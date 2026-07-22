import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';
import type { GuidanceAskResponse } from '@/services/api-types';

type GuidanceQuestionBoxProps = {
  childId: number | null;
  childName?: string;
};

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <ThemedText key={item} type="small" themeColor="textSecondary" style={styles.bulletItem}>
          • {item}
        </ThemedText>
      ))}
    </View>
  );
}

function GuidanceAnswer({ answer }: { answer: GuidanceAskResponse }) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.answerCard, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold">Summary</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.answerText}>
        {answer.summary}
      </ThemedText>

      {answer.developmental_context ? (
        <>
          <ThemedText type="smallBold" style={styles.answerHeading}>
            Developmental context
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.answerText}>
            {answer.developmental_context}
          </ThemedText>
        </>
      ) : null}

      {answer.suggested_actions.length > 0 ? (
        <>
          <ThemedText type="smallBold" style={styles.answerHeading}>
            Suggested actions
          </ThemedText>
          <BulletList items={answer.suggested_actions} />
        </>
      ) : null}

      {answer.watch_out_for.length > 0 ? (
        <>
          <ThemedText type="smallBold" style={styles.answerHeading}>
            Watch out for
          </ThemedText>
          <BulletList items={answer.watch_out_for} />
        </>
      ) : null}

      {answer.when_to_seek_help.length > 0 ? (
        <>
          <ThemedText type="smallBold" style={styles.answerHeading}>
            When to seek help
          </ThemedText>
          <BulletList items={answer.when_to_seek_help} />
        </>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
        {answer.disclaimer}
      </ThemedText>
    </ThemedView>
  );
}

export function GuidanceQuestionBox({ childId, childName }: GuidanceQuestionBoxProps) {
  const theme = useTheme();
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<GuidanceAskResponse | null>(null);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!token || !childId) {
      return;
    }

    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.askGuidance(token, {
        child_id: childId,
        question: trimmed,
      });
      setAnswer(response);
    } catch (err) {
      setAnswer(null);
      setError(err instanceof ApiError ? err.message : 'Could not get guidance.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!childId) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Add a child to ask parenting questions.
      </ThemedText>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Ask a parenting question
      </ThemedText>
      {childName ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Answering for {childName}
        </ThemedText>
      ) : null}

      <TextInput
        multiline
        placeholder="e.g. How do I handle bedtime tantrums?"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, borderColor: theme.accentPink, backgroundColor: theme.background },
        ]}
        value={question}
        onChangeText={setQuestion}
        editable={!submitting}
      />

      <Pressable
        disabled={submitting || !question.trim()}
        onPress={handleAsk}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.accent, opacity: pressed || submitting ? 0.7 : 1 },
        ]}>
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText type="smallBold" style={styles.buttonText}>
            Get guidance
          </ThemedText>
        )}
      </Pressable>

      {error ? (
        <ThemedText type="small" themeColor="error" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      {answer ? (
        <ScrollView style={styles.answerScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <GuidanceAnswer answer={answer} />
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.two,
  },
  sectionTitle: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
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
  answerScroll: {
    maxHeight: 280,
  },
  answerCard: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  answerHeading: {
    marginTop: Spacing.half,
  },
  answerText: {
    lineHeight: 20,
  },
  bulletList: {
    gap: Spacing.half,
  },
  bulletItem: {
    lineHeight: 20,
  },
  disclaimer: {
    marginTop: Spacing.two,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
