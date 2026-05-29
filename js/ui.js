// ui.js — Cart, Checkout, Toast

/* ── Toast ──────────────────────────────────────────── */
const Toast = {
  init() {
    if (!document.getElementById('toast-container')) {
      const c = document.createElement('div');
      c.id = 'toast-container'; c.className = 'toast-container';
      document.body.appendChild(c);
    }
  },
  show(msg, type='success') {
    this.init();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = (type==='success'?'✅':'❌') + ' ' + msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 3200);
  }
};

/* ── Cart Badge ──────────────────────────────────────── */
function updateCartBadge() {
  const c = Store.cartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}

/* ── Cart Drawer ─────────────────────────────────────── */
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
    if (!cart.length) {
      body.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h3>Your cart is empty</h3><p>Add some products to get started!</p></div>`;
      if (foot) foot.style.display = 'none';
      return;
    }
    if (foot) foot.style.display = '';
    body.innerHTML = cart.map(item => {
      const p = Store.getProductSync(item.id);
      if (!p) return '';
      const img = p.image ? `<img src="${p.image}" alt="${p.name}">` : `<span style="font-size:26px">🛍️</span>`;
      return `<div class="cart-item">
        <div class="cart-item-img">${img}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${s.currency}${p.price.toLocaleString()}</div>
          <div class="qty-ctrl">
            <button onclick="CartDrawer.changeQty('${p.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="CartDrawer.changeQty('${p.id}',1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="CartDrawer.remove('${p.id}')">✕</button>
      </div>`;
    }).join('');
    const total    = Store.cartTotalSync();
    const shipMin  = s.freeShipMin || 500;
    const shipFee  = s.shippingCharge || 49;
    const shipping = total >= shipMin ? 'Free' : s.currency + shipFee;
    document.getElementById('cart-subtotal').textContent = s.currency + total.toLocaleString();
    document.getElementById('cart-shipping').textContent = shipping;
    document.getElementById('cart-total').textContent    = s.currency + (shipping==='Free' ? total : total+shipFee).toLocaleString();
  },
  changeQty(id, delta) {
    const item = Store.getCart().find(i => i.id===id);
    if (item) Store.updateCartQty(id, item.qty+delta);
    this.render(); updateCartBadge();
  },
  remove(id) { Store.removeFromCart(id); this.render(); updateCartBadge(); Toast.show('Item removed'); }
};

function addToCart(id, qty=1) {
  const p = Store.getProductSync(id);
  if (!p) return;
  Store.addToCart(id, qty);
  updateCartBadge();
  Toast.show(`"${p.name}" added to cart 🛍️`);
}

/* ── Checkout ────────────────────────────────────────── */
let _promoDiscount = 0;

const Checkout = {
  open() {
    const cart = Store.getCart();
    if (!cart.length) { Toast.show('Your cart is empty!', 'error'); return; }
    _promoDiscount = 0;
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-msg').textContent = '';
    this.renderSummary();
    document.getElementById('order-success').style.display = 'none';
    document.getElementById('order-form-wrap').style.display = '';
    document.getElementById('checkout-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    CartDrawer.close();
  },
  close() {
    document.getElementById('checkout-overlay').classList.remove('open');
    document.body.style.overflow = '';
  },
  renderSummary() {
    const s       = Store.getSettingsSync();
    const cart    = Store.getCart();
    const subTotal = Store.cartTotalSync();
    const shipMin  = s.freeShipMin || 500;
    const shipFee  = s.shippingCharge || 49;
    const ship     = (subTotal - _promoDiscount) >= shipMin ? 0 : shipFee;
    const total    = subTotal - _promoDiscount + ship;
    const rows = cart.map(i => {
      const p = Store.getProductSync(i.id);
      return p ? `<div class="osi-row"><span>${p.name} × ${i.qty}</span><span>${s.currency}${(p.price*i.qty).toLocaleString()}</span></div>` : '';
    }).join('');
    document.getElementById('order-summary').innerHTML = rows
      + (_promoDiscount ? `<div class="osi-row" style="color:#22c55e"><span>Promo Discount</span><span>−${s.currency}${_promoDiscount}</span></div>` : '')
      + `<div class="osi-row"><span>Shipping</span><span>${ship===0?'Free':s.currency+ship}</span></div>`
      + `<div class="osi-row total"><span>Total</span><span>${s.currency}${total.toLocaleString()}</span></div>`;
  },
  applyPromo() {
    const code = document.getElementById('promo-input').value;
    const res  = Store.applyPromo(code);
    const el   = document.getElementById('promo-msg');
    if (res.ok) {
      _promoDiscount = res.discount;
      el.style.color = '#22c55e';
      el.textContent = '✅ ' + res.msg;
      this.renderSummary();
    } else {
      _promoDiscount = 0;
      el.style.color = '#ef4444';
      el.textContent = '❌ ' + res.msg;
    }
  },
  async submit(e) {
    e.preventDefault();
    const s    = Store.getSettingsSync();
    const form = document.getElementById('order-form');
    const data = new FormData(form);
    const sub  = Store.cartTotalSync();
    const ship = (sub - _promoDiscount) >= (s.freeShipMin||500) ? 0 : (s.shippingCharge||49);
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
        return { id:i.id, name:p?.name||i.id, price:p?.price||0, qty:i.qty };
      }),
      subtotal:  sub,
      discount:  _promoDiscount,
      shipping:  ship,
      total:     sub - _promoDiscount + ship,
      promoCode: _promoDiscount ? document.getElementById('promo-input').value : '',
    };
    const btn = e.target.querySelector('button[type=submit]');
    if (btn) { btn.disabled=true; btn.textContent='Placing order…'; }
    try {
      await Store.addOrder(order);
      Store.clearCart();
      updateCartBadge();
      document.getElementById('order-form-wrap').style.display = 'none';
      document.getElementById('order-success').style.display = '';
      form.reset();
    } catch(err) {
      Toast.show('Failed to place order. Try again.', 'error');
      if (btn) { btn.disabled=false; btn.textContent='Place Order'; }
    }
  }
};

function toggleMobileMenu() {
  document.querySelector('nav')?.classList.toggle('mobile-open');
}

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  updateCartBadge();
  document.getElementById('cart-overlay')?.addEventListener('click', () => CartDrawer.close());
  document.getElementById('checkout-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) Checkout.close();
  });
});
