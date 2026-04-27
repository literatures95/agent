import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const showSuccess = (title: string, message?: string) => {
    return addNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    return addNotification({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    return addNotification({ type: 'info', title, message });
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    clearAll,
  };
}