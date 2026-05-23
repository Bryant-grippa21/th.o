const safe = (v) => v || null;

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const data = contentType.includes('application/json')
    ? JSON.parse(rawBody || '{}')
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  if (!data) {
    throw new Error('La respuesta del servidor no llegó en formato JSON');
  }

  return data;
};

if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

// 🔥 Cargar datos actuales
window.onload = async () => {
  try {
    const data = await requestJson(getProfileEndpointByEntity('customer'));

    const user = data.user;

    document.getElementById('phone').value = user.cell_phone || '';
    document.getElementById('address').value = user.mail_address || '';
  } catch (error) {
    alert(error.message);
    clearSession();
    redirectToLogin();
  }
};

// 🔄 Actualizar
function update() {
  fetch(getProfileEndpointByEntity('customer'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
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