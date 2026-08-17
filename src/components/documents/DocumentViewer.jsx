import { useState, useEffect, useRef } from 'react';
import {
  X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2,
  FileText, Image as ImageIcon, AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import './DocumentViewer.css';

export function DocumentViewer({ isOpen, onClose, documentPath, title = 'Medical Document' }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && documentPath) {
      loadSignedUrl(documentPath);
      setScale(1);
      setRotation(0);
      setIsFullscreen(false);
    } else {
      setSignedUrl(null);
      setError(null);
    }
  }, [isOpen, documentPath]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function loadSignedUrl(path) {
    setLoading(true);
    setError(null);
    try {
      const url = await storageService.getSignedUrl(path);
      setSignedUrl(url);
    } catch (err) {
      console.error('Failed to generate signed document URL:', err);
      setError('Unable to load private document. Please ensure you are authorized.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const isPdf = documentPath?.toLowerCase().endsWith('.pdf');
  const isImage = !isPdf;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => { setScale(1); setRotation(0); };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (!signedUrl) return;
    const a = document.createElement('a');
    a.href = signedUrl;
    a.download = documentPath.split('/').pop() || 'medical_document';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="doc-viewer-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`doc-viewer-modal ${isFullscreen ? 'fullscreen' : ''}`} ref={modalRef}>
        {/* Header */}
        <div className="doc-viewer-header">
          <div className="doc-viewer-title-group">
            {isPdf ? <FileText size={20} className="doc-type-icon pdf" /> : <ImageIcon size={20} className="doc-type-icon img" />}
            <div>
              <h2 className="doc-viewer-title">{title}</h2>
              <span className="doc-viewer-sub">{documentPath.split('/').pop()}</span>
            </div>
          </div>

          <div className="doc-viewer-actions">
            {/* Image zoom/rotate controls */}
            {isImage && signedUrl && (
              <div className="doc-viewer-controls">
                <button type="button" className="doc-action-btn" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <button type="button" className="doc-action-btn" onClick={handleResetZoom} title="Reset">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{Math.round(scale * 100)}%</span>
                </button>
                <button type="button" className="doc-action-btn" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button type="button" className="doc-action-btn" onClick={handleRotate} title="Rotate 90°">
                  <RotateCw size={16} />
                </button>
              </div>
            )}

            {signedUrl && (
              <button type="button" className="doc-action-btn" onClick={handleDownload} title="Download private document">
                <Download size={16} /> <span className="hide-mobile">Download</span>
              </button>
            )}

            <button type="button" className="doc-action-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button type="button" className="doc-action-btn close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="doc-viewer-body">
          {loading ? (
            <div className="doc-viewer-loading">
              <Loader2 size={36} className="spin text-primary" />
              <p>Fetching encrypted document from secure storage…</p>
            </div>
          ) : error ? (
            <div className="doc-viewer-error">
              <AlertCircle size={40} className="text-danger" />
              <h3>Document Unavailable</h3>
              <p>{error}</p>
            </div>
          ) : signedUrl ? (
            isPdf ? (
              <div className="doc-viewer-pdf-wrapper">
                <iframe
                  src={`${signedUrl}#toolbar=1&navpanes=0`}
                  title={title}
                  className="doc-viewer-iframe"
                />
              </div>
            ) : (
              <div className="doc-viewer-image-wrapper">
                <img
                  src={signedUrl}
                  alt={title}
                  className="doc-viewer-img"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            )
          ) : (
            <div className="doc-viewer-empty">
              <FileText size={48} className="text-muted" />
              <p>No document attachment found for this medical record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
