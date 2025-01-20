import { useState, useEffect, useRef } from 'react';
import './PhotoModal.scoped.scss';

export default function PhotoModal({ isOpen, onClose, selectPhoto, selectedPhoto, photos, children }) {
  const [showControls, setShowControls] = useState(true);
  const [hideArrows, setHideArrows] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const hasTouch = useRef(
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0
  );

  useEffect(() => {
    if (isOpen) {
      setShowControls(true);
      setHideArrows(false);

      if (hasTouch.current) {
        // Show arrows initially for 2.5 seconds on touch devices
        const timeoutId = setTimeout(() => {
          setHideArrows(true);
        }, 2500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();

      if (!showControls) {
        setShowControls(true); // Show controls when there's interaction
      }
    };

    const hideControlsAfterInactivity = () => {
      if (Date.now() - lastInteractionRef.current >= 1500) {
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

      if (Math.abs(deltaX) > 50) { // Only trigger swipe if swipe distance is > 50px
        deltaX > 0 ? nextPhoto() : prevPhoto(); // Swipe left or right
      }

      // Reset swipe coordinates
      touchStartXRef.current = null;
      touchEndXRef.current = null;
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

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
    const currentPhoto = photos.find((photo) => photo.order === selectedPhoto.order);
    let nextPhoto = photos.find((photo) => photo.order === currentPhoto.order + 1) || photos.find((photo) => photo.order === 1);
    selectPhoto(nextPhoto);
  };

  const prevPhoto = () => {
    if (!photos || !selectedPhoto) return;
    const currentPhoto = photos.find((photo) => photo.order === selectedPhoto.order);
    let prevPhoto = photos.find((photo) => photo.order === currentPhoto.order - 1) || photos.find((photo) => photo.order === photos.length);
    selectPhoto(prevPhoto);
  };

  return (
    <div className="photo-overlay">
      {photos.length > 1 && !selectedPhoto.profile && <>
        <button className={`arrow left ${showControls && !hideArrows ? '' : 'hidden'}`} onClick={prevPhoto}>&lt;</button>
        <button className={`arrow right ${showControls && !hideArrows ? '' : 'hidden'}`} onClick={nextPhoto}>&gt;</button>
      </>}
      <div className={`photo-close-box ${showControls ? '' : 'hidden'}`}>
        <button className="photo-close" onClick={onClose}>×</button>
      </div>
      <div className="photo-content">
        {children}
      </div>
    </div>
  );
}
