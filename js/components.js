// components.js — Injects header, cart, checkout, footer into every store page

document.addEventListener('DOMContentLoaded', async () => {
  const s    = await Store.getSettings();
  const page = location.pathname.split('/').pop() || 'index.html';

  const bannerHtml = `<div class="banner" id="site-banner"></div>`;

  const headerHtml = `
  <header>
    <div class="header-inner">
      <a href="index.html" class="logo" id="site-logo"></a>
      <nav id="main-nav">
        <a href="index.html"    class="${page==='index.html'||page===''?'active':''}">Home</a>
        <a href="products.html" class="${page==='products.html'?'active':''}">Products</a>
        <a href="about.html"    class="${page==='about.html'?'active':''}">About</a>
        <a href="contact.html"  class="${page==='contact.html'?'active':''}">Contact</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" onclick="CartDrawer.open()" title="Cart" aria-label="Cart">
          🛒<span class="cart-badge" id="cart-badge-head">0</span>
        </button>
      </div>
      <button class="menu-toggle icon-btn" onclick="toggleMobileMenu()" aria-label="Menu">☰</button>
    </div>
  </header>`;

  const cartHtml = `
  <div class="drawer-overlay" id="cart-overlay"></div>
  <aside class="cart-drawer" id="cart-drawer">
    <div class="drawer-head">
      <h3>🛒 Your Cart</h3>
      <button class="icon-btn" onclick="CartDrawer.close()">✕</button>
    </div>
    <div class="drawer-body" id="cart-body"></div>
    <div class="drawer-foot" id="cart-foot">
      <div class="cart-totals">
        <div class="cart-row"><span>Subtotal</span><span id="cart-subtotal">₹0</span></div>
        <div class="cart-row"><span>Shipping</span><span id="cart-shipping">₹0</span></div>
        <div class="cart-row total"><span>Total</span><span id="cart-total">₹0</span></div>
      </div>
      <button class="checkout-btn" onclick="Checkout.open()">Proceed to Checkout →</button>
    </div>
  </aside>`;

  const checkoutHtml = `
  <div class="modal-overlay" id="checkout-overlay">
    <div class="checkout-modal" id="checkout-modal">
      <div class="cm-head">
        <h2>Complete Your Order</h2>
        <button class="icon-btn" onclick="Checkout.close()">✕</button>
      </div>
      <div id="order-form-wrap">
        <div class="cm-body">
          <div class="cm-section">
            <h3>Order Summary</h3>
            <div id="order-summary"></div>
            <div class="promo-row">
              <input id="promo-input" placeholder="Promo code" style="flex:1;padding:9px 12px;border:1.5px solid #e8e4dd;border-radius:8px;font-size:13px">
              <button class="cm-apply-btn" onclick="Checkout.applyPromo()">Apply</button>
            </div>
            <div id="promo-msg" style="font-size:13px;margin-top:6px;min-height:18px"></div>
          </div>
          <div class="cm-section">
            <h3>Delivery Details</h3>
            <form id="order-form" onsubmit="Checkout.submit(event)">
              <div class="cm-grid">
                <div class="cm-field"><label>Full Name *</label><input name="name" required placeholder="Ravi Kumar"></div>
                <div class="cm-field"><label>Phone *</label><input name="phone" required placeholder="+91 98765 43210"></div>
              </div>
              <div class="cm-field"><label>Email</label><input name="email" type="email" placeholder="you@email.com"></div>
              <div class="cm-field"><label>Address *</label><input name="address" required placeholder="Door No., Street, Area"></div>
              <div class="cm-grid">
                <div class="cm-field"><label>City *</label><input name="city" required placeholder="Chennai"></div>
                <div class="cm-field"><label>PIN Code *</label><input name="pincode" required placeholder="600001"></div>
              </div>
              <div class="cm-field"><label>Order Notes</label><textarea name="notes" rows="2" placeholder="Special instructions…"></textarea></div>
              <button type="submit" class="place-order-btn">Place Order 🎉</button>
            </form>
          </div>
        </div>
      </div>
      <div id="order-success" style="display:none;text-align:center;padding:48px 24px">
        <div style="font-size:60px">🎉</div>
        <h2 style="margin:16px 0 8px">Order Placed!</h2>
        <p style="color:#6c757d;margin-bottom:24px">Thank you! We'll contact you shortly to confirm.</p>
        <button class="place-order-btn" onclick="Checkout.close()">Continue Shopping</button>
      </div>
    </div>
  </div>`;

  const footerHtml = `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo" id="footer-logo"></a>
          <p id="footer-tagline"></p>
        </div>
        <div class="footer-col">
          <h4>Shop</h4>
          <a href="products.html">All Products</a>
          <a href="products.html">New Arrivals</a>
          <a href="products.html">Best Sellers</a>
        </div>
        <div class="footer-col">
          <h4>Info</h4>
          <a href="about.html">About Us</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <a href="mailto:${s.contactEmail}">${s.contactEmail}</a>
          <a href="tel:${s.contactPhone}">${s.contactPhone}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span id="footer-text"></span>
        <span>Made with ❤️ · Powered by MyShop</span>
      </div>
    </div>
  </footer>
  <div id="toast-container" class="toast-container"></div>`;

  document.body.insertAdjacentHTML('afterbegin', bannerHtml + headerHtml);
  document.body.insertAdjacentHTML('beforeend',  cartHtml + checkoutHtml + footerHtml);

  // Apply settings to DOM
  const applyLogo = (el) => {
    if (!el) return;
    el.innerHTML = s.logo
      ? `<img src="${s.logo}" alt="${s.storeName}" style="height:36px">`
      : `<span>${s.storeName.split('').map((c,i)=>i===0?`<span class="logo-accent">${c}</span>`:c).join('')}</span>`;
  };
  applyLogo(document.getElementById('site-logo'));
  applyLogo(document.getElementById('footer-logo'));

  const ft = document.getElementById('footer-tagline'); if(ft) ft.textContent = s.tagline;
  const fb = document.getElementById('footer-text');    if(fb) fb.textContent = s.footerText;

  // Banner
  const banner = document.getElementById('site-banner');
  if (banner) {
    if (s.bannerActive && s.bannerText) banner.textContent = s.bannerText;
    else banner.style.display = 'none';
  }

  // Theme colors
  document.documentElement.style.setProperty('--accent', s.accentColor || '#e94560');
  document.documentElement.style.setProperty('--dark',   s.heroBg || '#1a1a2e');
  const shade = (c,p) => { const n=parseInt(c.replace('#',''),16); const r=Math.min(255,Math.max(0,(n>>16)+p)); const g=Math.min(255,Math.max(0,((n>>8)&0xFF)+p)); const b=Math.min(255,Math.max(0,(n&0xFF)+p)); return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); };
  document.documentElement.style.setProperty('--darker', shade(s.heroBg||'#1a1a2e',-20));

  // Page title
  document.title = document.title.includes('|')
    ? s.storeName + ' | ' + document.title.split('|')[1].trim()
    : s.storeName + (document.title && document.title!=='MyShop' ? ' | ' + document.title : '');

  updateCartBadge();

  // Cart overlay listeners
  document.getElementById('cart-overlay')?.addEventListener('click', () => CartDrawer.close());
  document.getElementById('checkout-overlay')?.addEventListener('click', e => {
    if (e.target===e.currentTarget) Checkout.close();
  });
});

/* ── Scroll reveal observer ───────────────────────────── */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.page-section, .feature-item, .about-grid, .contact-grid, .product-card').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

/* ── Header scroll effect ─────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── Clean URLs (remove .html from address bar) ───────── */
function cleanURL() {
  const path = location.pathname;
  if (path.endsWith('.html')) {
    const clean = path.slice(0, -5) || '/';
    history.replaceState(null, '', clean + location.search + location.hash);
  }
}

/* ── Run on DOMContentLoaded (appended) ──────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  cleanURL();
  setTimeout(() => { initScrollReveal(); initHeaderScroll(); }, 100);
});

/* ── Mobile menu ─────────────────────────────────────── */
function toggleMobileMenu() {
  document.getElementById('main-nav')?.classList.toggle('mobile-open');
}
