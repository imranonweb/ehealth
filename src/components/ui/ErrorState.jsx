import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong.', onRetry, className = '' }) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state-icon">
        <AlertCircle size={40} />
      </div>
      <h3 className="error-state-title">Error</h3>
      <p className="error-state-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-md" onClick={onRetry} style={{ marginTop: 16 }}>
          <RefreshCw size={15} /> Try Again
        </button>
      )}
    </div>
  );
}
