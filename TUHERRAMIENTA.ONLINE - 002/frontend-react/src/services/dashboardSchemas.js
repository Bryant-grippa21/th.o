export const DASHBOARD_FILTER_ORDER = [
  'search',
  'period',
  'category',
  'state',
  'city',
  'urbanization',
  'wholesaler',
  'store',
  'seller',
  'status',
  'specific',
];

export const ADMIN_MODULE_FILTERS = {
  home: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'store', 'operationType'],
  risk: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'store', 'financialStatus'],
  wholesalers: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'category'],
  hardware: ['search', 'period', 'state', 'city', 'urbanization', 'store', 'wholesaler', 'category'],
  customers: ['search', 'period', 'state', 'city', 'urbanization', 'store', 'customer', 'category'],
  collections: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'store', 'collector', 'collectionStatus', 'cessionStatus', 'recoveryStatus'],
  operations: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'store', 'orderStatus'],
  finance: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'store', 'category'],
  governance: ['search', 'period', 'userType', 'state', 'city', 'urbanization', 'user', 'responsible', 'eventType', 'requestStatus'],
  inventory: ['search', 'period', 'state', 'city', 'urbanization', 'wholesaler', 'category', 'brand', 'inventoryStatus'],
  commerce: ['search', 'period', 'category', 'brand', 'state', 'city', 'urbanization'],
};

export const WHOLESALER_MODULE_FILTERS = {
  default: ['search', 'period', 'category', 'state', 'city', 'urbanization', 'seller', 'status'],
};

export const RETAILER_MODULE_FILTERS = {
  default: ['search', 'period', 'category', 'state', 'city', 'urbanization', 'status'],
};
