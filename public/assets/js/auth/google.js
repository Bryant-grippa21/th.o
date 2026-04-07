function handleCredentialResponse(response) {
  fetch('http://localhost:3000/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credential: response.credential
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  })
  .then(data => {
    localStorage.setItem('token', data.token);
    window.location.href = '/index.html';
  })
  .catch(err => alert(err.message));
}