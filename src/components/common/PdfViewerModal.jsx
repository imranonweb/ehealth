import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Download, Maximize2, Minimize2,
  FileText, Image as ImageIcon, AlertCircle, Loader2, RefreshCw,
  ZoomIn, ZoomOut, RotateCw, ExternalLink, ShieldCheck
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import './PdfViewerModal.css';

/**
 * Enhanced In-App Document & Medical Image Viewer Modal
 *
 * - Renders via ReactDOM.createPortal to ensure it overlays on top of all drawers & modals.
 * - Uses Blob URLs for PDFs so download extensions (e.g. IDM) are not hijacked upon preview.
 * - Supports rich in-browser image viewing (Zoom, Rotate, Reset, Pan).
 * - Triggers downloads only when the explicit Download button is clicked.
 */
export function PdfViewerModal({
  isOpen,
  onClose,
  title = 'Medical Document',
  filePath,
  documentPath,
  fileUrl,
}) {
  const targetPath = filePath || documentPath;
  const [signedUrl, setSignedUrl] = useState(fileUrl || null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [detectedType, setDetectedType] = useState(null); // 'pdf' | 'image' | 'other'
  const [fileSize, setFileSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Image viewer interactive controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const modalRef = useRef(null);
  const activeBlobUrlRef = useRef(null);

  // Derive file name
  const fileName = useMemo(() => {
    if (targetPath) {
      return targetPath.split('/').pop();
    }
    if (fileUrl) {
      try {
        const urlObj = new URL(fileUrl);
        return urlObj.pathname.split('/').pop() || 'medical_document';
      } catch {
        return 'medical_document';
      }
    }
    return 'medical_document';
  }, [targetPath, fileUrl]);

  // Clean up any generated blob URL
  const cleanupBlob = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setBlobUrl(null);
  };

  // Determine initial file type based on extension
  const detectFileTypeFromPath = (pathOrUrl) => {
    if (!pathOrUrl) return 'pdf';
    const clean = pathOrUrl.split('?')[0].toLowerCase();
    if (clean.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(clean)) return 'image';
    return 'other';
  };

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    cleanupBlob();
    setZoom(1);
    setRotation(0);

    try {
      let directUrl = fileUrl;

      // 1. Get signed URL from Supabase if not provided
      if (!directUrl && targetPath) {
        directUrl = await storageService.getSignedUrl(targetPath);
      }

      if (!directUrl) {
        throw new Error('No document path or URL provided.');
      }

      setSignedUrl(directUrl);

      // 2. Fetch as blob to prevent IDM extension auto-interception and detect exact MIME
      const initialType = detectFileTypeFromPath(targetPath || directUrl);
      
      try {
        const res = await fetch(directUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        
        const blob = await res.blob();
        setFileSize(blob.size);

        const mime = blob.type.toLowerCase();
        let finalType = initialType;
        if (mime.includes('pdf')) {
          finalType = 'pdf';
        } else if (mime.startsWith('image/')) {
          finalType = 'image';
        }

        setDetectedType(finalType);

        // Create local object URL for in-app preview
        const localBlobUrl = URL.createObjectURL(blob);
        activeBlobUrlRef.current = localBlobUrl;
        setBlobUrl(localBlobUrl);
      } catch (fetchErr) {
        console.warn('[PdfViewerModal] Direct blob fetch failed, falling back to signed URL:', fetchErr);
        // Fallback: Use signed URL directly
        setDetectedType(initialType);
        setBlobUrl(directUrl);
      }

    } catch (err) {
      console.error('[PdfViewerModal] Failed to load document:', err);
      setError('Unable to load document. You may not be authorized to view this record or the file may be missing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(false);
      loadDocument();
    } else {
      cleanupBlob();
      setSignedUrl(null);
      setError(null);
    }

    return () => {
      cleanupBlob();
    };
  }, [isOpen, targetPath, fileUrl]);

  // Handle ESC and keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (detectedType === 'image') {
        if (e.key === '+' || e.key === '=') {
          setZoom((z) => Math.min(z + 0.25, 3));
        } else if (e.key === '-' || e.key === '_') {
          setZoom((z) => Math.max(z - 0.25, 0.5));
        } else if (e.key === '0') {
          setZoom(1);
          setRotation(0);
        } else if (e.key.toLowerCase() === 'r') {
          setRotation((r) => (r + 90) % 360);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, detectedType, onClose]);

  if (!isOpen) return null;

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
    const urlToDownload = signedUrl || blobUrl;
    if (!urlToDownload) return;

    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    const urlToOpen = signedUrl || blobUrl;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  const isPdf = detectedType === 'pdf';
  const isImage = detectedType === 'image';

  return createPortal(
    <div
      className="pdf-viewer-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`pdf-viewer-modal ${isFullscreen ? 'fullscreen' : ''}`} ref={modalRef}>
        {/* Header */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title-group">
            {isPdf ? (
              <div className="pdf-icon-badge pdf">
                <FileText size={18} />
              </div>
            ) : isImage ? (
              <div className="pdf-icon-badge img">
                <ImageIcon size={18} />
              </div>
            ) : (
              <div className="pdf-icon-badge file">
                <FileText size={18} />
              </div>
            )}
            <div className="pdf-viewer-title-text">
              <h2 className="pdf-viewer-title">{title}</h2>
              <div className="pdf-viewer-meta">
                <span className="pdf-viewer-sub">{fileName}</span>
                <span className="pdf-verified-pill">
                  <ShieldCheck size={11} /> Verified Record
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="pdf-viewer-actions">
            {/* Image viewer controls */}
            {isImage && !loading && !error && blobUrl && (
              <div className="pdf-image-controls">
                <button
                  type="button"
                  className="pdf-tool-btn"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="pdf-zoom-level">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className="pdf-tool-btn"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  className="pdf-tool-btn"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate 90° (R)"
                >
                  <RotateCw size={15} />
                </button>
                {(zoom !== 1 || rotation !== 0) && (
                  <button
                    type="button"
                    className="pdf-tool-btn reset"
                    onClick={() => { setZoom(1); setRotation(0); }}
                    title="Reset view (0)"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* External Tab link */}
            {(signedUrl || blobUrl) && !loading && !error && (
              <button
                type="button"
                className="pdf-action-btn"
                onClick={handleOpenInNewTab}
                title="Open in new window"
              >
                <ExternalLink size={15} />
                <span className="hide-mobile">New Tab</span>
              </button>
            )}

            {/* Explicit Download button */}
            {(signedUrl || blobUrl) && !loading && !error && (
              <button
                type="button"
                className="pdf-action-btn btn-primary-view"
                onClick={handleDownload}
                title="Download original file to device"
              >
                <Download size={15} />
                <span className="hide-mobile">Download</span>
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              type="button"
              className="pdf-action-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close button */}
            <button
              type="button"
              className="pdf-action-btn close"
              onClick={onClose}
              title="Close viewer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="pdf-viewer-body">
          {loading ? (
            <div className="pdf-viewer-loading">
              <Loader2 size={40} className="spin text-primary" />
              <p style={{ margin: 0, fontWeight: 600, color: '#F8FAFC' }}>
                Fetching verified medical document…
              </p>
              <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                Preparing encrypted in-browser preview
              </span>
            </div>
          ) : error ? (
            <div className="pdf-viewer-error">
              <AlertCircle size={44} className="text-danger" />
              <h3>Document Preview Unavailable</h3>
              <p>{error}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={loadDocument}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                {signedUrl && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownload}
                  >
                    <Download size={14} /> Download File
                  </button>
                )}
              </div>
            </div>
          ) : blobUrl ? (
            isPdf ? (
              <div className="pdf-viewer-iframe-wrapper">
                <iframe
                  src={`${blobUrl}#toolbar=1&navpanes=0`}
                  title={title}
                  className="pdf-viewer-iframe"
                />
              </div>
            ) : isImage ? (
              <div className="pdf-viewer-image-wrapper">
                <div
                  className="pdf-image-canvas"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <img
                    src={blobUrl}
                    alt={title}
                    className="pdf-viewer-img"
                    onError={() => setError('Image failed to render. You can download the file directly.')}
                  />
                </div>
              </div>
            ) : (
              <div className="pdf-viewer-fallback">
                <FileText size={56} className="text-primary" />
                <h3 style={{ color: '#F8FAFC', margin: '14px 0 6px' }}>{fileName}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 20px' }}>
                  This file type cannot be previewed directly inside the browser. You can download it to view on your device.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={handleDownload}
                >
                  <Download size={16} /> Download File
                </button>
              </div>
            )
          ) : (
            <div className="pdf-viewer-empty">
              <FileText size={48} className="text-muted" />
              <p>No document attachment found for this medical record.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
