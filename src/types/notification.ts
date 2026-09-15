export type NotificationType = 
  | "toast" 
  | "modal" 
  | "banner";

export type NotificationStatus = 
  | "SUCCESS" 
  | "ERROR" 
  | "WARNING" 
  | "INFO" 
  | "ACTION_REQUIRED";

export interface NotificationAction {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick: () => void;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  actions?: NotificationAction[];
  autoCloseDuration?: number; // ms, only for toast (default: 4000ms)
  createdAt: number;
}
