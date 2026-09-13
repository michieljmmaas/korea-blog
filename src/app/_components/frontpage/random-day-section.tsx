'use client';

import type { ReactNode } from 'react';
import DayCard from '../day/day-card';
import { TripDay } from '@/app/types';
import RandomSection from './random-section';

interface RandomDaySectionProps {
  days: TripDay[];
  initialDay: TripDay;
  linkComponent: ReactNode;
}

export default function RandomDaySection({
  days,
  initialDay,
  linkComponent,
}: RandomDaySectionProps) {
  return (
    <RandomSection
      title="Random Day"
      items={days}
      initialItem={initialDay}
      getKey={(day) => day.day}
      renderItem={(day) => <DayCard day={day} />}
      linkComponent={linkComponent}
    />
  );
}
