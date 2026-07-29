// Shared date helper utilities

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format date to Indonesian locale (e.g., "30 Juli 2026")
 */
function formatDateID(date) {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time to HH:MM
 */
function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format datetime to Indonesian locale
 */
function formatDateTimeID(date) {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate work days between two dates (excluding weekends)
 */
function calculateWorkDays(startDate, endDate, holidays = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  const holidaySet = new Set(holidays.map((h) => formatDate(h)));

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = formatDate(current);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check if a date is today
 */
function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return formatDate(d) === formatDate(today);
}

/**
 * Get start and end of month
 */
function getMonthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

module.exports = {
  formatDate,
  formatDateID,
  formatTime,
  formatDateTimeID,
  calculateWorkDays,
  isToday,
  getMonthRange,
};
