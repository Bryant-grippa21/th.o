if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const cartSummary = document.getElementById('cart-summary');
const cartList = document.getElementById('cart-list');
const cartClearButton = document.getElementById('cart-clear-button');
const cartCheckoutButton = document.getElementById('cart-checkout-button');
const cartFeedback = document.getElementById('cart-feedback');
const cartUseCashbackInput = document.getElementById('cart-use-cashback');
const cartCashbackSummary = document.getElementById('cart-cashback-summary');
const state = {
  exchangeRate: null,
  cart: null,
  cashback: null,
  useCashback: false,
  checkoutInFlight: false
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

const formatAmount = (value) => Number(value || 0).toFixed(2);
const formatExchangeRate = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4
});

const formatBsAmount = (value) => Number(value || 0).toLocaleString('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const convertUsdToBs = (usdAmount) => {
  if (!state.exchangeRate?.rate_bs_per_usd) {
    return null;
  }

  return Number(usdAmount || 0) * Number(state.exchangeRate.rate_bs_per_usd || 0);
};

const setFeedback = (message, type = 'info') => {
  if (!cartFeedback) {
    return;
  }

  cartFeedback.textContent = message || '';
  cartFeedback.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const getCartCashbackPreview = (subtotalUsd) => {
  const availableCashbackUsd = Number(state.cashback?.value || 0);
  const appliedCashbackUsd = state.useCashback
    ? Math.min(availableCashbackUsd, Number(subtotalUsd || 0))
    : 0;

  return {
    availableCashbackUsd,
    appliedCashbackUsd: Number(appliedCashbackUsd.toFixed(2)),
    totalPayableUsd: Number(Math.max(Number(subtotalUsd || 0) - appliedCashbackUsd, 0).toFixed(2))
  };
};

const renderCart = (cart) => {
  state.cart = cart || null;
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotalUsd = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.product?.price || 0)), 0);
  const subtotalBs = convertUsdToBs(subtotalUsd);
  const cashbackPreview = getCartCashbackPreview(subtotalUsd);
  const cashbackAppliedBs = convertUsdToBs(cashbackPreview.appliedCashbackUsd);
  const totalPayableBs = convertUsdToBs(cashbackPreview.totalPayableUsd);
  const subtotalBsLabel = subtotalBs === null
    ? ''
    : `| Subtotal referencial Bs: <b>Bs.S ${formatBsAmount(subtotalBs)}</b> | Tasa actual: <b>Bs.S ${formatExchangeRate(state.exchangeRate.rate_bs_per_usd)}</b>`;
  const cashbackAppliedBsLabel = cashbackAppliedBs === null
    ? ''
    : ` | Bs.S ${formatBsAmount(cashbackAppliedBs)}`;
  const totalPayableBsLabel = totalPayableBs === null
    ? ''
    : ` | Bs.S ${formatBsAmount(totalPayableBs)}`;
  const cashbackUsageLabel = state.useCashback
    ? `| Cashback a usar: <b>USD ${formatAmount(cashbackPreview.appliedCashbackUsd)}</b>${cashbackAppliedBsLabel} | Total a pagar: <b>USD ${formatAmount(cashbackPreview.totalPayableUsd)}</b>${totalPayableBsLabel}`
    : '';
  cartSummary.innerHTML = `
    Productos en carrito: <b>${totalItems}</b> |
    Subtotal referencial USD: <b>${formatAmount(subtotalUsd)}</b>
    ${subtotalBsLabel}
  `;
  cartCashbackSummary.innerHTML = `
    Cashback disponible: <b>USD ${formatAmount(cashbackPreview.availableCashbackUsd)}</b>
    ${cashbackUsageLabel}
  `;
  cartClearButton.disabled = items.length === 0;
  cartCheckoutButton.disabled = items.length === 0 || state.checkoutInFlight;
  cartUseCashbackInput.disabled = items.length === 0 || cashbackPreview.availableCashbackUsd <= 0;

  if (cartUseCashbackInput.disabled) {
    state.useCashback = false;
    cartUseCashbackInput.checked = false;
  }

  if (!items.length) {
    cartList.innerHTML = '<p>No tienes productos en el carrito.</p>';
    return;
  }

  cartList.innerHTML = items.map((item) => {
    const product = item.product;

    if (!product) {
      return `
        <article class="customer-card customer-cart-item">
          <div class="customer-cart-item__body">
            <p class="customer-card__title"><b>Producto ${item.id_product}</b></p>
            <p class="customer-card__meta">Ya no está disponible en el catálogo.</p>
            <div class="customer-card__actions customer-cart-item__cta-actions">
              <button type="button" onclick="removeCartItem(${item.id_product})">Eliminar</button>
            </div>
          </div>
          <div class="customer-cart-item__media">
            <div class="customer-card__media-placeholder">Sin imagen</div>
          </div>
        </article>
      `;
    }

    return `
      <article class="customer-card customer-cart-item">
        <div class="customer-cart-item__body">
          <p class="customer-card__title"><b>${product.name || 'Sin nombre'}</b></p>
          <p class="customer-card__meta">SKU: ${product.sku}</p>
          <p class="customer-card__meta">Mayorista: ${product.company_name || 'Sin proveedor'}</p>
          <p class="customer-card__meta">Precio USD: ${formatAmount(product.price)}</p>
          ${state.exchangeRate?.rate_bs_per_usd
      ? `<p class="customer-card__meta">Precio Bs: Bs.S ${formatBsAmount(convertUsdToBs(product.price))}</p>`
      : ''}
          <p class="customer-card__meta">Subtotal item USD: ${formatAmount(Number(product.price || 0) * Number(item.quantity || 0))}</p>
          ${state.exchangeRate?.rate_bs_per_usd
      ? `<p class="customer-card__meta">Subtotal item Bs: Bs.S ${formatBsAmount(convertUsdToBs(Number(product.price || 0) * Number(item.quantity || 0)))}</p>`
      : ''}
          <div class="customer-card__actions customer-cart-item__qty-actions">
            <span>Cantidad</span>
            <button type="button" onclick="changeCartItemQuantity(${item.id_product}, -1)">-</button>
            <input id="cart-quantity-${item.id_product}" type="number" min="1" step="1" value="${item.quantity}">
            <button type="button" onclick="changeCartItemQuantity(${item.id_product}, 1)">+</button>
          </div>
          <div class="customer-card__actions customer-cart-item__cta-actions">
            <a href="/products/detail.html?sku=${encodeURIComponent(product.sku)}">Ver detalle</a>
            <button type="button" onclick="updateCartItemQuantity(${item.id_product})">Actualizar cantidad</button>
            <button type="button" onclick="removeCartItem(${item.id_product})">Eliminar</button>
          </div>
        </div>
        <div class="customer-cart-item__media">
          ${product.main_image_url
      ? `<img src="${product.main_image_url}" alt="${product.name}">`
      : '<div class="customer-card__media-placeholder">Sin imagen</div>'}
        </div>
      </article>
    `;
  }).join('');
};

const loadLatestExchangeRate = async () => {
  const response = await fetch(`${API_BASE_URL}/api/exchange-rate/latest`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo cargar la tasa actual');
  }

  state.exchangeRate = data.exchange_rate || null;
};

const loadCashback = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/auth/cashback`);
  state.cashback = data.cashback || null;
};

const loadCart = async () => {
  const data = await requestJson(`${API_BASE_URL}/api/auth/cart`);
  renderCart(data.cart);
};

const finalizeCheckout = async () => {
  try {
    const cartItems = Array.isArray(state.cart?.items) ? state.cart.items : [];

    if (!cartItems.length) {
      throw new Error('No hay productos en el carrito');
    }

    if (!confirm('Se creará una compra separada por proveedor y se reservará el stock. ¿Deseas continuar?')) {
      return;
    }

    state.checkoutInFlight = true;
    cartCheckoutButton.disabled = true;
    setFeedback('Procesando checkout...');

    const data = await requestJson(`${API_BASE_URL}/api/purchases/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Use-Cashback': state.useCashback ? 'true' : 'false'
      },
      body: JSON.stringify({
        use_cashback: state.useCashback
      })
    });

    const orderCode = data.checkout.order_code || `#${data.checkout.id_checkout}`;
    setFeedback(`Orden ${orderCode} creada correctamente.`, 'success');
    await loadCashback().catch(() => {
      state.cashback = null;
    });
    await loadCart();
    setTimeout(() => {
      location.href = '/modules/customer/purchases.html';
    }, 600);
  } catch (error) {
    setFeedback(error.message, 'error');
  } finally {
    state.checkoutInFlight = false;
    cartCheckoutButton.disabled = false;
  }
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
cartCheckoutButton.addEventListener('click', finalizeCheckout);
cartUseCashbackInput.addEventListener('change', () => {
  state.useCashback = cartUseCashbackInput.checked;
  renderCart(state.cart);
});
globalThis.changeCartItemQuantity = changeCartItemQuantity;
globalThis.updateCartItemQuantity = updateCartItemQuantity;
globalThis.removeCartItem = removeCartItem;

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    return loadLatestExchangeRate()
      .catch(() => {
        state.exchangeRate = null;
      })
      .then(() => loadCashback().catch(() => {
        state.cashback = null;
      }))
      .then(() => loadCart());
  })
  .catch((error) => {
    alert(error.message);
    clearSession();
    redirectToLogin();
  });