import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export default function DownloadAppScreen() {
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);
    const [canInstall, setCanInstall] = React.useState(false);
    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);
    const install = async () => {
        if (!deferredPrompt)
            return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome !== "accepted") {
            // Usuario canceló
        }
        setDeferredPrompt(null);
        setCanInstall(false);
    };
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = (window.matchMedia("(display-mode: standalone)").matches) || (window.navigator.standalone === true);
    return (_jsxs("div", { className: "max-w-md mx-auto p-4", children: [_jsx("h1", { className: "text-xl font-bold mb-2", children: "Instalar la app" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Instala Eventos FX para recibir recordatorios, ver tu pase y QR sin abrir el navegador." }), !isStandalone && canInstall && (_jsx("button", { onClick: install, className: "w-full bg-black text-white py-2 rounded-xl mb-4", children: "Instalar app" })), !isStandalone && isIOS && (_jsxs("div", { className: "p-3 rounded-2xl border bg-white mb-3 text-sm", children: [_jsx("div", { className: "font-medium mb-1", children: "iOS (Safari)" }), _jsxs("ol", { className: "list-decimal ml-5 space-y-1", children: [_jsxs("li", { children: ["Toca el bot\u00F3n ", _jsx("strong", { children: "Compartir" }), " en Safari."] }), _jsxs("li", { children: ["Elige ", _jsx("strong", { children: "\u201CA\u00F1adir a pantalla de inicio\u201D" }), "."] }), _jsx("li", { children: "Confirma y listo." })] })] })), isStandalone ? (_jsx("div", { className: "p-3 rounded-2xl border bg-white", children: "\u2705 La app ya est\u00E1 instalada." })) : (!canInstall && !isIOS && (_jsxs("div", { className: "p-3 rounded-2xl border bg-white text-sm", children: ["Si no ves el bot\u00F3n \u201CInstalar\u201D, abre este enlace en ", _jsx("strong", { children: "Chrome" }), " (Android) y busca \u201C", _jsx("em", { children: "A\u00F1adir a pantalla de inicio" }), "\u201D."] })))] }));
}
