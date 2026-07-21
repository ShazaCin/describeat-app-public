import React, { useRef, useState } from 'react';
import useStore from '../../hooks/useStore';
import Modal from '../ui/Modal';

const FEEDBACK_OPTIONS = [
    { id: 'recording', label: 'Recording problem', description: 'Device not recording' },
    { id: 'match', label: 'Match problem', description: 'Incorrect match found, suggestions wrong' },
    { id: 'sound', label: 'Sound issues', description: 'Out of sync, not playing, or missing' },
    { id: 'connection', label: 'Connection issues', description: 'Audio not buffering, not playing, or jittery' },
    { id: 'labelling', label: 'Labelling problem', description: 'Incorrect episode, film, chapter, etc.' },
];

const FeedbackModal: React.FC = () => {
    const { isFeedbackOpen, closeFeedback, setAnnouncement } = useStore();
    const [submitted, setSubmitted] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = formRef.current;
        if (!form) return;

        const formData = new FormData(form);
        const selected = FEEDBACK_OPTIONS
            .filter(o => formData.get(o.id) === 'on')
            .map(o => o.label);
        const details = formData.get('details') as string || '';

        const feedback = {
            type: 'app_feedback',
            categories: selected,
            details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        console.log('[Feedback] Submitted:', feedback);

        // Store in localStorage for now (offline queue pattern)
        try {
            const existing = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
            existing.push(feedback);
            localStorage.setItem('pendingFeedback', JSON.stringify(existing));
        } catch (err) {
            console.warn('[Feedback] Could not save to localStorage:', err);
        }

        setSubmitted(true);
        setAnnouncement('Thank you for your feedback.');
        setTimeout(() => {
            setSubmitted(false);
            closeFeedback();
        }, 1500);
    };

    return (
        <Modal
            isOpen={isFeedbackOpen}
            onClose={closeFeedback}
            title="Something Wrong?"
            ariaLabelledBy="feedback-modal-title"
        >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <p className="text-brand-text-secondary">Please select those that apply.</p>
                <fieldset className="space-y-3">
                    <legend className="sr-only">Feedback Options</legend>
                    {FEEDBACK_OPTIONS.map(option => (
                        <div key={option.id} className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id={option.id}
                                    name={option.id}
                                    type="checkbox"
                                    className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={option.id} className="font-medium text-brand-text">{option.label}</label>
                                <p className="text-brand-text-secondary">{option.description}</p>
                            </div>
                        </div>
                    ))}
                </fieldset>
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-brand-text">Please provide more details (optional)</label>
                    <textarea
                        id="details"
                        name="details"
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-brand-surface-light focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
                <div className="text-right">
                    <button
                        type="submit"
                        disabled={submitted}
                        className="bg-brand-primary px-5 py-2 rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
                    >
                        {submitted ? 'Submitted!' : 'Submit'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default FeedbackModal;
