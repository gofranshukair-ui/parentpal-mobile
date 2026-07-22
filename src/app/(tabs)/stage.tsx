import { useCallback, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildCarousel } from '@/components/child-carousel';
import { GuidanceQuestionBox } from '@/components/guidance-question-box';
import { ParentPalTitle } from '@/components/parent-pal-title';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/services/api';
import type { ChildProfile } from '@/services/api-types';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function StageScreen() {
  const { user, token } = useAuth();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!token) {
      setProfiles([]);
      setSelectedChildId(null);
      return;
    }

    try {
      const children = await api.listChildren(token);
      setProfiles(children);
      setSelectedChildId((current) => {
        if (children.length === 0) {
          return null;
        }
        if (current && children.some((child) => child.id === current)) {
          return current;
        }
        return children[0].id;
      });
      setError(null);
    } catch (err) {
      setProfiles([]);
      setSelectedChildId(null);
      setError(err instanceof ApiError ? err.message : 'Could not load children.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChildren().finally(() => setLoading(false));
    }, [loadChildren])
  );

  const handleChildIndexChange = useCallback(
    (index: number) => {
      setSelectedChildId(profiles[index]?.id ?? null);
    },
    [profiles]
  );

  const selectedChild = profiles.find((profile) => profile.id === selectedChildId) ?? null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ParentPalTitle />
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Signed in as {user.email}
          </ThemedText>

          {loading ? (
            <ThemedView style={styles.centered}>
              <ActivityIndicator />
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="small" themeColor="error" style={styles.errorText}>
                {error}
              </ThemedText>
              <Button title="Try again" onPress={loadChildren} />
            </ThemedView>
          ) : profiles.length > 0 ? (
            <>
              <ThemedView style={styles.carouselArea}>
                <ChildCarousel profiles={profiles} onIndexChange={handleChildIndexChange} />
              </ThemedView>
              <GuidanceQuestionBox
                childId={selectedChildId}
                childName={selectedChild?.name}
              />
            </>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                No children yet. Add your first child to get personalized guidance.
              </ThemedText>
              <Button title="Add child" onPress={() => router.push('/(tabs)/children')} />
            </ThemedView>
          )}

          {profiles.length > 0 ? (
            <Button title="Add child" onPress={() => router.push('/(tabs)/children')} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  subtitle: {
    textAlign: 'center',
  },
  centered: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArea: {
    width: '100%',
    minHeight: 280,
  },
  emptyState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
});
