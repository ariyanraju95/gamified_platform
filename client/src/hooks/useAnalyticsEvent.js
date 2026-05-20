import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logClientEvent } from '../services/analytics.service';

/**
 * Hook for firing client-side analytics events.
 * Only fires when the user is logged in.
 * Failures are swallowed — analytics must never break the user flow.
 *
 * Usage:
 *   const { trackEvent } = useAnalyticsEvent();
 *   trackEvent('lesson_start', { lessonId: '...', lessonTitle: '...' });
 *
 * Allowed event types: 'page_visit' | 'lesson_start' | 'quiz_attempt'
 */
const useAnalyticsEvent = () => {
  const { user } = useAuth();

  const trackEvent = useCallback(
    async (eventType, metadata = {}) => {
      if (!user) return;
      try {
        await logClientEvent(eventType, metadata);
      } catch {
        // Non-blocking — analytics failure must not disrupt the user experience
      }
    },
    [user]
  );

  return { trackEvent };
};

export default useAnalyticsEvent;
