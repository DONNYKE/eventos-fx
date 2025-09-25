import React from "react";
import { MyPassScreen } from "./screens/MyPassScreen";
import { ScannerScreen } from "./screens/ScannerScreen";
import { DashboardMini } from "./screens/DashboardMini";
import InstallPWAButton from "./components/InstallPWAButton";

export default function App() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Eventos FX</h1>
      <InstallPWAButton />
      {/* ...resto de tu UI */}
    </div>
  );
}


export default function App() {
const [tab, setTab] = React.useState<"pass" | "scan" | "dash">("pass");


return (
<div className="min-h-dvh bg-gray-100">
<nav className="sticky top-0 z-10 bg-white border-b">
<div className="max-w-md mx-auto flex items-center justify-between p-3">
<button onClick={() => setTab("pass")} className={`px-3 py-2 rounded-xl ${tab==='pass'?'bg-black text-white':'bg-gray-100'}`}>Mi Pase</button>
<button onClick={() => setTab("scan")} className={`px-3 py-2 rounded-xl ${tab==='scan'?'bg-black text-white':'bg-gray-100'}`}>Escáner</button>
<button onClick={() => setTab("dash")} className={`px-3 py-2 rounded-xl ${tab==='dash'?'bg-black text-white':'bg-gray-100'}`}>Dashboard</button>
</div>
</nav>


<main className="max-w-md mx-auto">
{tab === "pass" && <MyPassScreen />}
{tab === "scan" && <ScannerScreen />}
{tab === "dash" && <DashboardMini />}
</main>
</div>
);
}