import React, { useState, useEffect } from 'react';
import useStore from '../../hooks/useStore';

/**
 * NotificationAnnouncer Component
 * 
 * Provides ARIA live regions for screen reader announcements of notifications.
 * Uses both polite and assertive regions for different types of announcements.
 * 
 * Accessibility Features:
 * - aria-live="polite" for non-urgent notifications
 * - aria-live="assertive" for urgent notifications
 * - aria-atomic="true" to announce entire region
 * - role="status" for status messages
 * - role="alert" for urgent alerts
 */
const NotificationAnnouncer: React.FC = () => {
  const announcement = useStore(state => state.announcement);
  const setAnnouncement = useStore(state => state.setAnnouncement);

  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    if (announcement) {
      const isUrgent = announcement.toLowerCase().includes('error') ||
                       announcement.toLowerCase().includes('warning') ||
                       announcement.toLowerCase().includes('alert');

      if (isUrgent) {
        setAssertiveMessage(announcement);
        const timer = setTimeout(() => {
          setAssertiveMessage('');
          if (useStore.getState().announcement === announcement) {
            setAnnouncement(null);
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setPoliteMessage(announcement);
        const timer = setTimeout(() => {
          setPoliteMessage('');
          if (useStore.getState().announcement === announcement) {
            setAnnouncement(null);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [announcement, setAnnouncement]);

  return (
    <>
      {/* Polite announcements - for regular notifications */}
      <div
        id="notification-announcer"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
        aria-label="Notification announcements"
      >
        {politeMessage}
      </div>

      {/* Assertive announcements - for urgent alerts */}
      <div
        id="notification-alert"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        className="sr-only"
        aria-label="Urgent notification alerts"
      >
        {assertiveMessage}
      </div>

      {/* Permission status announcements */}
      <div
        id="permission-announcer"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
        aria-label="Permission status"
      >
        {politeMessage}
      </div>

      {/* Error announcements */}
      <div
        id="error-announcer"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        className="sr-only"
        aria-label="Error messages"
      >
        {assertiveMessage}
      </div>
    </>
  );
};

export default NotificationAnnouncer;
