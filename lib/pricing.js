/**
 * Hourly pricing.
 *
 * Every rule comes from data/rates.js — day rate, day minimum, the weekend
 * two-window split, and standing holds. Nothing here is hardcoded, so an
 * admin rate change flows through the calculator without a code edit.
 *
 * quote() is deliberately total: it returns the reason a booking is invalid
 * rather than just a boolean, so the UI can say what is wrong.
 */

import {
  DAY_RATES, BOOKING_WINDOWS, RECURRING_BLOCKS,
  toMinutes, toClock, dateKey,
} from '../data/rates.js';

export const QUOTE_ERRORS = {
  OUTSIDE_WINDOW: 'outside-window',
  OVERRUNS_WINDOW: 'overruns-window',
  HITS_BLOCK: 'hits-block',
  BELOW_MINIMUM: 'below-minimum',
  BLOCKED_DATE: 'blocked-date',
};

/** Rate + minimum for a date, honouring admin-edited rates when supplied. */
export function rateForDate(date, rates = DAY_RATES) {
  return rates[date.getDay()];
}

/** Bookable windows for a date, as [startMin, endMin] pairs. */
export function windowsForDate(date, windows = BOOKING_WINDOWS) {
  return (windows[date.getDay()] || []).map(([a, b]) => [toMinutes(a), toMinutes(b)]);
}

/** Standing holds that fall on this date. */
export function blocksForDate(date, recurring = RECURRING_BLOCKS) {
  return recurring
    .filter((block) => block.weekday === date.getDay())
    .map((block) => ({
      ...block,
      startMin: toMinutes(block.start),
      endMin: toMinutes(block.end),
    }));
}

/**
 * Free spans on a date: the day's windows minus every hold on it.
 * Used by both the calculator and the availability view.
 */
export function freeSpans(date, opts = {}) {
  const windows = windowsForDate(date, opts.windows);
  const busy = blocksForDate(date, opts.recurring)
    .map((b) => [b.startMin, b.endMin])
    .sort((a, b) => a[0] - b[0]);

  const free = [];
  windows.forEach(([open, close]) => {
    let cursor = open;
    busy.forEach(([bStart, bEnd]) => {
      if (bEnd <= cursor || bStart >= close) return;
      if (bStart > cursor) free.push([cursor, bStart]);
      cursor = Math.max(cursor, bEnd);
    });
    if (cursor < close) free.push([cursor, close]);
  });
  return free;
}

/** Spans long enough to satisfy this day's minimum. */
export function bookableSpans(date, opts = {}) {
  const rate = rateForDate(date, opts.rates);
  const minMinutes = rate.minHours * 60;
  return freeSpans(date, opts).filter(([a, b]) => b - a >= minMinutes);
}

/**
 * Day status for the availability grid.
 * 'past' | 'blocked' | 'limited' | 'open'
 */
export function dayStatus(date, opts = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return 'past';

  const blockedDates = opts.blockedDates || [];
  if (blockedDates.includes(dateKey(date))) return 'blocked';

  if (!bookableSpans(date, opts).length) return 'blocked';
  return blocksForDate(date, opts.recurring).length ? 'limited' : 'open';
}

/**
 * Price a specific request.
 *
 * @returns {{ok: true, …}} on success, or {ok: false, error, …} with a
 *          machine-readable reason from QUOTE_ERRORS.
 */
export function quote({ date, startTime, hours }, opts = {}) {
  const rate = rateForDate(date, opts.rates);
  const minHours = rate.minHours;

  if (hours < minHours) {
    return { ok: false, error: QUOTE_ERRORS.BELOW_MINIMUM, minHours, rate };
  }

  if ((opts.blockedDates || []).includes(dateKey(date))) {
    return { ok: false, error: QUOTE_ERRORS.BLOCKED_DATE, rate };
  }

  const start = toMinutes(startTime);
  const end = start + hours * 60;

  const windows = windowsForDate(date, opts.windows);
  const containing = windows.find(([open, close]) => start >= open && start < close);
  if (!containing) {
    return { ok: false, error: QUOTE_ERRORS.OUTSIDE_WINDOW, windows, rate };
  }
  if (end > containing[1]) {
    return { ok: false, error: QUOTE_ERRORS.OVERRUNS_WINDOW, window: containing, rate };
  }

  const hit = blocksForDate(date, opts.recurring)
    .find((b) => start < b.endMin && end > b.startMin);
  if (hit) {
    return { ok: false, error: QUOTE_ERRORS.HITS_BLOCK, block: hit, rate };
  }

  return {
    ok: true,
    rate,
    hours,
    hourly: rate.hourly,
    subtotal: rate.hourly * hours,
    startMin: start,
    endMin: end,
    minHours,
  };
}

/**
 * Money for display. Deposits are excluded on purpose — they're set at booking.
 *
 * es-US, not es-MX: the venue is in California and the customer reading the
 * Spanish page is standing in the same city as the one reading the English
 * one. es-MX disambiguates the currency as "USD 100", which is the right
 * answer for a reader in Mexico and the wrong one here — they expect $100.
 */
export function formatMoney(amount, locale = 'en') {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSpan([startMin, endMin], locale = 'en') {
  return `${toClock(startMin, locale)} – ${toClock(endMin, locale)}`;
}

/** Valid start times for a date, on the half hour, that could fit the minimum. */
export function startOptions(date, opts = {}) {
  const rate = rateForDate(date, opts.rates);
  const need = rate.minHours * 60;
  const options = [];

  freeSpans(date, opts).forEach(([open, close]) => {
    for (let t = open; t + need <= close; t += 30) options.push(t);
  });
  return options;
}

/** Longest bookable run starting at a given time, capped by window and holds. */
export function maxHoursFrom(date, startMin, opts = {}) {
  const span = freeSpans(date, opts).find(([a, b]) => startMin >= a && startMin < b);
  if (!span) return 0;
  return Math.floor((span[1] - startMin) / 60);
}
