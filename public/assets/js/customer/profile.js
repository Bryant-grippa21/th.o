const safe = (v) => v || null;

if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

// 🔥 Cargar datos actuales
window.onload = async () => {
  try {
    const res = await fetch(getProfileEndpointByEntity('customer'), {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'No se pudo cargar el perfil');
    }

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