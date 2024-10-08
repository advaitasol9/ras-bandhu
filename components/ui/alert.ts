import alertService, { AlertButton } from "./alert-service";

const Alert = {
  alert: (
    title: string,
    message: string,
    buttons?: AlertButton[] // Make buttons optional
  ) => {
    alertService.alert(title, message, buttons);
  },
};

export default Alert;
