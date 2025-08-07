const WeekdayHeaders: React.FC = () => {
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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