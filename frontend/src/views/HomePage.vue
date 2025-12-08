<template>
    <Hero />
    <InfoSection
      title="Bantu Kucing Liar Menemukan Rumahnya"
      text="Selamatkan kucing liar tak terurus di daerah sekitar, laporkan dan bantu kami untuk menekan populasi kucing liar di Indonesia."
      image1="/src/assets/section12.jpg"   
      image2="/src/assets/section11.jpg" 
      btnText1="Ke Halaman Rescue"
      btnText2="Ke Halaman Donate"
      :reverse="false"
    />
    <InfoSection
      title="Bantu Para Majikan Kembali Kepada Babunya"
      text="Mari berkontribusi mengembalikan senyuman para Babu Anabul yang kehilangan majikannya"
      image1="/src/assets/section21.jpg"   
      image2="/src/assets/section22.jpg" 
      btnText1="Ke Halaman Search"
      btnText2="Ke Halaman Adopt"
      :reverse="true"
    />
  </template>
  
  <script setup>
  import Hero from "../components/HeroSection.vue"; 
  import InfoSection from "../components/InfoSection.vue";
  </script>