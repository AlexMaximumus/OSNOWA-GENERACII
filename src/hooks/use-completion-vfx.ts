'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCompletionVFX() {
  const [isVFXActive, setIsVFXActive] = useState(false);

  const triggerVFX = useCallback(() => {
    setIsVFXActive(true);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error("Could not play sound effect:", error);
    }

    setTimeout(() => {
      setIsVFXActive(false);
    }, 300);
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes vfx-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);


  return { triggerVFX, isVFXActive };
}
