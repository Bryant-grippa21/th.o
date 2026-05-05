function login() {
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      if (data.attempts_left !== undefined) {
        throw new Error(`${data.error} (Intentos restantes: ${data.attempts_left})`);
      }
      throw new Error(data.error);
    }

    return data;
  })
  .then(data => {
    localStorage.setItem('token', data.token);
    location.href = '/index.html';
  })
  .catch(err => alert(err.message));
};