// Browser Notification Service
// Respects user intent, requests permission only on explicit user action

export class NotificationService {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  static show(title: string, options?: NotificationOptions): void {
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });
    } catch (e) {
      console.warn('Failed to display notification', e);
    }
  }
}
