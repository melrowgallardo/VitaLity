/**
 * Date utility helpers for VitaLity
 * Ensures all date comparisons, labels, and sorting use the user's local timezone.
 */

/**
 * Returns today's date in local timezone formatted as 'YYYY-MM-DD'
 * @param {Date} [d=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export function getLocalTodayStr(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date in local timezone formatted as 'YYYY-MM-DD'
 * @returns {string} 'YYYY-MM-DD'
 */
export function getLocalYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalTodayStr(d);
}

/**
 * Returns tomorrow's date in local timezone formatted as 'YYYY-MM-DD'
 * @returns {string} 'YYYY-MM-DD'
 */
export function getLocalTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalTodayStr(d);
}

/**
 * Parse a 'YYYY-MM-DD' string safely into a local Date object (at local midnight)
 * Avoids UTC parsing shifts that happen with new Date('YYYY-MM-DD')
 * @param {string} dateStr 'YYYY-MM-DD'
 * @returns {Date}
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Assign a priority tier for sorting:
 * 1: Today (always top)
 * 2: Yesterday (immediately below Today)
 * 3: Older dates (past dates, descending)
 * 4: Future dates (upcoming)
 */
export function getDateSortTier(dateStr, todayStr = getLocalTodayStr(), yesterdayStr = getLocalYesterdayStr()) {
  if (dateStr === todayStr) return 1;
  if (dateStr === yesterdayStr) return 2;
  if (dateStr < yesterdayStr) return 3; // Older dates
  return 4; // Future dates
}

/**
 * Comparator to sort vitamins:
 * 1. "Today" first
 * 2. "Yesterday" second
 * 3. Older dates descending (newest to oldest)
 * 4. Future dates
 * 5. Chronological by time within the same date
 */
export function compareVitamins(a, b, todayStr = getLocalTodayStr(), yesterdayStr = getLocalYesterdayStr()) {
  const dateA = a?.date || '';
  const dateB = b?.date || '';

  const tierA = getDateSortTier(dateA, todayStr, yesterdayStr);
  const tierB = getDateSortTier(dateB, todayStr, yesterdayStr);

  if (tierA !== tierB) {
    return tierA - tierB;
  }

  // Tier 3: Older dates in descending order (newest first: 2026-11-11 before 2026-11-10)
  if (tierA === 3) {
    const diff = dateB.localeCompare(dateA);
    if (diff !== 0) return diff;
  }

  // Tier 4: Future dates in ascending order (nearest future first)
  if (tierA === 4) {
    const diff = dateA.localeCompare(dateB);
    if (diff !== 0) return diff;
  }

  // Same date: sort by time ascending (e.g. 08:00 before 12:00)
  const timeA = a?.time || '00:00';
  const timeB = b?.time || '00:00';
  const timeComp = timeA.localeCompare(timeB);
  if (timeComp !== 0) return timeComp;

  // Final fallback by id
  return (a?.id || 0) - (b?.id || 0);
}

/**
 * Sort an array of vitamins immutably according to the schedule rules
 * @param {Array} vitaminsList
 * @returns {Array} sorted vitamins
 */
export function sortVitamins(vitaminsList = []) {
  const todayStr = getLocalTodayStr();
  const yesterdayStr = getLocalYesterdayStr();
  return [...vitaminsList].sort((a, b) => compareVitamins(a, b, todayStr, yesterdayStr));
}

/**
 * Returns human-friendly metadata for a date string
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {string} [todayStr]
 * @param {string} [yesterdayStr]
 */
export function getDateSectionInfo(dateStr, todayStr = getLocalTodayStr(), yesterdayStr = getLocalYesterdayStr()) {
  const tomorrowStr = getLocalTomorrowStr();
  const localDate = parseLocalDate(dateStr);

  const formattedDate = localDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (dateStr === todayStr) {
    return {
      type: 'today',
      title: 'Today',
      formattedDate,
      isToday: true,
      isYesterday: false,
    };
  }

  if (dateStr === yesterdayStr) {
    return {
      type: 'yesterday',
      title: 'Yesterday',
      formattedDate,
      isToday: false,
      isYesterday: true,
    };
  }

  if (dateStr === tomorrowStr) {
    return {
      type: 'tomorrow',
      title: 'Tomorrow',
      formattedDate,
      isToday: false,
      isYesterday: false,
    };
  }

  const isFuture = dateStr > todayStr;
  return {
    type: isFuture ? 'future' : 'past',
    title: formattedDate,
    formattedDate,
    isToday: false,
    isYesterday: false,
    isFuture,
  };
}

