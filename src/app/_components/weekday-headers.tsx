interface WeekdayHeadersProps {
  size: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-16 text-xs',
  medium: 'w-20 text-sm',
  large: 'w-24 text-base'
};

const WeekdayHeaders: React.FC<WeekdayHeadersProps> = ({ size }) => {
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="grid grid-cols-7 gap-0 mb-4">
      {weekdays.map((day) => (
        <div key={day} className={`${sizeClasses[size]} text-center font-semibold text-gray-600 py-2`}>
          {day}
        </div>
      ))}
    </div>
  );
};

export default WeekdayHeaders;