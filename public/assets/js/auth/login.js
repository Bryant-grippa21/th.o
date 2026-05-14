const loginEntitySelect = document.getElementById('login-entity');
const loginGoogleSection = document.getElementById('login-google-section');

const onLoginEntityChange = () => {
  const entity = loginEntitySelect.value;
  loginGoogleSection.style.display = entity === 'customer' ? 'block' : 'none';
};

function login() {
  const entity = loginEntitySelect.value;
  const endpoint = entity === 'company'
    ? `${API_BASE_URL}/api/company-auth/login`
    : `${API_BASE_URL}/api/auth/login`;

  fetch(endpoint, {
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
    setSession(data.token, entity);
    return redirectToDashboard();
  })
  .catch(err => alert(err.message));
}

onLoginEntityChange();