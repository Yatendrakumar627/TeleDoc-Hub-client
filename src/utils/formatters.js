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


