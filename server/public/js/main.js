document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        } else {
            message.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        message.textContent = 'An error occurred';
        console.error(error);
    }
});
