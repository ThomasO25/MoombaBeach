/* ═══════════════════════════════════════════════════
   MOOMBA BEACH v2 — main.js
   Performance-first shared JavaScript
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── PERFORMANCE: defer non-critical work ── */
const onIdle = (fn) => {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 200);
};

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL ── */
  const nav = document.querySelector('.nav');
  const stickyBook = document.querySelector('.sticky-book');
  const floatSocial = document.querySelector('.float-social');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav?.classList.toggle('nav--scrolled', y > 60);
      stickyBook?.classList.toggle('show', y > 300);
      floatSocial?.classList.toggle('show', y > 300);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── ACTIVE NAV LINK ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(l => {
    if (l.getAttribute('href') === page) l.classList.add('active');
  });

  /* ── MOBILE MENU ── */
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');
  const openMenu = () => { mobileMenu?.classList.add('is-open'); document.body.style.overflow = 'hidden'; burger?.setAttribute('aria-expanded','true'); };
  const closeMenu = () => { mobileMenu?.classList.remove('is-open'); document.body.style.overflow = ''; burger?.setAttribute('aria-expanded','false'); };
  // Expose globally so inline onclick="openMobileMenu()" works
  window.openMobileMenu  = openMenu;
  window.closeMobileMenu = closeMenu;
  burger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  /* ── PERFORMANCE: Intersection Observer for scroll-reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObs.unobserve(e.target); // Stop watching after reveal
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ── PERFORMANCE: Native lazy loading + IntersectionObserver fallback ── */
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading - nothing to do
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.addEventListener('load', () => img.classList.add('loaded'));
      if (img.complete) img.classList.add('loaded');
    });
  } else {
    // Fallback for older browsers
    const lazyObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
          img.classList.add('loaded');
          lazyObs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => lazyObs.observe(img));
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 84, behavior: 'smooth' });
    });
  });

  /* ── LIGHTBOX ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  if (lightbox && lbImg) {
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.lightbox, el.dataset.alt || ''));
      el.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openLightbox(el.dataset.lightbox, el.dataset.alt || '')));
    });
    const closeLb = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; };
    document.getElementById('lb-close')?.addEventListener('click', closeLb);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb(); });
  }

  /* ── MENU TABS ── */
  document.querySelectorAll('[data-tab-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const group = trigger.dataset.tabGroup;
      const target = trigger.dataset.tabTarget;
      document.querySelectorAll(`[data-tab-group="${group}"][data-tab-trigger]`).forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected','false');
      });
      document.querySelectorAll(`[data-tab-group="${group}"][data-tab-panel]`).forEach(p => p.classList.remove('active'));
      trigger.classList.add('active');
      trigger.setAttribute('aria-selected','true');
      document.getElementById(target)?.classList.add('active');
    });
  });

  /* ── COUNTER ANIMATION ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cObs.unobserve(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let val = 0;
        const step = Math.ceil(target / 50);
        const tick = () => { val = Math.min(val + step, target); el.textContent = val + suffix; if (val < target) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cObs.observe(el));
  }

  /* ── PERFORMANCE: Prefetch on hover ── */
  onIdle(() => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('tel') || href.startsWith('mailto')) return;
      a.addEventListener('mouseenter', () => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      }, { once: true });
    });
  });

});

/* ── GLOBAL HELPERS ── */
function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  if (!lb || !img) return;
  img.src = src;
  img.alt = alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  img.focus();
}

/* ── PERFORMANCE: Web Vitals hints ──
   Call this to measure CLS/LCP in production.
   Requires web-vitals npm package or CDN snippet.
   Uncomment when deploying:

   import { getCLS, getLCP, getFID } from 'web-vitals';
   getCLS(console.log);
   getLCP(console.log);
   getFID(console.log);
*/
