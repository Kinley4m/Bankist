const token = localStorage.getItem('bankistToken');
const dashboardMessage = document.getElementById('dashboardMessage');
const balanceAmount = document.getElementById('balanceAmount');
const accountInfo = document.getElementById('accountInfo');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAccount = document.getElementById('userAccount');
const userJoined = document.getElementById('userJoined');
const transactionList = document.getElementById('transactionList');
const logoutBtn = document.getElementById('logoutBtn');

if (!token) {
  window.location.href = '/auth.html';
}

const authFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

const setMessage = (message, isError = false) => {
  dashboardMessage.textContent = message;
  dashboardMessage.classList.toggle('error-message', isError);
  dashboardMessage.classList.toggle('success-message', !isError);
};

const formatCurrency = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

const renderTransactions = transactions => {
  if (!transactions.length) {
    transactionList.innerHTML = '<p>No transactions yet.</p>';
    return;
  }

  transactionList.innerHTML = transactions
    .map(transaction => {
      const relatedUser = transaction.relatedUser
        ? `${transaction.relatedUser.fullName} (${transaction.relatedUser.accountNumber})`
        : 'Self';

      return `
        <article class="transaction-item">
          <div>
            <h4>${transaction.type.replaceAll('_', ' ')}</h4>
            <p>${transaction.note || '-'} </p>
            <small>${new Date(transaction.createdAt).toLocaleString('en-IN')}</small>
          </div>
          <div class="transaction-meta">
            <strong>${formatCurrency(transaction.amount)}</strong>
            <span>${relatedUser}</span>
          </div>
        </article>
      `;
    })
    .join('');
};

const loadProfile = async () => {
  try {
    const data = await authFetch('/api/account/profile');
    balanceAmount.textContent = formatCurrency(data.user.balance);
    accountInfo.textContent = `Account No: ${data.user.accountNumber}`;
    userName.textContent = data.user.fullName;
    userEmail.textContent = data.user.email;
    userAccount.textContent = data.user.accountNumber;
    userJoined.textContent = new Date(data.user.createdAt).toLocaleDateString('en-IN');
    renderTransactions(data.transactions);
  } catch (error) {
    setMessage(error.message, true);
    if (error.message.toLowerCase().includes('token')) {
      localStorage.removeItem('bankistToken');
      window.location.href = '/auth.html';
    }
  }
};

const bindForm = (formId, endpoint) => {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await authFetch(`/api/account/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setMessage(data.message);
      form.reset();
      await loadProfile();
    } catch (error) {
      setMessage(error.message, true);
    }
  });
};

bindForm('depositForm', 'deposit');
bindForm('withdrawForm', 'withdraw');
bindForm('loanForm', 'loan');
bindForm('transferForm', 'transfer');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('bankistToken');
  localStorage.removeItem('bankistUser');
  window.location.href = '/auth.html';
});

loadProfile();
