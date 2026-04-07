const token = localStorage.getItem('token');

if (!token) {
  alert('Debes iniciar sesión');
  window.location.href = '/auth/login.html';
}

fetch('http://localhost:3000/api/auth/me', {
  headers: {
    Authorization: 'Bearer ' + token
  }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById('welcome').innerText =
      'Bienvenido ' + (data.user.name || data.user.email);
  });