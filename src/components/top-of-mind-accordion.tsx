import { StyleSheet, View } from 'react-native';

import { AccordionList, type AccordionEntry } from '@/components/accordion-list';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type {
  DevelopmentSkill,
  TopOfMindCard,
  TopOfMindResponse,
} from '@/services/api-types';

type TopOfMindState = {
  loading: boolean;
  data: TopOfMindResponse | null;
  error: string | null;
};

function skillsToItems(skills: DevelopmentSkill[]): AccordionEntry[] {
  return skills.map((skill) => ({
    id: skill.document_id,
    title: skill.title,
    body: skill.summary,
  }));
}

function articlesToItems(articles: TopOfMindCard[]): AccordionEntry[] {
  return articles.map((article) => ({
    id: article.document_id,
    title: article.title,
    body: article.summary,
  }));
}

function TopOfMindSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: AccordionEntry[];
  emptyMessage: string;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <AccordionList items={items} emptyMessage={emptyMessage} />
    </View>
  );
}

export function TopOfMindAccordion({ state }: { state: TopOfMindState | undefined }) {
  if (!state) {
    return <AccordionList items={[]} loading />;
  }

  if (state.loading) {
    return <AccordionList items={[]} loading />;
  }

  if (state.error) {
    return (
      <AccordionList
        items={[{ id: 0, title: 'Unable to load', body: state.error }]}
      />
    );
  }

  const data = state.data;
  if (!data) {
    return <AccordionList items={[]} emptyMessage="Nothing noted yet" />;
  }

  const allEmpty =
    data.mastered_skills.length === 0 &&
    data.working_on_skills.length === 0 &&
    data.articles.length === 0;

  if (data.message && allEmpty) {
    return (
      <AccordionList
        items={[{ id: 0, title: 'Insight', body: data.message }]}
      />
    );
  }

  return (
    <View style={styles.sections}>
      <TopOfMindSection
        title="Mastered"
        items={skillsToItems(data.mastered_skills)}
        emptyMessage="No mastered skills noted for this age yet"
      />
      <TopOfMindSection
        title="Working on"
        items={skillsToItems(data.working_on_skills)}
        emptyMessage="No skills in progress noted for this age yet"
      />
      <TopOfMindSection
        title="Top of mind"
        items={articlesToItems(data.articles)}
        emptyMessage="No articles matched this age stage yet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    width: '100%',
    gap: Spacing.three,
  },
  section: {
    width: '100%',
    gap: Spacing.one,
  },
  sectionTitle: {
    textAlign: 'left',
  },
});
