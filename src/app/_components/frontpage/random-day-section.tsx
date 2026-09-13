'use client';

import type { ReactNode } from 'react';
import DayCard from '../day/day-card';
import { TripDay } from '@/app/types';
import RandomSection from './random-section';
import { findReduxDay } from '../../../../utils/reduxMode';
import { useReduxMode } from '../providers/redux-mode-provider';

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
  const { hasNotHappenedYet } = useReduxMode();
  const eligibleDays = days.filter((day) => !hasNotHappenedYet(day.frontmatter.date));

  return (
    <RandomSection
      title="Random Day"
      items={eligibleDays.length > 0 ? eligibleDays : days}
      initialItem={initialDay}
      getKey={(day) => day.day}
      renderItem={(day) => <DayCard day={day} />}
      linkComponent={linkComponent}
      getReduxItem={findReduxDay}
    />
  );
}
