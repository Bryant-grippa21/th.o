const container = globalThis.document.getElementById('auth-buttons');
const productList = globalThis.document.getElementById('product-list');

const renderProductList = (products) => {
  if (!products.length) {
    productList.innerHTML = '<p>No hay productos disponibles todavía.</p>';
    return;
  }

  productList.innerHTML = products
    .map((product) => `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:180px; margin:0 16px 24px 0; vertical-align:top;">
        <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}" style="text-decoration:none; color:inherit;">
          ${product.image_url
        ? `<img src="${product.image_url}" alt="${product.name}" style="width:160px; height:160px; object-fit:cover; border:1px solid #ccc; display:block;">`
    : '<div style="width:160px; height:160px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
        </a>
        <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}" style="margin-top:10px; text-align:center; text-decoration:none; color:inherit;">
          ${product.name}
        </a>
        <span style="margin-top:6px; font-size:12px; color:#666; text-align:center;">${product.line_name || ''}</span>
      </div>
    `)
    .join('');
};

const loadPublicCatalog = () => {
  globalThis.fetch(`${API_BASE_URL}/api/products/catalog?limit=12`)
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cargar el catálogo');
      }

      return data;
    })
    .then((data) => {
      renderProductList(data.products || []);
    })
    .catch(() => {
      productList.innerHTML = '<p>No se pudo cargar el catálogo.</p>';
    });
};

if (isLogged()) {
  fetchCurrentSession()
  .then((session) => {
    const profile = session.entity === 'company'
      ? session.data.company
      : session.data.user;

    const name = profile.name || profile.email;
    let dashboardLabel = 'Ir a mi dashboard';

    if (session.entity === 'company') {
      dashboardLabel = profile.id_role_fk === 1
        ? 'Ir a dashboard admin'
        : 'Ir a dashboard empresa';
    }

    container.innerHTML = `
      <p>Bienvenido <b>${name}</b></p>
      
      <button onclick="goDashboard()">${dashboardLabel}</button><br><br>
      
      <button onclick="logout()">Cerrar sesión</button>
    `;
  })
  .catch(() => {
    clearSession();
    globalThis.location.reload();
  });
} else {
  container.innerHTML = `
    <a href="/auth/login.html">Login</a><br>
    <a href="/auth/register.html">Registro</a>
  `;
}

function goDashboard() {
  redirectToDashboard().catch(() => {
    clearSession();
    redirectToLogin();
  });
}

loadPublicCatalog();