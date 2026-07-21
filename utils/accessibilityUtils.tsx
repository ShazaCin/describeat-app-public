import React from 'react';

/**
 * SkipLinks Component
 * Provides keyboard users with quick navigation to main content areas
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only">
      <a href="#main-content" className="focus-visible:not-sr-only focus-visible:fixed focus-visible:top-0 focus-visible:left-0 focus-visible:z-[9999] focus-visible:bg-brand-primary focus-visible:text-white focus-visible:p-4 focus-visible:rounded-md">
        Skip to main content
      </a>
      <a href="#player-controls" className="focus-visible:not-sr-only focus-visible:fixed focus-visible:top-12 focus-visible:left-0 focus-visible:z-[9999] focus-visible:bg-brand-primary focus-visible:text-white focus-visible:p-4 focus-visible:rounded-md">
        Skip to player controls
      </a>
      <a href="#navigation" className="focus-visible:not-sr-only focus-visible:fixed focus-visible:top-24 focus-visible:left-0 focus-visible:z-[9999] focus-visible:bg-brand-primary focus-visible:text-white focus-visible:p-4 focus-visible:rounded-md">
        Skip to navigation
      </a>
    </div>
  );
};

/**
 * Utility to announce messages to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Utility to manage focus restoration
 */
export const createFocusManager = () => {
  let previouslyFocusedElement: HTMLElement | null = null;

  return {
    saveFocus: () => {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    },
    restoreFocus: () => {
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    },
  };
};

/**
 * Utility to check if an element is visible to screen readers
 */
export const isAccessible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hasAttribute('aria-hidden')
  );
};

/**
 * Utility to get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (el) => isAccessible(el as HTMLElement)
  ) as HTMLElement[];
};

/**
 * Utility to announce dynamic content changes
 */
export const announceContentChange = (message: string, region?: HTMLElement) => {
  if (region) {
    region.textContent = message;
  } else {
    announceToScreenReader(message, 'polite');
  }
};

export default {
  SkipLinks,
  announceToScreenReader,
  createFocusManager,
  isAccessible,
  getFocusableElements,
  announceContentChange,
};
