# 🏪 MyShop — Free E-Commerce Website

A complete, self-contained e-commerce website you can host anywhere for FREE.
No monthly fees. No subscriptions. No server required.

---

## 📁 Files Included

```
myshop/
├── index.html          ← Homepage
├── products.html       ← All Products page
├── product.html        ← Single Product detail page
├── about.html          ← About Us page
├── contact.html        ← Contact page
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── store.js        ← Data layer (localStorage)
│   ├── ui.js           ← Cart, Toast, Checkout
│   ├── components.js   ← Header, Footer (auto-injected)
│   └── theme.js        ← Theme applicator
├── admin/
│   └── index.html      ← ⭐ Your Admin Panel
└── README.md
```

---

## 🚀 How to Use

### Step 1 — Upload to your hosting
Upload ALL files to your web hosting (cPanel, Hostinger, Netlify, GitHub Pages, etc.)
Keep the folder structure exactly as-is.

### Step 2 — Open your store
Visit `your-domain.com/index.html` (or just `your-domain.com/` if you set it as root).

### Step 3 — Open Admin Panel
Go to `your-domain.com/admin/` to manage everything.

---

## 🛠️ Admin Panel Features

### 📦 Products
- Add, edit, delete products
- Upload product images OR use image URL
- Set price, original price (shows discount %)
- Categories, badges (Sale, New, Best Seller, etc.)
- Toggle In Stock / Out of Stock
- Mark as Featured (shows on homepage)

### 🛒 Orders
- See all orders placed on your store
- View full customer details, address, items
- Update order status: New → Processing → Shipped → Delivered → Cancelled

### 🏠 Homepage
- Edit Hero title, subtitle, button text
- Change hero background color
- Toggle/edit announcement banner

### 🎨 Theme & Colors
- Change accent/button color
- Change dark/hero background color
- 6 pre-built theme presets (Ruby Red, Ocean Blue, Forest, etc.)
- Add your logo image URL

### ⚙️ Store Settings
- Store name, tagline, currency symbol
- Contact email & phone
- Footer text
- About section title & text

---

## 📊 How Data is Stored

All data (products, orders, settings) is stored in **localStorage** in the visitor's browser.

> ⚠️ This means:
> - Data is stored on the device/browser being used
> - The admin and store must be on the SAME device/browser
> - Clearing browser data will clear store data
> - For a shared/team setup, consider exporting data regularly

---

## 🌐 Hosting Options (All Free)

| Host | Steps |
|------|-------|
| **Netlify** | Drag & drop the myshop folder at netlify.com/drop |
| **GitHub Pages** | Push to a repo, enable Pages in Settings |
| **Hostinger Free** | Upload via File Manager in hPanel |
| **InfinityFree** | Upload via cPanel file manager |
| **Tiiny.host** | Upload as ZIP at tiiny.host |

---

## 🎨 Customisation Tips

- **Change fonts**: Edit the Google Fonts import in `css/style.css` (line 1)
- **Add more pages**: Copy any `.html` file and edit its content section
- **Add WhatsApp button**: Add `<a href="https://wa.me/91XXXXXXXXXX">` anywhere
- **Currency**: Change in Admin → Store Settings → Currency Symbol (default ₹)

---

## 📞 Need Help?

Everything is in plain HTML/CSS/JavaScript — no framework needed.
Open the files in any text editor (VS Code recommended) to customise further.

---

*Made with ❤️ — Free forever*
