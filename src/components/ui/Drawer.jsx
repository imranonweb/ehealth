import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Drawer — renders via a portal into document.body so it always
 * escapes any overflow:hidden / stacking-context ancestor.
 */
export function Drawer({ isOpen, onClose, title, children, width = 520, className = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll while drawer is open
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

  // Portal ensures the drawer sits at the very top of the DOM tree,
  // completely outside any overflow:hidden or transform ancestors.
  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        ref={overlayRef}
        onClick={onClose}
      />

      {/* Drawer panel */}
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
    </>,
    document.body
  );
}
