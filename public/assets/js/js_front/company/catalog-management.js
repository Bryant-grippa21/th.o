const ROLE_RETAILER = 3;

const summaryElement = document.getElementById('company-wholesale-summary');
const feedbackElement = document.getElementById('company-wholesale-feedback');
const cartSummaryElement = document.getElementById('company-b2b-cart-summary');
const cartFeedbackElement = document.getElementById('company-b2b-cart-feedback');
const cartListElement = document.getElementById('company-b2b-cart-list');
const cartSubmitButton = document.getElementById('company-b2b-cart-submit');
const cartClearButton = document.getElementById('company-b2b-cart-clear');
const productsListElement = document.getElementById('company-wholesale-products-list');
const searchInputElement = document.getElementById('company-wholesale-search');
const sortSelectElement = document.getElementById('company-wholesale-sort');
const categorySelectElement = document.getElementById('company-wholesale-category');
const prevPageButton = document.getElementById('company-wholesale-prev-page');
const nextPageButton = document.getElementById('company-wholesale-next-page');
const pageLabelElement = document.getElementById('company-wholesale-page-label');
const productModalElement = document.getElementById('company-product-modal');
const productModalTitleElement = document.getElementById('company-product-modal-title');
const productModalBodyElement = document.getElementById('company-product-modal-body');
const productModalCloseButton = document.getElementById('company-product-modal-close');

const state = {
  session: null,
  products: [],
  cart: null,
  categories: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  },
  filters: {
    query: '',
    sort: 'recent',
    categoryId: ''
  }
};

let searchDebounceId = null;

if (!requireCompanySession()) {
  throw new Error('Sesión requerida');
}

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
  const data = contentType.includes('application/json') ? JSON.parse(rawBody || '{}') : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error en la solicitud (${response.status})`);
  }

  return data || {};
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

const formatProductDetailText = (value, fallback = 'Sin información') => String(value || '').trim() || fallback;

const getRetailerCartGroupPaymentLabel = (paymentMode) => {
  if (paymentMode === 'INSTALLMENTS') {
    return 'Cuotas';
  }

  return 'Pago único';
};

const setFeedback = (message, type = 'info') => {
  feedbackElement.textContent = message || '';
  feedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const setCartFeedback = (message, type = 'info') => {
  if (!cartFeedbackElement) {
    return;
  }

  cartFeedbackElement.textContent = message || '';
  cartFeedbackElement.style.color = type === 'error' ? '#b00020' : '#1f5f2c';
};

const renderSummary = () => {
  const companyName = state.session?.data?.company?.name || state.session?.data?.company?.email || 'Empresa';
  summaryElement.innerHTML = `
    Empresa: <b>${companyName}</b> |
    Productos visibles: <b>${state.products.length}</b> |
    Total: <b>${state.pagination.total}</b> |
    Página: <b>${state.pagination.page} / ${state.pagination.total_pages}</b>
  `;

  if (pageLabelElement) {
    pageLabelElement.textContent = `Página ${state.pagination.page} de ${state.pagination.total_pages}`;
  }

  if (prevPageButton) {
    prevPageButton.disabled = state.pagination.page <= 1;
  }

  if (nextPageButton) {
    nextPageButton.disabled = state.pagination.page >= state.pagination.total_pages;
  }
};

const renderCategoryOptions = () => {
  if (!categorySelectElement) {
    return;
  }

  const options = ['<option value="">Todas las categorías</option>']
    .concat(state.categories.map((category) => (
      `<option value="${category.id_category}">${category.name}</option>`
    )));

  categorySelectElement.innerHTML = options.join('');
  categorySelectElement.value = state.filters.categoryId;
};

const renderProducts = () => {
  if (!state.products.length) {
    productsListElement.innerHTML = '<p>No hay productos mayoristas para este filtro.</p>';
    return;
  }

  productsListElement.innerHTML = `
    <div class="company-wholesale-grid">
      ${state.products.map((product) => `
        <article class="company-wholesale-card">
          <div class="company-wholesale-card__media">
            ${product.image_url
              ? `<img src="${product.image_url}" alt="${product.name || 'Producto'}">`
              : '<div class="company-wholesale-card__media-placeholder">Sin imagen</div>'}
          </div>

          <div class="company-wholesale-card__body">
            <h3>${product.name || 'Sin nombre'}</h3>
            <p class="company-wholesale-card__seller">Mayorista: ${product.company_name || `Empresa #${product.id_company_fk}`}</p>
            <p class="company-wholesale-card__seller">Categoría: ${product.category_name || 'Sin categoría'}</p>
            <p class="company-wholesale-card__seller">Subcategoría: ${product.subcategory_name || 'Sin subcategoría'}</p>
            <p class="company-wholesale-card__stock">Stock: ${Number(product.quantity || 0)}</p>
            <p class="company-wholesale-card__price">USD ${formatAmount(product.price)}</p>
            <div class="company-card__actions" style="margin-top: 12px; flex-wrap: wrap; gap: 8px;">
              <label style="display:flex; flex-direction:column; gap:4px; min-width: 110px;">
                Cantidad
                <input id="company-cart-qty-${product.id_product}" type="number" min="1" step="1" value="1" style="width:100%;">
              </label>
              <button type="button" data-cart-action="add" data-product-id="${product.id_product}" ${state.cart?.status === 'LOCKED' ? 'disabled' : ''}>Cotizar</button>
              <button type="button" data-product-action="details" data-product-id="${product.id_product}">Ver más detalles</button>
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  `;
};

const renderCart = () => {
  const cart = state.cart || { groups: [], total_items: 0, subtotal_usd: 0 };
  const groups = Array.isArray(cart.groups) ? cart.groups : [];
  const cartIsLocked = String(cart.status || '') === 'LOCKED';

  if (cartSummaryElement) {
    cartSummaryElement.innerHTML = `
      Estado: <b>${cartIsLocked ? 'Bloqueado' : 'Activo'}</b> |
      Empresas en carrito: <b>${Number(cart.groups_count || groups.length || 0)}</b> |
      Productos: <b>${Number(cart.total_items || 0)}</b> |
      Subtotal USD: <b>USD ${formatAmount(cart.subtotal_usd || 0)}</b>
    `;
  }

  if (cartSubmitButton) {
    cartSubmitButton.disabled = cartIsLocked;
  }

  if (!groups.length) {
    cartListElement.innerHTML = '<p>No tienes productos en el carrito B2B.</p>';
    if (cartClearButton) {
      cartClearButton.disabled = cartIsLocked || true;
    }
    return;
  }

  if (cartClearButton) {
    cartClearButton.disabled = cartIsLocked;
  }

  cartListElement.innerHTML = groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    const companyLogoHtml = group.company_image_url
      ? `<img src="${group.company_image_url}" alt="${group.company_name || 'Logo de empresa'}" style="width:72px; height:72px; object-fit:cover; border-radius:16px; border:1px solid #e2e8f0; background:#fff;">`
      : '<div style="width:72px; height:72px; border-radius:16px; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; background:#f8fafc; color:#64748b; font-size:12px;">Sin logo</div>';

    return `
      <details class="company-panel" open>
        <summary><b>${group.company_name || `Empresa #${group.company_id}`}</b> | ${getRetailerCartGroupPaymentLabel(group.payment_mode)} | Items: ${Number(group.items_count || items.length || 0)} | USD ${formatAmount(group.subtotal_usd || 0)}</summary>
        <div style="display:flex; gap:16px; align-items:flex-start; margin-top:12px; flex-wrap:wrap;">
          ${companyLogoHtml}
          <div style="min-width:220px;">
            <p style="margin:0 0 6px;"><b>${group.company_name || `Empresa #${group.company_id}`}</b></p>
            <p style="margin:0 0 6px;">Residencia: ${group.company_address || 'Sin residencia registrada'}</p>
            <p style="margin:0 0 6px;">Correo: ${group.company_email || 'Sin correo registrado'}</p>
            ${group.company_phone ? `<p style="margin:0;">Teléfono: ${group.company_phone}</p>` : ''}
          </div>
        </div>
        <label style="display:flex; flex-direction:column; gap:4px; max-width: 240px; margin: 12px 0;">
          Comentario para mayorista
          <textarea data-cart-group-note="${group.company_id}" rows="3" placeholder="Comentario para esta empresa">${group.note || ''}</textarea>
        </label>
        <label style="display:flex; flex-direction:column; gap:4px; max-width: 240px; margin-bottom: 12px;">
          Tipo de pago
          <select data-cart-group-payment="${group.company_id}">
            <option value="ONE_TIME" ${group.payment_mode === 'ONE_TIME' ? 'selected' : ''}>Pago único</option>
            <option value="INSTALLMENTS" ${group.payment_mode === 'INSTALLMENTS' ? 'selected' : ''}>Cuotas</option>
          </select>
        </label>
        <div class="company-wholesale-grid">
          ${items.map((item) => `
            <article class="company-wholesale-card">
              <div class="company-wholesale-card__media">
                ${item.main_image_url
                  ? `<img src="${item.main_image_url}" alt="${item.product_name || 'Producto'}">`
                  : '<div class="company-wholesale-card__media-placeholder">Sin imagen</div>'}
              </div>
              <div class="company-wholesale-card__body">
                <h3>${item.product_name || 'Sin nombre'}</h3>
                <p class="company-wholesale-card__seller">SKU: ${item.sku || 'Sin SKU'}</p>
                <p class="company-wholesale-card__stock">Cantidad: ${Number(item.quantity || 0)}</p>
                <p class="company-wholesale-card__price">USD ${formatAmount(item.unit_price_usd)}</p>
                <div class="company-card__actions" style="margin-top: 12px; flex-wrap: wrap; gap: 8px;">
                  <button type="button" data-cart-action="remove" data-product-id="${item.id_product}">Eliminar</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </details>
    `;
  }).join('');
};

const renderProductModal = (product) => {
  if (!productModalElement || !productModalTitleElement || !productModalBodyElement) {
    return;
  }

  productModalTitleElement.textContent = product.name || 'Producto';
  productModalBodyElement.innerHTML = `
    <div style="display:grid; grid-template-columns:minmax(240px, 320px) minmax(0, 1fr); gap:24px; align-items:start;">
      <div>
        <div style="border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#f8fafc; min-height:280px; display:flex; align-items:center; justify-content:center;">
          ${product.image_url
            ? `<img src="${product.image_url}" alt="${product.name || 'Producto'}" style="width:100%; height:100%; object-fit:cover;">`
            : '<div style="padding:32px; color:#64748b;">Sin imagen disponible</div>'}
        </div>
      </div>
      <div style="display:grid; gap:10px;">
        <p style="margin:0;"><b>SKU:</b> ${formatProductDetailText(product.sku)}</p>
        <p style="margin:0;"><b>Mayorista:</b> ${formatProductDetailText(product.company_name, `Empresa #${product.id_company_fk}`)}</p>
        <p style="margin:0;"><b>Correo:</b> ${formatProductDetailText(product.company_email)}</p>
        <p style="margin:0;"><b>Residencia:</b> ${formatProductDetailText(product.company_address)}</p>
        <p style="margin:0;"><b>Categoría:</b> ${formatProductDetailText(product.category_name)}</p>
        <p style="margin:0;"><b>Subcategoría:</b> ${formatProductDetailText(product.subcategory_name)}</p>
        <p style="margin:0;"><b>Marca:</b> ${formatProductDetailText(product.brand)}</p>
        <p style="margin:0;"><b>Stock:</b> ${Number(product.quantity || 0)}</p>
        <p style="margin:0;"><b>Precio:</b> USD ${formatAmount(product.price)}</p>
        <p style="margin:0;"><b>Descripción:</b></p>
        <p style="margin:0; color:#334155; line-height:1.5;">${formatProductDetailText(product.description, 'Sin descripción registrada')}</p>
      </div>
    </div>
  `;

  productModalElement.hidden = false;
};

const closeProductModal = () => {
  if (productModalElement) {
    productModalElement.hidden = true;
  }
};

const openProductDetails = (productId) => {
  const product = state.products.find((candidate) => Number(candidate.id_product) === Number(productId));

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  renderProductModal(product);
};

const buildQueryParams = () => {
  const queryParams = new URLSearchParams();

  queryParams.set('page', String(state.pagination.page));
  queryParams.set('limit', String(state.pagination.limit));
  queryParams.set('sort', state.filters.sort);

  if (state.filters.categoryId) {
    queryParams.set('category_id', state.filters.categoryId);
  }

  if (state.filters.query) {
    queryParams.set('q', state.filters.query);
  }

  return queryParams.toString();
};

const loadWholesaleCatalog = async () => {
  const queryString = buildQueryParams();
  const response = await requestJson(`${API_BASE_URL}/api/products/company/wholesale-catalog?${queryString}`);

  state.products = Array.isArray(response.products) ? response.products : [];
  state.pagination = response.pagination || state.pagination;

  renderSummary();
  renderProducts();
};

const loadRetailerCart = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart`);
  state.cart = response.cart || null;
  renderCart();
};

const loadCategories = async () => {
  const response = await requestJson(`${API_BASE_URL}/api/products/categories`);
  state.categories = Array.isArray(response.categories) ? response.categories : [];
  renderCategoryOptions();
};

const changePage = (delta) => {
  const nextPage = state.pagination.page + delta;

  if (nextPage < 1 || nextPage > state.pagination.total_pages) {
    return;
  }

  state.pagination.page = nextPage;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

const handleSearchInput = (event) => {
  state.filters.query = String(event.target.value || '').trim();
  state.pagination.page = 1;

  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
  }

  searchDebounceId = setTimeout(() => {
    loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
  }, 250);
};

const handleSortChange = (event) => {
  state.filters.sort = String(event.target.value || 'recent');
  state.pagination.page = 1;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

const handleCategoryChange = (event) => {
  state.filters.categoryId = String(event.target.value || '');
  state.pagination.page = 1;
  loadWholesaleCatalog().catch((error) => setFeedback(error.message, 'error'));
};

const addProductToRetailerCart = async (productId) => {
  const quantityInput = document.getElementById(`company-cart-qty-${productId}`);
  const quantity = Number(quantityInput?.value || 1);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }

  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_product: Number(productId),
      quantity
    })
  });

  await loadRetailerCart();
};

const removeProductFromRetailerCart = async (productId) => {
  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/items/${productId}`, {
    method: 'DELETE'
  });

  await loadRetailerCart();
};

const updateRetailerCartGroup = async (companyId) => {
  const note = document.querySelector(`[data-cart-group-note="${companyId}"]`)?.value || '';
  const paymentMode = document.querySelector(`[data-cart-group-payment="${companyId}"]`)?.value || 'ONE_TIME';

  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/groups/${companyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      note,
      payment_mode: paymentMode
    })
  });

  await loadRetailerCart();
};

const clearRetailerCart = async () => {
  if (!confirm('¿Deseas vaciar tu carrito B2B?')) {
    return;
  }

  await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart`, {
    method: 'DELETE'
  });

  await loadRetailerCart();
};

const submitRetailerCart = async () => {
  if (!confirm('Se enviarán las cotizaciones agrupadas por empresa. ¿Deseas continuar?')) {
    return;
  }

  if (cartSubmitButton) {
    cartSubmitButton.disabled = true;
  }

  try {
    const response = await requestJson(`${API_BASE_URL}/api/b2b-quotes/retailer-cart/submit`, {
      method: 'POST'
    });

    const totalQuotes = Array.isArray(response.quotes) ? response.quotes.length : 0;
    setCartFeedback(`Cotización solicitada correctamente. Se generaron ${totalQuotes} cotizaciones y tu carrito fue eliminado.`, 'success');
    await loadRetailerCart();
    await loadWholesaleCatalog();
  } catch (error) {
    setCartFeedback(error.message, 'error');
  } finally {
    if (cartSubmitButton) {
      cartSubmitButton.disabled = false;
    }
  }
};

searchInputElement?.addEventListener('input', handleSearchInput);
sortSelectElement?.addEventListener('change', handleSortChange);
categorySelectElement?.addEventListener('change', handleCategoryChange);
prevPageButton?.addEventListener('click', () => changePage(-1));
nextPageButton?.addEventListener('click', () => changePage(1));
cartClearButton?.addEventListener('click', () => {
  clearRetailerCart().catch((error) => setCartFeedback(error.message, 'error'));
});

cartSubmitButton?.addEventListener('click', () => {
  submitRetailerCart().catch((error) => setCartFeedback(error.message, 'error'));
});

productsListElement?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-cart-action]');
  const detailButton = event.target.closest('[data-product-action="details"]');

  if (!button && !detailButton) {
    return;
  }

  try {
    if (detailButton) {
      openProductDetails(Number(detailButton.dataset.productId));
      return;
    }

    const action = button.dataset.cartAction;
    const productId = Number(button.dataset.productId);

    if (action === 'add') {
      await addProductToRetailerCart(productId);
      setCartFeedback('Producto agregado al carrito B2B.', 'success');
      return;
    }
  } catch (error) {
    setCartFeedback(error.message, 'error');
  }
});

cartListElement?.addEventListener('change', async (event) => {
  const noteTarget = event.target.closest('[data-cart-group-note]');
  const paymentTarget = event.target.closest('[data-cart-group-payment]');

  try {
    if (noteTarget) {
      await updateRetailerCartGroup(noteTarget.dataset.cartGroupNote);
      setCartFeedback('Comentario actualizado.', 'success');
      return;
    }

    if (paymentTarget) {
      await updateRetailerCartGroup(paymentTarget.dataset.cartGroupPayment);
      setCartFeedback('Tipo de pago actualizado.', 'success');
    }
  } catch (error) {
    setCartFeedback(error.message, 'error');
  }
});

cartListElement?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-cart-action]');

  if (!button) {
    return;
  }

  if (button.dataset.cartAction !== 'remove') {
    return;
  }

  try {
    await removeProductFromRetailerCart(Number(button.dataset.productId));
    setCartFeedback('Producto eliminado del carrito B2B.', 'success');
  } catch (error) {
    setCartFeedback(error.message, 'error');
  }
});

productModalCloseButton?.addEventListener('click', closeProductModal);

productModalElement?.addEventListener('click', (event) => {
  if (event.target === productModalElement) {
    closeProductModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && productModalElement && !productModalElement.hidden) {
    closeProductModal();
  }
});

fetchCurrentSession()
  .then(async (session) => {
    if (session.entity !== 'company') {
      throw new Error('Sesión no válida para empresa');
    }

    const company = session.data.company || {};
    const roleId = Number(company.id_role_fk || company.id_role || 0);

    if (roleId !== ROLE_RETAILER) {
      throw new Error('Acceso solo para detallista');
    }

    if (company.verification_status !== 'APPROVED' || !company.can_buy) {
      throw new Error('Tu empresa debe estar aprobada y con permiso de compra para ver este catálogo');
    }

    state.session = session;
    await loadCategories();
    await loadWholesaleCatalog();
    await loadRetailerCart();
  })
  .catch((error) => {
    alert(error.message);
    redirectToDashboard();
  });
