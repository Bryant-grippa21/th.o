const container = globalThis.document.getElementById('auth-buttons');
const productList = globalThis.document.getElementById('product-list');

const renderProductList = (products) => {
  if (!products.length) {
    productList.innerHTML = '<p>No hay productos disponibles todavía.</p>';
    return;
  }

  productList.innerHTML = products
    .map((product) => `<a href="/products/detail.html?productId=${product.id_product}">${product.name}</a><br>`)
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
  globalThis.fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders()
  })
  .then(res => res.json())
  .then(data => {
    if (!data.user) {
      throw new Error(data.error || 'Sesión inválida');
    }

    const name = data.user.name || data.user.email;

    container.innerHTML = `
      <p>Bienvenido <b>${name}</b></p>
      
      <button onclick="goDashboard()">Ir a mi dashboard</button><br><br>
      
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
  globalThis.location.href = '/modules/user_n/dashboard.html';
}

loadPublicCatalog();