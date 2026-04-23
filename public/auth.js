const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const fullNameGroup = document.getElementById('fullNameGroup');
const fullNameInput = document.getElementById('fullName');
const authTabs = document.querySelectorAll('.auth-tab');
const submitButton = document.querySelector('.auth-submit');

let mode = 'login';

const showMessage = (message, isError = false) => {
  authMessage.textContent = message;
  authMessage.classList.toggle('error-message', isError);
  authMessage.classList.toggle('success-message', !isError);
};

const updateMode = newMode => {
  mode = newMode;
  authTabs.forEach(tab => tab.classList.toggle('auth-tab--active', tab.dataset.mode === newMode));
  const isSignup = newMode === 'signup';
  fullNameGroup.classList.toggle('hidden-field', !isSignup);
  fullNameInput.required = isSignup;
  submitButton.textContent = isSignup ? 'Create Account' : 'Login';
  authMessage.textContent = '';
};

authTabs.forEach(tab => {
  tab.addEventListener('click', () => updateMode(tab.dataset.mode));
});

authForm.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    email: authForm.email.value.trim(),
    password: authForm.password.value.trim(),
  };

  if (mode === 'signup') {
    payload.fullName = fullNameInput.value.trim();
  }

  try {
    showMessage('Please wait...', false);
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    localStorage.setItem('bankistToken', data.token);
    localStorage.setItem('bankistUser', JSON.stringify(data.user));
    showMessage(data.message || 'Success');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 800);
  } catch (error) {
    showMessage(error.message, true);
  }
});

updateMode('login');
