const token = localStorage.getItem('token');
const container = document.getElementById('auth-buttons');

if (!token) {
  container.innerHTML = `
    <a href="/auth/login.html">Login</a><br>
    <a href="/auth/register.html">Registro</a>
  `;
} else {

  fetch('http://localhost:3000/api/auth/me', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(res => res.json())
  .then(data => {

    const name = data.user.name || data.user.email;

    container.innerHTML = `
      <p>Bienvenido <b>${name}</b></p>
      
      <button onclick="goDashboard()">Ir a mi dashboard</button><br><br>
      
      <button onclick="logout()">Cerrar sesión</button>
    `;
  })
  .catch(() => {
    localStorage.removeItem('token');
    location.reload();
  });
}

function goDashboard() {
  window.location.href = '/modules/user_n/dashboard.html';
}

function logout() {
  localStorage.removeItem('token');
  location.reload();
}