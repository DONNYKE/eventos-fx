import React from "react";

let deferredPrompt: any = null;

export default function InstallPWAButton() {
  const [canInstall, setCanInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      deferredPrompt = null;
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    deferredPrompt = null;
    setCanInstall(false);
  };

  if (installed) return <span className="text-green-600">App instalada ✔</span>;
  if (!canInstall) return null;

  return (
    <button
      onClick={onInstall}
      className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
    >
      Instalar la App
    </button>
  );
}
