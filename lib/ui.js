/**
 * Shared page behaviour: nav, header state, lightbox, FAQ, counters,
 * hero video and the availability calendar widget.
 *
 * There is deliberately no scroll listener anywhere. Scroll handlers run on
 * the main thread every frame, which is what stops a high-refresh display
 * from reaching its refresh rate. Header state uses IntersectionObserver;
 * all continuous scroll motion is CSS scroll-driven (see styles/site.css).
 */

import { t, getLocale } from './i18n.js';
import {
  DAY_RATES, RECURRING_BLOCKS, dateKey, parseDateKey, toClock,
} from '../data/rates.js';
import { dayStatus, bookableSpans, blocksForDate, formatSpan } from './pricing.js';
import { getBlocks, getRates } from './api.mock.js';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */
export function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * The header always carries a surface. It used to reverse out over a dark
 * full-bleed hero; the hero is light again, so there is nothing to reverse
 * out over and a permanent surface keeps the nav legible from the first pixel.
 */
export function initHeaderState() {
  document.querySelector('.site-header')?.classList.add('is-solid');
}

/* ------------------------------------------------------------------ *
 * Hero video — only fetched when it will actually be watched
 * ------------------------------------------------------------------ */
export function initHeroVideo() {
  const bg = document.getElementById('heroBg');
  const video = document.getElementById('heroVideo');
  if (!bg || !video) return;

  const conn = navigator.connection || {};
  const metered = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
  if (prefersReducedMotion() || metered) return;

  const sources = video.querySelectorAll('source[data-src]');
  if (!sources.length) return;

  video.addEventListener('playing', () => bg.classList.add('video-playing'));
  sources.forEach((s) => { s.src = s.getAttribute('data-src'); });
  video.load();

  const attempt = video.play();
  if (attempt?.catch) attempt.catch(() => { /* autoplay refused — still stays */ });
}

/* ------------------------------------------------------------------ *
 * Stat counters — one shot, then the observer releases
 * ------------------------------------------------------------------ */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => observer.observe(el));

  function run(el) {
    if (prefersReducedMotion()) return;
    const target = Number(el.dataset.countTo);
    const prefix = el.dataset.countPrefix || '';
    const DURATION = 700;
    let start = null;

    el.textContent = prefix + '0';
    requestAnimationFrame(function step(now) {
      start ??= now;
      const p = Math.min(1, (now - start) / DURATION);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
}

/* ------------------------------------------------------------------ *
 * FAQ accordion
 * ------------------------------------------------------------------ */
export function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ------------------------------------------------------------------ *
 * Lightbox
 * ------------------------------------------------------------------ */
export function initLightbox() {
  const items = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  if (!items.length || !lightbox || !image) return;

  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let index = 0;

  const srcs = items.map((item) => {
    const img = item.querySelector('img');
    return { src: img?.getAttribute('src') || '', alt: img?.getAttribute('alt') || '' };
  });

  items.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  function open(i) {
    index = i;
    image.setAttribute('src', srcs[i].src);
    image.setAttribute('alt', srcs[i].alt);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    items[index]?.focus();
  }

  function move(step) {
    if (srcs.length < 2) return;
    index = (index + step + srcs.length) % srcs.length;
    image.setAttribute('src', srcs[index].src);
    image.setAttribute('alt', srcs[index].alt);
  }

  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => move(-1));
  nextBtn?.addEventListener('click', () => move(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'Tab') {
      const focusable = lightbox.querySelectorAll('button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ------------------------------------------------------------------ *
 * Availability calendar
 * ------------------------------------------------------------------ */
const MONTHS = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
};

export async function initAvailability({ onSelect } = {}) {
  const grid = document.getElementById('calGrid');
  const monthLabel = document.getElementById('calMonth');
  if (!grid || !monthLabel) return;

  const prev = document.getElementById('calPrev');
  const next = document.getElementById('calNext');
  const detail = document.getElementById('calDetail');

  const [rates, blocks] = await Promise.all([getRates(), getBlocks()]);
  const opts = {
    rates,
    recurring: blocks.recurring || RECURRING_BLOCKS,
    blockedDates: blocks.dates || [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let year = today.getFullYear();
  let month = today.getMonth();
  let selected = null;
  const MONTHS_AHEAD = 12;

  const monthsFromNow = () =>
    (year - today.getFullYear()) * 12 + (month - today.getMonth());

  function render() {
    const locale = getLocale();
    monthLabel.textContent = `${MONTHS[locale][month]} ${year}`;
    grid.innerHTML = '';

    const pad = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < pad; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day is-blank';
      blank.setAttribute('role', 'presentation');
      grid.appendChild(blank);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const status = dayStatus(date, opts);
      const key = dateKey(date);

      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `cal-day is-${status}${key === selected ? ' is-selected' : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.dataset.key = key;
      cell.innerHTML = `<span>${d}</span>${status === 'past' ? '' : '<span class="dot"></span>'}`;

      const readable = `${MONTHS[locale][month]} ${d}`;
      if (status === 'past') {
        cell.disabled = true;
        cell.setAttribute('aria-label', `${readable} — ${locale === 'es' ? 'fecha pasada' : 'past date'}`);
      } else {
        const word = status === 'open' ? t('pricing.availOpen')
                   : status === 'limited' ? t('pricing.availLimited')
                   : t('pricing.availBlocked');
        cell.setAttribute('aria-label', `${readable} — ${word}`);
        if (status === 'blocked') cell.setAttribute('aria-disabled', 'true');
      }
      grid.appendChild(cell);
    }

    if (prev) prev.disabled = monthsFromNow() <= 0;
    if (next) next.disabled = monthsFromNow() >= MONTHS_AHEAD;
  }

  function renderDetail(key) {
    if (!detail) return;
    const locale = getLocale();
    const date = parseDateKey(key);
    const rate = rates[date.getDay()];
    const spans = bookableSpans(date, opts);
    const held = blocksForDate(date, opts.recurring);

    const heading = `${MONTHS[locale][date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    let html = `<h4>${heading}</h4>`;

    if (!spans.length) {
      html += `<p class="cal-detail-note">${t('pricing.availBlocked')}.</p>`;
    } else {
      const heldNote = held.length
        ? ` ${t('pricing.availHeld')}: ${held.map((h) => `${locale === 'es' ? h.labelEs : h.label} ${toClock(h.startMin, locale)}–${toClock(h.endMin, locale)}`).join('; ')}.`
        : '';
      html += `<p class="cal-detail-note">${rate.minHours} ${t('pricing.hourMin')} ${t('pricing.minimum')}.${heldNote}</p>`;
      html += '<div class="cal-slots">';
      spans.forEach((span) => {
        html += `<button type="button" class="cal-slot" data-start="${span[0]}">${formatSpan(span, locale)}</button>`;
      });
      html += '</div>';
    }
    detail.innerHTML = html;
  }

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cal-day');
    if (!cell || cell.disabled || cell.classList.contains('is-blank')) return;
    selected = cell.dataset.key;
    grid.querySelectorAll('.cal-day').forEach((c) =>
      c.classList.toggle('is-selected', c.dataset.key === selected));
    renderDetail(selected);
    onSelect?.(selected);
  });

  grid.addEventListener('keydown', (e) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in steps)) return;
    const cells = [...grid.querySelectorAll('.cal-day:not(.is-blank):not(:disabled)')];
    const i = cells.indexOf(document.activeElement);
    if (i === -1) return;
    const target = cells[i + steps[e.key]];
    if (target) { e.preventDefault(); target.focus(); }
  });

  prev?.addEventListener('click', () => {
    if (--month < 0) { month = 11; year--; }
    render();
  });
  next?.addEventListener('click', () => {
    if (++month > 11) { month = 0; year++; }
    render();
  });

  document.addEventListener('localechange', () => {
    render();
    if (selected) renderDetail(selected);
  });

  render();
  return { getSelected: () => selected };
}

/* ------------------------------------------------------------------ *
 * Smooth in-page scrolling, offset for the sticky header
 * ------------------------------------------------------------------ */
export function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h'), 10) || 88;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - offset - 8,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
  });
}

/** Everything a normal public page needs. */
export function initPage() {
  initNav();
  initHeaderState();
  initHeroVideo();
  initCounters();
  initFaq();
  initLightbox();
  initAnchors();
}
