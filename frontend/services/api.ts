import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. ⚠️ PENTING: Ganti '192.168.x.x' dengan IP lokal laptop Anda (cek di CMD via 'ipconfig')
// Jangan gunakan localhost atau 127.0.0.1 karena tidak akan terdeteksi oleh HP/Emulator
const IP_LAPTOP = '192.168.1.3'; 
const API_BASE_URL = `http://${IP_LAPTOP}:3000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("=== 🚨 AXIOS DEBUG ERROR 🚨 ===");
    if (error.response) {
      // Server merespon dengan status code selain 2xx
      console.log("Status Code:", error.response.status);
      console.log("Data Error dari Server:", error.response.data);
      console.log("Header Server:", error.response.headers);
    } else if (error.request) {
      // Request terkirim tapi tidak ada respon (Masalah Jaringan/IP)
      console.log("Request terkirim tapi tidak ada respon (Cek IP Laptop)");
    } else {
      console.log("Pesan Error:", error.message);
    }
    console.log("URL Terpanggil:", error.config?.url);
    console.log("===============================");
    return Promise.reject(error);
  }
);

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
  // UBAH INI: Hanya hapus data storage
  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
  },
  updateProfile: (formData: FormData) => api.put('/auth/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  }),
};

// --- 2. DATA API ---
export const dataAPI = {
  getProvinces: () => api.get('/wilayah/provinsi'),
  getAllTags: () => api.get('/tags'),
};

// Tambahkan fungsi ini untuk mempermudah pengambilan data user
export const getUserData = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Gagal mengambil data user dari storage", error);
    return null;
  }
};

// --- 3. KUCING API ---
export const kucingAPI = {
  getAll: () => api.get('/kucing'),
  getById: (id: string | number) => api.get(`/kucing/${id}`),
  getByUser: (userId: number | string) => api.get(`/kucing/user/${userId}`),
  getJenis: () => api.get('/kucing/jenis'),
  search: (params: any) => api.get('/kucing/search', { params }),
  // Create menggunakan FormData untuk upload gambar
  create: (formData: FormData) => api.post('/kucing', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// --- 4. DONASI API ---
// frontend/services/api.ts

export const donasiAPI = {
  // Ambil daftar user yang memiliki role 'shelter'
  getShelters: () => api.get('/donasi/shelters'),
  
  // Kirim formulir donasi beserta file bukti transfer
  submitDonasi: (formData: FormData) => api.post('/donasi/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data, // Menjaga format FormData agar tidak rusak
  }),
  
  // Ambil history donasi milik user yang sedang login
  getHistory: (userId: number | string) => api.get(`/donasi/history/${userId}`),
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
  getAll: (params?: any) => api.get('/rescue', { params }), 
  getById: (id: string | number) => api.get(`/rescue/${id}`),
  create: (formData: FormData) => api.post('/rescue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id: string | number, status: string) => 
    api.patch(`/rescue/${id}`, { status }) // Gunakan PATCH sesuai rescueRoutes.js
};

export const getRescue = async () => {
  try {
    const res = await api.get("/rescue"); 
    // Mengembalikan data di dalam { success: true, data: [...] }
    return res.data.data || res.data || [];
  } catch (e: any) {
    console.error("Gagal ambil rescue:", e.message);
    return [];
  }
};

export const createRescue = async (formData: FormData) => {
  const res = await api.post("/rescue", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// --- 7. ADOPSI API ---
export const adopsiAPI = {
  submitAplikasi: (data: any) => api.post('/adopsi/submit', data),
  submitPengajuan: (data: any) => api.post('/pengajuan', data),
  getByUser: (userId: string | number) => api.get(`/pengajuan/user/${userId}`),
  // 1. Ambil daftar kucing milik user (Hasil gabungan si P)
  getKucingSaya: (userId: string | number) => api.get(`/kucing/saya/${userId}`),
  
  // 2. Ambil daftar pelamar untuk kucing tertentu
  getPelamar: (kucingId: string | number) => api.get(`/kucing/pelamar/${kucingId}`),
  
  // 3. Update status pelamar (Terima/Tolak)
  updateStatusPelamar: (id: string | number, status: string) => 
    api.put(`/pelamar/status/${id}`, { status }),
};

// --- 8. CHAT API ---
export const ChatService = {
  getConversations: (userId: any) => api.get(`/chat/conversations/${userId}`),
  getMessages: (id_percakapan: string) => api.get(`/chat/messages/${id_percakapan}`),
  saveMessage: (data: any) => api.post('/chat/send', data),
  markAsRead: (id_percakapan: string) => api.put(`/chat/read/${id_percakapan}`),
};

// --- 9. SHELTER API (TAMBAHKAN INI) ---
export const shelterAPI = {
  cekStatus: (userId: string | number) => api.get(`/cek-status/${userId}`),
  ajukan: (formData: FormData) => api.post('/ajukan-shelter', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const BASE_URL = 'http://192.168.1.3:3000'; 
export const IMAGE_URL = `${BASE_URL}/uploads/`; 

export default api;