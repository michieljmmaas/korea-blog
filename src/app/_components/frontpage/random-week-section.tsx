'use client';

import type { ReactNode } from 'react';
import WeekCard from '../weeks/week-card';
import { WeekData } from '@/app/types';
import RandomSection from './random-section';

interface RandomWeekSectionProps {
  initialWeek: WeekData;
  fetchNewWeek: (current: number | null) => Promise<WeekData>;
  linkComponent: ReactNode;
}

export default function RandomWeekSection({
  initialWeek,
  fetchNewWeek,
  linkComponent,
}: RandomWeekSectionProps) {
  return (
    <RandomSection
      title="Random Week"
      initialItem={initialWeek}
      fetchNew={fetchNewWeek}
      getKey={(week) => week.index}
      renderItem={(week) => <WeekCard week={week} priorty={true} />}
      linkComponent={linkComponent}
    />
  );
}
