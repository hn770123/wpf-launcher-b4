const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super-secret-key-change-this';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ログインエンドポイント
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password);

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        // ランチャーが必要に応じて検証できるようにDBにトークンを保存するか、単にJWT検証を使用します
        // ランチャーのURIスキームの場合、短命のワンタイムトークンまたは単にJWTが必要になる場合があります。
        // 追跡のために保存しておきます。
        const insertToken = db.prepare('INSERT INTO tokens (token, user_id) VALUES (?, ?)');
        insertToken.run(token, user.id);

        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// トークンを検証するミドルウェア
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// 設定エンドポイント (XML)
app.get('/api/config', authenticateToken, (req, res) => {
    // ランチャー用のXML設定を返します
    // 実際のアプリでは、ユーザーの役割/権限に基づいて動的に生成されます
    const xml = `
    <Config>
        <Categories>
            <Category Name="General">
                <App Name="Notepad" Icon="notepad.png" Path="notepad.exe" />
                <App Name="Calculator" Icon="calc.png" Path="calc.exe" />
            </Category>
            <Category Name="Medical">
                <App Name="Patient Records" Icon="records.png" Path="C:\\Medical\\Records.exe" />
            </Category>
        </Categories>
    </Config>
    `;
    res.set('Content-Type', 'text/xml');
    res.send(xml);
});

// 接続エンドポイント (ランチャーがトークンを検証し、接続情報を取得するため)
app.get('/api/connect', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Connected to Medical Server',
        user: req.user
    });
});

// 管理者権限チェックミドルウェア
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
};

// ユーザー一覧取得 (管理者のみ)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    const stmt = db.prepare('SELECT id, username, role, department FROM users');
    const users = stmt.all();
    res.json(users);
});

// ユーザー作成 (管理者のみ)
app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
    const { username, password, role, department } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO users (username, password, role, department) VALUES (?, ?, ?, ?)');
        stmt.run(username, password, role || 'user', department);
        res.json({ success: true, message: 'User created' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ユーザー更新 (管理者のみ)
app.put('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { username, password, role, department } = req.body;
    const { id } = req.params;

    try {
        // パスワードが空の場合は更新しない
        if (password) {
            const stmt = db.prepare('UPDATE users SET username = ?, password = ?, role = ?, department = ? WHERE id = ?');
            stmt.run(username, password, role, department, id);
        } else {
            const stmt = db.prepare('UPDATE users SET username = ?, role = ?, department = ? WHERE id = ?');
            stmt.run(username, role, department, id);
        }
        res.json({ success: true, message: 'User updated' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ユーザー削除 (管理者のみ)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
