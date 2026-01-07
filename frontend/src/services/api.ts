import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.10:3000', // GANTI IP KAMU
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


// export const getRescue = async () => {
//   try {
//     const res = await fetch('http://192.168.100.12:3000/api/rescue');
//     const json = await res.json();
//     return json.data || [];
//   } catch (e) {
//     return [];
//   }
// };
