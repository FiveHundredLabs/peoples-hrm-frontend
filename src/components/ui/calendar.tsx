import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 bg-white text-[#262626] select-none rounded-none', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-between pt-1 relative items-center mb-2 px-1',
        caption_label: 'text-sm font-bold text-[#262626] tracking-tight uppercase',
        nav: 'space-x-1 flex items-center',
        button_previous:
          'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6] rounded-none inline-flex items-center justify-center transition-colors cursor-pointer',
        button_next:
          'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6] rounded-none inline-flex items-center justify-center transition-colors cursor-pointer',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-[#6b6b6b] rounded-none w-9 font-bold text-[0.75rem] uppercase tracking-[0.5px] text-center',
        weeks: 'w-full mt-1.5 space-y-1',
        week: 'flex w-full',
        day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 inline-flex items-center justify-center',
        day_button: cn(
          'h-9 w-9 p-0 font-normal rounded-none transition-colors inline-flex items-center justify-center cursor-pointer hover:bg-[#f7f7f7] hover:text-[#262626]',
        ),
        selected:
          'bg-[#1c69d4] text-white hover:bg-[#0653b6] hover:text-white focus:bg-[#1c69d4] focus:text-white font-bold rounded-none',
        today: 'bg-[#f7f7f7] text-[#1c69d4] font-bold border border-[#cccccc]',
        outside:
          'text-[#9a9a9a] opacity-50',
        disabled: 'text-[#9a9a9a] opacity-30 cursor-not-allowed',
        range_middle:
          'bg-[#f7f7f7] text-[#262626]',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4 text-[#262626]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#262626]" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
