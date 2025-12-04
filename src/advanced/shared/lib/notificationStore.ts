import { create } from "zustand";
import { Notification } from "../model/types";

interface NotificationState {
  notifications: Notification[];
  // 액션도 스토어 안에 함께 정의
  addNotification: (message: string, type?: "error" | "success" | "warning") => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (message, type = "success") => {
    const id = crypto.randomUUID();
    
    // 1. 상태 업데이트 (추가)
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    // 2. 사이드 이펙트 (타이머).
    setTimeout(() => {
      get().removeNotification(id);
    }, 3000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));