// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products/${id}`, { method: 'DELETE' }),
  getStats: () => apiCall('/products/stats'),
};

// Customers API
export const customersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/customers${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/customers/${id}`),
  create: (data) => apiCall('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/customers/${id}`, { method: 'DELETE' }),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/vendors${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/vendors/${id}`),
  create: (data) => apiCall('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/vendors/${id}`, { method: 'DELETE' }),
};

// BOM API
export const bomAPI = {
  getAll: () => apiCall('/bom'),
  getById: (id) => apiCall(`/bom/${id}`),
  create: (data) => apiCall('/bom', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/bom/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/bom/${id}`, { method: 'DELETE' }),
};

// RFQ API
export const rfqAPI = {
  getAll: () => apiCall('/rfq'),
  getById: (id) => apiCall(`/rfq/${id}`),
  create: (data) => apiCall('/rfq', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/rfq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/rfq/${id}`, { method: 'DELETE' }),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: () => apiCall('/purchase-orders'),
  getById: (id) => apiCall(`/purchase-orders/${id}`),
  create: (data) => apiCall('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/purchase-orders/${id}`, { method: 'DELETE' }),
};

// Sales Orders API
export const salesOrdersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/sales-orders${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/sales-orders/${id}`),
  create: (data) => apiCall('/sales-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/sales-orders/${id}`, { method: 'DELETE' }),
  getStats: () => apiCall('/sales-orders/stats'),
};

// Quotations API
export const quotationsAPI = {
  getAll: () => apiCall('/quotations'),
  getById: (id) => apiCall(`/quotations/${id}`),
  create: (data) => apiCall('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/quotations/${id}`, { method: 'DELETE' }),
};

// Manufacturing Orders API
export const manufacturingOrdersAPI = {
  getAll: () => apiCall('/manufacturing-orders'),
  getById: (id) => apiCall(`/manufacturing-orders/${id}`),
  create: (data) => apiCall('/manufacturing-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/manufacturing-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/manufacturing-orders/${id}`, { method: 'DELETE' }),
};

// Employees API
export const employeesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/employees${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiCall(`/employees/${id}`),
  create: (data) => apiCall('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/employees/${id}`, { method: 'DELETE' }),
};

// Health Check
export const healthAPI = {
  check: () => apiCall('/health'),
};
