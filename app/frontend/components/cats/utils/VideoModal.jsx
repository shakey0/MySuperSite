import { useState, useEffect, useRef } from 'react';
import './VideoModal.scoped.scss';

export default function VideoModal({ isOpen, quitFullScreen, children }) {
  const [showControls, setShowControls] = useState(true);
  const lastInteractionRef = useRef(Date.now());

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();

      if (!showControls) {
        setShowControls(true); // Show controls when there's interaction
      }
    };

    const hideControlsAfterInactivity = () => {
      if (Date.now() - lastInteractionRef.current >= 1000) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('touchend', hideControlsAfterInactivity);

    const interval = setInterval(hideControlsAfterInactivity, 100);

    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('touchend', hideControlsAfterInactivity);
      clearInterval(interval);
    };
  }, [isOpen, showControls]);

  if (!isOpen) return null;

  return (
    <div className="video-overlay">
      <div className={`video-close-box ${showControls ? '' : 'hidden'}`}>
        <button className="video-close" onClick={quitFullScreen}>×</button>
      </div>
      <div className="video-content">
        {children}
      </div>
    </div>
  )
}