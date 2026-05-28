// ui.js — Shared UI: header, cart drawer, toast, checkout

/* ── Toast ──────────────────────────────────────────── */
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(msg, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = (type === 'success' ? '✅' : '❌') + ' ' + msg;
    this.container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
  }
};

/* ── Cart Badge ─────────────────────────────────────── */
function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    const c = Store.cartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}

/* ── Cart Drawer ────────────────────────────────────── */
const CartDrawer = {
  open() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
    this.render();
  },
  close() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-drawer').classList.remove('open');
    document.body.style.overflow = '';
  },
  render() {
    const cart = Store.getCart();
    const s    = Store.getSettingsSync();
    const body = document.getElementById('cart-body');
    const foot = document.getElementById('cart-foot');
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h3>Your cart is empty</h3><p>Add some products to get started!</p></div>`;
      if (foot) foot.style.display = 'none';
      return;
    }
    if (foot) foot.style.display = '';

    body.innerHTML = cart.map(item => {
      const p = Store.getProductSync(item.id);
      if (!p) return '';
      const img = p.image
        ? `<img src="${p.image}" alt="${p.name}">`
        : `<span style="font-size:26px">🛍️</span>`;
      return `
      <div class="cart-item">
        <div class="cart-item-img">${img}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${s.currency}${p.price.toLocaleString()}</div>
          <div class="qty-ctrl">
            <button onclick="CartDrawer.changeQty('${p.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="CartDrawer.changeQty('${p.id}', 1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="CartDrawer.remove('${p.id}')" title="Remove">✕</button>
      </div>`;
    }).join('');

    const total = Store.cartTotalSync();
    const shipping = total >= 500 ? 'Free' : s.currency + '49';
    document.getElementById('cart-subtotal').textContent = s.currency + total.toLocaleString();
    document.getElementById('cart-shipping').textContent = shipping;
    document.getElementById('cart-total').textContent = s.currency + (shipping === 'Free' ? total : total + 49).toLocaleString();
  },
  changeQty(id, delta) {
    const cart = Store.getCart();
    const item = cart.find(i => i.id === id);
    if (item) Store.updateCartQty(id, item.qty + delta);
    this.render();
    updateCartBadge();
  },
  remove(id) {
    Store.removeFromCart(id);
    this.render();
    updateCartBadge();
    Toast.show('Item removed from cart');
  }
};

/* ── Add-to-Cart helper ─────────────────────────────── */
function addToCart(id, qty = 1) {
  const p = Store.getProductSync(id);
  if (!p) return;
  Store.addToCart(id, qty);
  updateCartBadge();
  Toast.show(`"${p.name}" added to cart 🛍️`);
}

/* ── Checkout Modal ─────────────────────────────────── */
const Checkout = {
  open() {
    const cart = Store.getCart();
    if (cart.length === 0) { Toast.show('Your cart is empty!', 'error'); return; }
    const s = Store.getSettingsSync();
    const overlay = document.getElementById('checkout-overlay');
    const modal   = document.getElementById('checkout-modal');
    if (!overlay || !modal) return;

    // Populate order summary
    const total  = Store.cartTotalSync();
    const ship   = total >= 500 ? 0 : 49;
    const rows   = cart.map(i => {
      const p = Store.getProduct(i.id);
      return p ? `<div class="osi-row"><span>${p.name} × ${i.qty}</span><span>${s.currency}${(p.price*i.qty).toLocaleString()}</span></div>` : '';
    }).join('');
    const summaryEl = document.getElementById('order-summary');
    if (summaryEl) summaryEl.innerHTML = rows +
      `<div class="osi-row"><span>Shipping</span><span>${ship===0?'Free':s.currency+ship}</span></div>` +
      `<div class="osi-row total"><span>Total</span><span>${s.currency}${(total+ship).toLocaleString()}</span></div>`;

    // Show form
    document.getElementById('order-success').style.display = 'none';
    document.getElementById('order-form-wrap').style.display = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    CartDrawer.close();
  },
  close() {
    document.getElementById('checkout-overlay').classList.remove('open');
    document.body.style.overflow = '';
  },
  async submit(e) {
    e.preventDefault();
    const form  = document.getElementById('order-form');
    const data  = new FormData(form);
    const order = {
      customer: {
        name:    data.get('name'),
        email:   data.get('email'),
        phone:   data.get('phone'),
        address: data.get('address'),
        city:    data.get('city'),
        pincode: data.get('pincode'),
        notes:   data.get('notes'),
      },
      items: Store.getCart().map(i => {
        const p = Store.getProductSync(i.id);
        return { id:i.id, name:p ? p.name : i.id, price:p ? p.price : 0, qty:i.qty };
      }),
      total: Store.cartTotalSync(),
    };
    await Store.addOrder(order);
    Store.clearCart();
    updateCartBadge();
    document.getElementById('order-form-wrap').style.display = 'none';
    document.getElementById('order-success').style.display = '';
    form.reset();
  }
};

/* ── Header mobile menu ─────────────────────────────── */
function toggleMobileMenu() {
  document.querySelector('nav').classList.toggle('mobile-open');
}

/* ── Init all shared UI ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  updateCartBadge();

  // Cart overlay close
  document.getElementById('cart-overlay')?.addEventListener('click', () => CartDrawer.close());
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) Checkout.close();
  });
});
