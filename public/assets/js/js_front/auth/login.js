const loginEntityInput = document.getElementById('login-entity');
const loginGoogleSection = document.getElementById('login-google-section');
const loginSubmitButton = document.getElementById('login-submit');
const loginFeedback = document.getElementById('login-feedback');
const loginEntityCustomerButton = document.getElementById('login-entity-customer');
const loginEntityCompanyButton = document.getElementById('login-entity-company');

const getLoginEntity = () => (loginEntityInput?.value === 'company' ? 'company' : 'customer');

const setLoginEntity = (entity) => {
  const resolvedEntity = entity === 'company' ? 'company' : 'customer';

  if (loginEntityInput) {
    loginEntityInput.value = resolvedEntity;
  }

  if (loginEntityCustomerButton) {
    const isCustomer = resolvedEntity === 'customer';
    loginEntityCustomerButton.classList.toggle('is-active', isCustomer);
    loginEntityCustomerButton.setAttribute('aria-pressed', isCustomer ? 'true' : 'false');
  }

  if (loginEntityCompanyButton) {
    const isCompany = resolvedEntity === 'company';
    loginEntityCompanyButton.classList.toggle('is-active', isCompany);
    loginEntityCompanyButton.setAttribute('aria-pressed', isCompany ? 'true' : 'false');
  }

  if (loginGoogleSection) {
    loginGoogleSection.style.display = resolvedEntity === 'customer' ? 'block' : 'none';
  }

  if (loginSubmitButton) {
    loginSubmitButton.textContent = resolvedEntity === 'customer'
      ? 'Iniciar sesión como usuario →'
      : 'Iniciar sesión como comercio →';
  }
};

const setLoginFeedback = (message, isError = false) => {
  if (!loginFeedback) {
    return;
  }

  loginFeedback.textContent = message || '';
  loginFeedback.style.color = isError ? '#8d2520' : '#1f4f77';
};

function login() {
  const entity = getLoginEntity();
  const endpoint = entity === 'company'
    ? `${API_BASE_URL}/api/company-auth/login`
    : `${API_BASE_URL}/api/auth/login`;

  setLoginFeedback('Validando credenciales...');

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
      throw new Error(data.error || 'No se pudo iniciar sesión');
    }

    return data;
  })
  .then(data => {
    setSession(data.token, entity);
    setLoginFeedback('Acceso correcto. Redirigiendo...');
    return redirectToDashboard();
  })
  .catch(err => {
    setLoginFeedback(err.message, true);
    alert(err.message);
  });
}

setLoginEntity(getLoginEntity());

globalThis.setLoginEntity = setLoginEntity;
globalThis.login = login;