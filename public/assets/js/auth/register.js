const safe = (v) => v || null;

const registerEntitySelect = document.getElementById('register-entity');
const customerRegisterFields = document.getElementById('customer-register-fields');
const companyRegisterFields = document.getElementById('company-register-fields');
const registerGoogleSection = document.getElementById('register-google-section');
const rifInput = document.getElementById('rif');

const onRegisterEntityChange = () => {
  const entity = registerEntitySelect.value;
  const isCustomer = entity === 'customer';

  customerRegisterFields.hidden = !isCustomer;
  companyRegisterFields.hidden = isCustomer;
  registerGoogleSection.style.display = isCustomer ? 'block' : 'none';
};

function register() {
  const entity = registerEntitySelect.value;
  const endpoint = entity === 'company'
    ? `${API_BASE_URL}/api/company-auth/register`
    : `${API_BASE_URL}/api/auth/register`;

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
    alert(data.message);
    location.href = '/auth/login.html';
  })
  .catch(err => alert(err.message));
}

if (rifInput) {
  rifInput.addEventListener('input', () => {
    rifInput.value = rifInput.value.replace(/\D/g, '');
  });
}

onRegisterEntityChange();