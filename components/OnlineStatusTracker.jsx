"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function OnlineStatusTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    let intervalId;
    let activityTimeout;

    // Function to update lastSeen
    const updateLastSeen = async () => {
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lastSeen: new Date().toISOString() }),
        });
      } catch (error) {
        console.error('Error updating lastSeen:', error);
      }
    };

    // Function to handle user activity
    const handleActivity = () => {
      // Clear existing timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      
      // Set new timeout to update lastSeen after 30 seconds of inactivity
      activityTimeout = setTimeout(() => {
        updateLastSeen();
      }, 30000); // 30 seconds
    };

    // Update lastSeen immediately when component mounts
    updateLastSeen();

    // Set up periodic updates (every 1 minute)
    intervalId = setInterval(updateLastSeen, 1 * 60 * 1000);

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload (when user closes tab/window)
    const handleBeforeUnload = () => {
      // Send a final update before leaving
      try {
        navigator.sendBeacon('/api/profile', JSON.stringify({
          lastSeen: new Date().toISOString()
        }));
      } catch (error) {
        // Fallback: try to send a regular fetch request
        fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lastSeen: new Date().toISOString() }),
        }).catch(() => {
          // Ignore errors on page unload
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session?.user?.id]);

  // This component doesn't render anything
  return null;
}
