"use client";

import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal } from '@/app/types';
import HeaderLink from '../layout/Link';

export const GoalItem = ({ goal }: { goal: Goal }) => {
  return (
    <div className="transition-all duration-300 border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        {goal.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}

        <div className="flex-1">
          <h3
            className={cn(
              "font-medium text-sm",
              goal.completed ? "text-green-600 line-through" : "text-foreground"
            )}
          >
            {goal.text}
          </h3>
        </div>

        {
          goal.completed &&
          <HeaderLink pathname={'blogs/' + goal.link} title={'Read the blog'} currentPathName={''} />
        }
      </div>
    </div>
  );
};
