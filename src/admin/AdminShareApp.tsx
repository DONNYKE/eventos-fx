import React from "react";
import QRCode from "qrcode";

export default function AdminShareApp() {
  const [url, setUrl] = React.useState<string>(() => {
    // En producción usa TU DOMINIO. En dev, el host actual.
    const base = typeof window !== "undefined" ? window.location.origin : "https://tudominio.com";
    return `${base}/app`;
  });
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 256 }, (err) => { if (err) console.error(err); });
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Enlace copiado");
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Compartir instalación</h1>
      <p className="text-sm text-gray-600">
        Envía este código QR o enlace para que los socios instalen la app PWA.
      </p>
      <canvas ref={canvasRef} className="mx-auto rounded-2xl border" />
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 rounded-xl border" value={url} onChange={(e)=>setUrl(e.target.value)} />
        <button className="px-3 py-2 rounded-xl border" onClick={copy}>Copiar</button>
      </div>
    </div>
  );
}
