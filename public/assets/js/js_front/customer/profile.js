const safe = (v) => v || null;

const profileFeedback = document.getElementById('profile-feedback');
const customerImagePreview = document.getElementById('customer-image-preview');
const customerImageInput = document.getElementById('customer-image');
const customerNameElement = document.getElementById('customer-name');
const customerEmailElement = document.getElementById('customer-email');

const setFeedback = (message, isError = false) => {
  if (!profileFeedback) {
    return;
  }

  profileFeedback.textContent = message || '';
  profileFeedback.style.color = isError ? '#b00020' : '';
};

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

const renderCustomerImage = (user) => {
  if (!customerImagePreview) {
    return;
  }

  if (!user?.img_profile) {
    const fallbackLetter = String(user?.name || user?.email || 'C').trim().charAt(0).toUpperCase() || 'C';

    customerImagePreview.innerHTML = `
      <div class="customer-profile-avatar customer-profile-avatar--fallback">
        ${fallbackLetter}
      </div>
    `;
    return;
  }

  customerImagePreview.innerHTML = `
    <img class="customer-profile-avatar" src="/uploads/profiles/customers/${user.img_profile}" alt="Imagen de perfil">
  `;
};

const renderCustomerIdentity = (user) => {
  if (customerNameElement) {
    customerNameElement.textContent = user?.name || 'No disponible';
  }

  if (customerEmailElement) {
    customerEmailElement.textContent = user?.email || 'No disponible';
  }
};

const renderCustomerProfile = (user) => {
  renderCustomerIdentity(user);
  renderCustomerImage(user);
};

// 🔥 Cargar datos actuales
globalThis.onload = async () => {
  try {
    const data = await requestJson(getProfileEndpointByEntity('customer'));

    const user = data.user;

    document.getElementById('phone').value = user.cell_phone || '';
    document.getElementById('address').value = user.mail_address || '';
    renderCustomerProfile(user);
    globalThis.refreshCustomerLayout?.(user);
  } catch (error) {
    alert(error.message);
    clearSession();
    redirectToLogin();
  }
};

// 🔄 Actualizar
async function update() {
  try {
    const data = await requestJson(getProfileEndpointByEntity('customer'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cell_phone: safe(document.getElementById('phone').value),
        mail_address: safe(document.getElementById('address').value),
        password: safe(document.getElementById('password').value)
      })
    });

    renderCustomerProfile(data.user);
    globalThis.refreshCustomerLayout?.(data.user);
    document.getElementById('password').value = '';
    setFeedback(data.message || 'Perfil actualizado correctamente');
  } catch (error) {
    setFeedback(error.message, true);
  }
}

async function uploadCustomerProfileImage() {
  try {
    const imageFile = customerImageInput?.files?.[0];

    if (!imageFile) {
      throw new Error('Selecciona una imagen antes de continuar');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const data = await requestJson(`${API_BASE_URL}/api/auth/profile/image`, {
      method: 'PUT',
      body: formData
    });

    renderCustomerProfile(data.user);
    globalThis.refreshCustomerLayout?.(data.user);

    if (customerImageInput) {
      customerImageInput.value = '';
    }

    setFeedback(data.message || 'Imagen actualizada correctamente');
  } catch (error) {
    setFeedback(error.message, true);
  }
}

globalThis.update = update;
globalThis.uploadCustomerProfileImage = uploadCustomerProfileImage;
