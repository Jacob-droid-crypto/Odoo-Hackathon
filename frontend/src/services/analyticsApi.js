/**
 * Analytics API Client for Brightloop Software
 * Connects directly to Express backend /api endpoints
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Retrieve authorization token from localStorage or request demo credentials
 */
const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = localStorage.getItem('brightloop_token');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API responses with robust error handling
 */
const handleResponse = async (response) => {
  if (response.status === 401) {
    // If token expired, clear and attempt quick relogin or emit event
    console.warn('API returned 401 Unauthorized.');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob();
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data !== undefined ? json.data : json;
};

export const analyticsApi = {
  // ---------------------------------------------------------------------------
  // AUTHENTICATION HELPER
  // ---------------------------------------------------------------------------
  async loginAdmin(email = 'admin@brightloop.com', password = 'Admin@Brightloop123!') {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to auto-authenticate admin:', err);
      return null;
    }
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  // ---------------------------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------------------------
  async getDashboardSummary() {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // REVENUE ANALYTICS
  // ---------------------------------------------------------------------------
  async getRevenueAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/revenue${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getMonthlyRevenue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/revenue/monthly${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRevenueSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/revenue/summary${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // SUBSCRIPTION ANALYTICS
  // ---------------------------------------------------------------------------
  async getSubscriptionAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/subscriptions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getSubscriptionStatus() {
    const res = await fetch(`${BASE_URL}/analytics/subscriptions/status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getSubscriptionTrends() {
    const res = await fetch(`${BASE_URL}/analytics/subscriptions/trends`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // INVOICE & PAYMENT ANALYTICS
  // ---------------------------------------------------------------------------
  async getInvoiceAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/invoices`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getInvoiceStatusDistribution() {
    const res = await fetch(`${BASE_URL}/analytics/invoices/status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getOutstandingInvoices() {
    const res = await fetch(`${BASE_URL}/analytics/invoices/outstanding`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPaymentAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/payments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPaymentMethods() {
    const res = await fetch(`${BASE_URL}/analytics/payments/methods`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // CUSTOMER ANALYTICS
  // ---------------------------------------------------------------------------
  async getCustomerAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/customers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getCustomerGrowth() {
    const res = await fetch(`${BASE_URL}/analytics/customers/growth`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getTopCustomers() {
    const res = await fetch(`${BASE_URL}/analytics/customers/top`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // ---------------------------------------------------------------------------
  // FINANCIAL REPORTS & CSV DOWNLOAD
  // ---------------------------------------------------------------------------
  async getReport(type = 'revenue', params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/reports/${type}${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async downloadReportCsv(type = 'revenue', params = {}) {
    const query = new URLSearchParams({ ...params, format: 'csv' }).toString();
    const res = await fetch(`${BASE_URL}/reports/${type}?${query}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error('Failed to generate CSV export');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // ---------------------------------------------------------------------------
  // SEED DEMO DATA
  // ---------------------------------------------------------------------------
  async seedDemoData() {
    const res = await fetch(`${BASE_URL}/analytics/seed-demo`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
