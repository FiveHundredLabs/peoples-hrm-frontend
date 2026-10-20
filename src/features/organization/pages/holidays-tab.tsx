import { useState } from 'react';
import { useHolidays, useHolidayCalendars } from '../api/organization-api';
import { HolidayModal } from '../components/holiday-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, CalendarDays, Moon, Sparkles } from 'lucide-react';

export function HolidaysTab() {
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [poyaOnly, setPoyaOnly] = useState(false);
  const [mercantileOnly, setMercantileOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: calendars = [] } = useHolidayCalendars();
  const activeCalendar = calendars[0];

  const { data: response, isLoading, isError } = useHolidays({
    year: currentYear,
    isPoya: poyaOnly ? true : undefined,
    isMercantileHoliday: mercantileOnly ? true : undefined,
    search: search ? search : undefined,
    pageSize: 50,
  });

  const holidays = response?.data || [];

  return (
    <div className="space-y-6">
      {/* Overview Banner for Sri Lanka Holidays */}
      <div className="rounded-none bg-canvas-soft p-5 border border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sri Lanka Statutory Calendar ({currentYear})</span>
          </div>
          <h3 className="text-base font-semibold text-ink">Public, Bank & Mercantile Holidays</h3>
          <p className="text-xs text-body mt-0.5">
            Full Moon Poya days are mandatory non-working public holidays under the Holidays Act No. 29 of 1971.
          </p>
        </div>

        <Button
          variant="primary-pill"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Holiday</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search holidays..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={poyaOnly ? 'primary-pill' : 'outline'}
            size="sm"
            onClick={() => setPoyaOnly(!poyaOnly)}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Poya Days Only</span>
          </Button>

          <Button
            variant={mercantileOnly ? 'primary-pill' : 'outline'}
            size="sm"
            onClick={() => setMercantileOnly(!mercantileOnly)}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Mercantile Only</span>
          </Button>
        </div>
      </div>

      {/* Holiday Table */}
      {isLoading ? (
        <LoadingState message="Loading holiday calendar..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load holidays.
        </div>
      ) : holidays.length === 0 ? (
        <EmptyState
          title="No Holidays Recorded"
          description="Add national, mercantile, and Poya holidays to configure attendance and leave policies."
          actionLabel="Add Holiday"
          onAction={() => setIsModalOpen(true)}
          icon={CalendarDays}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Holiday Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Statutory Classification</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidays.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-mono font-bold text-ink">{h.holidayDate}</TableCell>
                <TableCell className="font-semibold text-ink">{h.name}</TableCell>
                <TableCell className="text-xs text-ink-mute">{h.holidayType}</TableCell>
                <TableCell className="space-x-1.5">
                  {h.isPoya && <Badge variant="secondary">🌕 Poya Day</Badge>}
                  {h.isMercantileHoliday && <Badge variant="success">Mercantile</Badge>}
                  {h.isPublicHoliday && <Badge variant="outline">Public</Badge>}
                  {h.isCompanyHoliday && <Badge variant="cream">Company</Badge>}
                </TableCell>
                <TableCell className="text-xs text-ink-mute">{h.notes || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        calendars={calendars}
        defaultCalendarId={activeCalendar?.id}
      />
    </div>
  );
}
