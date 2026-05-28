// components.js — Injects shared header, cart drawer, checkout modal, footer

document.addEventListener('DOMContentLoaded', async () => {
  const s = await Store.getSettings();

  /* ── Determine active nav link ─────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';

  /* ── Banner ────────────────────────────────────────── */
  const bannerHtml = `<div class="banner" id="site-banner"></div>`;

  /* ── Header ────────────────────────────────────────── */
  const headerHtml = `
  <header>
    <div class="header-inner">
      <a href="index.html" class="logo" data-logo></a>
      <nav id="main-nav">
        <a href="index.html"    class="${page==='index.html'?'active':''}">Home</a>
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

  /* ── Cart Drawer ────────────────────────────────────── */
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

  /* ── Checkout Modal ─────────────────────────────────── */
  const checkoutHtml = `
  <div class="modal-overlay" id="checkout-overlay">
    <div class="modal">
      <div id="order-form-wrap">
        <h2>Complete Your Order</h2>
        <div class="order-summary-mini">
          <h4>Order Summary</h4>
          <div id="order-summary"></div>
        </div>
        <form id="order-form" onsubmit="Checkout.submit(event)">
          <div class="form-grid">
            <div class="form-row"><label>Full Name *</label><input name="name" required placeholder="Ravi Kumar"></div>
            <div class="form-row"><label>Phone *</label><input name="phone" required type="tel" placeholder="+91 9876543210"></div>
          </div>
          <div class="form-row"><label>Email *</label><input name="email" required type="email" placeholder="ravi@email.com"></div>
          <div class="form-row"><label>Address *</label><input name="address" required placeholder="Street / Building name"></div>
          <div class="form-grid">
            <div class="form-row"><label>City *</label><input name="city" required placeholder="Chennai"></div>
            <div class="form-row"><label>PIN Code *</label><input name="pincode" required placeholder="641001"></div>
          </div>
          <div class="form-row"><label>Order Notes</label><textarea name="notes" placeholder="Any special instructions…"></textarea></div>
          <button type="submit" class="checkout-btn" style="margin-top:8px">Place Order ✓</button>
        </form>
      </div>
      <div class="success-screen" id="order-success" style="display:none">
        <div class="success-icon">🎉</div>
        <h2>Order Placed!</h2>
        <p>Thank you! Your order has been received successfully.<br>We'll contact you shortly to confirm.</p>
        <button class="btn btn-primary mt-24" onclick="Checkout.close()">Continue Shopping</button>
      </div>
    </div>
  </div>`;

  /* ── Footer ─────────────────────────────────────────── */
  const footerHtml = `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo" data-logo></a>
          <p data-store-tagline></p>
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
        <span data-footer-text></span>
        <span>Made with ❤️ · Powered by MyShop</span>
      </div>
    </div>
  </footer>
  <div id="toast-container" class="toast-container"></div>`;

  /* ── Inject ─────────────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', bannerHtml + headerHtml);
  document.body.insertAdjacentHTML('beforeend', cartHtml + checkoutHtml + footerHtml);

  // Apply theme (needs DOM ready)
  const script = document.createElement('script');
  script.textContent = `
    (function(){
      const s = await Store.getSettings();
      document.documentElement.style.setProperty('--accent', s.accentColor);
      document.documentElement.style.setProperty('--dark', s.heroBg);
      function shade(c,p){const n=parseInt(c.replace('#',''),16);const r=Math.min(255,Math.max(0,(n>>16)+p));const g=Math.min(255,Math.max(0,((n>>8)&0xFF)+p));const b=Math.min(255,Math.max(0,(n&0xFF)+p));return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
      document.documentElement.style.setProperty('--darker', shade(s.heroBg,-20));
      document.querySelectorAll('[data-store-name]').forEach(e=>e.textContent=s.storeName);
      document.querySelectorAll('[data-store-tagline]').forEach(e=>e.textContent=s.tagline);
      document.querySelectorAll('[data-footer-text]').forEach(e=>e.textContent=s.footerText);
      document.querySelectorAll('[data-logo]').forEach(el=>{
        el.innerHTML=s.logo?'<img src="'+s.logo+'" alt="'+s.storeName+'"> '+s.storeName:'<span>'+s.storeName.split('').map((c,i)=>i===0?'<span class="logo-accent">'+c+'</span>':c).join('')+'</span>';
      });
      document.title = s.storeName + (document.title.includes('|') ? document.title.slice(document.title.indexOf('|')) : '');
      const banner=document.getElementById('site-banner');
      if(banner){if(s.bannerActive&&s.bannerText){banner.textContent=s.bannerText;}else{banner.style.display='none';}}
    })();
  `;
  document.head.appendChild(script);

  updateCartBadge();
});
