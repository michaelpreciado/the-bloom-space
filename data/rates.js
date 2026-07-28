/**
 * THE BLOOM SPACE — rates, minimums, windows and blocks.
 *
 * This is the single source of truth for anything priced or scheduled.
 * The rate card, the pricing calculator and the availability view all read
 * from here — nothing below is duplicated in markup. The admin panel edits
 * this shape through lib/api.mock.js, so adding a day rate or a recurring
 * block never requires touching a page.
 *
 * Hours are 24h "HH:MM" strings. Weekday indices match Date#getDay(),
 * where 0 is Sunday.
 */

export const CURRENCY = 'USD';

/** Day rates and minimums, keyed by Date#getDay(). */
export const DAY_RATES = {
  0: { label: 'Sunday',    labelEs: 'Domingo',   hourly: 100, minHours: 5, group: 'weekend' },
  1: { label: 'Monday',    labelEs: 'Lunes',     hourly: 65,  minHours: 3, group: 'weekday' },
  2: { label: 'Tuesday',   labelEs: 'Martes',    hourly: 65,  minHours: 3, group: 'weekday' },
  3: { label: 'Wednesday', labelEs: 'Miércoles', hourly: 65,  minHours: 3, group: 'weekday' },
  4: { label: 'Thursday',  labelEs: 'Jueves',    hourly: 65,  minHours: 3, group: 'weekday' },
  5: { label: 'Friday',    labelEs: 'Viernes',   hourly: 85,  minHours: 4, group: 'friday' },
  6: { label: 'Saturday',  labelEs: 'Sábado',    hourly: 100, minHours: 5, group: 'weekend' },
};

/**
 * Bookable windows per day. Weekends run two blocks with a closed
 * turnaround between them; the rest of the week is a single span.
 */
export const BOOKING_WINDOWS = {
  0: [['07:00', '14:00'], ['16:00', '23:00']],
  1: [['07:00', '23:00']],
  2: [['07:00', '23:00']],
  3: [['07:00', '23:00']],
  4: [['07:00', '23:00']],
  5: [['07:00', '23:00']],
  6: [['07:00', '14:00'], ['16:00', '23:00']],
};

/** Standing weekly holds. These grey out in the availability view. */
export const RECURRING_BLOCKS = [
  {
    id: 'bachata-monday',
    weekday: 1,
    start: '19:30',
    end: '21:30',
    label: 'Bachata class',
    labelEs: 'Clase de bachata',
  },
];

/**
 * One-off blocked dates, 'YYYY-MM-DD'. Seeded empty on purpose — the
 * calendar must never show a hold that isn't real. The admin panel writes
 * here; at launch this comes from Turso instead.
 */
export const BLOCKED_DATES = [];

/**
 * Deposits. Both are required and both are non-refundable — that wording is
 * deliberate and appears on Pricing, in the FAQ and in the inquiry
 * confirmation. Amounts are intentionally null until the owner sets them.
 */
export const DEPOSITS = {
  retainer:  { required: true, refundable: false, amount: null },
  security:  { required: true, refundable: false, amount: null },
};

/** Rate card rows, in display order. Derived so the card can't drift. */
export const RATE_CARD = [
  { key: 'weekday', days: [1, 2, 3, 4], daysLabel: 'Mon – Thu', daysLabelEs: 'Lun – Jue' },
  { key: 'friday',  days: [5],          daysLabel: 'Friday',    daysLabelEs: 'Viernes', featured: true },
  { key: 'weekend', days: [6, 0],       daysLabel: 'Sat & Sun', daysLabelEs: 'Sáb y Dom' },
];

export const VENUE = {
  name: 'The Bloom Space',
  street: '316 S Bridge St',
  city: 'Visalia',
  region: 'CA',
  postalCode: '93291',
  country: 'US',
  capacity: 65,
  instagram: 'https://www.instagram.com/the_bloom_space559',
  instagramHandle: '@the_bloom_space559',
  email: 'hello@thebloomspace.com',
  mapsUrl: 'https://maps.google.com/?q=316+S+Bridge+St+Visalia+CA+93291',
};

/* ---------- helpers shared by pricing, availability and the rate card ---------- */

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function toClock(minutes, locale = 'en') {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  const time = `${hour}${m ? ':' + String(m).padStart(2, '0') : ''}`;
  return locale === 'es' ? `${time} ${suffix === 'am' ? 'a.m.' : 'p.m.'}` : `${time}${suffix}`;
}

/** Local-date key. toISOString() would shift the day in western timezones. */
export function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
