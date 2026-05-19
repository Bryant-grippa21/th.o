if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const favoritesSummary = document.getElementById('favorites-summary');
const favoritesList = document.getElementById('favorites-list');

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};

const renderFavorites = (favorites) => {
  const items = Array.isArray(favorites?.items) ? favorites.items : [];
  favoritesSummary.innerText = `Total de favoritos: ${items.length}`;

  if (!items.length) {
    favoritesList.innerHTML = '<p>No tienes favoritos guardados.</p>';
    return;
  }

  favoritesList.innerHTML = items.map((item) => {
    const product = item.product;

    if (!product) {
      return `
        <div style="border-bottom:1px solid #ccc; padding:12px 0;">
          <p><b>Producto ${item.id_product}</b></p>
          <p>Ya no está disponible en el catálogo.</p>
          <button type="button" onclick="removeFavoriteItem(${item.id_product})">Eliminar</button>
        </div>
      `;
    }

    return `
      <div style="display:flex; gap:16px; align-items:flex-start; border-bottom:1px solid #ccc; padding:12px 0;">
        <div>
          ${product.main_image_url
      ? `<img src="${product.main_image_url}" alt="${product.name}" style="width:96px; height:96px; object-fit:cover; border:1px solid #ccc;">`
      : '<div style="width:96px; height:96px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">Sin imagen</div>'}
        </div>
        <div>
          <p><b>${product.name || 'Sin nombre'}</b></p>
          <p>SKU: ${product.sku}</p>
          <p>Línea: ${product.line_name || 'Sin línea'}</p>
          <p>Precio: ${product.price}</p>
          <p>Stock actual: ${product.quantity ?? 0}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">Ver detalle</a>
            <button type="button" onclick="addFavoriteProductToCart(${product.id_product})">Agregar al carrito</button>
            <button type="button" onclick="removeFavoriteItem(${product.id_product})">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

const loadFavorites = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/auth/favorites`);
  renderFavorites(data.favorites);
};

async function removeFavoriteItem(productId) {
  try {
    await requestJson(`${API_BASE_URL}/api/auth/favorites/${productId}`, {
      method: 'DELETE'
    });
    await loadFavorites();
  } catch (error) {
    alert(error.message);
  }
}

async function addFavoriteProductToCart(productId) {
  try {
    await requestJson(`${API_BASE_URL}/api/auth/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_product: productId,
        quantity: 1
      })
    });
    alert('Producto agregado al carrito');
  } catch (error) {
    alert(error.message);
  }
}

globalThis.removeFavoriteItem = removeFavoriteItem;
globalThis.addFavoriteProductToCart = addFavoriteProductToCart;

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    return loadFavorites();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });