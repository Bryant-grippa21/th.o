const API_BASE_URL = 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

const getAuthEntity = () => localStorage.getItem('auth_entity');

const setSession = (token, entity) => {
  localStorage.setItem('token', token);
  localStorage.setItem('auth_entity', entity);
};

const isLogged = () => !!getToken();

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? { Authorization: 'Bearer ' + token }
    : {};
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_entity');
};

const redirectToLogin = () => {
  location.href = '/auth/login.html';
};

const getMeEndpointByEntity = (entity) => {
  if (entity === 'company') {
    return `${API_BASE_URL}/api/company-auth/me`;
  }

  return `${API_BASE_URL}/api/auth/me`;
};

const getProfileEndpointByEntity = (entity) => {
  if (entity === 'company') {
    return `${API_BASE_URL}/api/company-auth/profile`;
  }

  return `${API_BASE_URL}/api/auth/profile`;
};

const getDashboardPathFromSession = (session) => {
  if (session.entity === 'company') {
    const company = session.data.company;

    if (company?.id_role_fk === 1) {
      return '/modules/admin/dashboard.html';
    }

    return '/modules/company/dashboard.html';
  }

  return '/modules/customer/dashboard.html';
};

const normalizeSessionResponse = (entity, data) => {
  if (entity === 'company' && data.company) {
    return { entity, data };
  }

  if (entity === 'customer' && data.user) {
    return { entity, data };
  }

  throw new Error(data.error || 'Sesión inválida');
};

const fetchSessionByEntity = async (entity) => {
  const response = await fetch(getMeEndpointByEntity(entity), {
    headers: getAuthHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo validar la sesión');
  }

  return normalizeSessionResponse(entity, data);
};

const fetchCurrentSession = async () => {
  if (!getToken()) {
    throw new Error('Sesión requerida');
  }

  const entity = getAuthEntity();

  if (entity) {
    return fetchSessionByEntity(entity);
  }

  try {
    const customerSession = await fetchSessionByEntity('customer');
    localStorage.setItem('auth_entity', 'customer');
    return customerSession;
  } catch {
    const companySession = await fetchSessionByEntity('company');
    localStorage.setItem('auth_entity', 'company');
    return companySession;
  }
};

const requireSession = (expectedEntity) => {
  if (!isLogged()) {
    redirectToLogin();
    return false;
  }

  const entity = getAuthEntity();

  if (expectedEntity && entity && entity !== expectedEntity) {
    clearSession();
    redirectToLogin();
    return false;
  }

  return true;
};

const requireCustomerSession = () => requireSession('customer');

const requireCompanySession = () => requireSession('company');

const redirectToDashboard = async () => {
  const session = await fetchCurrentSession();
  location.href = getDashboardPathFromSession(session);
};

const logout = () => {
  clearSession();
  redirectToLogin();
};