// Registration page functionality
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value;
      const surname = document.getElementById('surname').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const btn = document.querySelector('button[type="submit"]');

      // Validate passwords match
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Disable button during submission
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      try {
        const name = `${firstName} ${surname}`.trim();

        const response = await fetch('/v1/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Invalid response from server');
        }

        if (response.ok && data.status === 'success') {
          // Store token and user info
          localStorage.setItem('accessToken', data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.data.user));

          alert('Registration successful! Redirecting to dashboard...');

          // Redirect based on role
          if (data.data.user.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
          } else {
            window.location.href = '/user-dashboard.html';
          }
        } else {
          const errorMessage = data.message || 'Registration failed. Please try again.';
          alert(errorMessage);
          btn.disabled = false;
          btn.textContent = 'Agree and continue';
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Agree and continue';
      }
    });
  }
});
