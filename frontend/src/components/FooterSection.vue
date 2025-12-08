<template>
  <footer class="footer">
    <div class="wave"></div>

    <div class="footer-content">
      <div class="footer-section">
        <h3>About Us</h3>
        <p>
          Meowment adalah sebuah website yang memberikan akses untuk para pecinta
          kucing dan para relawan kucing liar berkontribusi menolong kucing terlantar.
        </p>
      </div>

      <div class="footer-section">
        <h3>Follow Us</h3>
        <ul>
          <li>📸 <span>@meowment</span></li>
          <li>❌ <span>@meowment</span></li>
          <li>⚫ <span>@meowment</span></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Contact Us</h3>
        <p>0858-8088-3095</p>
      </div>
    </div>

    <div class="footer-bottom">
      © 2025 <strong>Meowment</strong>. All rights reserved.
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  background: var(--darky);
  color: #fffaf2;
  padding-top: 80px;
  font-family: "Poppins", sans-serif;
  overflow: hidden;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  margin-top: auto; /* Ini yang bikin footer selalu di bawah */
  width: 100%;
}

/* Wave murni CSS di atas footer */
.wave {
  position: absolute;
  top: -60px;
  left: 0;
  width: 100%;
  height: 60px;
  background: radial-gradient(circle at 50% 100%, #b47d56 40px, transparent 41px)
    repeat-x;
  background-size: 60px 60px;
}

/* Isi footer */
.footer-content {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2.5rem 1rem;
}

.footer-section {
  max-width: 300px;
  text-align: left;
}

.footer-section h3 {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff4e4;
  position: relative;
}

.footer-section h3::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: #f9d6b0;
  border-radius: 2px;
}

.footer-section p {
  color: #fff;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Social */
.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.6rem;
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.footer-section li:hover {
  transform: translateX(5px);
}

.footer-section li span {
  color: #fff4e4;
  transition: color 0.3s ease;
}

.footer-section li:hover span {
  color: #fddbb0;
}

/* Batas bawah */
.footer-bottom {
  text-align: center;
  padding: 1.2rem 0;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }
  
  .footer-section {
    max-width: 100%;
  }
}
</style>