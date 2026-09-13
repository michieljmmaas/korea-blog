'use client';

import type { ReactNode } from 'react';
import WeekCard from '../weeks/week-card';
import { WeekData } from '@/app/types';
import RandomSection from './random-section';
import { findReduxWeek } from '../../../../utils/reduxMode';
import { useReduxMode } from '../providers/redux-mode-provider';

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
  const { hasNotHappenedYet } = useReduxMode();
  const eligibleWeeks = weeks.filter((week) => !hasNotHappenedYet(week.days[0]));

  return (
    <RandomSection
      title="Random Week"
      items={eligibleWeeks.length > 0 ? eligibleWeeks : weeks}
      initialItem={initialWeek}
      getKey={(week) => week.index}
      renderItem={(week) => <WeekCard week={week} priorty={true} />}
      linkComponent={linkComponent}
      getReduxItem={findReduxWeek}
    />
  );
}
