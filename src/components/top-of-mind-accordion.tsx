import { AccordionList } from '@/components/accordion-list';
import type { TopOfMindCard, TopOfMindResponse } from '@/services/api-types';

type TopOfMindState = {
  loading: boolean;
  data: TopOfMindResponse | null;
  error: string | null;
};

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

  if (state.data?.message && !state.data.cards.length) {
    return (
      <AccordionList
        items={[{ id: 0, title: 'Insight', body: state.data.message }]}
      />
    );
  }

  const items = (state.data?.cards ?? []).map((card: TopOfMindCard) => ({
    id: card.document_id,
    title: card.title,
    body: card.summary,
  }));

  return (
    <AccordionList
      items={items}
      emptyMessage="Nothing noted yet"
    />
  );
}
