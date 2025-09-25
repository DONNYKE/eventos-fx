// Requerido por FCM en algunos navegadores
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCGWsz_BuM8N0u__PwKd5yUFKuZg8QFD5c",
  authDomain: "eventos-familia-x.firebaseapp.com",
  projectId: "eventos-familia-x",
  storageBucket: "eventos-familia-x.firebasestorage.app",
  messagingSenderId: "855504990473",
  appId: "1:855504990473:web:e0d90a1a8e7fea27c763d8",
  measurementId: "G-GSN1TWRS2J"
});

const messaging = firebase.messaging();

// Puedes manejar aquí 'onBackgroundMessage' si deseas
messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification?.title || "Recordatorio", {
    body: payload.notification?.body || "",
    icon: "/icons/icon-192.png"
  });
});
