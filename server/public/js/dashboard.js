document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userDisplay').textContent = username;

    // JWTからロールを確認 (簡易的)
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);

        if (payload.role === 'admin') {
            const container = document.getElementById('adminLinkContainer');
            const link = document.createElement('a');
            link.href = 'admin.html';
            link.textContent = 'Manage Users';
            link.style.display = 'block';
            link.style.marginBottom = '10px';
            link.style.fontWeight = 'bold';
            container.appendChild(link);
        }
    } catch (e) {
        console.error('Error parsing token:', e);
    }

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });

    document.getElementById('launchBtn').addEventListener('click', () => {
        // トークンを使用してURIスキームを構築
        // スキーム: medlauncher://token=YOUR_TOKEN
        const uri = `medlauncher://token=${token}`;

        // URIを開こうとする
        window.location.href = uri;

        // オプション: インストールされていない場合のメッセージ表示やフォールバック処理 (ブラウザでの確実な検出は困難)
        console.log('Attempting to launch:', uri);
    });
});
