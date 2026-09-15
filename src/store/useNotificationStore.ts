import { create } from "zustand";
import { AppNotification, NotificationStatus, NotificationAction } from "@/types/notification";

interface NotificationState {
  toasts: AppNotification[];
  activeModal: AppNotification | null;
  activeBanner: AppNotification | null;

  showToast: (
    title: string,
    message: string,
    status?: NotificationStatus,
    actions?: NotificationAction[],
    duration?: number
  ) => string;
  removeToast: (id: string) => void;

  showModal: (
    title: string,
    message: string,
    status?: NotificationStatus,
    actions?: NotificationAction[]
  ) => void;
  closeModal: () => void;

  showBanner: (
    title: string,
    message: string,
    status?: NotificationStatus,
    actions?: NotificationAction[]
  ) => void;
  closeBanner: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  activeModal: null,
  activeBanner: null,

  showToast: (title, message, status = "INFO", actions, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: AppNotification = {
      id,
      type: "toast",
      status,
      title,
      message,
      actions,
      autoCloseDuration: duration,
      createdAt: Date.now(),
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  showModal: (title, message, status = "INFO", actions) => {
    const modalNotification: AppNotification = {
      id: `modal-${Date.now()}`,
      type: "modal",
      status,
      title,
      message,
      actions,
      createdAt: Date.now(),
    };
    set({ activeModal: modalNotification });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  showBanner: (title, message, status = "ACTION_REQUIRED", actions) => {
    const bannerNotification: AppNotification = {
      id: `banner-${Date.now()}`,
      type: "banner",
      status,
      title,
      message,
      actions,
      createdAt: Date.now(),
    };
    set({ activeBanner: bannerNotification });
  },

  closeBanner: () => {
    set({ activeBanner: null });
  },
}));
