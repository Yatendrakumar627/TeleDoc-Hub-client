import { useState, useEffect, useCallback } from 'react';
import { getGroups, getGroup } from '../services/apiClient';

export function useGroups(enabled = true) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loadingGroupDetail, setLoadingGroupDetail] = useState(false);

  const loadGroups = useCallback(async (scope = 'all') => {
    if (!enabled) return;
    try {
      setLoading(true);
      const data = await getGroups(scope);
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load groups:', err.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      loadGroups();
    }
  }, [loadGroups, enabled]);

  const selectGroup = useCallback(async (id) => {
    if (!id) {
      setSelectedGroupId(null);
      setCurrentGroup(null);
      return;
    }

    try {
      setLoadingGroupDetail(true);
      setSelectedGroupId(id);
      const detail = await getGroup(id);
      setCurrentGroup(detail);
      return detail;
    } catch (err) {
      console.error('Failed to load group detail:', err.message);
    } finally {
      setLoadingGroupDetail(false);
    }
  }, []);

  const addGroup = useCallback((newGroup) => {
    setGroups((prev) => [newGroup, ...prev.filter((g) => g.id !== newGroup.id)]);
  }, []);

  const updateGroupInState = useCallback((updated) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
    setCurrentGroup((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const removeGroupFromState = useCallback((id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
      setCurrentGroup(null);
    }
  }, [selectedGroupId]);

  return {
    groups,
    loading,
    selectedGroupId,
    currentGroup,
    loadingGroupDetail,
    loadGroups,
    selectGroup,
    addGroup,
    updateGroupInState,
    removeGroupFromState,
  };
}

