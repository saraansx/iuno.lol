"use client";

import { useEffect, useState } from "react";

/**
 * Every widget account field is typed into on the customize pages, and each
 * change is an upstream API call, so all widget hooks share one delay.
 */
export const WIDGET_DEBOUNCE_MS = 600;

/**
 * Holds `value` steady until it stops changing for `delayMs`, so a widget hook
 * fetches once per settled input instead of once per keystroke.
 *
 * The initial value is returned immediately — a widget mounting with a saved
 * account fetches at once, and only later edits pay the delay. Callers pass ""
 * for input they consider invalid, which settles at once so the preview clears
 * rather than waiting on a request that is never going to be made.
 *
 * `isPending` is true while the live value is ahead of the settled one. Hooks
 * report their loading state while it holds, rather than the data they still
 * have, so a preview never shows one account's card under another's name.
 * Typing back to the already-settled value clears it with no new request, since
 * the timer is the only thing that ever commits a non-empty value.
 */
export function useDebouncedValue(
  value: string,
  delayMs: number = WIDGET_DEBOUNCE_MS
): { value: string; isPending: boolean } {
  const [settled, setSettled] = useState<string>(value);

  // Emptying the field settles during render rather than in an effect. Doing it
  // here is what keeps the previous account from resurfacing: it would otherwise
  // still be the settled value once the field became non-empty again, and hooks
  // keyed on that value would fire a second request for the abandoned account.
  if (!value && settled) setSettled("");

  useEffect(() => {
    // The empty case is settled above, so there is nothing left to wait for.
    if (!value) return;
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return { value: settled, isPending: value !== settled };
}
