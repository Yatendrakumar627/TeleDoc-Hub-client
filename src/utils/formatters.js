/**
 * Common formatting helpers
 */

export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatReadingTime = (wordCount, wordsPerMinute = 200) => {
  if (!wordCount || wordCount === 0) return '~1 min read';
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `~${minutes} min read`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const truncateText = (text, maxLength = 120) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
};

/**
 * Safely extracts a displayable string from any error object,
 * preventing Minified React Error #31 (Objects are not valid as a React child).
 */
export const extractErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  // Handle Axios / Network timeouts gracefully with human guidance
  if (
    err.code === 'ECONNABORTED' ||
    (typeof err.message === 'string' && (err.message.toLowerCase().includes('timeout') || err.message.includes('exceeded')))
  ) {
    return 'Upload processing took longer than expected. Your files may already be securely saving in the background. Please check your vault.';
  }

  // Handle browser CORS / Cold-Start network errors gracefully
  if (
    err.code === 'ERR_NETWORK' ||
    (typeof err.message === 'string' && err.message.toLowerCase() === 'network error')
  ) {
    return 'Server waking up or network unavailable. Render free instances sleep after inactivity — please wait 15 seconds and try again.';
  }

  const data = err.response?.data;
  if (data) {
    if (typeof data.error === 'string') return data.error;
    if (data.error && typeof data.error === 'object') {
      return data.error.message || (typeof data.error.code === 'string' ? `Error: ${data.error.code}` : JSON.stringify(data.error));
    }
    if (typeof data.message === 'string') return data.message;
    if (typeof data === 'string') return data;
  }

  if (typeof err.message === 'string') return err.message;
  return fallback;
};

/**
 * Smart chronological date extractor from folder or file titles.
 * Accurately parses:
 * - "H-meet 12.10.2024" -> Oct 12, 2024
 * - "Jul 2024", "October 2026"
 * - "2024-10-12"
 * - Fallback to createdAt or 0
 */
export const extractDateFromName = (name, fallbackDate = null) => {
  if (!name) return fallbackDate ? new Date(fallbackDate).getTime() : 0;

  // 1. Match DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY (e.g. 12.10.2024)
  const ddmmyyyy = name.match(/\b(\d{1,2})[.-/](\d{1,2})[.-/](\d{4})\b/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(year, month, day).getTime();
  }

  // 2. Match YYYY-MM-DD or YYYY.MM.DD (e.g. 2024-10-12)
  const yyyymmdd = name.match(/\b(\d{4})[.-/](\d{1,2})[.-/](\d{1,2})\b/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    return new Date(year, month, day).getTime();
  }

  // 3. Match Month Name + Year (e.g. "Jul 2024", "October 2026", "15 Jul 2024")
  const monthNames = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const monthNameMatch = name.match(
    /\b(?:(\d{1,2})[\s_-]+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s_-]+(\d{4})\b/i
  );
  if (monthNameMatch) {
    const day = monthNameMatch[1] ? parseInt(monthNameMatch[1], 10) : 1;
    const month = monthNames[monthNameMatch[2].toLowerCase().slice(0, 3)];
    const year = parseInt(monthNameMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  // 4. Try standard Date.parse
  const parsed = Date.parse(name);
  if (!isNaN(parsed)) return parsed;

  // 5. Fallback
  return fallbackDate ? new Date(fallbackDate).getTime() : 0;
};



