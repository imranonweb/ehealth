import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../lib/validators';

export function FileUpload({
  onFileSelect,
  onRemove,
  file = null,
  uploading = false,
  progress = 0,
  error = null,
  success = false,
  accept = '.pdf,.jpg,.jpeg,.png',
  className = '',
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleFile = (f) => {
    if (!ALLOWED_FILE_TYPES.includes(f.type)) {
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      return;
    }
    onFileSelect?.(f);
  };

  const isImage = file && file.type?.startsWith('image/');
  const FileIcon = isImage ? ImageIcon : FileText;

  return (
    <div className={`file-upload ${className}`}>
      {!file ? (
        <div
          className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload file"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <Upload size={28} className="file-upload-icon" />
          <p className="file-upload-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="file-upload-hint">PDF, JPG, or PNG (max 10 MB)</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className={`file-upload-preview ${success ? 'success' : ''} ${error ? 'error' : ''}`}>
          <div className="file-upload-info">
            <div className="file-upload-file-icon">
              {success ? <CheckCircle size={20} /> : <FileIcon size={20} />}
            </div>
            <div className="file-upload-meta">
              <span className="file-upload-name">{file.name}</span>
              <span className="file-upload-size">{formatFileSize(file.size)}</span>
            </div>
            {!uploading && (
              <button
                className="file-upload-remove"
                onClick={() => { onRemove?.(); if (inputRef.current) inputRef.current.value = ''; }}
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {uploading && (
            <div className="file-upload-progress">
              <div className="file-upload-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && <p className="file-upload-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
