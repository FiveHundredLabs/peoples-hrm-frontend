import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { DatePicker } from '../../../components/ui/date-picker';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { holidaySchema, HolidayFormValues } from '../schemas/organization.schema';
import { HolidayCalendar } from '../types/organization';
import { useCreateHoliday } from '../api/organization-api';

export interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendars: HolidayCalendar[];
  defaultCalendarId?: string;
}

export function HolidayModal({
  isOpen,
  onClose,
  calendars,
  defaultCalendarId,
}: HolidayModalProps) {
  const createMutation = useCreateHoliday();

  const initialValues: HolidayFormValues = {
    calendarId: defaultCalendarId || calendars[0]?.id || '',
    holidayDate: new Date().toISOString().split('T')[0],
    name: '',
    holidayType: 'Public & Bank',
    isPoya: false,
    isPublicHoliday: true,
    isMercantileHoliday: true,
    isCompanyHoliday: false,
    notes: '',
  };

  const handleSubmit = async (values: HolidayFormValues) => {
    await createMutation.mutateAsync(values);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Statutory Holiday"
      description="Add statutory holiday."
      maxWidth="md"
    >
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(holidaySchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form className="space-y-4">
            {/* Calendar */}
            <div>
              <Label className="mb-1 block font-bold text-xs uppercase tracking-[0.5px]">Holiday Calendar *</Label>
              <select
                name="calendarId"
                value={values.calendarId}
                onChange={(e) => setFieldValue('calendarId', e.target.value)}
                className="flex h-11 w-full rounded-none border border-[#e6e6e6] bg-white px-4 py-2 text-sm text-[#262626] transition-all focus:outline-none focus:border-[#262626] focus:ring-1 focus:ring-[#262626]"
              >
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <Label className="mb-1 block font-bold text-xs uppercase tracking-[0.5px]">Holiday Date *</Label>
                <DatePicker
                  value={values.holidayDate}
                  onChange={(val) => setFieldValue('holidayDate', val)}
                  hasError={touched.holidayDate && !!errors.holidayDate}
                />
                <ErrorMessage name="holidayDate" component="p" className="mt-1 text-xs text-[#dc2626] font-bold" />
              </div>

              {/* Type */}
              <div>
                <Label className="mb-1 block font-bold text-xs uppercase tracking-[0.5px]">Category *</Label>
                <Field
                  name="holidayType"
                  as={Input}
                  placeholder="e.g. Public, Bank & Mercantile"
                  hasError={touched.holidayType && !!errors.holidayType}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label className="mb-1 block font-bold text-xs uppercase tracking-[0.5px]">Holiday Name *</Label>
              <Field
                name="name"
                as={Input}
                placeholder="e.g. Vesak Full Moon Poya Day"
                hasError={touched.name && !!errors.name}
              />
              <ErrorMessage name="name" component="p" className="mt-1 text-xs text-[#dc2626] font-bold" />
            </div>

            {/* Sri Lanka Statutory Classification Checkboxes */}
            <div className="rounded-none bg-[#f7f7f7] p-4 border border-[#e6e6e6] space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.5px] text-[#6b6b6b] mb-2">
                Sri Lanka Statutory Classification
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-[#262626]">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    checked={values.isPoya}
                    onCheckedChange={(checked) => setFieldValue('isPoya', !!checked)}
                  />
                  <span>Full Moon Poya Day</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    checked={values.isMercantileHoliday}
                    onCheckedChange={(checked) => setFieldValue('isMercantileHoliday', !!checked)}
                  />
                  <span>Mercantile Holiday (Paid)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    checked={values.isPublicHoliday}
                    onCheckedChange={(checked) => setFieldValue('isPublicHoliday', !!checked)}
                  />
                  <span>Public Holiday</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    checked={values.isCompanyHoliday}
                    onCheckedChange={(checked) => setFieldValue('isCompanyHoliday', !!checked)}
                  />
                  <span>Company Custom Holiday</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#e6e6e6]">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Add Holiday
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
