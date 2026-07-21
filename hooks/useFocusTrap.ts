import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = <T extends HTMLElement>(isOpen: boolean) => {
    const ref = useRef<T>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen || !ref.current) return;

        previouslyFocusedElement.current = document.activeElement as HTMLElement;

        const trapElement = ref.current;

        // Move focus to the first focusable element in the trap
        const focusableElements = trapElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const isTab = e.key === 'Tab';

            if (!isTab) return;
            if (!trapElement) return;

            // Re-query for focusable elements on each key press to handle dynamic content
            const elements = Array.from(trapElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)) as HTMLElement[];
            if (elements.length === 0) {
                if (isTab) e.preventDefault();
                return;
            }

            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            if (isTab) {
                if (e.shiftKey) { // Shift + Tab
                    if (currentIndex === 0 || currentIndex === -1) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (currentIndex === elements.length - 1) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        trapElement.addEventListener('keydown', handleKeyDown);

        return () => {
            trapElement.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement.current?.focus();
        };
    }, [isOpen]);

    return ref;
};