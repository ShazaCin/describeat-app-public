import React from 'react';
import Modal from '../ui/Modal';
import Icon from '../ui/Icon';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Information"
      ariaLabelledBy="help-modal-title"
    >
      <div className="space-y-6 text-brand-text">
        <section className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-brand-primary">
            <Icon name="microphone" className="w-5 h-5" />
            What is describeAT?
          </h3>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            describeAT provides high-quality audio descriptions for blind and partially sighted viewers.
            Our app allows you to listen to syncronized AD tracks for your favorite movies, TV shows, and books.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-brand-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            How to use the Sync feature?
          </h3>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            1. Start your movie or TV show on your television or computer.<br />
            2. Tap the large <strong>hexagonal microphone button</strong> on the home screen.<br />
            3. Hold your phone near the speakers for 10 seconds.<br />
            4. Once matched, the audio description will start playing in perfect sync!
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-brand-primary">
            <Icon name="podcasts" className="w-5 h-5" />
            Need more help?
          </h3>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            If you're having trouble syncing or find any issues with a track, please use the <strong>Report</strong> feature found on the title details page, or email us at support@shazacin.com.
          </p>
        </section>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-8 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
