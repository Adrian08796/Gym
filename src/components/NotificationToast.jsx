// src/components/NotificationToast.jsx

import React from 'react';
import { useNotification } from '../context/NotificationContext';

function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-2 p-4 rounded shadow-md ${
            notification.type === 'error' ? 'bg-red-500' : 
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
          } text-white`}
        >
          {notification.message}
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-white font-bold"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;