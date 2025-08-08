interface DayTextProps {
  content: string;
}

const DayText = ({ content }: DayTextProps) => {
  return (
    <div className="flex-1 min-h-0">
      <div 
        className="h-full overflow-y-auto scrollbar-hide prose prose-sm max-w-none px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="text-text-primary leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
};

export default DayText;