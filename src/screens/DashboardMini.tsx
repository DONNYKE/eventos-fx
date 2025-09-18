import React from "react";
import { supabase } from "../lib/supabaseClient";


export const DashboardMini: React.FC = () => {
const [stats, setStats] = React.useState<{ confirmados: number; pagados: number; asistieron: number } | null>(null);


React.useEffect(() => {
(async () => {
// Demo rápida: ajusta con tus queries
const { data: conf } = await supabase.rpc("rpc_confirmados_actual"); // opcional si defines funciones
const { data: paid } = await supabase.rpc("rpc_pagados_actual");
const { data: inx } = await supabase.rpc("rpc_asistidos_actual");
setStats({ confirmados: conf ?? 0, pagados: paid ?? 0, asistieron: inx ?? 0 });
})();
}, []);


return (
<div className="p-4 grid grid-cols-3 gap-3">
<div className="p-3 rounded-2xl border text-center">
<div className="text-2xl font-bold">{stats?.confirmados ?? "—"}</div>
<div className="text-xs text-gray-500">Confirmados</div>
</div>
<div className="p-3 rounded-2xl border text-center">
<div className="text-2xl font-bold">{stats?.pagados ?? "—"}</div>
<div className="text-xs text-gray-500">Pagados</div>
</div>
<div className="p-3 rounded-2xl border text-center">
<div className="text-2xl font-bold">{stats?.asistieron ?? "—"}</div>
<div className="text-xs text-gray-500">Asistencias</div>
</div>
</div>
);
};