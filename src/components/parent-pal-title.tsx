import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ParentPalTitle() {
  const theme = useTheme();

  return (
    <Text style={styles.container} accessibilityRole="header">
      <Text style={[styles.brand, { color: theme.text }]}>Parent</Text>
      <Text style={[styles.brand, { color: theme.accent }]}>Pal</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
  },
  brand: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -0.5,
  },
});
