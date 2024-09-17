// src/components/NotificationToast.jsx

import React from 'react';
import { useNotification } from '../context/NotificationContext';

function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed z-50 w-full sm:w-auto sm:max-w-sm">
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 sm:top-4 sm:right-4 sm:bottom-auto sm:left-auto sm:transform-none">
        <div className="flex flex-col items-center sm:items-end space-y-2 p-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${
                notification.type === 'error' ? 'bg-red-500' : 
                notification.type === 'success' ? 'bg-green-500' : 
                notification.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              } text-white rounded-lg shadow-lg overflow-hidden max-w-xs w-full sm:w-auto`}
            >
              <div className="p-4">
                <p className="text-sm">{notification.message}</p>
                {notification.actions && notification.actions.length > 0 && (
                  <div className="mt-2 flex justify-end">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.onClick();
                          removeNotification(notification.id);
                        }}
                        className="ml-2 px-2 py-1 bg-white text-gray-800 text-xs rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;