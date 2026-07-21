import { useEffect, useRef } from 'react';

export const useAudioUnlock = () => {
  const unlocked = useRef(false);

  useEffect(() => {
    const unlock = async () => {
      if (unlocked.current) return;

      // Create an empty buffer and play it
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // iOS Safari fix: explicitly resume the AudioContext after the gesture.
      // iOS creates the context in 'suspended' state even inside a user gesture;
      // without an explicit resume() the unlock silently fails and later play()
      // calls land outside the user-activation window.
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          // Best-effort unlock — fall through, the HTMLAudioElement retry below
          // will catch the failure on the next gesture.
        }
      }

      // Also try to play a silent HTML5 element to unlock that path
      const audio = new Audio();
      audio.play().catch(() => { });

      unlocked.current = true;

      // Cleanup listeners
      ['touchstart', 'touchend', 'click', 'keydown'].forEach(event => {
        document.removeEventListener(event, unlock);
      });
    };

    ['touchstart', 'touchend', 'click', 'keydown'].forEach(event => {
      document.addEventListener(event, unlock);
    });

    return () => {
      ['touchstart', 'touchend', 'click', 'keydown'].forEach(event => {
        document.removeEventListener(event, unlock);
      });
    };
  }, []);
};