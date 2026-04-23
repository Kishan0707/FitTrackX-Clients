import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import AppContent from "./AppContent";
import OfflineBanner from "./OfflineBanner";
import InstallButton from "./InstallButton";
import { listenNotifications } from "./firebase/notification";
import { useEffect } from "react";
import {
  NotificationProvider,
  useNotification,
} from "./context/notificationContext";
import ToastMessage from "./components/ToastMessage";

function AppContentWithNotifications() {
  const { showNotification, hideNotification, toast } = useNotification();

  useEffect(() => {
    listenNotifications(showNotification);
  }, [showNotification]);

  return (
    <>
      <AppContent />
      <ToastMessage toast={toast} onClose={hideNotification} />
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <OfflineBanner />
        <InstallButton />
        <AppContentWithNotifications />
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
