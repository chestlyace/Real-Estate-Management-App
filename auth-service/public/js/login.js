// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/v1/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                let data;
                try {
                  data = await response.json();
                } catch (e) {
                  throw new Error('Invalid response from server');
                }

                if (response.ok && data.status === 'success') {
                    // Store token
                    localStorage.setItem('accessToken', data.data.tokens.accessToken);
                    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
                    localStorage.setItem('user', JSON.stringify(data.data.user));

                    // Redirect based on user role
                    if (data.data.user.role === 'admin') {
                        window.location.href = '/admin-dashboard.html';
                    } else {
                        window.location.href = '/user-dashboard.html';
                    }
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    }
});
