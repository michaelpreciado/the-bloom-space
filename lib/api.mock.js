/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  THE ONLY MODULE THAT TALKS TO A BACKEND.                            │
 * │                                                                       │
 * │  Everything in this release is mocked against localStorage. Nothing  │
 * │  here makes a network call, and the app holds no keys or secrets.    │
 * │                                                                       │
 * │  AT LAUNCH: replace the body of each method below with a fetch() to  │
 * │  the matching serverless route. The signatures and return shapes are │
 * │  already what the real API should expose, so no calling code changes.│
 * │                                                                       │
 * │    getContent / saveContent   →  Turso  (content table)              │
 * │    getGallery / saveGallery   →  Turso + blob storage                │
 * │    getRates   / saveRates     →  Turso  (rates table)                │
 * │    getBlocks  / saveBlocks    →  Turso  (blocks table)               │
 * │    createInquiry              →  Resend (email) + Turso (inbox)      │
 * │    listInquiries / markRead   →  Turso  (inquiries table)            │
 * │    login / logout / session   →  real server-side auth               │
 * │    checkout                   →  client-owned Stripe                 │
 * └──────────────────────────────────────────────────────────────────────┘
 */

import { FAQ_ENTRIES } from '../data/content.js';
import { DAY_RATES, RECURRING_BLOCKS, BLOCKED_DATES } from '../data/rates.js';

export const IS_MOCK = true;

const NS = 'bloomspace.rc.';
const key = (name) => NS + name;

/** Simulated latency so loading states are real in the preview. */
const LATENCY = 120;
const settle = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY));

function read(name, fallback) {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function write(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Seeded gallery. Images live in /assets. Alt text is required by the
 * admin UI — an image without it cannot be saved.
 * ------------------------------------------------------------------ */
/**
 * Seeded from data/media.json, inlined into the page at build time by
 * tools/build.py. One file governs every image on the site — see the _readme
 * in media.json for how to swap in real photography.
 */
const SEED_GALLERY = (() => {
  const node = typeof document !== 'undefined' && document.getElementById('media-gallery');
  if (!node) return [];
  try {
    return JSON.parse(node.textContent).map((item, i) => ({ ...item, order: i }));
  } catch {
    return [];
  }
})();

const SEED_CONTENT = {};   // admin overrides layer on top of data/content.js

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */
export async function getContent() {
  return settle(read('content', SEED_CONTENT));
}

/** overrides: { 'home.title': { en, es }, … } — merged, not replaced. */
export async function saveContent(overrides) {
  const merged = { ...read('content', SEED_CONTENT), ...overrides };
  write('content', merged);
  return settle(merged);
}

export async function getFaq() {
  return settle(read('faq', FAQ_ENTRIES));
}

export async function saveFaq(entries) {
  write('faq', entries);
  return settle(entries);
}

/* ------------------------------------------------------------------ *
 * Gallery
 * ------------------------------------------------------------------ */
export async function getGallery() {
  const items = read('gallery', SEED_GALLERY);
  items.sort((a, b) => a.order - b.order);
  return settle(items);
}

export async function saveGallery(items) {
  const normalised = items.map((item, i) => ({ ...item, order: i }));
  write('gallery', normalised);
  return settle(normalised);
}

/**
 * In the preview an "upload" is a data URL held in localStorage, which is
 * why the admin warns about size. At launch this posts the file to blob
 * storage and stores the returned URL instead.
 */
export async function uploadImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { url: dataUrl, bytes: file.size, name: file.name };
}

/* ------------------------------------------------------------------ *
 * Rates and blocks
 * ------------------------------------------------------------------ */
export async function getRates() {
  return settle(read('rates', DAY_RATES));
}

export async function saveRates(rates) {
  write('rates', rates);
  return settle(rates);
}

export async function getBlocks() {
  return settle(read('blocks', { recurring: RECURRING_BLOCKS, dates: BLOCKED_DATES }));
}

export async function saveBlocks(blocks) {
  write('blocks', blocks);
  return settle(blocks);
}

/* ------------------------------------------------------------------ *
 * Inquiries
 * ------------------------------------------------------------------ */
export async function createInquiry(payload) {
  const inquiries = read('inquiries', []);
  const record = {
    ...payload,
    id: 'inq_' + Math.random().toString(36).slice(2, 10),
    receivedAt: new Date().toISOString(),
    read: false,
  };
  inquiries.unshift(record);
  write('inquiries', inquiries);

  // AT LAUNCH: Resend sends the owner an email here and the record goes to Turso.
  return settle({ ok: true, id: record.id, delivered: false, mock: true });
}

export async function listInquiries() {
  return settle(read('inquiries', []));
}

export async function markInquiryRead(id, read_ = true) {
  const inquiries = read('inquiries', []);
  const found = inquiries.find((i) => i.id === id);
  if (found) found.read = read_;
  write('inquiries', inquiries);
  return settle(found || null);
}

export async function deleteInquiry(id) {
  const inquiries = read('inquiries', []).filter((i) => i.id !== id);
  write('inquiries', inquiries);
  return settle({ ok: true });
}

/* ------------------------------------------------------------------ *
 * Auth — PREVIEW ONLY
 * ------------------------------------------------------------------ */
/**
 * Digest of the preview passphrase rather than the passphrase itself, so no
 * literal credential ships in source. To be clear this is still NOT security:
 * the gate runs in the browser, and anyone determined can bypass it or brute
 * a short phrase against this hash. It exists so the client can click through
 * the admin in the preview. Real server-side auth lands at launch, and the
 * admin must not hold real data until it does.
 *
 * To change it: sha256 the new phrase and replace the digest.
 *   printf '%s' 'your phrase' | shasum -a 256
 */
const PREVIEW_GATE_DIGEST =
  '164a35702f68e0d2b5661a8b4085900f9c1aff8c5e30913cc24282167fb697ef';

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function login(phrase) {
  let ok = false;
  try {
    ok = (await sha256Hex(phrase)) === PREVIEW_GATE_DIGEST;
  } catch {
    // crypto.subtle needs a secure context; localhost and https both qualify.
    ok = false;
  }
  if (ok) write('session', { at: Date.now() });
  return settle({ ok });
}

export async function logout() {
  try { localStorage.removeItem(key('session')); } catch { /* ignore */ }
  return settle({ ok: true });
}

export function hasSession() {
  return Boolean(read('session', null));
}

/* ------------------------------------------------------------------ *
 * Payments — deliberately unimplemented
 * ------------------------------------------------------------------ */
export async function checkout() {
  return settle({ ok: false, reason: 'not-live', message: 'Online booking launching soon' });
}

/** Wipes preview state so the client can demo from a clean slate. */
export async function resetPreviewData() {
  ['content', 'faq', 'gallery', 'rates', 'blocks', 'inquiries', 'session']
    .forEach((n) => { try { localStorage.removeItem(key(n)); } catch { /* ignore */ } });
  return settle({ ok: true });
}
