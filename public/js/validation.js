function parseOpeningHours(input) {
  if (!input) return { ok: true, empty: true };

  const m = input.trim().match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
  if (!m) {
    return {
      ok: false,
      message: 'Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)',
    };
  }

  const sh = Number(m[1]);
  const sm = Number(m[2]);
  const eh = Number(m[3]);
  const em = Number(m[4]);

  const validHour = h => h >= 0 && h <= 23;
  const validMin = m => m >= 0 && m <= 59;

  if (!validHour(sh) || !validHour(eh) || !validMin(sm) || !validMin(em)) {
    return {
      ok: false,
      message: 'Opening Hours has invalid time values (00:00 to 23:59 only)',
    };
  }

  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (start >= end) {
    return {
      ok: false,
      message: 'Opening Hours start time must be earlier than end time',
    };
  }

  return { ok: true, start, end };
}

export { parseOpeningHours };
