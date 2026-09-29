"use client";

import { useEffect, useRef } from 'react';

interface ProfileViewTrackerProps {
  profileId: number;
}

function whenIdle(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1500);
  return () => window.clearTimeout(id);
}

export default function ProfileViewTracker({ profileId }: ProfileViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    const sessionKey = `viewed_profile_${profileId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    hasTracked.current = true;

    const trackView = async () => {
      sessionStorage.setItem(sessionKey, 'true');

      let fingerprint: string | undefined;
      try {
        const { default: fpPromise } = await import('@fingerprintjs/fingerprintjs');
        const fp = await fpPromise.load();
        fingerprint = (await fp.get()).visitorId;
      } catch (err) {
        console.error('[views] Fingerprint failed:', err);
      }

      fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, fingerprint }),
        keepalive: true,
      }).catch(err => {
        console.error('[views] Client tracking failed:', err);
      });
    };

    const cancel = whenIdle(() => {
      void trackView();
    });
    return () => {
      cancel();
      hasTracked.current = false;
    };
  }, [profileId]);

  return null;
}
