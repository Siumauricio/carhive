'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { subscribeToNewsletter } from '@/db/actions';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      size="xs"
      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md text-xs text-neutral-600"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'Subscribing...' : 'Subscribe'}
    </Button>
  );
}

export function SubscribeForm() {
  const initialState = {
    errors: [],
    message: null,
    subscribed: false,
  };

  const [state, formAction] = useFormState(subscribeToNewsletter, initialState);

  return (
    <form action={formAction}>
      <div className={cn('relative', state?.subscribed && 'hidden')}>
        <Input
          name="email"
          placeholder="you@domain.com"
          type="email"
          className="w-full text-ellipsis rounded-md border bg-neutral-50 px-3.5 py-2 pr-24 text-sm"
          defaultValue=""
          required
          aria-describedby="email-validation"
        />
        <SubmitButton />
      </div>
      <div id="email-validation" aria-live="polite">
        {state?.errors?.map((error: string) => (
          <p key={error} className="mt-2 text-sm text-red-500">
            {error}
          </p>
        ))}
        {state?.message && (
          <p className="mt-2 text-sm text-red-500">{state.message}</p>
        )}
        {state?.subscribed && (
          <p className="mt-2 flex flex-row items-center gap-1.5 text-sm text-neutral-600">
            <Icons.checkCircle
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden="true"
            />
            Thanks for subscribing!
          </p>
        )}
      </div>
    </form>
  );
}
