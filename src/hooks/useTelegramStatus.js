import { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../services/apiClient';

export function useTelegramStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Failed to fetch Telegram status:', err.message);
      setStatus({ telegram: { connected: false, error: err.message } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refreshStatus: fetchStatus };
}

