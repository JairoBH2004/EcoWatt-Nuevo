// useNotificationStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationItem {
  id: string; 
  title: string;
  body: string;
  date: string; // ISO string para persistencia
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  
  addNotification: (notification: { title: string; body: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            unreadCount: 0,
            
            addNotification: (notification) =>
                set((state) => {
                    const newNotification: NotificationItem = {
                        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                        title: notification.title,
                        body: notification.body,
                        date: new Date().toISOString(),
                        read: false,
                    };
                    
                    return {
                        notifications: [newNotification, ...state.notifications],
                        unreadCount: state.unreadCount + 1,
                    };
                }),
                
            markAsRead: (id) =>
                set((state) => {
                    const index = state.notifications.findIndex(n => n.id === id);
                    if (index === -1 || state.notifications[index].read) return state;

                    const newNotifications = [...state.notifications];
                    newNotifications[index] = { ...newNotifications[index], read: true };
                    
                    return {
                        notifications: newNotifications,
                        unreadCount: state.unreadCount - 1,
                    };
                }),
                
            markAllAsRead: () =>
                set((state) => {
                    const newNotifications = state.notifications.map(n => ({ ...n, read: true }));
                    return {
                        notifications: newNotifications,
                        unreadCount: 0,
                    };
                }),
            
            clearAll: () => set({ notifications: [], unreadCount: 0 }),
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);