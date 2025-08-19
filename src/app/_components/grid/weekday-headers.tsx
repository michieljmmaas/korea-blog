interface WeekdayHeadersProps {
  startDay?: string;
}

const WeekdayHeaders: React.FC<WeekdayHeadersProps> = ({ startDay = 'MON' }) => {
  const allWeekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Find the index of the starting day
  const startIndex = allWeekdays.indexOf(startDay.toUpperCase());
  
  // If the startDay is not found, default to Monday (index 0)
  const validStartIndex = startIndex !== -1 ? startIndex : 0;
  
  // Reorder the weekdays array starting from the specified day
  const weekdays = [
    ...allWeekdays.slice(validStartIndex),
    ...allWeekdays.slice(0, validStartIndex)
  ];

  return (
    <div className="grid grid-cols-7 gap-0 mb-4">
      {weekdays.map((day) => (
        <div key={day} className={`w-16 text-xs text-center font-semibold text-gray-600 py-2`}>
          {day}
        </div>
      ))}
    </div>
  );
};

export default WeekdayHeaders;