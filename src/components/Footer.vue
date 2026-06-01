<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>Shayne<em>Styles</em></h3>
          <p>Where fashion meets self-expression. Curated clothing, accessories, and press-on nails for modern style.</p>
        </div>

        <div class="footer-col">
          <h4>Shop</h4>
          <router-link to="/">Home</router-link>
          <router-link to="/modiwear">ModiWear</router-link>
          <router-link to="/favorites">Favorites</router-link>
          <router-link to="/cart">Cart</router-link>
        </div>

        <div class="footer-col">
          <h4>Help</h4>
          <a href="#">FAQ</a>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>

        <div class="footer-col">
          <h4>Join Newsletter</h4>
          <p class="newsletter-copy">Get updates on drops and seasonal offers.</p>
          <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button>Join</button>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 ShayneStyles. All rights reserved.</p>
        <p>Privacy · Terms · Cookies</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: #1a1410;
  color: #d4c8bc;
  margin-top: 56px;
}

.footer-inner {
  padding: 48px 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 32px;
  margin-bottom: 32px;
}

.footer-brand h3 {
  font-family: var(--font-display);
  font-size: 30px;
  color: #fff;
  margin-bottom: 12px;
}

.footer-brand em {
  color: var(--accent);
  font-style: italic;
}

.footer-brand p {
  color: #a8998c;
  line-height: 1.6;
  max-width: 280px;
}

.footer-col h4 {
  color: #fff;
  font-size: 11px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.footer-col a {
  display: block;
  color: #a8998c;
  font-size: 13px;
  margin-bottom: 8px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--accent);
}

.social-links {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.social-icon:hover {
  background: var(--accent);
  border-color: var(--accent);
}

.newsletter-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.newsletter-form input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #3d3229;
  border-radius: var(--radius);
  font-size: 13px;
  background: #221c17;
  color: #fff;
}

.newsletter-form button {
  padding: 10px 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
}

.newsletter-form button:hover {
  background: var(--accent2);
}

.newsletter-copy {
  font-size: 13px;
  color: #a8998c;
}

.footer-bottom {
  border-top: 1px solid #2a2520;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  margin: 0;
  color: #7f7165;
  font-size: 12px;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
