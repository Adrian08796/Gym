// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', actions = [], duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, actions }]);
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}