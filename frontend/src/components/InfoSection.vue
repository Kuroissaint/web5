<template>
  <section class="info" :class="{ reverse }">
    <div class="info-box"> 
      <div class="text">
        <h2>{{ title }}</h2>
        <p>{{ text }}</p>
        <div class="buttons">
          <button class="btn-light">{{ btnText1 }}</button>
          <button class="btn-dark">{{ btnText2 }}</button>
        </div>
      </div>
      <div class="image-stack">
        <img :src="image1" :alt="title + ' image 1'" class="main-image" />
        <img v-if="image2" :src="image2" :alt="title + ' image 2'" class="secondary-image" />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  text: String,
  image1: String, 
  image2: String, 
  btnText1: String,
  btnText2: String,
  reverse: Boolean,
});
</script>

<style scoped>
.info {
  padding: 2rem 0;
  display: flex;
  justify-content: center;
}

.info-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 4rem 6rem;
  background-color: var(--boxy); 
  border-radius: 20px;
  height: 100%;
  min-height: 500px;
  width: 90%;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.info.reverse .info-box {
  flex-direction: row-reverse;
}

.text {
  flex: 1;
}

.text h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary);
}

.text p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.image-stack {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}


.image-stack .main-image {
  position: absolute;
  width: 70%; 
  height: 60%; 
  object-fit: cover; 
  z-index: 2;
  top: 0%;
  left: 5%;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.image-stack .secondary-image {
  position: absolute;
  width: 65%;
  height: 55%;
  object-fit: cover;
  z-index: 1;
  top: 40%;
  left: 30%;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  filter: brightness(0.9);
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.buttons button {
  padding: 0.8rem 1.5rem;
  border: 1px solid var(--dark);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-light {
  background-color: var(--light); 
  color: var(--dark);
}

.btn-dark {
  background-color: var(--dark); 
  color: var(--light); 
  border: 1px solid var(--dark);
}

.btn-light:hover { background-color: #eee; }
.btn-dark:hover { background-color: var(--primary); border-color: var(--primary); color: white; }

/* Responsive */
@media (max-width: 768px) {
  .info-box {
    flex-direction: column;
    padding: 2rem;
    min-height: auto;
  }
  
  .image-stack {
    min-height: 300px;
    width: 100%;
  }
  
  .image-stack .main-image,
  .image-stack .secondary-image {
    position: relative;
    width: 80%;
    height: auto;
    top: auto;
    left: auto;
    margin-bottom: 1rem;
  }
}
</style>