import { useState, useEffect, useRef, forwardRef } from 'react';
import './VideoModal.scoped.scss';
import useStore from '../store';

const VideoModal = forwardRef(({ children }, ref) => {
  const isOpen = useStore(s => s.isVideoOpen);
  const closeVideoModal = useStore(s => s.closeVideoModal);
  const openFullscreen = useStore(s => s.openFullscreen);

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

    const interval = setInterval(hideControlsAfterInactivity, 100);

    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      clearInterval(interval);
    };
  }, [isOpen, showControls]);

  useEffect(() => {
    if (isOpen) {
      openFullscreen(ref);
    }
  }, [isOpen, openFullscreen]);

  if (!isOpen) return null;

  return (
    <div className="video-overlay" ref={ref}>
      <div className={`video-close-box ${showControls ? '' : 'hidden'}`}>
        <button className="video-close" onClick={closeVideoModal}>×</button>
      </div>
      <div className="video-content">
        {children}
      </div>
    </div>
  )
});

VideoModal.displayName = 'VideoModal';

export default VideoModal;
