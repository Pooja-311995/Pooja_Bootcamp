import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            pointerEvents: 'auto',
            transform: `translateY(${index * 10}px)`,
            transition: 'transform 0.3s ease'
          }}
        >
          <Notification notification={notification} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
