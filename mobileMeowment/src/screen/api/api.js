import axios from 'axios';

// 1. Link Ngrok Aktif Kamu
const BASE_URL = "https://hyperrhythmical-joy-uninherently.ngrok-free.dev";

// 2. Buat Instance Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Berhenti mencoba setelah 10 detik jika tidak ada respon
  headers: {
    'Content-Type': 'application/json',
    // PENTING: Supaya ngrok tidak menampilkan halaman peringatan "Visit Site"
    'ngrok-skip-browser-warning': 'true', 
  }
});

export default api;
export { BASE_URL };