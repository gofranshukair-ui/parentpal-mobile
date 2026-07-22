import { SymbolView, type SymbolViewProps } from 'expo-symbols';

type TabIconName = SymbolViewProps['name'];

type TabBarIconProps = {
  name: TabIconName;
  color: string;
  focused: boolean;
  size?: number;
};

export function TabBarIcon({ name, color, focused, size = 26 }: TabBarIconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={focused ? 'semibold' : 'regular'}
      resizeMode="scaleAspectFit"
    />
  );
}

export const TabIcons = {
  stage: {
    ios: 'sparkles',
    android: 'auto_awesome',
    web: 'auto_awesome',
  },
  children: {
    ios: 'figure.and.child.holdinghands',
    android: 'family_restroom',
    web: 'family_restroom',
  },
  sos: {
    ios: 'sos.circle.fill',
    android: 'sos',
    web: 'sos',
  },
} satisfies Record<string, TabIconName>;
