import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { getAuthErrorMessage, useAuth } from '@/context/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/stage" />;
  }

  const handleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          ParentPal
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Sign in to manage your children and get guidance.
        </ThemedText>

        <View style={styles.form}>
          <ThemedText type="smallBold">Email</ThemedText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background }]}
            value={email}
            onChangeText={setEmail}
          />

          <ThemedText type="smallBold">Password</ThemedText>
          <TextInput
            secureTextEntry
            placeholder="Your password"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background }]}
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <ThemedText type="small" themeColor="error" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            disabled={submitting || !email || !password}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.accent, opacity: pressed || submitting ? 0.7 : 1 },
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.buttonText}>Sign in</ThemedText>
            )}
          </Pressable>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          No account yet?{' '}
          <Link href="/register">
            <ThemedText type="linkPrimary">Create one</ThemedText>
          </Link>
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: { textAlign: 'center', fontSize: 40, lineHeight: 44 },
  subtitle: { textAlign: 'center' },
  form: { gap: Spacing.two, marginTop: Spacing.four },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: {
    marginTop: Spacing.two,
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
  error: { textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: Spacing.four },
});
