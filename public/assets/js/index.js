const container = globalThis.document.getElementById('auth-buttons');
const productList = globalThis.document.getElementById('product-list');

const renderProductList = (products) => {
  if (!products.length) {
    productList.innerHTML = '<p>No hay productos disponibles todavía.</p>';
    return;
  }

  productList.innerHTML = products
    .map((line) => `<a href="/products/detail.html?lineId=${line.id_line}">${line.name}</a><br>`)
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