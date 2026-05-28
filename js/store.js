// ============================================================
//  MYSHOP STORE — Firebase Cloud Data Layer
//  Data lives in Firestore (cloud) — works on ALL devices!
//  Cart stays in localStorage (per-user, intentional)
// ============================================================

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────
// Get this from: Firebase Console → Project Settings → Your apps → Web
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjoaxFAcH5DmJlzejaXfueLSMJHxNLEjo",
  authDomain: "testmyshope.firebaseapp.com",
  projectId: "testmyshope",
  storageBucket: "testmyshope.firebasestorage.app",
  messagingSenderId: "1070637939017",
  appId: "1:1070637939017:web:8315cc6d29345c3354c298",
  measurementId: "G-23WGX6WMK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// ─────────────────────────────────────────────────────────────

// Firebase imports (loaded via CDN in each HTML file)
let _db = null;
function getDB() {
  if (_db) return _db;
  if (typeof firebase === 'undefined') throw new Error('Firebase not loaded');
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  _db = firebase.firestore();
  return _db;
}

/* ── Default settings ──────────────────────────────────── */
const DEFAULT_SETTINGS = {
  storeName:    "MyShop",
  tagline:      "Quality products at your fingertips",
  heroTitle:    "Shop the Latest Trends",
  heroSubtitle: "Free shipping on orders over ₹500",
  heroBtn:      "Shop Now",
  heroBg:       "#1a1a2e",
  accentColor:  "#e94560",
  aboutTitle:   "About Our Store",
  aboutText:    "We are a passionate team dedicated to bringing you the best products. Founded with love and a commitment to quality, every item in our store is hand-picked for you.",
  footerText:   "© 2024 MyShop. All rights reserved.",
  contactEmail: "hello@myshop.com",
  contactPhone: "+91 98765 43210",
  currency:     "₹",
  logo:         "",
  bannerActive: true,
  bannerText:   "🎉 Free shipping on orders above ₹500 — Limited time offer!",
};

/* ── Default products ──────────────────────────────────── */
const DEFAULT_PRODUCTS = [
  { id:"p1", name:"Classic Cotton T-Shirt",   price:799,  originalPrice:1299, category:"Clothing",     description:"Premium quality 100% cotton t-shirt. Soft, breathable and perfect for everyday wear.", image:"", badge:"Best Seller", inStock:true,  featured:true  },
  { id:"p2", name:"Wireless Earbuds Pro",      price:2499, originalPrice:3999, category:"Electronics",  description:"True wireless earbuds with active noise cancellation, 24hr battery life.",              image:"", badge:"Sale",        inStock:true,  featured:true  },
  { id:"p3", name:"Leather Wallet",            price:599,  originalPrice:899,  category:"Accessories",  description:"Genuine leather bi-fold wallet with RFID blocking, multiple card slots.",               image:"", badge:"New",         inStock:true,  featured:false },
];

/* ── Helpers ───────────────────────────────────────────── */
const uid  = () => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);
const lsGet  = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSave = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ── Cache: avoids re-fetching on same page load ─────── */
let _settingsCache = null;
let _productsCache = null;

/* ── Public Store API ───────────────────────────────────
   Async methods return Promises.
   Sync methods work with local cart only.
   ────────────────────────────────────────────────────── */
const Store = {

  /* ── Settings ── */
  async getSettings() {
    if (_settingsCache) return _settingsCache;
    try {
      const db  = getDB();
      const doc = await db.collection("store").doc("settings").get();
      _settingsCache = doc.exists ? { ...DEFAULT_SETTINGS, ...doc.data() } : { ...DEFAULT_SETTINGS };
      return _settingsCache;
    } catch(e) {
      console.warn("Firebase read failed, using defaults:", e);
      return { ...DEFAULT_SETTINGS };
    }
  },
  async saveSettings(obj) {
    const db  = getDB();
    const cur = await this.getSettings();
    _settingsCache = { ...cur, ...obj };
    await db.collection("store").doc("settings").set(_settingsCache);
  },
  // Sync fallback used by components.js on page load (returns cached or default)
  getSettingsSync() { return _settingsCache || { ...DEFAULT_SETTINGS }; },

  /* ── Products ── */
  async getProducts() {
    if (_productsCache) return _productsCache;
    try {
      const db   = getDB();
      const snap = await db.collection("products").orderBy("_createdAt", "asc").get();
      if (snap.empty) {
        // First run: seed defaults
        await this._seedProducts();
        return [...DEFAULT_PRODUCTS];
      }
      _productsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return _productsCache;
    } catch(e) {
      console.warn("Firebase read failed:", e);
      return [...DEFAULT_PRODUCTS];
    }
  },
  async _seedProducts() {
    const db = getDB();
    const batch = db.batch();
    DEFAULT_PRODUCTS.forEach(p => {
      const ref = db.collection("products").doc(p.id);
      batch.set(ref, { ...p, _createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
  },
  async getProduct(id) {
    const all = await this.getProducts();
    return all.find(p => p.id === id);
  },
  async addProduct(p) {
    const db  = getDB();
    const id  = uid();
    const doc = { ...p, id, _createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    await db.collection("products").doc(id).set(doc);
    _productsCache = null; // invalidate cache
    return { ...doc, id };
  },
  async updateProduct(id, data) {
    const db = getDB();
    await db.collection("products").doc(id).update(data);
    _productsCache = null;
  },
  async deleteProduct(id) {
    const db = getDB();
    await db.collection("products").doc(id).delete();
    _productsCache = null;
  },

  /* ── Orders ── */
  async getOrders() {
    try {
      const db   = getDB();
      const snap = await db.collection("orders").orderBy("date","desc").get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },
  async addOrder(o) {
    const db  = getDB();
    const id  = uid();
    const doc = { ...o, id, date: new Date().toISOString(), status: "New" };
    await db.collection("orders").doc(id).set(doc);
    return doc;
  },
  async updateOrderStatus(id, status) {
    const db = getDB();
    await db.collection("orders").doc(id).update({ status });
  },

  /* ── Cart (localStorage, per-user) ── */
  getCart()              { return lsGet("myshop_cart", []); },
  addToCart(id, qty=1)   {
    const cart = this.getCart();
    const idx  = cart.findIndex(i => i.id === id);
    if (idx > -1) cart[idx].qty += qty; else cart.push({ id, qty });
    lsSave("myshop_cart", cart);
  },
  removeFromCart(id)     { lsSave("myshop_cart", this.getCart().filter(i => i.id !== id)); },
  updateCartQty(id, qty) {
    if (qty < 1) return this.removeFromCart(id);
    lsSave("myshop_cart", this.getCart().map(i => i.id === id ? { ...i, qty } : i));
  },
  clearCart()            { lsSave("myshop_cart", []); },
  cartCount()            { return this.getCart().reduce((s,i) => s+i.qty, 0); },
  async cartTotal() {
    const s = await this.getSettings();
    const products = await this.getProducts();
    return this.getCart().reduce((sum, item) => {
      const p = products.find(x => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },
  // Sync version for cart drawer (uses cached products)
  cartTotalSync() {
    const products = _productsCache || [];
    return this.getCart().reduce((sum, item) => {
      const p = products.find(x => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },
};

// Sync helpers using cache (for cart drawer which runs after page init)
Store.getProductSync = function(id) {
  if (!_productsCache) return null;
  return _productsCache.find(p => p.id === id) || null;
};
