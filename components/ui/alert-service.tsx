// src/services/AlertService.ts

import { AlertData, AlertListener, AlertButton } from "@/lib/types";

class AlertService {
  private listeners: AlertListener[] = [];

  // Method to show an alert
  public alert(
    title: string,
    message: string,
    buttons?: AlertButton[] // Make buttons optional
  ) {
    const alertData: AlertData = { title, message, buttons };
    this.listeners.forEach((listener) => listener(alertData));
  }

  // Method to subscribe to alert events
  public subscribe(listener: AlertListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

const alertService = new AlertService();

export default alertService;
export type { AlertButton, AlertData };
