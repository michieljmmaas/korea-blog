'use client';

import type { ReactNode } from 'react';
import DayCard from '../day/day-card';
import { TripDay } from '@/app/types';
import RandomSection from './random-section';

interface RandomDaySectionProps {
  initialDay: TripDay;
  fetchNewDay: (current: number | null) => Promise<TripDay>;
  linkComponent: ReactNode;
}

export default function RandomDaySection({
  initialDay,
  fetchNewDay,
  linkComponent,
}: RandomDaySectionProps) {
  return (
    <RandomSection
      title="Random Day"
      initialItem={initialDay}
      fetchNew={fetchNewDay}
      getKey={(day) => day.day}
      renderItem={(day) => <DayCard day={day} />}
      linkComponent={linkComponent}
    />
  );
}
