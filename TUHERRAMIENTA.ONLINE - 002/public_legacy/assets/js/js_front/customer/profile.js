const safe = (v) => v || null;

const profileFeedback = document.getElementById('profile-feedback');
const profileImagePreview = document.getElementById('profile-image-preview');
const profileImageInput = document.getElementById('profile-image');

const setFeedback = (message, isError = false) => {
  if (!profileFeedback) {
    return;
  }

  profileFeedback.textContent = message || '';
  profileFeedback.style.color = isError ? '#b00020' : '';
};

const renderProfileImage = (user) => {
  if (!profileImagePreview) {
    return;
  }

  if (!user?.img_profile) {
    const fallbackLetter = String(user?.name || user?.email || 'C').trim().charAt(0).toUpperCase() || 'C';

    profileImagePreview.innerHTML = `
      <div style="width:120px; height:120px; border-radius:50%; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:700; background:#f5f5f5;">
        ${fallbackLetter}
      </div>
    `;
    return;
  }

  profileImagePreview.innerHTML = `
    <img src="/uploads/profiles/customers/${user.img_profile}" alt="Foto de perfil" style="width:120px; height:120px; object-fit:cover; border:1px solid #ccc;">
  `;
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

// 🔥 Cargar datos actuales
globalThis.onload = async () => {
  try {
    const data = await requestJson(getProfileEndpointByEntity('customer'));

    const user = data.user;

    document.getElementById('phone').value = user.cell_phone || '';
    document.getElementById('address').value = user.mail_address || '';
    renderProfileImage(user);
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

    renderProfileImage(data.user);
    globalThis.refreshCustomerLayout?.(data.user);
    document.getElementById('password').value = '';
    setFeedback(data.message || 'Perfil actualizado correctamente');
  } catch (error) {
    setFeedback(error.message, true);
  }
}

async function uploadProfileImage() {
  try {
    const imageFile = profileImageInput?.files?.[0];

    if (!imageFile) {
      throw new Error('Selecciona una imagen antes de continuar');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const data = await requestJson(`${API_BASE_URL}/api/auth/profile/image`, {
      method: 'PUT',
      body: formData
    });

    renderProfileImage(data.user);
    globalThis.refreshCustomerLayout?.(data.user);
    profileImageInput.value = '';
    setFeedback(data.message || 'Imagen de perfil actualizada correctamente');
  } catch (error) {
    setFeedback(error.message, true);
  }
}

globalThis.update = update;
globalThis.uploadProfileImage = uploadProfileImage;