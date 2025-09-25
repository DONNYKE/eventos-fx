import React from "react";
type PaymentMethod = string;


export const PaymentButtons: React.FC<{
disabled?: boolean;
onPay: (method: PaymentMethod, amount: number) => Promise<void> | void;
suggestedAmount: number;
}> = ({ disabled, onPay, suggestedAmount }) => {
const [amount, setAmount] = React.useState<number>(suggestedAmount);


const btn = (label: string, method: PaymentMethod) => (
<button
key={method}
disabled={disabled}
onClick={() => onPay(method, amount)}
className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm"
>{label}</button>
);


return (
<div className="w-full p-3 rounded-2xl border bg-gray-50 flex flex-col gap-2">
<div className="flex items-center gap-2">
<span className="text-sm text-gray-600">Monto:</span>
<input type="number" className="w-28 px-2 py-1 rounded-lg border" value={amount}
onChange={e => setAmount(Number(e.target.value)||0)} />
</div>
<div className="flex flex-wrap gap-2">
{btn("Efectivo", "EFECTIVO")}
{btn("Yape", "YAPE")}
{btn("Plin", "PLIN")}
{btn("Culqi", "CULQI")}
{btn("Mercado Pago", "MP")}
</div>
</div>
);
};