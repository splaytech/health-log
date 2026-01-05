import { useEffect, useState, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncService } from '../services/sync';
import { AppState, AppStateStatus } from 'react-native';

export const useSync = () => {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(isOnline);

  // Keep ref in sync with state
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const performSync = useCallback(async () => {
    if (!isOnlineRef.current || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);

    const result = await syncService.syncAll();

    isSyncingRef.current = false;
    setIsSyncing(false);

    if (result.success) {
      setLastSyncTime(new Date());
    } else {
      setSyncError(result.error || 'Unknown error');
    }
  }, []); // Empty deps - uses refs only

  // Auto-sync when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        performSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, [performSync]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    performSync,
  };
};
