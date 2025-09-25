// src/lib/fcm.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { createClient } from "@supabase/supabase-js";

// TODO: pega aquí tu config de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Tu VAPID key pública (desde Firebase)
const VAPID_KEY = "TU_VAPID_PUBLIC_KEY";

const app = initializeApp(firebaseConfig);

export async function registerFcmToken(supabaseUrl: string, supabaseKey: string) {
  const supported = await isSupported();
  if (!supported) {
    console.warn("FCM no soportado en este navegador.");
    return null;
  }

  const messaging = getMessaging(app);

  // pides permiso al usuario
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    console.warn("Permiso de notificaciones denegado.");
    return null;
  }

  // obtiene token del dispositivo
  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: await navigator.serviceWorker.ready });
  if (!token) {
    console.warn("No se pudo obtener token FCM.");
    return null;
  }

  // guarda token en Supabase usando la sesión del usuario (RLS permite insert para sí mismo)
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("Usuario no autenticado, no se guarda FCM token.");
    return token;
  }

  await supabase.from("push_tokens").upsert({
    user_id: user.id,
    fcm_token: token,
    device_info: {
      ua: navigator.userAgent,
      lang: navigator.language,
      ts: new Date().toISOString()
    }
  }, { onConflict: "user_id,fcm_token" });

  // listener opcional para mensajes en foreground
  onMessage(messaging, (payload) => {
    console.log("Mensaje en foreground:", payload);
  });

  return token;
}
