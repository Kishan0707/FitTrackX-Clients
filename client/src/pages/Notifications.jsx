import React from "react";
import CoachNotifications from "./coach/Notifications";

// Shared notifications screen for all authenticated roles.
// Reuses the existing implementation that talks to `/notifications`.
const Notifications = () => {
  return <CoachNotifications />;
};

export default Notifications;

