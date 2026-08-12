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
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return;
    }

    hasTracked.current = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, 'true');
    }

    const trackView = async () => {
      try {
        // The owner-view check is enforced server-side in /api/track-view from
        // the session cookie, so no viewer-id lookup is needed here.
        const fp = await fpPromise.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileId, fingerprint }),
        }).catch(err => {
          console.error('[views] Client tracking failed:', err);
        });
      } catch (err) {
        console.error('[views] Fingerprint failed:', err);
      }
    };

    trackView();
  }, [profileId]);

  return null; // Invisible component
}
