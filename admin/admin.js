/**
 * Admin panel — runs entirely against lib/api.mock.js.
 *
 * Nothing here talks to a network. Every read and write goes through the
 * mock module, so at launch the same calls hit real serverless routes and
 * this file does not change.
 */

import {
  login, logout, hasSession, resetPreviewData,
  getContent, saveContent, getFaq, saveFaq,
  getGallery, saveGallery, uploadImage,
  getRates, saveRates, getBlocks, saveBlocks,
  listInquiries, markInquiryRead, deleteInquiry,
} from '../lib/api.mock.js';

import { content as SEED } from '../data/content.js';
import { DAY_RATES } from '../data/rates.js';

const $ = (id) => document.getElementById(id);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Copy the owner is most likely to want to change. The rest stays in code. */
const EDITABLE_KEYS = [
  'home.eyebrow', 'home.title', 'home.lead',
  'home.welcomeTitle', 'home.welcomeBody1', 'home.welcomeBody2', 'home.welcomeBody3',
  'home.pullLine',
  'space.title', 'space.lead', 'space.amenitiesNote',
  'gallery.title', 'gallery.lead',
  'pricing.title', 'pricing.lead', 'pricing.depositTitle', 'pricing.depositBody',
  'contact.title', 'contact.lead', 'form.depositNotice',
];

let state = { content: {}, faq: [], gallery: [], rates: {}, blocks: { recurring: [], dates: [] } };

/* ------------------------------------------------------------------ *
 * Gate
 * ------------------------------------------------------------------ */
function showApp() {
  $('gate').hidden = true;
  $('app').hidden = false;
  boot();
}

$('gateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { ok } = await login($('password').value);
  $('gateError').hidden = ok;
  if (ok) showApp();
});

$('signOut').addEventListener('click', async () => {
  await logout();
  location.reload();
});

$('resetBtn').addEventListener('click', async () => {
  if (!confirm('Reset all demo content, gallery, rates and inquiries?')) return;
  await resetPreviewData();
  location.reload();
});

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('is-active'));
    document.querySelectorAll('.admin-panel').forEach((p) => { p.hidden = true; p.classList.remove('is-active'); });
    tab.classList.add('is-active');
    const panel = $(`panel-${tab.dataset.panel}`);
    panel.hidden = false;
    panel.classList.add('is-active');
  });
});

const flash = (id) => {
  const el = $(id);
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 2200);
};

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------------ *
 * Text blocks
 * ------------------------------------------------------------------ */
function renderContent() {
  $('contentEditor').innerHTML = EDITABLE_KEYS.map((key) => {
    const value = state.content[key] || SEED[key] || { en: '', es: '' };
    const long = (value.en || '').length > 90;
    const field = (lang) => long
      ? `<textarea data-key="${key}" data-lang="${lang}" rows="4">${esc(value[lang])}</textarea>`
      : `<input type="text" data-key="${key}" data-lang="${lang}" value="${esc(value[lang])}">`;

    return `
      <div class="editor-row">
        <p class="editor-key">${key}</p>
        <div class="editor-pair">
          <label><span class="lang-tag">EN</span>${field('en')}</label>
          <label><span class="lang-tag">ES</span>${field('es')}</label>
        </div>
      </div>`;
  }).join('');
}

$('saveContent').addEventListener('click', async () => {
  const next = {};
  $('contentEditor').querySelectorAll('[data-key]').forEach((field) => {
    const { key, lang } = field.dataset;
    next[key] ??= { ...(state.content[key] || SEED[key] || { en: '', es: '' }) };
    next[key][lang] = field.value;
  });
  state.content = await saveContent(next);
  flash('contentSaved');
});

/* ------------------------------------------------------------------ *
 * Gallery
 * ------------------------------------------------------------------ */
function renderGallery() {
  $('galleryEditor').innerHTML = state.gallery.map((item, i) => `
    <div class="gallery-row" data-index="${i}">
      <img src="${item.src}" alt="" class="gallery-thumb">
      <div class="gallery-fields">
        <label>
          <span class="lang-tag req">Alt text (required)</span>
          <input type="text" data-field="alt" value="${esc(item.alt)}"
                 placeholder="Describe the photo for screen readers">
        </label>
        <div class="editor-pair">
          <label><span class="lang-tag">Caption EN</span>
            <input type="text" data-field="caption.en" value="${esc(item.caption?.en || '')}"></label>
          <label><span class="lang-tag">Caption ES</span>
            <input type="text" data-field="caption.es" value="${esc(item.caption?.es || '')}"></label>
        </div>
      </div>
      <div class="gallery-controls">
        <button type="button" data-move="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>&uarr;</button>
        <button type="button" data-move="1" aria-label="Move down" ${i === state.gallery.length - 1 ? 'disabled' : ''}>&darr;</button>
        <button type="button" data-remove aria-label="Remove image">&times;</button>
      </div>
    </div>`).join('');
}

$('galleryEditor').addEventListener('click', (e) => {
  const row = e.target.closest('.gallery-row');
  if (!row) return;
  const i = Number(row.dataset.index);

  if (e.target.dataset.remove !== undefined) {
    state.gallery.splice(i, 1);
    renderGallery();
  } else if (e.target.dataset.move) {
    const to = i + Number(e.target.dataset.move);
    if (to < 0 || to >= state.gallery.length) return;
    [state.gallery[i], state.gallery[to]] = [state.gallery[to], state.gallery[i]];
    renderGallery();
  }
});

$('galleryUpload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const { url } = await uploadImage(file);
    state.gallery.push({
      id: 'g' + Math.random().toString(36).slice(2, 8),
      src: url, alt: '', caption: { en: '', es: '' }, order: state.gallery.length,
    });
  }
  e.target.value = '';
  renderGallery();
});

$('saveGallery').addEventListener('click', async () => {
  $('galleryEditor').querySelectorAll('.gallery-row').forEach((row) => {
    const i = Number(row.dataset.index);
    row.querySelectorAll('[data-field]').forEach((field) => {
      const path = field.dataset.field;
      if (path === 'alt') state.gallery[i].alt = field.value.trim();
      else {
        const [, lang] = path.split('.');
        state.gallery[i].caption ??= { en: '', es: '' };
        state.gallery[i].caption[lang] = field.value;
      }
    });
  });

  // Alt text is not optional — an image without it fails accessibility.
  if (state.gallery.some((item) => !item.alt)) {
    flash('galleryError');
    return;
  }

  state.gallery = await saveGallery(state.gallery);
  renderGallery();
  flash('gallerySaved');
});

/* ------------------------------------------------------------------ *
 * FAQ
 * ------------------------------------------------------------------ */
function renderFaq() {
  $('faqEditor').innerHTML = state.faq.map((entry, i) => `
    <div class="editor-row" data-index="${i}">
      <div class="editor-pair">
        <label><span class="lang-tag">Question EN</span>
          <input type="text" data-f="q.en" value="${esc(entry.q.en)}"></label>
        <label><span class="lang-tag">Question ES</span>
          <input type="text" data-f="q.es" value="${esc(entry.q.es)}"></label>
      </div>
      <div class="editor-pair">
        <label><span class="lang-tag">Answer EN</span>
          <textarea data-f="a.en" rows="3">${esc(entry.a.en)}</textarea></label>
        <label><span class="lang-tag">Answer ES</span>
          <textarea data-f="a.es" rows="3">${esc(entry.a.es)}</textarea></label>
      </div>
      <button type="button" class="row-remove" data-remove>Remove</button>
    </div>`).join('');
}

$('faqEditor').addEventListener('click', (e) => {
  if (e.target.dataset.remove === undefined) return;
  state.faq.splice(Number(e.target.closest('.editor-row').dataset.index), 1);
  renderFaq();
});

$('addFaq').addEventListener('click', () => {
  state.faq.push({
    id: 'faq' + Math.random().toString(36).slice(2, 7),
    q: { en: '', es: '' }, a: { en: '', es: '' },
  });
  renderFaq();
});

$('saveFaq').addEventListener('click', async () => {
  $('faqEditor').querySelectorAll('.editor-row').forEach((row) => {
    const i = Number(row.dataset.index);
    row.querySelectorAll('[data-f]').forEach((field) => {
      const [group, lang] = field.dataset.f.split('.');
      state.faq[i][group][lang] = field.value;
    });
  });
  state.faq = await saveFaq(state.faq);
  flash('faqSaved');
});

/* ------------------------------------------------------------------ *
 * Rates
 * ------------------------------------------------------------------ */
function renderRates() {
  $('ratesEditor').innerHTML = WEEKDAYS.map((day, i) => {
    const rate = state.rates[i] || DAY_RATES[i];
    return `
      <div class="rate-row" data-day="${i}">
        <span class="rate-day">${day}</span>
        <label><span class="lang-tag">$ / hour</span>
          <input type="number" data-r="hourly" min="0" step="5" value="${rate.hourly}"></label>
        <label><span class="lang-tag">Minimum hours</span>
          <input type="number" data-r="minHours" min="1" step="1" value="${rate.minHours}"></label>
      </div>`;
  }).join('');
}

$('saveRates').addEventListener('click', async () => {
  $('ratesEditor').querySelectorAll('.rate-row').forEach((row) => {
    const day = Number(row.dataset.day);
    state.rates[day] = { ...(state.rates[day] || DAY_RATES[day]) };
    row.querySelectorAll('[data-r]').forEach((field) => {
      state.rates[day][field.dataset.r] = Number(field.value);
    });
  });
  state.rates = await saveRates(state.rates);
  flash('ratesSaved');
});

/* ------------------------------------------------------------------ *
 * Blocks
 * ------------------------------------------------------------------ */
function renderBlocks() {
  $('recurringEditor').innerHTML = (state.blocks.recurring || []).map((block, i) => `
    <div class="editor-row block-row" data-index="${i}">
      <label><span class="lang-tag">Day</span>
        <select data-b="weekday">
          ${WEEKDAYS.map((d, w) => `<option value="${w}"${w === block.weekday ? ' selected' : ''}>${d}</option>`).join('')}
        </select></label>
      <label><span class="lang-tag">From</span><input type="time" data-b="start" value="${block.start}"></label>
      <label><span class="lang-tag">To</span><input type="time" data-b="end" value="${block.end}"></label>
      <div class="editor-pair">
        <label><span class="lang-tag">Label EN</span><input type="text" data-b="label" value="${esc(block.label)}"></label>
        <label><span class="lang-tag">Label ES</span><input type="text" data-b="labelEs" value="${esc(block.labelEs || '')}"></label>
      </div>
      <button type="button" class="row-remove" data-remove>Remove</button>
    </div>`).join('');

  $('blockedList').innerHTML = (state.blocks.dates || []).map((d) => `
    <li><span>${d}</span><button type="button" data-date="${d}" aria-label="Unblock ${d}">&times;</button></li>`).join('')
    || '<li class="empty">No one-off dates blocked.</li>';
}

$('recurringEditor').addEventListener('click', (e) => {
  if (e.target.dataset.remove === undefined) return;
  state.blocks.recurring.splice(Number(e.target.closest('.block-row').dataset.index), 1);
  renderBlocks();
});

$('addRecurring').addEventListener('click', () => {
  state.blocks.recurring.push({
    id: 'blk' + Math.random().toString(36).slice(2, 7),
    weekday: 1, start: '19:30', end: '21:30', label: '', labelEs: '',
  });
  renderBlocks();
});

$('addBlockDate').addEventListener('click', () => {
  const value = $('blockDate').value;
  if (!value) return;
  state.blocks.dates ??= [];
  if (!state.blocks.dates.includes(value)) state.blocks.dates.push(value);
  state.blocks.dates.sort();
  $('blockDate').value = '';
  renderBlocks();
});

$('blockedList').addEventListener('click', (e) => {
  const date = e.target.dataset.date;
  if (!date) return;
  state.blocks.dates = state.blocks.dates.filter((d) => d !== date);
  renderBlocks();
});

$('saveBlocks').addEventListener('click', async () => {
  $('recurringEditor').querySelectorAll('.block-row').forEach((row) => {
    const i = Number(row.dataset.index);
    row.querySelectorAll('[data-b]').forEach((field) => {
      const key = field.dataset.b;
      state.blocks.recurring[i][key] = key === 'weekday' ? Number(field.value) : field.value;
    });
  });
  state.blocks = await saveBlocks(state.blocks);
  flash('blocksSaved');
});

/* ------------------------------------------------------------------ *
 * Inquiry inbox
 * ------------------------------------------------------------------ */
async function renderInbox() {
  const items = await listInquiries();
  const unread = items.filter((i) => !i.read).length;
  const badge = $('unreadBadge');
  badge.hidden = unread === 0;
  badge.textContent = String(unread);

  if (!items.length) {
    $('inbox').innerHTML = '<p class="admin-help">No requests yet. Send one from the site to see it here.</p>';
    return;
  }

  $('inbox').innerHTML = items.map((item) => `
    <article class="inquiry${item.read ? ' is-read' : ''}">
      <header>
        <div>
          <strong>${esc(item.firstName)} ${esc(item.lastName)}</strong>
          <span class="inquiry-meta">${new Date(item.receivedAt).toLocaleString()}</span>
        </div>
        <div class="inquiry-actions">
          <button type="button" data-read="${item.id}">${item.read ? 'Mark unread' : 'Mark read'}</button>
          <button type="button" data-del="${item.id}" aria-label="Delete request">&times;</button>
        </div>
      </header>
      <dl class="inquiry-body">
        <div><dt>Email</dt><dd><a href="mailto:${esc(item.email)}">${esc(item.email)}</a></dd></div>
        <div><dt>Phone</dt><dd>${esc(item.phone)}</dd></div>
        <div><dt>Event</dt><dd>${esc(item.eventType)}</dd></div>
        <div><dt>Date</dt><dd>${esc(item.preferredDate)}</dd></div>
        <div><dt>Guests</dt><dd>${esc(item.guestCount)}</dd></div>
        <div><dt>Time</dt><dd>${esc(item.preferredTime || '—')}</dd></div>
        <div><dt>Language</dt><dd>${esc(item.locale || 'en')}</dd></div>
      </dl>
      ${item.message ? `<p class="inquiry-message">${esc(item.message)}</p>` : ''}
    </article>`).join('');
}

$('inbox').addEventListener('click', async (e) => {
  const readId = e.target.dataset.read;
  const delId = e.target.dataset.del;
  if (readId) {
    const items = await listInquiries();
    const current = items.find((i) => i.id === readId);
    await markInquiryRead(readId, !current.read);
    renderInbox();
  } else if (delId) {
    if (!confirm('Delete this request?')) return;
    await deleteInquiry(delId);
    renderInbox();
  }
});

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */
async function boot() {
  const [c, faq, gallery, rates, blocks] = await Promise.all([
    getContent(), getFaq(), getGallery(), getRates(), getBlocks(),
  ]);
  state = { content: c, faq, gallery, rates, blocks };
  renderContent();
  renderGallery();
  renderFaq();
  renderRates();
  renderBlocks();
  renderInbox();
}

if (hasSession()) showApp();
