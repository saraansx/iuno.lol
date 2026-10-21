"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface ProfileViewTrackerProps {
  profileId: number;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_TIMEOUT_MS = 8000;

function whenIdle(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1500);
  return () => window.clearTimeout(id);
}

export default function ProfileViewTracker({ profileId }: ProfileViewTrackerProps) {
  const hasTracked = useRef(false);
  const sent = useRef(false);
  const [active, setActive] = useState(false);

  const send = useCallback(async (turnstileToken?: string) => {
    if (sent.current) return;
    sent.current = true;

    let fingerprint: string | undefined;
    try {
      const { default: fpPromise } = await import("@fingerprintjs/fingerprintjs");
      const fp = await fpPromise.load();
      fingerprint = (await fp.get()).visitorId;
    } catch (err) {
      console.error("[views] Fingerprint failed:", err);
    }

    try {
      await fetch("/api/track-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId, fingerprint, turnstileToken }),
        keepalive: true,
      });
    } catch (err) {
      console.error("[views] Client tracking failed:", err);
    }
  }, [profileId]);

  useEffect(() => {
    if (hasTracked.current) return;

    const sessionKey = `viewed_profile_${profileId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    hasTracked.current = true;

    const cancel = whenIdle(() => {
      sessionStorage.setItem(sessionKey, "true");

      if (!SITE_KEY) {
        void send();
        return;
      }

      setActive(true);
    });

    return () => {
      cancel();
      hasTracked.current = false;
    };
  }, [profileId, send]);

  useEffect(() => {
    if (!active || sent.current) return;

    const id = window.setTimeout(() => {
      void send();
    }, TURNSTILE_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [active, send]);

  if (!active || !SITE_KEY) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-0 right-0 -z-10 opacity-0"
    >
      <Turnstile
        siteKey={SITE_KEY}
        options={{ appearance: "interaction-only", theme: "dark" }}
        onSuccess={(token) => {
          void send(token);
        }}
        onError={() => {
          void send();
        }}
        onTimeout={() => {
          void send();
        }}
      />
    </div>
  );
}
