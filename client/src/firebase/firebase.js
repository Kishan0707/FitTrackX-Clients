import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBCc8qNzCrzG2Wctny7GriCY-dizFNhIoA",
  authDomain: "fittrackx-d14b0.firebaseapp.com",
  projectId: "fittrackx-d14b0",
  storageBucket: "fittrackx-d14b0.firebasestorage.app",
  messagingSenderId: "735622815654",
  appId: "1:735622815654:web:268518cf835eaaaaadb967",
  measurementId: "G-E28B53TDMX",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
