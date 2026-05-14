const safeCompanyValue = (value) => value || null;

if (!requireCompanySession()) {
  throw new Error('Sesion requerida');
}

window.onload = async () => {
  try {
    const response = await fetch(getProfileEndpointByEntity('company'), {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo cargar el perfil de empresa');
    }

    const company = data.company;

    document.getElementById('company_name').innerText = company.name || 'No disponible';
    document.getElementById('rif').innerText = company.rif || 'No disponible';
    document.getElementById('email').innerText = company.email || 'No disponible';
    document.getElementById('phone').value = company.cell_phone || '';
    document.getElementById('address').value = company.mail_address || '';
  } catch (error) {
    alert(error.message);
    clearSession();
    redirectToLogin();
  }
};

function updateCompanyProfile() {
  fetch(getProfileEndpointByEntity('company'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      phone: safeCompanyValue(document.getElementById('phone').value),
      address: safeCompanyValue(document.getElementById('address').value),
      password: safeCompanyValue(document.getElementById('password').value)
    })
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la empresa');
      }

      return data;
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      alert(error.message);
    });
}
