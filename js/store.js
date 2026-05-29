// ============================================================
//  MYSHOP — Firebase Cloud Data Layer v3
// ============================================================

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCjoaxFAcH5DmJlzejaXfueLSMJHxNLEjo",
  authDomain:        "testmyshope.firebaseapp.com",
  projectId:         "testmyshope",
  storageBucket:     "testmyshope.firebasestorage.app",
  messagingSenderId: "1070637939017",
  appId:             "1:1070637939017:web:8315cc6d29345c3354c298",
};

let _db = null;
function getDB() {
  if (_db) return _db;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  _db = firebase.firestore();
  return _db;
}

/* ── Defaults ──────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  storeName:    "MyShop",
  tagline:      "Quality products at your fingertips",
  heroTitle:    "Shop the Latest Trends",
  heroSubtitle: "Free shipping on orders over ₹500",
  heroBtn:      "Shop Now",
  heroBg:       "#1a1a2e",
  accentColor:  "#e94560",
  aboutTitle:   "About Our Store",
  aboutText:    "We are a passionate team dedicated to bringing you the best products.",
  footerText:   "© 2024 MyShop. All rights reserved.",
  contactEmail: "hello@myshop.com",
  contactPhone: "+91 98765 43210",
  currency:     "₹",
  logo:         "",
  bannerActive: true,
  bannerText:   "🎉 Free shipping on orders above ₹500 — Limited time offer!",
  promoActive:     false,
  promoCode:       "SAVE10",
  promoType:       "percent",
  promoValue:      10,
  promoMin:        0,
  promoLabel:      "10% OFF",
  freeShipMin:     500,
  shippingCharge:  49,
  // Working hours
  workingHours: "Monday – Saturday, 9am – 7pm",
  workingHoursExtra: "",
};

const DEFAULT_PRODUCTS = [
  { id:"p1", name:"Classic Cotton T-Shirt",   price:799,  originalPrice:1299, category:"Clothing",    description:"Premium quality 100% cotton t-shirt.",                     image:"", badge:"Best Seller", inStock:true,  featured:true  },
  { id:"p2", name:"Wireless Earbuds Pro",      price:2499, originalPrice:3999, category:"Electronics", description:"True wireless earbuds with active noise cancellation.",    image:"", badge:"Sale",        inStock:true,  featured:true  },
  { id:"p3", name:"Leather Wallet",            price:599,  originalPrice:899,  category:"Accessories", description:"Genuine leather bi-fold wallet with RFID blocking.",       image:"", badge:"New",         inStock:true,  featured:false },
];

/* ── In-memory cache ───────────────────────────────────── */
let _settingsCache   = null;
let _productsCache   = null;

const uid = () => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);
const lsGet  = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSave = (k,v) => localStorage.setItem(k, JSON.stringify(v));

/* ── Store API ─────────────────────────────────────────── */
const Store = {

  /* Settings */
  async getSettings() {
    if (_settingsCache) return _settingsCache;
    try {
      const doc = await getDB().collection("store").doc("settings").get();
      _settingsCache = { ...DEFAULT_SETTINGS, ...(doc.exists ? doc.data() : {}) };
    } catch(e) { console.warn("Firestore read failed:", e); _settingsCache = { ...DEFAULT_SETTINGS }; }
    return _settingsCache;
  },
  getSettingsSync() { return _settingsCache || { ...DEFAULT_SETTINGS }; },
  async saveSettings(obj) {
    _settingsCache = { ...(_settingsCache || DEFAULT_SETTINGS), ...obj };
    await getDB().collection("store").doc("settings").set(_settingsCache);
  },

  /* Products */
  async getProducts() {
    if (_productsCache) return _productsCache;
    try {
      const snap = await getDB().collection("products").orderBy("_createdAt","asc").get();
      if (snap.empty) { await this._seedProducts(); return [...DEFAULT_PRODUCTS]; }
      _productsCache = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch(e) { console.warn("Firestore read failed:", e); _productsCache = [...DEFAULT_PRODUCTS]; }
    return _productsCache;
  },
  async _seedProducts() {
    const batch = getDB().batch();
    DEFAULT_PRODUCTS.forEach(p => {
      const ref = getDB().collection("products").doc(p.id);
      batch.set(ref, { ...p, _createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    _productsCache = [...DEFAULT_PRODUCTS];
  },
  async getProduct(id) { return (await this.getProducts()).find(p => p.id === id) || null; },
  getProductSync(id) { return (_productsCache||[]).find(p => p.id === id) || null; },
  async addProduct(p) {
    const id  = uid();
    const doc = { ...p, id, _createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    await getDB().collection("products").doc(id).set(doc);
    _productsCache = null;
    return doc;
  },
  async updateProduct(id, data) {
    const { _createdAt, ...updateData } = data;
    await getDB().collection("products").doc(id).update(updateData);
    _productsCache = null;
  },
  async deleteProduct(id) {
    await getDB().collection("products").doc(id).delete();
    _productsCache = null;
  },

  /* Orders */
  async getOrders() {
    try {
      const snap = await getDB().collection("orders").orderBy("date","desc").get();
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch(e) { console.warn("Orders read failed:", e); return []; }
  },
  async addOrder(o) {
    const id  = uid();
    const doc = { ...o, id, date: new Date().toISOString(), status: "New" };
    await getDB().collection("orders").doc(id).set(doc);
    return doc;
  },
  async updateOrderStatus(id, status) {
    await getDB().collection("orders").doc(id).update({ status });
  },
  async deleteOrder(id) {
    await getDB().collection("orders").doc(id).delete();
  },
  async clearAllOrders() {
    const snap = await getDB().collection("orders").get();
    const batch = getDB().batch();
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
  },
  async clearAllProducts() {
    const snap = await getDB().collection("products").get();
    const batch = getDB().batch();
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    _productsCache = null;
  },

  /* Enquiries */
  async addEnquiry(e) {
    const id  = uid();
    const doc = { ...e, id, date: new Date().toISOString(), status: "New", read: false };
    await getDB().collection("enquiries").doc(id).set(doc);
    return doc;
  },
  async getEnquiries() {
    try {
      const snap = await getDB().collection("enquiries").orderBy("date","desc").get();
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch(e) { console.warn("Enquiries read failed:", e); return []; }
  },
  async markEnquiryRead(id) {
    await getDB().collection("enquiries").doc(id).update({ read: true });
  },
  async deleteEnquiry(id) {
    await getDB().collection("enquiries").doc(id).delete();
  },
  async replyEnquiry(id, reply) {
    await getDB().collection("enquiries").doc(id).update({ reply, repliedAt: new Date().toISOString(), status: "Replied" });
  },

  /* Cart (localStorage — per browser) */
  getCart()              { return lsGet("myshop_cart", []); },
  addToCart(id, qty=1)   { const c=this.getCart(); const i=c.findIndex(x=>x.id===id); if(i>-1) c[i].qty+=qty; else c.push({id,qty}); lsSave("myshop_cart",c); },
  removeFromCart(id)     { lsSave("myshop_cart", this.getCart().filter(i=>i.id!==id)); },
  updateCartQty(id, qty) { if(qty<1) return this.removeFromCart(id); lsSave("myshop_cart", this.getCart().map(i=>i.id===id?{...i,qty}:i)); },
  clearCart()            { lsSave("myshop_cart",[]); },
  cartCount()            { return this.getCart().reduce((s,i)=>s+i.qty,0); },
  cartTotalSync() {
    return this.getCart().reduce((sum,item) => {
      const p = this.getProductSync(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },

  /* Promo codes */
  applyPromo(code) {
    const s = this.getSettingsSync();
    if (!s.promoActive) return { ok:false, msg:"No active promo code." };
    if (code.trim().toUpperCase() !== s.promoCode.toUpperCase()) return { ok:false, msg:"Invalid promo code." };
    const total = this.cartTotalSync();
    if (total < (s.promoMin||0)) return { ok:false, msg:`Minimum order ₹${s.promoMin} required.` };
    const discount = s.promoType === "percent"
      ? Math.round(total * s.promoValue / 100)
      : Math.min(s.promoValue, total);
    return { ok:true, discount, msg:`${s.promoLabel} applied! You save ${s.currency}${discount}` };
  },
};
