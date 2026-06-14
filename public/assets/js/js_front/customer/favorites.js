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

const formatAmount = (value) => Number(value || 0).toFixed(2);

const renderFavorites = (favorites) => {
  if (!favoritesSummary || !favoritesList) {
    return;
  }

  const items = Array.isArray(favorites?.items) ? favorites.items : [];
  favoritesSummary.innerHTML = `Total de favoritos: <b>${items.length}</b>`;

  if (!items.length) {
    favoritesList.innerHTML = '<p>No tienes favoritos guardados.</p>';
    return;
  }

  favoritesList.innerHTML = `<div class="customer-card-list customer-favorites-list">${items.map((item) => {
    const product = item.product;

    if (!product) {
      return `
        <article class="customer-card customer-favorite-card customer-favorite-card--missing">
          <div class="customer-card__body customer-favorite-card__body">
            <p class="customer-card__title"><b>Producto ${item.id_product}</b></p>
            <p class="customer-card__meta">Ya no está disponible en el catálogo.</p>
            <div class="customer-card__actions customer-favorite-card__actions">
              <button type="button" onclick="removeFavoriteItem(${item.id_product})">Eliminar</button>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="customer-card customer-favorite-card">
        <div class="customer-card__media customer-favorite-card__media">
          ${product.main_image_url
      ? `<img src="${product.main_image_url}" alt="${product.name || 'Producto'}">`
      : '<div class="customer-card__media-placeholder">Sin imagen</div>'}
        </div>
        <div class="customer-card__body customer-favorite-card__body">
          <p class="customer-card__title"><b>${product.name || 'Sin nombre'}</b></p>
          <p class="customer-card__meta">SKU: ${product.sku || 'N/A'}</p>
          <p class="customer-card__meta">Línea: ${product.line_name || 'Sin línea'}</p>
          <p class="customer-card__meta">Mayorista: ${product.company_name || 'Sin proveedor'}</p>
          <p class="customer-card__meta">Stock actual: ${product.quantity ?? 0}</p>
          <p class="customer-card__price">USD ${formatAmount(product.price)}</p>
          <div class="customer-card__actions customer-favorite-card__actions">
            <a class="customer-favorite-card__link" href="/products/detail.html?sku=${encodeURIComponent(product.sku || '')}">Ver detalle</a>
            <button type="button" onclick="addFavoriteProductToCart(${product.id_product})">Agregar al carrito</button>
            <button type="button" onclick="removeFavoriteItem(${product.id_product})">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join('')}</div>`;
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
        id_product: Number(productId),
        quantity: 1
      })
    });

    alert('Producto agregado al carrito correctamente');
  } catch (error) {
    alert(error.message);
  }
}

globalThis.removeFavoriteItem = removeFavoriteItem;
globalThis.addFavoriteProductToCart = addFavoriteProductToCart;

loadFavorites()
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });
