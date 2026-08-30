"use client";

import { useEffect, useRef } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';

interface ProfileViewTrackerProps {
  profileId: number;
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
    sessionStorage.setItem(sessionKey, 'true');

    const trackView = async () => {
      // Fingerprint is a best-effort extra signal — the server dedups on IP+UA
      // first, so a failure here must not cost us the view.
      let fingerprint: string | undefined;
      try {
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
      }).catch(err => {
        console.error('[views] Client tracking failed:', err);
      });
    };

    trackView();
  }, [profileId]);

  return null;
}
