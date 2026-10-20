import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

const EMPTY_VALUE = '__EMPTY__';

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { hasError?: boolean }
>(({ className, children, hasError, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-11 w-full items-center justify-between rounded-none border border-[#e6e6e6] bg-white px-3.5 py-2.5 text-sm text-[#262626] transition-all data-[placeholder]:text-[#9a9a9a] data-[placeholder]:font-light focus:outline-none focus:border-[#262626] focus:ring-1 focus:ring-[#262626] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer select-none text-left',
      hasError && 'border-[#dc2626] bg-white focus:border-[#dc2626] focus:ring-[#dc2626]',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-60 ml-2 shrink-0 text-[#6b6b6b]" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-[#6b6b6b]',
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-[#6b6b6b]',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-none border border-[#cccccc] bg-white text-[#262626] shadow-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-3 py-1.5 text-xs font-bold text-[#6b6b6b] uppercase tracking-[0.5px]', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-none py-2.5 pl-3 pr-8 text-sm outline-none transition-colors focus:bg-[#f7f7f7] focus:text-[#262626] data-[disabled]:pointer-events-none data-[disabled]:opacity-40 hover:bg-[#f7f7f7]',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-ink" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectItem.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-hairline', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export interface UnifiedSelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | { target: { name?: string; value: string; id?: string } }) => void;
  onValueChange?: (value: string) => void;
  onBlur?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLButtonElement, UnifiedSelectProps>(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onChange,
      onValueChange,
      placeholder = 'Select option...',
      disabled,
      hasError,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // Check if children contain SelectTrigger/SelectContent (composable mode)
    const isComposable = React.Children.toArray(children).some(
      (child) =>
        React.isValidElement(child) &&
        (child.type === SelectTrigger || child.type === SelectContent),
    );

    if (isComposable) {
      return (
        <SelectPrimitive.Root
          value={value !== undefined ? String(value) : undefined}
          defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
          onValueChange={onValueChange}
          disabled={disabled}
          {...props}
        >
          {children}
        </SelectPrimitive.Root>
      );
    }

    // Auto-convert option elements to SelectItem components with placeholder detection
    let detectedPlaceholder = placeholder;
    const items: React.ReactNode[] = [];

    const processChild = (child: React.ReactNode, index: number): void => {
      if (!React.isValidElement(child)) return;

      if (child.type === 'option' || (typeof child.type === 'string' && child.type.toLowerCase() === 'option')) {
        const optionProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
        const optVal = optionProps.value !== undefined ? String(optionProps.value) : '';
        const optLabel = optionProps.children || optVal;

        if (optVal === '') {
          if (optLabel && typeof optLabel === 'string') {
            detectedPlaceholder = optLabel;
          }
          items.push(
            <SelectItem key={`opt-${index}`} value={EMPTY_VALUE}>
              {optLabel || 'None'}
            </SelectItem>,
          );
        } else {
          items.push(
            <SelectItem
              key={`opt-${index}-${optVal}`}
              value={optVal}
              disabled={optionProps.disabled}
            >
              {optLabel}
            </SelectItem>,
          );
        }
      } else if (child.type === React.Fragment) {
        React.Children.forEach((child.props as any)?.children, processChild);
      } else if (Array.isArray(child)) {
        child.forEach(processChild);
      } else {
        items.push(child);
      }
    };

    React.Children.forEach(children, processChild);

    const safeValue = value === '' || value === undefined ? EMPTY_VALUE : String(value);

    const handleValueChange = (val: string) => {
      const resolvedVal = val === EMPTY_VALUE ? '' : val;
      onValueChange?.(resolvedVal);
      if (onChange) {
        onChange({
          target: {
            name,
            value: resolvedVal,
            id,
          },
        } as any);
      }
    };

    return (
      <SelectPrimitive.Root
        value={safeValue}
        defaultValue={defaultValue !== undefined ? (defaultValue === '' ? EMPTY_VALUE : String(defaultValue)) : undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger ref={ref} id={id} className={className} hasError={hasError}>
          <SelectValue placeholder={detectedPlaceholder} />
        </SelectTrigger>
        <SelectContent>{items}</SelectContent>
      </SelectPrimitive.Root>
    );
  },
);

Select.displayName = 'Select';

export const SelectRoot = SelectPrimitive.Root;
export const NativeSelect = Select;

export {
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
