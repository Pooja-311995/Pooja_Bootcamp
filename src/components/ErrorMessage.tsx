import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="menu-error">
      <h3>Oops! Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="button button-coffee" style={{ marginTop: '1rem' }}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
