import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccordionList } from '@/components/accordion-list';
import type { AccordionEntry } from '@/components/accordion-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';

const SOS_CATEGORIES = [
  { slug: 'social_anxiety', label: 'Social Anxiety' },
  { slug: 'school_refusal', label: 'School Refusal' },
] as const;

type SosCategory = (typeof SOS_CATEGORIES)[number]['slug'];

function buildSosQuery(subcategory: SosCategory, description: string): string {
  const label = subcategory.replace(/_/g, ' ');
  const trimmed = description.trim();
  return trimmed ? `${label}. ${trimmed}` : label;
}

export default function SosScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const [subcategory, setSubcategory] = useState<SosCategory>('social_anxiety');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<AccordionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(
    async (queryDescription: string) => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.searchKnowledge(token, {
          query: buildSosQuery(subcategory, queryDescription),
          category: 'sos',
          subcategory,
          top_k: 3,
        });

        setItems(
          response.matches.slice(0, 3).map((match) => ({
            id: match.document_id,
            title: match.title,
            body: match.content,
          })),
        );
      } catch (err) {
        setItems([]);
        setError(err instanceof ApiError ? err.message : 'Could not load SOS guidance.');
      } finally {
        setLoading(false);
      }
    },
    [token, subcategory],
  );

  useEffect(() => {
    runSearch('');
  }, [subcategory, token, runSearch]);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              SOS
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Curated guidance for urgent parenting situations. This is not a substitute for
              emergency services.
            </ThemedText>

            <ThemedView
              style={[styles.emergencyNote, { backgroundColor: theme.accentPink, borderColor: theme.accent }]}>
              <ThemedText type="smallBold" style={styles.emergencyTitle}>
                In an emergency
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emergencyText}>
                Call local emergency services if your child is in immediate danger, unresponsive,
                or seriously injured.
              </ThemedText>
            </ThemedView>

            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Situation
            </ThemedText>
            <View style={styles.chipRow}>
              {SOS_CATEGORIES.map((category) => {
                const selected = subcategory === category.slug;
                return (
                  <Pressable
                    key={category.slug}
                    onPress={() => setSubcategory(category.slug)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? theme.accent : theme.background,
                        borderColor: theme.accentPeach,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? '#FFFFFF' : theme.text }}>
                      {category.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Describe what is happening (optional)
            </ThemedText>
            <TextInput
              multiline
              maxLength={500}
              placeholder="e.g. My child cried and refused to get in the car this morning"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background },
              ]}
              value={description}
              onChangeText={setDescription}
              editable={!loading}
            />

            <Pressable
              disabled={loading}
              onPress={() => runSearch(description)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.accent, opacity: pressed || loading ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.buttonText}>
                {loading ? 'Searching…' : 'Refresh guidance'}
              </ThemedText>
            </Pressable>

            {error ? (
              <ThemedText type="small" themeColor="error" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Top guidance
            </ThemedText>
            <AccordionList
              items={items}
              loading={loading}
              emptyMessage="No matching guidance found"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  emergencyNote: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  emergencyTitle: {
    textAlign: 'left',
  },
  emergencyText: {
    lineHeight: 20,
  },
  sectionLabel: {
    textAlign: 'left',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 10,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
  error: {
    textAlign: 'center',
  },
});
