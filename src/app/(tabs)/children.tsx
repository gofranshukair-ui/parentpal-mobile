import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { api, ApiError } from '@/services/api';
import type { ChildProfile } from '@/services/api-types';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAge } from '@/utils/format-age';

export default function ChildrenScreen() {
  const theme = useTheme();
  const { user, token } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');

  const loadChildren = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const profiles = await api.listChildren(token);
      setChildren(profiles);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not load children.';
      Alert.alert('Error', message);
    }
  }, [token]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  }, [loadChildren]);

  useEffect(() => {
    loadChildren().finally(() => setLoading(false));
  }, [loadChildren]);

  if (!user || !token) {
    return <Redirect href="/login" />;
  }

  const handleAddChild = async () => {
    const trimmedName = name.trim();
    const years = Number.parseInt(ageYears || '0', 10);
    const months = Number.parseInt(ageMonths || '0', 10);

    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter your child\'s name.');
      return;
    }

    const totalMonths = years * 12 + months;
    if (Number.isNaN(totalMonths) || totalMonths < 0 || totalMonths > 216) {
      Alert.alert('Invalid age', 'Age must be between 0 and 18 years.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createChild(token, {
        name: trimmedName,
        age_months: totalMonths,
      });
      setChildren((current) => [...current, created]);
      setName('');
      setAgeYears('');
      setAgeMonths('');
      Alert.alert('Added', `${created.name} was added successfully.`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not add child.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Children
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Add a child profile so ParentPal can tailor guidance to their age.
        </ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">Add a child</ThemedText>
          <TextInput
            placeholder="Name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background }]}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.ageRow}>
            <View style={styles.ageField}>
              <ThemedText type="small">Years</ThemedText>
              <TextInput
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background }]}
                value={ageYears}
                onChangeText={setAgeYears}
              />
            </View>
            <View style={styles.ageField}>
              <ThemedText type="small">Months</ThemedText>
              <TextInput
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background }]}
                value={ageMonths}
                onChangeText={setAgeMonths}
              />
            </View>
          </View>
          <Pressable
            disabled={submitting}
            onPress={handleAddChild}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.accent, opacity: pressed || submitting ? 0.7 : 1 },
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>Add child</ThemedText>
            )}
          </Pressable>
        </View>

        <FlatList
          data={children}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No children yet. Add your first child above.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View style={[styles.childCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Age: {formatAge(item.age_months)}
              </ThemedText>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  title: { fontSize: 36, lineHeight: 40 },
  subtitle: { marginBottom: Spacing.three },
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  ageRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  ageField: {
    flex: 1,
    gap: Spacing.half,
  },
  button: {
    borderRadius: 10,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  childCard: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
});
