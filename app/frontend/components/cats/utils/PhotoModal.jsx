import { useState, useEffect, useRef } from 'react';
import './PhotoModal.scoped.scss';

export default function PhotoModal({ isOpen, onClose, selectPhoto, selectedPhoto, photos, children }) {
  const [showControls, setShowControls] = useState(true);
  const lastInteractionRef = useRef(Date.now());
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = () => {
      const now = Date.now();
      lastInteractionRef.current = now;

      if (!showControls) {
        setShowControls(true); // Update state only if controls are hidden
      }
    };

    const hideControlsAfterInactivity = () => {
      const now = Date.now();
      if (now - lastInteractionRef.current >= 2000) {
        setShowControls(false);
      }
    };

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (touchStartXRef.current === null || touchEndXRef.current === null) return;

      const deltaX = touchStartXRef.current - touchEndXRef.current;

      if (Math.abs(deltaX) > 50) { // Only trigger swipe if the user swipes more than 50px
        if (deltaX > 0) {
          nextPhoto(); // Swipe left
        } else {
          prevPhoto(); // Swipe right
        }
      }

      // Reset values
      touchStartXRef.current = null;
      touchEndXRef.current = null;
    };

    // Attach listeners for user interaction
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Start a loop to periodically check inactivity
    const interval = setInterval(hideControlsAfterInactivity, 100);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearInterval(interval);
    };
  }, [isOpen, showControls, selectedPhoto, photos]);

  if (!isOpen) return null;

  const nextPhoto = () => {
    if (!photos || !selectedPhoto) return;
    const currentPhoto = photos.find(photo => photo.order === selectedPhoto.order);
    const orderNum = currentPhoto.order;
    let nextPhoto = photos.find(photo => photo.order === orderNum + 1);
    if (!nextPhoto) {
      nextPhoto = photos.find(photo => photo.order === 1);
    }
    selectPhoto(nextPhoto);
  }

  const prevPhoto = () => {
    if (!photos || !selectedPhoto) return;
    const currentPhoto = photos.find(photo => photo.order === selectedPhoto.order);
    const orderNum = currentPhoto.order
    let prevPhoto = photos.find(photo => photo.order === orderNum - 1);
    if (!prevPhoto) {
      prevPhoto = photos.find(photo => photo.order === photos.length);
    }
    selectPhoto(prevPhoto);
  }

  return (
    <div className="photo-overlay">
      <div className="photo-content">
        <div className={`photo-close-box ${showControls ? '' : 'hidden'}`}>
          <button className="photo-close" onClick={onClose}>×</button>
        </div>
        {photos.length > 1 && <>
          <button className={`arrow left ${showControls ? '' : 'hidden'}`} onClick={prevPhoto}>&lt;</button>
          <button className={`arrow right ${showControls ? '' : 'hidden'}`} onClick={nextPhoto}>&gt;</button>
        </>}
        {children}
      </div>
    </div>
  );
}
