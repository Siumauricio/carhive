'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { addDays, differenceInDays, format, isAfter } from 'date-fns';
import { SearchParams } from '@/lib/types';
import { Location } from '@/db/definitions';
import { cn, formatCurrency } from '@/lib/utils';

const FormSchema = z
  .object({
    location: z.string({ required_error: 'Location is required' }),
    checkin: z.date({ required_error: 'Check in is required' }),
    checkout: z.date({ required_error: 'Check out is required' }),
  })
  .refine((schema) => isAfter(schema.checkout, schema.checkin), {
    message: 'Check out must be after check in',
    path: ['checkout'],
  });

interface ReservationFormProps {
  locations: Location[];
  pricePerDay: number;
  currency: string;
}

export function ReservationForm({
  locations,
  pricePerDay,
  currency,
}: ReservationFormProps) {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    const { location, checkin, checkout } = values;

    console.log({ location, checkin, checkout });
  }

  useEffect(() => {
    const location = searchParams.get(SearchParams.LOCATION);
    const checkin = searchParams.get(SearchParams.CHECKIN);
    const checkout = searchParams.get(SearchParams.CHECKOUT);

    if (location) form.setValue('location', location);
    if (checkin) form.setValue('checkin', new Date(checkin));
    if (checkout) form.setValue('checkout', new Date(checkout));

    return () => {
      form.resetField('location');
      form.resetField('checkin');
      form.resetField('checkout');
    };
  }, [searchParams, form]);

  const checkIn = addDays(new Date(), 7);
  const checkOut = addDays(new Date(), 14);

  const days: number = differenceInDays(checkOut, checkIn);
  const taxesAndFees: number = pricePerDay * days * 0.16;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-6 w-full rounded-xl border border-neutral-300">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="absolute left-[10px] top-[10px] text-xs font-bold leading-none">
                    Pick-up / Drop-off
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          role="combobox"
                          aria-label="select location"
                          variant="unstyled"
                          className="m-0 flex h-[52px] w-full flex-col justify-end gap-1.5 truncate rounded-t-xl border-b border-neutral-300 p-2.5 text-left text-sm leading-none text-neutral-600"
                        >
                          <span className="w-full">
                            {field.value
                              ? locations.find(
                                  (location) => location.value === field.value,
                                )?.name
                              : 'Select location'}
                          </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Search location..." />
                        <CommandEmpty>No place found.</CommandEmpty>
                        <CommandGroup>
                          {locations.map((location) => (
                            <CommandItem
                              value={location.name}
                              key={location.value}
                              onSelect={() => {
                                form.setValue('location', location.value);
                              }}
                            >
                              <Icons.check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  location.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {location.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2">
              <FormField
                control={form.control}
                name="checkin"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="absolute left-[10px] top-[10px] text-xs font-bold leading-none">
                      Check in
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="unstyled"
                            className="m-0 flex h-[52px] w-full flex-col justify-end gap-1.5 truncate rounded-bl-xl p-2.5 text-left text-sm leading-none text-neutral-600"
                          >
                            <span className="w-full">
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </span>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkout"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="absolute left-[10px] top-[10px] text-xs font-bold leading-none">
                      Check out
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="unstyled"
                            className="m-0 flex h-[52px] w-full flex-col justify-end gap-1.5 truncate rounded-br-xl border-l border-neutral-300 p-2.5 text-left text-sm leading-none text-neutral-600"
                          >
                            <span className="w-full">
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </span>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= addDays(new Date(), 1)}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-2" aria-live="polite">
            {form.formState.errors.location && (
              <p className="mt-1 text-left text-xs font-medium text-red-500">
                {form.formState.errors.location.message}
              </p>
            )}
            {form.formState.errors.checkin && (
              <p className="mt-1 text-left text-xs font-medium text-red-500">
                {form.formState.errors.checkin.message}
              </p>
            )}
            {form.formState.errors.checkout && (
              <p className="mt-1 text-left text-xs font-medium text-red-500">
                {form.formState.errors.checkout.message}
              </p>
            )}
          </div>
          <Button type="submit" size="xl" className="mt-4 w-full text-base">
            Reserve
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        You won&apos;t be charged yet
      </p>
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="text-neutral-600 underline">
            {formatCurrency(pricePerDay, currency)} x {days}{' '}
            {days > 1 ? 'days' : 'day'}
          </div>
          <div className="text-neutral-600">
            {formatCurrency(pricePerDay * days, currency)}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-neutral-600 underline">Taxes and fees</div>
          <div className="text-neutral-600">
            {formatCurrency(taxesAndFees, currency)}
          </div>
        </div>
        <hr className="my-6" />
        <div className="flex items-center justify-between">
          <div className="font-semibold">Total (taxes included)</div>
          <div className="font-semibold">
            {formatCurrency(pricePerDay * days + taxesAndFees, currency)}
          </div>
        </div>
      </div>
    </>
  );
}
