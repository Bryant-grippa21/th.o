const safe = (v) => v || null;

function register() {
  fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      DOB: document.getElementById('dob').value,
      cell_phone: safe(document.getElementById('phone').value),
      mail_address: safe(document.getElementById('address').value)
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  })
  .then(data => {
    alert(data.message);
    window.location.href = '/auth/login.html';
  })
  .catch(err => alert(err.message));
}