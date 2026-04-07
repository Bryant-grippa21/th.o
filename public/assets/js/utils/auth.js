const getToken = () => localStorage.getItem('token');

const isLogged = () => !!getToken();

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/auth/login.html';
};