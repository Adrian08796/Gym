// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`mb-2 p-3 rounded shadow-md ${
              type === 'error' ? 'bg-red-500' : 'bg-green-500'
            } text-white`}
          >
            {message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}