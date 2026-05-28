// theme.js — Applies settings from Store to the DOM
(function applyTheme() {
  const s = Store.getSettings();

  // CSS variables
  document.documentElement.style.setProperty('--accent', s.accentColor);
  document.documentElement.style.setProperty('--dark',   s.heroBg);
  document.documentElement.style.setProperty('--darker', shadeColor(s.heroBg, -20));

  function shadeColor(col, pct) {
    const num = parseInt(col.replace('#',''), 16);
    const r = Math.min(255, Math.max(0, (num>>16) + pct));
    const g = Math.min(255, Math.max(0, ((num>>8)&0x00FF) + pct));
    const b = Math.min(255, Math.max(0, (num&0x0000FF) + pct));
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  // Store name everywhere
  document.querySelectorAll('[data-store-name]').forEach(el => el.textContent = s.storeName);
  document.querySelectorAll('[data-store-tagline]').forEach(el => el.textContent = s.tagline);
  document.querySelectorAll('[data-footer-text]').forEach(el => el.textContent = s.footerText);

  // Logo
  document.querySelectorAll('[data-logo]').forEach(el => {
    el.innerHTML = s.logo
      ? `<img src="${s.logo}" alt="${s.storeName}"> ${s.storeName}`
      : `<span>${s.storeName.split('').map((c,i)=>i===0?`<span class="logo-accent">${c}</span>`:c).join('')}</span>`;
  });

  // Page title
  document.title = s.storeName + (document.title.includes('|') ? document.title.slice(document.title.indexOf('|')) : '');

  // Banner
  const banner = document.getElementById('site-banner');
  if (banner) {
    if (s.bannerActive && s.bannerText) {
      banner.textContent = s.bannerText;
      banner.style.display = '';
    } else {
      banner.style.display = 'none';
    }
  }
})();
