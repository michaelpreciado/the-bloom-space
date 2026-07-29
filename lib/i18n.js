/**
 * EN/ES switching.
 *
 * Pages ship English inline so crawlers and first paint get real content
 * with no JavaScript. Translatable nodes carry data-i18n="<key>"; this
 * module swaps their text when Spanish is selected.
 *
 *   data-i18n           → replaces textContent
 *   data-i18n-attr      → "attr:key,attr:key" for placeholder, aria-label, etc.
 *   data-i18n-html      → replaces innerHTML (use only for copy with markup)
 *
 * The choice persists in localStorage and <html lang> is updated so screen
 * readers switch pronunciation.
 */

import { content, LOCALES, DEFAULT_LOCALE } from '../data/content.js';
import { getContent } from './api.mock.js';

const STORAGE_KEY = 'bloomspace.locale';

let overrides = {};
let current = DEFAULT_LOCALE;

export function getLocale() {
  return current;
}

function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.includes(saved)) return saved;
  } catch { /* ignore */ }

  // Fall back to the browser once, rather than assuming English.
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  return LOCALES.includes(nav) ? nav : DEFAULT_LOCALE;
}

/** Admin overrides win over the seed file. */
export function t(key, locale = current) {
  const entry = overrides[key] || content[key];
  if (!entry) {
    if (location.hostname === 'localhost') console.warn('[i18n] missing key:', key);
    return '';
  }
  return entry[locale] ?? entry[DEFAULT_LOCALE] ?? '';
}

export function applyLocale(locale = current, root = document) {
  current = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  document.documentElement.lang = current;

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.getAttribute('data-i18n'));
    if (value) el.textContent = value;
  });

  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const value = t(el.getAttribute('data-i18n-html'));
    if (value) el.innerHTML = value;
  });

  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const value = t(key);
      if (attr && value) el.setAttribute(attr, value);
    });
  });

  // Toggle buttons advertise the language they switch TO.
  root.querySelectorAll('[data-lang-toggle]').forEach((el) => {
    const other = current === 'en' ? 'es' : 'en';
    el.textContent = t('lang.switchTo');
    el.setAttribute('aria-label', `${t('lang.label')}: ${other === 'es' ? 'Español' : 'English'}`);
    el.setAttribute('lang', other);
  });

  document.dispatchEvent(new CustomEvent('localechange', { detail: { locale: current } }));
}

export function setLocale(locale) {
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* ignore */ }
  applyLocale(locale);
}

export function toggleLocale() {
  setLocale(current === 'en' ? 'es' : 'en');
}

/**
 * Call once per page. Pulls admin overrides first so edited copy shows in
 * both languages, then applies the stored locale.
 */
export async function initI18n() {
  current = readStored();

  try {
    overrides = await getContent();
  } catch {
    overrides = {};
  }

  applyLocale(current);

  document.querySelectorAll('[data-lang-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLocale();
    });
  });

  return current;
}
