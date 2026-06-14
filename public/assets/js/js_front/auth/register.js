const safe = (v) => v || null;

const registerEntityInput = document.getElementById('register-entity');
const customerRegisterFields = document.getElementById('customer-register-fields');
const companyRegisterFields = document.getElementById('company-register-fields');
const registerGoogleSection = document.getElementById('register-google-section');
const rifInput = document.getElementById('rif');
const registerSubmitButton = document.getElementById('register-submit');
const registerFeedback = document.getElementById('register-feedback');
const registerEntityCustomerButton = document.getElementById('register-entity-customer');
const registerEntityCompanyButton = document.getElementById('register-entity-company');

const getRegisterEntity = () => (registerEntityInput?.value === 'company' ? 'company' : 'customer');

const updateEntityButtonState = (button, isActive) => {
  if (!button) {
    return;
  }

  button.classList.toggle('is-active', isActive);
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
};

const setRegisterFeedback = (message, isError = false) => {
  if (!registerFeedback) {
    return;
  }

  registerFeedback.textContent = message || '';
  registerFeedback.style.color = isError ? '#8d2520' : '#1f4f77';
};

const setRegisterEntity = (entity) => {
  const resolvedEntity = entity === 'company' ? 'company' : 'customer';

  if (registerEntityInput) {
    registerEntityInput.value = resolvedEntity;
  }

  const customerEntityActive = resolvedEntity === 'customer';
  updateEntityButtonState(registerEntityCustomerButton, customerEntityActive);
  updateEntityButtonState(registerEntityCompanyButton, !customerEntityActive);

  if (customerRegisterFields) {
    customerRegisterFields.hidden = !customerEntityActive;
  }

  if (companyRegisterFields) {
    companyRegisterFields.hidden = customerEntityActive;
  }

  if (registerGoogleSection) {
    registerGoogleSection.style.display = customerEntityActive ? 'block' : 'none';
  }

  if (registerSubmitButton) {
    registerSubmitButton.textContent = customerEntityActive
      ? 'Registrar usuario →'
      : 'Registrar comercio →';
  }
};

function register() {
  const entity = getRegisterEntity();
  const endpoint = entity === 'company'
    ? `${API_BASE_URL}/api/company-auth/register`
    : `${API_BASE_URL}/api/auth/register`;

  const missingFields = entity === 'company'
    ? [
        ['company_name', 'nombre de la empresa'],
        ['rif', 'RIF'],
        ['email', 'correo'],
        ['password', 'contraseña']
      ].filter(([id]) => !document.getElementById(id).value.trim())
    : [
        ['name', 'nombre'],
        ['email', 'correo'],
        ['password', 'contraseña']
      ].filter(([id]) => !document.getElementById(id).value.trim());

  if (missingFields.length) {
    const message = `Faltan campos obligatorios: ${missingFields.map(([, label]) => label).join(', ')}`;
    setRegisterFeedback(message, true);
    alert(message);
    return;
  }

  setRegisterFeedback('Creando cuenta...');

  const payload = entity === 'company'
    ? {
        company_name: document.getElementById('company_name').value.trim(),
        rif: document.getElementById('rif').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        phone: safe(document.getElementById('phone').value),
        address: safe(document.getElementById('address').value)
      }
    : {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        cell_phone: safe(document.getElementById('phone').value),
        mail_address: safe(document.getElementById('address').value)
      };

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  })
  .then(data => {
    setRegisterFeedback('Cuenta registrada correctamente. Redirigiendo...');
    alert(data.message);

    if (entity === 'company') {
      alert('Luego de iniciar sesión entra a Perfil empresa para cargar los recaudos jurídicos.');
    }

    location.href = '/auth/login.html';
  })
  .catch(err => {
    setRegisterFeedback(err.message, true);
    alert(err.message);
  });
}

if (rifInput) {
  rifInput.addEventListener('input', () => {
    rifInput.value = rifInput.value.replace(/\D/g, '');
  });
}

setRegisterEntity(getRegisterEntity());

globalThis.setRegisterEntity = setRegisterEntity;
globalThis.register = register;