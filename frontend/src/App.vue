<template>
  <div id="app">

    

    <Navbar />
    
    <main class="main-content">
      <router-view></router-view>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/FooterSection.vue";
import { testConnection } from './services/api';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Konten utama akan mengisi sisa space */
.main-content {
  flex: 1 0 auto;
  width: 100%;
}

/* Footer akan selalu di bawah */
footer {
  flex-shrink: 0;
}

</style>