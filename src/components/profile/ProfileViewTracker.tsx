"use client";

import { useEffect, useRef } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { getCurrentUserId } from '@/actions/get-viewer-id';

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
        // Don't count your own profile views.
        const viewerId = await getCurrentUserId();
        if (viewerId === profileId) return;

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
