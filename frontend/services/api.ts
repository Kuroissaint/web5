import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.100.16:3000/api",
  timeout: 10000, // Tambahkan timeout 10 detik
});

// --- INTERCEPTOR UNTUK TOKEN ---
// Fungsi ini otomatis berjalan SETIAP KALI kamu panggil api.get atau api.post
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// --- DATA FETCHING ---
// --- DATA FETCHING ---
export const getRescue = async () => {
  try {
    // Sesuaikan dengan rute baru: /api/rescue
    // Kita panggil tanpa query param dulu untuk memastikan rute terpanggil benar
    const res = await api.get("/rescue"); 
    
    // Fastify return { success: true, data: [...] }
    return res.data.data || res.data || [];
  } catch (e: any) {
    console.error("Gagal ambil rescue:", e.response?.data || e.message);
    return [];
  }
};

// --- FUNGSI AMBIL DETAIL (Tambahkan ini jika belum ada) ---
export const getRescueDetail = async (id: number | string) => {
  try {
    const res = await api.get(`/rescue/${id}`);
    return res.data.data;
  } catch (e: any) {
    console.error("Gagal ambil detail rescue:", e.message);
    return null;
  }
};

// --- FUNGSI SUBMIT LAPORAN (PENTING) ---
export const createRescue = async (formData: FormData) => {
  try {
    const res = await api.post("/rescue", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (e: any) {
    // Console log ini akan muncul di terminal laptop kamu
    console.log("DETAL ERROR SUBMIT:", JSON.stringify(e.response?.data, null, 2));
    throw e; // Lemparkan error agar bisa ditangkap di UI (halaman Form)
  }
};
// --- PERBAIKAN FUNGSI UPDATE STATUS (MENGGUNAKAN AXIOS) ---
export const updateRescueStatus = async (id: string | number, newStatus: string) => {
  try {
    // Menggunakan instance 'api' agar token otomatis terkirim
    // Dan URL otomatis menjadi http://192.168.100.16:3000/api/rescue/:id
    const res = await api.patch(`/rescue/${id}`, { status: newStatus });
    
    return res.data;
  } catch (e: any) {
    console.error("Gagal update status:", e.response?.data || e.message);
    throw e;
  }
};