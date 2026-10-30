import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import { useAppState } from '@/lib/app-state';

type QueryState<T> = {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  reload: () => void;
};

/**
 * Runs a database read while the screen is focused, re-running it when `query` changes
 * or the screen regains focus (so saved/registered state stays in sync after navigating back),
 * and after the event catalogue syncs from the server.
 * Wrap `query` in useCallback so it only changes when its inputs do.
 */
export function useDbQuery<T>(query: (db: SQLiteDatabase) => Promise<T>): QueryState<T> {
  const db = useSQLiteContext();
  const { catalogVersion } = useAppState();
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    query(db)
      .then((result) => {
        if (id !== requestId.current) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // catalogVersion is a trigger: a new value means fresh rows to read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, query, catalogVersion]);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return { data, error, loading, reload: run };
}
