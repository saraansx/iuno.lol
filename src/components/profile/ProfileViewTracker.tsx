"use client";

import { useEffect, useRef } from 'react';

interface ProfileViewTrackerProps {
  profileId: number;
}

export default function ProfileViewTracker({ profileId }: ProfileViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load, even in React Strict Mode
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Fire and forget the view tracking request
    fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileId }),
    }).catch(err => {
      // Silently ignore errors so it doesn't break the user experience
      console.error('[views] Client tracking failed:', err);
    });
  }, [profileId]);

  return null; // Invisible component
}
