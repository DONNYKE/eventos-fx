// src/admin/AdminShareApp.tsx
import React from "react";
import QRCode from "qrcode";

export default function AdminShareApp() {
  const appUrl = React.useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/app`;
  }, []);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(appUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 8,
        });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (e) { console.error("QR error:", e); }
    })();
    return () => { mounted = false; };
  }, [appUrl]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(appUrl); alert("Enlace copiado ✅"); }
    catch { alert("No se pudo copiar. Copia manualmente el enlace."); }
  };

  const downloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qr-eventosfx.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Compartir app (QR)</h1>
      <div className="p-4 rounded-2xl border bg-white space-y-3">
        <div className="text-sm">Instalación: <span className="font-mono">{appUrl}</span></div>
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img src={qrDataUrl} alt="QR app" className="w-64 h-64 rounded-xl border" />
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadPng} className="px-3 py-2 rounded-xl bg-black text-white">Descargar PNG</button>
              <button onClick={copy} className="px-3 py-2 rounded-xl border">Copiar enlace</button>
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 grid place-items-center border rounded-xl mx-auto">Generando QR…</div>
        )}
      </div>
    </div>
  );
}
