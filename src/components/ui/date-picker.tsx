import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DatePickerProps {
  date?: Date | string;
  value?: Date | string;
  onSelect?: (date: Date | undefined) => void;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function DatePicker({
  date,
  value,
  onSelect,
  onChange,
  placeholder = 'YYYY-MM-DD',
  className,
  disabled = false,
  hasError = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize input date
  const rawDate = date ?? value;
  const selectedDate = React.useMemo(() => {
    if (!rawDate) return undefined;
    if (rawDate instanceof Date) return isNaN(rawDate.getTime()) ? undefined : rawDate;
    if (typeof rawDate === 'string' && rawDate.trim() !== '') {
      try {
        const parsed = parseISO(rawDate);
        return isNaN(parsed.getTime()) ? new Date(rawDate) : parsed;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [rawDate]);

  const handleSelect = (newDate: Date | undefined) => {
    onSelect?.(newDate);
    if (onChange) {
      if (newDate) {
        onChange(format(newDate, 'yyyy-MM-dd'));
      } else {
        onChange('');
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-none border border-[#e6e6e6] bg-white px-4 py-2 text-sm text-[#262626] transition-all placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#262626] focus:ring-1 focus:ring-[#262626] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none text-left',
            hasError && 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]',
            className,
          )}
        >
          {selectedDate ? (
            <span className="font-normal text-[#262626]">{format(selectedDate, 'yyyy-MM-dd')}</span>
          ) : (
            <span className="text-[#9a9a9a] font-light">{placeholder}</span>
          )}
          <CalendarIcon className="h-4 w-4 text-[#6b6b6b] shrink-0 ml-2 opacity-75" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-none border border-[#cccccc] bg-white shadow-md z-50" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
