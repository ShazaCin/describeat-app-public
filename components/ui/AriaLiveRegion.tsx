import React, { useState, useEffect } from 'react';
import useStore from '../../hooks/useStore';

const AriaLiveRegion: React.FC = () => {
    const announcement = useStore(state => state.announcement);
    const setAnnouncement = useStore(state => state.setAnnouncement);
    
    const [politeMessage, setPoliteMessage] = useState('');
    const [assertiveMessage, setAssertiveMessage] = useState('');

    useEffect(() => {
        if (announcement) {
// Determine urgency based on announcement content
            const isUrgent = announcement.toLowerCase().includes('error') || 
                           announcement.toLowerCase().includes('warning') ||
                           announcement.toLowerCase().includes('alert') ||
                           announcement.toLowerCase().includes('fail') ||
                           announcement.toLowerCase().includes('failed') ||
                           announcement.toLowerCase().includes('denied') ||
                           announcement.toLowerCase().includes('cannot');
            const isPolite = announcement.toLowerCase().includes('success');
            
            if (isUrgent && !isPolite) {
                setAssertiveMessage(announcement);
                // Clear after announcement is made
                const timer = setTimeout(() => {
                    setAssertiveMessage('');
                    if (useStore.getState().announcement === announcement) {
                        setAnnouncement(null);
                    }
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                setPoliteMessage(announcement);
                // Clear after announcement is made
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
            {/* Polite announcements for general updates */}
            <div 
                role="status" 
                aria-live="polite" 
                aria-atomic="true"
                className="sr-only"
            >
                {politeMessage}
            </div>
            
            {/* Assertive announcements for urgent messages */}
            <div 
                role="alert" 
                aria-live="assertive" 
                aria-atomic="true"
                className="sr-only"
            >
                {assertiveMessage}
            </div>
        </>
    );
};

export default AriaLiveRegion;
