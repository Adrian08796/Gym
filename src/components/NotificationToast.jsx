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
          className={`mb-2 p-4 rounded shadow-md w-64 sm:w-80 md:w-96 ${
            notification.type === 'error' ? 'bg-red-500' : 
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          <p>{notification.message}</p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-2 flex justify-end">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    removeNotification(notification.id);
                  }}
                  className="ml-2 px-2 py-1 bg-white text-gray-800 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;