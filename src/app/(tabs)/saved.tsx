import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { FlatList, StyleSheet, View } from 'react-native';
import { useCallback } from 'react';

import { EventCard } from '@/components/event-card';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { listSavedEvents, setEventSaved } from '@/db/events';
import type { EventListItem } from '@/db/types';
import { useDbQuery } from '@/hooks/use-db-query';
import { useAppState } from '@/lib/app-state';

export default function SavedPage() {
  const db = useSQLiteContext();
  const { userId } = useAppState();
  const { data, error, loading, reload } = useDbQuery(
    useCallback((database) => listSavedEvents(database, userId), [userId]),
  );

  const unsave = async (event: EventListItem) => {
    await setEventSaved(db, userId, event.event_id, false);
    reload();
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={error ? [] : (data ?? [])}
        keyExtractor={(e) => String(e.event_id)}
        renderItem={({ item }) => (
          <View style={styles.inset}>
            <EventCard event={item} onToggleSave={unsave} />
          </View>
        )}
        ListHeaderComponent={
          <View style={[styles.inset, styles.header]}>
            <AppText variant="heading">Saqlangan</AppText>
            {data && data.length > 0 ? (
              <AppText variant="secondary">
                {data.length} ta saqlangan tadbir
              </AppText>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : loading || !data ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon="bookmark-outline"
              title="Hozircha saqlangan tadbir yoʻq"
              message="Tadbirni bu yerda saqlash uchun xatchoʻp belgisini bosing."
              action={<Button label="Tadbirlarni koʻrish" onPress={() => router.navigate('/events')} />}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: Spacing.xxl },
  inset: { paddingHorizontal: Spacing.lg },
  header: { paddingTop: Spacing.md, paddingBottom: Spacing.lg, gap: 2 },
  separator: { height: Spacing.lg },
});
