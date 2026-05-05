const getToken = () => localStorage.getItem('token');

const API_BASE_URL = 'http://localhost:3000';

const isLogged = () => !!getToken();

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? { Authorization: 'Bearer ' + token }
    : {};
};

const clearSession = () => {
  localStorage.removeItem('token');
};

const redirectToLogin = () => {
  location.href = '/auth/login.html';
};

const requireCustomerSession = () => {
  if (!isLogged()) {
    redirectToLogin();
    return false;
  }

  return true;
};

const logout = () => {
  clearSession();
  redirectToLogin();
};