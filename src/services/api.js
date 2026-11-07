const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}, token = '') {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle CSV attachment stream or text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    if (!response.ok) throw new Error('Failed to generate CSV export');
    return await response.blob();
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json;
}

export const api = {
  // System status
  async getConfigStatus() {
    return request('/config-status');
  },

  // Profile
  async getProfile(token) {
    return request('/profile', { method: 'GET' }, token);
  },

  async updateProfile(data, token) {
    return request('/profile', { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  // Transactions
  async getTransactions(params = {}, token) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/transactions${queryString}`, { method: 'GET' }, token);
  },

  async createTransaction(data, token) {
    return request('/transactions', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  async updateTransaction(id, data, token) {
    return request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  async deleteTransaction(id, token) {
    return request(`/transactions/${id}`, { method: 'DELETE' }, token);
  },

  // Budgets
  async getBudgets(params = {}, token) {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.year) query.append('year', params.year);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/budgets${queryString}`, { method: 'GET' }, token);
  },

  async createBudget(data, token) {
    return request('/budgets', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  async updateBudget(id, data, token) {
    return request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  async deleteBudget(id, token) {
    return request(`/budgets/${id}`, { method: 'DELETE' }, token);
  },

  // Dashboard
  async getDashboardSummary(params = {}, token) {
    const query = new URLSearchParams();
    if (params.period) query.append('period', params.period);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/dashboard/summary${queryString}`, { method: 'GET' }, token);
  },

  async getDashboardAnalytics(token) {
    return request('/dashboard/analytics', { method: 'GET' }, token);
  },

  // Reports
  async getReportsSummary(params = {}, token) {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/reports/summary${queryString}`, { method: 'GET' }, token);
  },

  async exportCSV(params = {}, token) {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.type) query.append('type', params.type);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/reports/export${queryString}`, { method: 'GET' }, token);
  },
};
