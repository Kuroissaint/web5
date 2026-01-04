import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. ⚠️ PENTING: Ganti '192.168.x.x' dengan IP lokal laptop Anda (cek di CMD via 'ipconfig')
// Jangan gunakan localhost atau 127.0.0.1 karena tidak akan terdeteksi oleh HP/Emulator
const IP_LAPTOP = '192.168.1.6'; 
const API_BASE_URL = `http://${IP_LAPTOP}:3000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR: Otomatis memasukkan Token JWT dari AsyncStorage ke setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 1. AUTH API ---
export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: async (navigation: any) => {
    await AsyncStorage.multiRemove(['token', 'user']);
    // Navigasi di React Native menggunakan reset, bukan window.location
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
};

// --- 2. DATA API ---
export const dataAPI = {
  getProvinces: () => api.get('/wilayah/provinsi'),
  getAllTags: () => api.get('/tags'),
};

// --- 3. KUCING API ---
export const kucingAPI = {
  getAll: () => api.get('/kucing'),
  getById: (id: string | number) => api.get(`/kucing/${id}`),
  search: (params: any) => api.get('/kucing/search', { params }),
  // Create menggunakan FormData untuk upload gambar
  create: (formData: FormData) => api.post('/kucing', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// --- 4. DONASI API ---
export const donasiAPI = {
  create: (data: any) => api.post('/donasi', data),
  getStats: () => api.get('/donasi/stats'), 
  getById: (id: string | number) => api.get(`/donasi/${id}`),
};

// --- 5. PEMBAYARAN API ---
export const pembayaranAPI = {
  create: (data: any) => api.post('/pembayaran', data),
  getStatus: (kode: string) => api.get(`/pembayaran/${kode}`),
  uploadBukti: (formData: FormData) => api.post('/upload/bukti-bayar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// --- 6. RESCUE API ---
export const rescueAPI = {
  getAll: () => api.get('/api/rescue'), // Sesuai prefix di server.js
  getById: (id: string | number) => api.get(`/api/rescue/${id}`),
  create: (formData: FormData) => api.post('/api/rescue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id: string | number, status: string) => 
    api.put(`/api/rescue/${id}/status`, { status })
};

// --- 7. ADOPSI API ---
export const adopsiAPI = {
  submitAplikasi: (data: any) => api.post('/adopsi/submit', data),
  submitPengajuan: (data: any) => api.post('/pengajuan', data),
  getByUser: (userId: string | number) => api.get(`/pengajuan/user/${userId}`),
};


export const BASE_URL = 'http://192.168.1.6:3000'; 
export const IMAGE_URL = `${BASE_URL}/uploads/`; 

export default api;