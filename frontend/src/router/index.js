import { createRouter, createWebHistory } from 'vue-router';

// Impor komponen halaman (pages)
import SearchPage from '../views/SearchPage.vue';
import HomePage from '../views/HomePage.vue';
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
import BankTransferCheckout from '../views/BankTransferCheckout.vue'
import QrisCheckout from '../views/QrisCheckout.vue'
import PaymentConfirmation from '../views/PaymentConfirmation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage,
  },
  {
    path: '/mysearch',
    name: 'MySearch',
    component: MySearchPage,
  },
  {
    path: '/report',
    name: 'Report',
    component: FormSearchPage,
  },
  {
    path: '/my-reports',
    name: 'MyReports', // <--- NAMA INI HARUS SAMA PERSIS
    component: MyReportsPage // Asumsi nama komponen
  },
  {
    path: '/rescue',
    name: 'Rescue',
    component: RescuePage,  
  },
  {
    path: '/formlaporanrescue',
    name: 'FormLaporanRescue',
    component: FormLaporanRescue,
  },
  {
    path: '/adopt',
    name: 'Adopt',
    component: AdoptPage,

  },
  {
    path: '/adoptdetail',
    name: 'AdoptDetail',
    component: AdoptDetail,

  },
  {
    path: '/ajukanadopsi',
    name: 'AjukanAdopsi',
    component: AjukanAdopsi,
  },
  {
    path: '/ajukankucing',
    name: 'AjukanKucing',
    component: AjukanKucing,
  },
  {
    path: '/donate',
    name: 'Donate',
    component: DonatePage,
  },
  { 
    path: '/donate/bank/:kode_transaksi', 
    name: 'BankTransferCheckout', 
    component: BankTransferCheckout,
    props: true 
  },
  { 
    path: '/donate/qris/:kode_transaksi', 
    name: 'QrisCheckout', 
    component: QrisCheckout,
    props: true 
  },
  { 
    path: '/payment/confirmation', 
    name: 'PaymentConfirmation', 
    component: PaymentConfirmation 
  },
  {
    path: '/donate/bank/:kode_transaksi', 
    name: 'BankTransferCheckout', 
    component: BankTransferCheckout,
    props: true    
  },
    {
    path: '/payment/confirmation',
    name: 'PaymentConfirmation', 
    component: () => import('../views/PaymentConfirmation.vue'),
    },
    {
    path: '/donate/qris',
    name: 'QrisCheckout',
    component: () => import('../views/QrisCheckout.vue'),
    }
];

const router = createRouter({
  history: createWebHistory(), 
  routes,
});

export default router;