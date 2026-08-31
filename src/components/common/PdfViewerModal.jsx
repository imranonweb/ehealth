import { useState, useEffect, useRef } from 'react';
import {
  X, Download, Maximize2, Minimize2,
  FileText, Image as ImageIcon, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import './PdfViewerModal.css';

/**
 * Reusable In-App PDF & Medical Document Viewer Modal.
 *
 * Props:
 *   isOpen       - boolean: whether modal is displayed
 *   onClose      - function: close callback
 *   title        - string: title of the document (e.g. "Prescription", "Diagnostic Report")
 *   filePath     - string: Supabase Storage path (or documentPath)
 *   documentPath - string: alias for filePath
 *   fileUrl      - string: optional pre-signed direct URL
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);

  const loadDocumentUrl = async (path) => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const url = await storageService.getSignedUrl(path);
      setSignedUrl(url);
    } catch (err) {
      console.error('[PdfViewerModal] Failed to obtain signed URL:', err);
      setError('Unable to load document. You may not be authorized to view this record or the file may be missing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(false);
      if (fileUrl) {
        setSignedUrl(fileUrl);
        setError(null);
      } else if (targetPath) {
        loadDocumentUrl(targetPath);
      } else {
        setError('No document file path provided.');
      }
    } else {
      setSignedUrl(null);
      setError(null);
    }
  }, [isOpen, targetPath, fileUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPdf = !targetPath || targetPath.toLowerCase().endsWith('.pdf') || (signedUrl && signedUrl.includes('.pdf'));
  const fileName = targetPath ? targetPath.split('/').pop() : 'medical_document.pdf';

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
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="pdf-viewer-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`pdf-viewer-modal ${isFullscreen ? 'fullscreen' : ''}`} ref={modalRef}>
        {/* Header */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title-group">
            {isPdf ? (
              <FileText size={20} className="pdf-type-icon" />
            ) : (
              <ImageIcon size={20} className="pdf-type-icon img" />
            )}
            <div>
              <h2 className="pdf-viewer-title">{title}</h2>
              <span className="pdf-viewer-sub">{fileName}</span>
            </div>
          </div>

          <div className="pdf-viewer-actions">
            {signedUrl && (
              <button
                type="button"
                className="pdf-action-btn"
                onClick={handleDownload}
                title="Download file to device"
              >
                <Download size={15} />
                <span className="hide-mobile">Download</span>
              </button>
            )}

            <button
              type="button"
              className="pdf-action-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              type="button"
              className="pdf-action-btn close"
              onClick={onClose}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="pdf-viewer-body">
          {loading ? (
            <div className="pdf-viewer-loading">
              <Loader2 size={36} className="spin text-primary" />
              <p style={{ margin: 0 }}>Fetching encrypted document from secure storage…</p>
            </div>
          ) : error ? (
            <div className="pdf-viewer-error">
              <AlertCircle size={40} className="text-danger" />
              <h3>Document Unavailable</h3>
              <p>{error}</p>
              {targetPath && (
                <button
                  type="button"
                  className="pdf-action-btn"
                  onClick={() => loadDocumentUrl(targetPath)}
                  style={{ marginTop: 8 }}
                >
                  <RefreshCw size={14} /> Retry
                </button>
              )}
            </div>
          ) : signedUrl ? (
            isPdf ? (
              <div className="pdf-viewer-iframe-wrapper">
                <iframe
                  src={`${signedUrl}#toolbar=1&navpanes=0`}
                  title={title}
                  className="pdf-viewer-iframe"
                />
              </div>
            ) : (
              <div className="pdf-viewer-image-wrapper">
                <img
                  src={signedUrl}
                  alt={title}
                  className="pdf-viewer-img"
                />
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
    </div>
  );
}
