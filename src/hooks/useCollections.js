import { useState, useEffect, useCallback } from 'react';
import { getCollections, createCollection as apiCreateCollection, deleteCollection as apiDeleteCollection } from '../services/apiClient';
import { notifications } from '@mantine/notifications';

export function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCollections = useCallback(async (scope = 'all') => {
    try {
      setLoading(true);
      const data = await getCollections(scope);
      setCollections(data);
    } catch (err) {
      console.warn('Failed to load collections:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const addCollection = useCallback(async (collectionData) => {
    try {
      const newCol = await apiCreateCollection(collectionData);
      setCollections((prev) => [newCol, ...prev]);
      notifications.show({
        title: 'Collection Created',
        message: `Collection "${newCol.name}" created successfully.`,
        color: 'teal',
      });
      return newCol;
    } catch (err) {
      notifications.show({
        title: 'Error Creating Collection',
        message: err.response?.data?.error || err.message,
        color: 'red',
      });
      throw err;
    }
  }, []);

  const removeCollection = useCallback(async (id) => {
    try {
      await apiDeleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      notifications.show({
        title: 'Collection Removed',
        message: 'Collection deleted and documents moved to Inbox.',
        color: 'gray',
      });
    } catch (err) {
      notifications.show({
        title: 'Error Deleting Collection',
        message: err.response?.data?.error || err.message,
        color: 'red',
      });
    }
  }, []);

  return {
    collections,
    loading,
    refreshCollections,
    addCollection,
    removeCollection,
  };
}

