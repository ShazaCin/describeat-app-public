import React, { useEffect } from 'react';
import Icon from './Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  ariaLabelledBy: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, ariaLabelledBy }) => {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        className="bg-brand-surface rounded-lg shadow-xl w-[90vw] max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        <header className="flex items-center justify-between p-4 border-b border-brand-surface-light">
          <h2 id={ariaLabelledBy} className="text-xl font-bold text-brand-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-text-secondary hover:text-brand-text transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none p-1"
            aria-label="Close dialog"
          >
            <Icon name="close" className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;