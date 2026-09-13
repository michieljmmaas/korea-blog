'use client';

import type { ReactNode } from 'react';
import WeekCard from '../weeks/week-card';
import { WeekData } from '@/app/types';
import RandomSection from './random-section';

interface RandomWeekSectionProps {
  weeks: WeekData[];
  initialWeek: WeekData;
  linkComponent: ReactNode;
}

export default function RandomWeekSection({
  weeks,
  initialWeek,
  linkComponent,
}: RandomWeekSectionProps) {
  return (
    <RandomSection
      title="Random Week"
      items={weeks}
      initialItem={initialWeek}
      getKey={(week) => week.index}
      renderItem={(week) => <WeekCard week={week} priorty={true} />}
      linkComponent={linkComponent}
    />
  );
}
