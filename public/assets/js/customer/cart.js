if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const cartSummary = document.getElementById('cart-summary');
const cartList = document.getElementById('cart-list');
const cartClearButton = document.getElementById('cart-clear-button');

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

const formatAmount = (value) => Number(value || 0).toFixed(2);

const renderCart = (cart) => {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.product?.price || 0)), 0);
  cartSummary.innerText = `Productos en carrito: ${totalItems} | Subtotal referencial USD: ${formatAmount(subtotal)}`;
  cartClearButton.disabled = items.length === 0;

  if (!items.length) {
    cartList.innerHTML = '<p>No tienes productos en el carrito.</p>';
    return;
  }

  cartList.innerHTML = items.map((item) => {
    const product = item.product;

    if (!product) {
      return `
        <div style="border-bottom:1px solid #ccc; padding:12px 0;">
          <p><b>Producto ${item.id_product}</b></p>
          <p>Ya no está disponible en el catálogo.</p>
          <button type="button" onclick="removeCartItem(${item.id_product})">Eliminar</button>
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
          <p>Precio: ${product.price}</p>
          <p>Subtotal item: ${formatAmount(Number(product.price || 0) * Number(item.quantity || 0))}</p>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span>Cantidad</span>
            <button type="button" onclick="changeCartItemQuantity(${item.id_product}, -1)">-</button>
            <input id="cart-quantity-${item.id_product}" type="number" min="1" step="1" value="${item.quantity}" style="width:72px;">
            <button type="button" onclick="changeCartItemQuantity(${item.id_product}, 1)">+</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">Ver detalle</a>
            <button type="button" onclick="updateCartItemQuantity(${item.id_product})">Actualizar cantidad</button>
            <button type="button" onclick="removeCartItem(${item.id_product})">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

const loadCart = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/auth/cart`);
  renderCart(data.cart);
};

async function updateCartItemQuantity(productId) {
  try {
    const quantity = Number(document.getElementById(`cart-quantity-${productId}`).value);

    await requestJson(`${API_BASE_URL}/api/auth/cart/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_product: productId,
        quantity
      })
    });

    await loadCart();
  } catch (error) {
    alert(error.message);
  }
}

function changeCartItemQuantity(productId, delta) {
  const input = document.getElementById(`cart-quantity-${productId}`);

  if (!input) {
    return;
  }

  const currentValue = Number(input.value || 1);
  const nextValue = Math.max(1, currentValue + Number(delta || 0));
  input.value = String(nextValue);
}

async function removeCartItem(productId) {
  try {
    await requestJson(`${API_BASE_URL}/api/auth/cart/items/${productId}`, {
      method: 'DELETE'
    });
    await loadCart();
  } catch (error) {
    alert(error.message);
  }
}

async function clearCartItems() {
  try {
    if (!confirm('¿Deseas vaciar el carrito?')) {
      return;
    }

    await requestJson(`${API_BASE_URL}/api/auth/cart`, {
      method: 'DELETE'
    });
    await loadCart();
  } catch (error) {
    alert(error.message);
  }
}

cartClearButton.addEventListener('click', clearCartItems);
globalThis.changeCartItemQuantity = changeCartItemQuantity;
globalThis.updateCartItemQuantity = updateCartItemQuantity;
globalThis.removeCartItem = removeCartItem;

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    return loadCart();
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });