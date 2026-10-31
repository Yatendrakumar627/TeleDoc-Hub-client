// Central client-side configuration, sourced from Vite environment variables.
// Only VITE_* variables are available in the browser bundle, and they are
// PUBLIC - do not put secrets here (see client/.env.example).

const env = import.meta.env;

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Base URL/path for every backend request (defaults to the dev proxy path).
export const API_BASE_URL = (env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

// Default request timeout in milliseconds.
export const API_TIMEOUT = toPositiveNumber(env.VITE_API_TIMEOUT, 45000);

// Longer timeout for large media/video uploads.
export const UPLOAD_TIMEOUT = toPositiveNumber(env.VITE_UPLOAD_TIMEOUT, 180000);
