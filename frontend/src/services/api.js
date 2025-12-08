import axios from 'axios';

// ✅ Pastikan Port 3000 (Sesuai backend)
const API_BASE_URL = 'http://localhost:3000/api';

// Helper Fetch Utama
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
    }
  };

  // 1. Handle Content-Type
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // 2. Handle Token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || `API Error: ${response.status}`);
    return data;

  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// --- 1. AUTH API ---
export const authAPI = {
  login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// --- 2. DATA API ---
export const dataAPI = {
  getProvinces: () => fetchAPI('/wilayah/provinsi'),
  getAllTags: () => fetchAPI('/tags'),
};

// --- 3. KUCING API ---
export const kucingAPI = {
  getAll: () => fetchAPI('/kucing'),
  getById: (id) => fetchAPI(`/kucing/${id}`),
  search: (params) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
        if (params[key]) {
             if (Array.isArray(params[key])) {
                 params[key].forEach(val => searchParams.append(key, val));
             } else {
                 searchParams.append(key, params[key]);
             }
        }
    }
    return fetchAPI(`/kucing/search?${searchParams.toString()}`);
  },
  create: (formData) => fetchAPI('/kucing', { method: 'POST', body: formData })
};

export const searchKucing = (filters) => kucingAPI.search(filters);
export const testConnection = async () => { return fetchAPI('/health'); };

// --- 4. DONASI API (INI YANG TADI HILANG!) ---
export const donasiAPI = {
  create: (data) => fetchAPI('/donasi', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => fetchAPI('/donasi/stats'), 
  getById: (id) => fetchAPI(`/donasi/${id}`),
};

export const pembayaranAPI = {
  create: (data) => fetchAPI('/pembayaran', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: (kode) => fetchAPI(`/pembayaran/${kode}`),
  uploadBukti: (formData) => fetchAPI('/upload/bukti-bayar', { method: 'POST', body: formData })
};

// --- 5. DEFAULT EXPORT ---
const API = {
  get: (url, config) => {
      // Support query params di axios-style
      if (config && config.params) {
          const q = new URLSearchParams(config.params).toString();
          url += `?${q}`;
      }
      return fetchAPI(url, config);
  },
  post: (url, data) => fetchAPI(url, { 
    method: 'POST', 
    body: data instanceof FormData ? data : JSON.stringify(data) 
  })
};

export default API;