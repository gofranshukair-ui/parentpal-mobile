import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopOfMindAccordion } from '@/components/top-of-mind-accordion';
import { useAuth } from '@/context/auth-context';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';
import type { ChildProfile, TopOfMindResponse } from '@/services/api-types';
import { formatAge } from '@/utils/format-age';

type TopOfMindState = {
  loading: boolean;
  data: TopOfMindResponse | null;
  error: string | null;
};

type ChildCarouselProps = {
  profiles: ChildProfile[];
  onIndexChange?: (index: number) => void;
};

function ChildCard({
  profile,
  topOfMindState,
  backgroundColor,
}: {
  profile: ChildProfile;
  topOfMindState: TopOfMindState | undefined;
  backgroundColor: string;
}) {
  return (
    <ThemedView style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.name}>
          {profile.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.age}>
          {formatAge(profile.age_months)}
        </ThemedText>
      </View>

      <View style={styles.topOfMindSection}>
        <TopOfMindAccordion state={topOfMindState} />
      </View>
    </ThemedView>
  );
}

export function ChildCarousel({ profiles, onIndexChange }: ChildCarouselProps) {
  const theme = useTheme();
  const { token } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [topOfMindByChildId, setTopOfMindByChildId] = useState<Record<number, TopOfMindState>>({});

  const pageWidth =
    measuredWidth > 0
      ? measuredWidth
      : Math.min(screenWidth, MaxContentWidth) - Spacing.four * 2;

  useEffect(() => {
    if (!token || profiles.length === 0) {
      setTopOfMindByChildId({});
      return;
    }

    let cancelled = false;

    setTopOfMindByChildId(
      Object.fromEntries(profiles.map((profile) => [profile.id, { loading: true, data: null, error: null }]))
    );

    Promise.all(
      profiles.map(async (profile) => {
        try {
          const data = await api.getChildTopOfMind(token, profile.id);
          return [profile.id, { loading: false, data, error: null }] as const;
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : 'Could not load top-of-mind insights.';
          return [profile.id, { loading: false, data: null, error: message }] as const;
        }
      })
    ).then((entries) => {
      if (!cancelled) {
        setTopOfMindByChildId(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [profiles, token]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const index = viewableItems[0].index;
      setActiveIndex(index);
      onIndexChange?.(index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setMeasuredWidth(width);
    }
  }, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<ChildProfile> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth]
  );

  const renderItem = useCallback(
    ({ item }: { item: ChildProfile }) => (
      <View style={[styles.page, { width: pageWidth }]}>
        <ChildCard
          profile={item}
          topOfMindState={topOfMindByChildId[item.id]}
          backgroundColor={theme.backgroundElement}
        />
      </View>
    ),
    [pageWidth, theme.backgroundElement, topOfMindByChildId]
  );

  if (profiles.length === 1) {
    return (
      <View style={styles.container} onLayout={handleLayout}>
        <View style={styles.singleCard}>
          <ChildCard
            profile={profiles[0]}
            topOfMindState={topOfMindByChildId[profiles[0].id]}
            backgroundColor={theme.backgroundElement}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <FlatList
        data={profiles}
        horizontal
        pagingEnabled
        snapToInterval={pageWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.dots}>
        {profiles.map((profile, index) => (
          <View
            key={profile.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? theme.accent : theme.accentPeach,
                },
              ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    gap: Spacing.three,
  },
  list: {
    flexGrow: 1,
  },
  singleCard: {
    flex: 1,
    justifyContent: 'center',
  },
  page: {
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.four,
    minHeight: 180,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  age: {
    textAlign: 'center',
  },
  topOfMindSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    width: '100%',
    alignItems: 'stretch',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
