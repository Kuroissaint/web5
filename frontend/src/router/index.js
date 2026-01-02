import { createRouter, createWebHistory } from 'vue-router';

// Impor komponen halaman (pages)
import HomePage from '../views/HomePage.vue';

import SearchPage from '../views/SearchPage.vue';
import MySearchPage from '../views/MySearchPage.vue';
import FormSearchPage from '../views/FormSearch.vue';

import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';

import AdoptPage from '../views/AdoptPage.vue';
import AdoptDetail from '../views/AdoptDetail.vue';
import AjukanAdopsi from '../views/AjukanAdopsi.vue';
import AjukanKucing from '../views/AjukanKucing.vue';

import RescuePage from '../views/RescuePage.vue';
import FormLaporanRescue from '../views/FormLaporanRescue.vue';
import MyReportsPage from '../views/MyReportsPage.vue';

import DonatePage from '../views/Donate.vue'; 
import BankTransferCheckout from '../views/BankTransferCheckout.vue';
import QrisCheckout from '../views/QrisCheckout.vue';
import PaymentConfirmation from '../views/PaymentConfirmation.vue';

const routes = [
  // --- RUTE PUBLIK (Bisa diakses tanpa login) ---
  { 
    path: '/', 
    name: 'Home', 
    component: HomePage 
  },
  { 
    path: '/login', 
    name: 'Login',
     component: LoginPage 
    },
  { 
    path: '/register', 
    name: 'Register', 
    component: RegisterPage 
  },
  { 
    path: '/search', 
    name: 'Search', 
    component: SearchPage 
  },
  { 
    path: '/rescue', 
    name: 'Rescue', component: 
    RescuePage 
  },
  { 
    path: '/adopt', 
    name: 'Adopt', 
    component: AdoptPage 
  },
  { 
    path: '/adoptdetail', 
    name: 'AdoptDetail', 
    component: AdoptDetail 
  },

  // --- RUTE PROTEKSI (Wajib Login) ---
  { 
    path: '/mysearch', 
    name: 'MySearch', 
    component: MySearchPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/report', 
    name: 'Report', 
    component: FormSearchPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/my-reports', 
    name: 'MyReports', 
    component: MyReportsPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/formlaporanrescue', 
    name: 'FormLaporanRescue', 
    component: FormLaporanRescue, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/ajukanadopsi', 
    name: 'AjukanAdopsi', 
    component: AjukanAdopsi, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/ajukankucing', 
    name: 'AjukanKucing', 
    component: AjukanKucing, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/donate', 
    name: 'Donate', 
    component: DonatePage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/donate/bank/:kode_transaksi', 
    name: 'BankTransferCheckout', 
    component: BankTransferCheckout, 
    props: true, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/donate/qris/:kode_transaksi', 
    name: 'QrisCheckout', 
    component: QrisCheckout, 
    props: true, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/payment/confirmation', 
    name: 'PaymentConfirmation', 
    component: PaymentConfirmation, 
    meta: { requiresAuth: true } 
  }
];

const router = createRouter({
  history: createWebHistory(), 
  routes,
});

// ✅ GLOBAL NAVIGATION GUARD
// Fungsi ini akan mengecek status login setiap kali user berpindah halaman
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Mengambil token dari localStorage
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !token) {
    // Jika halaman butuh login tapi user tidak punya token
    alert('Sesi diperlukan. Silakan login untuk melanjutkan.');
    next({ name: 'Login' }); // Lempar ke halaman login
  } else {
    // Jika tidak butuh login atau user sudah punya token
    next();
  }
});

export default router;