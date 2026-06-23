import { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({ className = '', label, error, ...props }, ref) => {
  const id = props.id || props.name;
  
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input
        id={id}
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
