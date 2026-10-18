"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface UnsavedChangesContextValue {
  /** True while at least one SaveBar is reporting unsaved edits. */
  isDirty: boolean;
  /** Increments whenever a blocked navigation should shake the SaveBar. */
  blockSignal: number;
  /** Registers (or clears) one SaveBar's dirty state. */
  register: (id: string, dirty: boolean) => void;
  /** Ask the SaveBar to shake (used by non-anchor actions such as sign out). */
  block: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<string>>(() => new Set());
  const [blockSignal, setBlockSignal] = useState(0);
  const isDirty = dirtyIds.size > 0;
  const isDirtyRef = useRef(false);

  const register = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((prev) => {
      const has = prev.has(id);
      if (has === dirty) return prev;
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const block = useCallback(() => {
    setBlockSignal((value) => value + 1);
  }, []);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Closing the tab or refreshing: native browser prompt.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // In-app links (sidebar, logo, cards): block the click before Next's <Link>
  // handler sees it and ask the SaveBar to shake.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isDirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.dataset.unsavedIgnore !== undefined) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      // Same page (for example a hash link) loses nothing.
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      block();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [block]);

  // Browser back/forward: park a duplicate history entry on the current page
  // so the popstate handler can stay put and shake instead of leaving.
  useEffect(() => {
    if (!isDirty) return;

    const pushGuardEntry = () => {
      if (window.history.state?.__iunoUnsaved) return;
      window.history.pushState(
        { ...(window.history.state || {}), __iunoUnsaved: true },
        "",
        window.location.href,
      );
    };

    pushGuardEntry();

    const onPopState = () => {
      if (!isDirtyRef.current) return;
      pushGuardEntry();
      block();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, block]);

  const value = useMemo(
    () => ({ isDirty, blockSignal, register, block }),
    [isDirty, blockSignal, register, block],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}
