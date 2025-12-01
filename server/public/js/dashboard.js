document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userDisplay').textContent = username;

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
