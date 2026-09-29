import { useEffect, useState } from "react";
import type { ProfileEffect } from "@/components/dashboard/EffectsPicker";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

let effectsList: ProfileEffect[] | null = null;
let decorationsList: Decoration[] | null = null;
let effectsPromise: Promise<ProfileEffect[]> | null = null;
let decorationsPromise: Promise<Decoration[]> | null = null;

function loadEffects(): Promise<ProfileEffect[]> {
  effectsPromise ??= import("@/effects.json").then(
    (m) => (effectsList = m.default as unknown as ProfileEffect[]),
  );
  return effectsPromise;
}

function loadDecorations(): Promise<Decoration[]> {
  decorationsPromise ??= import("@/Deco.json").then(
    (m) => (decorationsList = m.default as Decoration[]),
  );
  return decorationsPromise;
}

function useCatalog<T>(enabled: boolean, cached: T[] | null, load: () => Promise<T[]>): T[] | null {
  const [list, setList] = useState<T[] | null>(cached);
  useEffect(() => {
    if (!enabled || list) return;
    let cancelled = false;
    load().then((items) => {
      if (!cancelled) setList(items);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, list, load]);
  return list;
}

export function useEffectsCatalog(enabled: boolean): ProfileEffect[] | null {
  return useCatalog(enabled, effectsList, loadEffects);
}

export function useDecorationsCatalog(enabled: boolean): Decoration[] | null {
  return useCatalog(enabled, decorationsList, loadDecorations);
}

const itemCache = new Map<string, Promise<unknown>>();

function fetchItem<T>(kind: "effect" | "decoration", key: string): Promise<T | null> {
  const list = kind === "effect" ? effectsList : decorationsList;
  if (list) {
    const found =
      kind === "effect"
        ? (list as ProfileEffect[]).find((e) => e.sku_id === key)
        : (list as Decoration[]).find((d) => d.url === key);
    return Promise.resolve((found as T | undefined) ?? null);
  }

  const cacheKey = `${kind}:${key}`;
  let pending = itemCache.get(cacheKey) as Promise<T | null> | undefined;
  if (!pending) {
    pending = fetch(`/api/collectibles?${kind}=${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : { item: null }))
      .then((data: { item?: T | null }) => data.item ?? null)
      .catch(() => {
        itemCache.delete(cacheKey);
        return null;
      });
    itemCache.set(cacheKey, pending);
  }
  return pending;
}

function useItem<T>(kind: "effect" | "decoration", key: string | null): T | null | undefined {
  const [state, setState] = useState<{ key: string | null; item: T | null } | null>(null);
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchItem<T>(kind, key).then((item) => {
      if (!cancelled) setState({ key, item });
    });
    return () => {
      cancelled = true;
    };
  }, [kind, key]);

  if (!key) return null;
  return state?.key === key ? state.item : undefined;
}

export function useProfileEffect(sku: string | null): ProfileEffect | null | undefined {
  return useItem<ProfileEffect>("effect", sku);
}

export function useDecoration(url: string | null): Decoration | null | undefined {
  return useItem<Decoration>("decoration", url);
}

export function effectSkuFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.split("effect:")[1] || null;
}
