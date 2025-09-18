import React from "react";


export const CheckinResultCard: React.FC<{
tone: "success" | "warning" | "error";
title: string;
subtitle?: string;
meta?: Record<string, string | number>;
}> = ({ tone, title, subtitle, meta }) => {
const toneMap = {
success: "border-green-500 bg-green-50",
warning: "border-amber-500 bg-amber-50",
error: "border-red-500 bg-red-50",
} as const;


return (
<div className={`w-full p-4 rounded-2xl border ${toneMap[tone]} animate-in fade-in duration-150`}>
<h3 className="font-semibold">{title}</h3>
{subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
{meta && (
<div className="mt-2 grid grid-cols-2 gap-1 text-sm text-gray-700">
{Object.entries(meta).map(([k,v]) => (
<div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{String(v)}</span></div>
))}
</div>
)}
</div>
);
};