const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'medical.db');
const db = new Database(dbPath, { verbose: console.log });

// テーブルの初期化
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- 実際のアプリではハッシュ化してください！
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// 存在しない場合、デフォルトの管理者を追加
const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
insertAdmin.run('admin', 'admin', 'admin');

module.exports = db;
