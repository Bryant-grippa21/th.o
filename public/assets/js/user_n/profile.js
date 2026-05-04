const safe = (v) => v || null;

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/auth/login.html';
}

// 🔥 Cargar datos actuales
window.onload = async () => {
  const res = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  const user = await res.json();

  document.getElementById('phone').value = user.cell_phone || '';
  document.getElementById('address').value = user.mail_address || '';
};

// 🔄 Actualizar
function update() {
  fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      cell_phone: safe(document.getElementById('phone').value),
      mail_address: safe(document.getElementById('address').value),
      password: safe(document.getElementById('password').value)
    })
  })
  .then(res => res.json())
  .then(data => alert(data.message))
  .catch(err => alert(err.message));
}