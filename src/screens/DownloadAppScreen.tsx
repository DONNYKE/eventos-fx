// src/screens/DownloadAppScreen.tsx
import React from "react";

export default function DownloadAppScreen() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [canInstall, setCanInstall] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    // @ts-ignore
    (window.navigator.standalone === true);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Instalar la app</h1>
      {!isStandalone && (
        <div className="p-3 rounded-2xl border bg-white">
          <p className="mb-2">Instala <strong>Eventos FX</strong> para usarla como app nativa:</p>
          <div className="space-y-2">
            <h2 className="font-medium">Android (Chrome)</h2>
            {canInstall ? (
              <button onClick={install} className="w-full px-3 py-2 rounded-xl bg-black text-white">Instalar ahora</button>
            ) : (
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Toca ⋮ (arriba derecha).</li>
                <li>Elige <strong>Añadir a pantalla de inicio</strong>.</li>
                <li>Confirma con <strong>Instalar</strong>.</li>
              </ol>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h2 className="font-medium">iPhone / iPad (Safari)</h2>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Abre este enlace en <strong>Safari</strong>.</li>
              <li>Toca el botón <strong>Compartir</strong>.</li>
              <li>Selecciona <strong>Añadir a pantalla de inicio</strong>.</li>
              <li>Confirma con <strong>Añadir</strong>.</li>
            </ol>
          </div>
        </div>
      )}
      {isStandalone ? (
        <div className="p-3 rounded-2xl border bg-white">✅ La app ya está instalada.</div>
      ) : (
        !canInstall && !isIOS && (
          <div className="p-3 rounded-2xl border bg-white text-sm">
            Si no ves el botón “Instalar”, abre en <strong>Chrome</strong> (Android) y busca “Añadir a pantalla de inicio”.
          </div>
        )
      )}
    </div>
  );
}
