import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AccordionEntry = {
  id: number;
  title: string;
  body: string;
};

type AccordionItemProps = {
  title: string;
  body: string;
  isOpen: boolean;
  onToggle: () => void;
};

function AccordionItem({ title, body, isOpen, onToggle }: AccordionItemProps) {
  const theme = useTheme();

  return (
    <View style={[styles.item, { backgroundColor: theme.background, borderColor: theme.accentPeach }]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.itemHeader, pressed && styles.itemHeaderPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <ThemedText type="smallBold" style={styles.itemTitle}>
          {title}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          size={18}
          weight="semibold"
          tintColor={theme.accent}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.itemBody}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.itemSummary}>
            {body}
          </ThemedText>
        </Animated.View>
      ) : null}
    </View>
  );
}

type AccordionListProps = {
  items: AccordionEntry[];
  loading?: boolean;
  emptyMessage?: string;
};

export function AccordionList({
  items,
  loading = false,
  emptyMessage = 'Nothing to show yet',
}: AccordionListProps) {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (!items.length) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        {emptyMessage}
      </ThemedText>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          body={item.body}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    gap: Spacing.two,
  },
  item: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  itemHeaderPressed: {
    opacity: 0.75,
  },
  itemTitle: {
    flex: 1,
    textAlign: 'left',
  },
  itemBody: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  itemSummary: {
    textAlign: 'left',
    lineHeight: 20,
  },
  empty: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loader: {
    marginTop: Spacing.one,
  },
});
