"use client";

import React, { useState, useEffect } from "react";
import alertService, { AlertData, AlertButton } from "./alert-service";
import * as Dialog from "@radix-ui/react-dialog";

const AlertProvider: React.FC = () => {
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  useEffect(() => {
    // Subscribe to alert events
    const unsubscribe = alertService.subscribe((data: AlertData) => {
      setAlertData(data);
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClose = () => {
    setAlertData(null);
  };

  if (!alertData) {
    return null;
  }

  const { title, message, buttons } = alertData;

  // Provide default 'OK' button if no buttons are provided
  const alertButtons: AlertButton[] =
    buttons && buttons.length > 0 ? buttons : [{ text: "OK" }];

  return (
    <Dialog.Root open={true} onOpenChange={handleClose}>
      <Dialog.Portal>
        {/* Blurred background with transparency */}
        <Dialog.Overlay className="fixed inset-0 bg-slate-500 bg-opacity-60 backdrop-blur-sm" />
        {/* Centered modal content */}
        <Dialog.Content className="fixed inset-0 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full">
            {title && (
              <Dialog.Title className="text-lg font-bold mb-2 text-primary-text">
                {title}
              </Dialog.Title>
            )}
            {message && (
              <Dialog.Description className="text-primary-text mb-4">
                {message}
              </Dialog.Description>
            )}
            <div className="flex justify-end space-x-2">
              {alertButtons.map((button: AlertButton, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    handleClose();
                    if (button.onPress) {
                      button.onPress();
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-button-text bg-primary rounded hover:bg-primary-foreground focus:outline-none"
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AlertProvider;
