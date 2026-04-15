import React, { useState, useEffect } from 'react';

interface StatusTimerProps {
  status: 'Order Placed' | 'Preparing' | 'Ready For Pick-Up' | 'Order Picked';
  statusStartTime?: string;
}

// Duration in seconds for each status
const STATUS_DURATIONS: Record<string, number> = {
  'Order Placed': 5,          // 5 seconds
  'Preparing': 5,             // 5 seconds
  'Ready For Pick-Up': 15,    // 15 seconds
  'Order Picked': 5           // 5 seconds (final status)
};

const StatusTimer: React.FC<StatusTimerProps> = ({ status, statusStartTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const duration = STATUS_DURATIONS[status] || 0;

  useEffect(() => {
    if (!statusStartTime) {
      setTimeRemaining(0);
      return;
    }

    const startTime = new Date(statusStartTime).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);

    setTimeRemaining(remaining);

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const currentElapsed = Math.floor((currentTime - startTime) / 1000);
      const currentRemaining = Math.max(0, duration - currentElapsed);
      
      setTimeRemaining(currentRemaining);
      
      if (currentRemaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [statusStartTime, status, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Placed': return '#FFA500';
      case 'Preparing': return '#FF6B35';
      case 'Ready For Pick-Up': return '#4CAF50';
      case 'Order Picked': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Order Placed': return '📝';
      case 'Preparing': return '☕';
      case 'Ready For Pick-Up': return '✅';
      case 'Order Picked': return '🎉';
      default: return '⏱️';
    }
  };

  const warningThreshold = duration > 10 ? Math.floor(duration / 2) : 5; // Show warning at half time or last 5 seconds

  return (
    <div style={{
      backgroundColor: getStatusColor(status),
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: timeRemaining > warningThreshold ? 'white' : '#ff4444',
        animation: timeRemaining <= warningThreshold ? 'pulse 1s infinite' : 'none'
      }} />
      <span>{getStatusIcon(status)}</span>
      <span>{status}</span>
      <span style={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        padding: '0.35rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontFamily: 'monospace',
        minWidth: '50px',
        textAlign: 'center'
      }}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default StatusTimer;
