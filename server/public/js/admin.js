document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    fetchUsers();

    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
});

async function fetchUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert('Access denied. Admin only.');
            window.location.href = 'dashboard.html';
            return;
        }

        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.department || '-'}</td>
            <td>
                <button onclick="editUser(${user.id}, '${user.username}', '${user.role}', '${user.department || ''}')" class="action-btn">Edit</button>
                <button onclick="deleteUser(${user.id})" class="action-btn delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal() {
    document.getElementById('userModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

function editUser(id, username, role, department) {
    document.getElementById('userModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = id;
    document.getElementById('username').value = username;
    document.getElementById('role').value = role;
    document.getElementById('department').value = department;
    document.getElementById('password').value = ''; // Don't show password
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('userId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const department = document.getElementById('department').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/users/${id}` : '/api/users';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password, role, department })
        });

        const data = await response.json();
        if (data.success) {
            closeModal();
            fetchUsers();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            fetchUsers();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}
