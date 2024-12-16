import './PhotoModal.scoped.scss';

export default function PhotoModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="photo-overlay">
      <div className="photo-content">
        <div className="photo-close-box">
          <button className="photo-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
