import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Drawer({ isOpen, onClose, title, children, width = 520, className = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => e.key === 'Escape' && onClose?.();
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const resolvedWidth = typeof width === 'number' ? `${width}px` : (width || '560px');

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} ref={overlayRef} onClick={onClose} />
      <aside
        className={`drawer ${isOpen ? 'open' : ''} ${className}`}
        style={{
          '--drawer-target-width': resolvedWidth,
          maxWidth: '100vw',
          width: `min(100vw, ${resolvedWidth})`,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}
