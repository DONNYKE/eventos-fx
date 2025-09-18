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
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome !== "accepted") {
      // Usuario canceló
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = (window.matchMedia("(display-mode: standalone)").matches) || ((window as any).navigator.standalone === true);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-2">Instalar la app</h1>
      <p className="text-sm text-gray-600 mb-4">
        Instala Eventos FX para recibir recordatorios, ver tu pase y QR sin abrir el navegador.
      </p>

      {!isStandalone && canInstall && (
        <button onClick={install} className="w-full bg-black text-white py-2 rounded-xl mb-4">
          Instalar app
        </button>
      )}

      {/* Guía para iOS donde no aparece el prompt nativo */}
      {!isStandalone && isIOS && (
        <div className="p-3 rounded-2xl border bg-white mb-3 text-sm">
          <div className="font-medium mb-1">iOS (Safari)</div>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Toca el botón <strong>Compartir</strong> en Safari.</li>
            <li>Elige <strong>“Añadir a pantalla de inicio”</strong>.</li>
            <li>Confirma y listo.</li>
          </ol>
        </div>
      )}

      {isStandalone ? (
        <div className="p-3 rounded-2xl border bg-white">✅ La app ya está instalada.</div>
      ) : (
        !canInstall && !isIOS && (
          <div className="p-3 rounded-2xl border bg-white text-sm">
            Si no ves el botón “Instalar”, abre este enlace en <strong>Chrome</strong> (Android)
            y busca “<em>Añadir a pantalla de inicio</em>”.
          </div>
        )
      )}
    </div>
  );
}
