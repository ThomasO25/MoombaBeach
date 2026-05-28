/* ═══════════════════════════════════════════════
   MOOMBA BEACH — Shared JS
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL ── */
  const nav = document.querySelector('.nav');
  const stickyBook = document.querySelector('.sticky-book');
  const floatSocial = document.querySelector('.float-social');

  const onScroll = () => {
    const y = window.scrollY;
    if (!nav) return;
    if (y > 60) {
      nav.classList.add('nav--scrolled');
      stickyBook?.classList.add('show');
      floatSocial?.classList.add('show');
    } else {
      nav.classList.remove('nav--scrolled');
      stickyBook?.classList.remove('show');
      floatSocial?.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── ACTIVE NAV LINK ── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  /* ── MOBILE MENU ── */
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');
  const open = () => { mobileMenu?.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const close = () => { mobileMenu?.classList.remove('is-open'); document.body.style.overflow = ''; };
  burger?.addEventListener('click', open);
  mobileClose?.addEventListener('click', close);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());

  /* ── REVEAL ON SCROLL ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });

  /* ── LIGHTBOX ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  if (lightbox && lbImg) {
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        lbImg.src = el.dataset.lightbox;
        lbImg.alt = el.dataset.alt || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    const closeLb = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; };
    document.getElementById('lb-close')?.addEventListener('click', closeLb);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }

  /* ── MENU TABS ── */
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const id = group.dataset.tabGroup;
    const tabs = document.querySelectorAll(`[data-tab="${id}"]`);
    const panels = document.querySelectorAll(`[data-panel="${id}"]`);
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        const target = document.getElementById(tab.dataset.target);
        target?.classList.add('active');
      });
    });
  });

  /* ── NUMBER COUNTER ANIMATION ── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 60);
        el.textContent = Math.min(start, target) + (el.dataset.suffix || '');
        if (start < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

});
