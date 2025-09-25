import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
/** Convierte el valor de <input type="datetime-local"> a ISO UTC string. */
function toISOFromLocalInput(v) {
    if (!v)
        return null;
    // v = "YYYY-MM-DDTHH:mm" en hora local; lo convertimos a Date local y luego a ISO
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
}
/** Devuelve un string "YYYY-MM-DDTHH:mm" (para setear defaultValue/min en inputs) */
function toLocalInputValue(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const DEFAULT_ZONES = ["GENERAL", "VIP"];
export default function EventNewScreen() {
    const nav = useNavigate();
    // form state
    const [name, setName] = React.useState("");
    const [venue, setVenue] = React.useState("");
    const [zonesText, setZonesText] = React.useState(DEFAULT_ZONES.join(","));
    // fecha/hora (datetime-local)
    const now = React.useMemo(() => new Date(), []);
    const defaultStart = React.useMemo(() => {
        const d = new Date(now);
        d.setMinutes(d.getMinutes() + 60); // por defecto, dentro de 1 hora
        d.setSeconds(0, 0);
        return toLocalInputValue(d);
    }, [now]);
    const defaultEnd = React.useMemo(() => {
        const d = new Date(now);
        d.setMinutes(d.getMinutes() + 60 + 180); // fin 3h después del inicio por defecto
        d.setSeconds(0, 0);
        return toLocalInputValue(d);
    }, [now]);
    const [startAt, setStartAt] = React.useState(defaultStart);
    const [endAt, setEndAt] = React.useState(defaultEnd);
    // flyer
    const [file, setFile] = React.useState(null);
    const [preview, setPreview] = React.useState(null);
    // ui state
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [okMsg, setOkMsg] = React.useState(null);
    // preview del flyer
    React.useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setOkMsg(null);
        // Validaciones
        if (!name.trim())
            return setError("Ingresa el nombre del evento.");
        if (!startAt)
            return setError("Selecciona fecha y hora de inicio.");
        if (!endAt)
            return setError("Selecciona fecha y hora de fin.");
        const start_iso = toISOFromLocalInput(startAt);
        const end_iso = toISOFromLocalInput(endAt);
        if (!start_iso || !end_iso)
            return setError("Fechas inválidas.");
        if (new Date(end_iso) <= new Date(start_iso))
            return setError("La hora de fin debe ser posterior al inicio.");
        const zones = zonesText
            .split(",")
            .map(z => z.trim())
            .filter(Boolean);
        if (zones.length === 0)
            return setError("Define al menos una zona (ej. GENERAL, VIP).");
        setSubmitting(true);
        try {
            // sesión
            const { data: sess } = await supabase.auth.getSession();
            if (!sess?.session)
                throw new Error("No has iniciado sesión.");
            const userId = sess.session.user.id;
            // 1) Crear evento SIN flyer aún
            const { data: ev, error: insErr } = await supabase
                .from("events")
                .insert({
                name: name.trim(),
                venue: venue.trim() || null,
                start_at: start_iso,
                end_at: end_iso,
                zones,
                created_by: userId,
            })
                .select("id")
                .single();
            if (insErr)
                throw insErr;
            const eventId = ev.id;
            // 2) Subir flyer (opcional)
            if (file) {
                const safeName = file.name.replace(/\s+/g, "_");
                const path = `${eventId}/${Date.now()}_${safeName}`;
                const up = await supabase.storage.from("event-flyers").upload(path, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type || "image/*",
                });
                if (up.error)
                    throw up.error;
                const publicUrl = supabase.storage.from("event-flyers").getPublicUrl(path).data.publicUrl;
                const { error: updErr } = await supabase
                    .from("events")
                    .update({ flyer_path: path, flyer_url: publicUrl })
                    .eq("id", eventId);
                if (updErr)
                    throw updErr;
            }
            setOkMsg("✅ Evento creado correctamente.");
            setTimeout(() => nav("/admin"), 600);
        }
        catch (err) {
            console.error(err);
            setError(err?.message ?? "No se pudo crear el evento.");
        }
        finally {
            setSubmitting(false);
        }
    }
    // min: no permitir seleccionar pasado
    const minLocal = toLocalInputValue(new Date());
    return (_jsxs("div", { className: "max-w-md mx-auto p-4", children: [_jsx("h1", { className: "text-xl font-bold mb-3", children: "Crear evento" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Nombre" }), _jsx("input", { className: "w-full border px-3 py-2 rounded-xl", placeholder: "Ej. Fiesta Aniversario", value: name, onChange: (e) => setName(e.target.value), disabled: submitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Lugar" }), _jsx("input", { className: "w-full border px-3 py-2 rounded-xl", placeholder: "Ej. Auditorio Central", value: venue, onChange: (e) => setVenue(e.target.value), disabled: submitting })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Inicio (fecha y hora)" }), _jsx("input", { type: "datetime-local", className: "w-full border px-3 py-2 rounded-xl", value: startAt, onChange: (e) => setStartAt(e.target.value), min: minLocal, disabled: submitting })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Fin (fecha y hora)" }), _jsx("input", { type: "datetime-local", className: "w-full border px-3 py-2 rounded-xl", value: endAt, onChange: (e) => setEndAt(e.target.value), min: startAt || minLocal, disabled: submitting })] })] }), _jsx("p", { className: "text-xs text-gray-500 -mt-2", children: "Las horas se guardan en UTC (ISO). Lo que ves aqu\u00ED est\u00E1 en tu zona horaria local." }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Zonas (separadas por coma)" }), _jsx("input", { className: "w-full border px-3 py-2 rounded-xl", placeholder: "GENERAL, VIP", value: zonesText, onChange: (e) => setZonesText(e.target.value), disabled: submitting }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Se guardan como arreglo JSON: ej. ", _jsx("code", { children: "[\"GENERAL\",\"VIP\"]" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Flyer (opcional)" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setFile(e.target.files?.[0] ?? null), disabled: submitting }), preview && (_jsx("img", { src: preview, alt: "Preview flyer", className: "mt-2 rounded-2xl border" }))] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), okMsg && _jsx("div", { className: "text-green-600 text-sm", children: okMsg }), _jsx("button", { type: "submit", disabled: submitting, className: "w-full bg-black text-white py-2 rounded-xl", children: submitting ? "Creando…" : "Crear evento" })] }), _jsx("div", { className: "mt-4 text-xs text-gray-500", children: _jsxs("p", { children: ["Requisitos: bucket ", _jsx("code", { children: "event-flyers" }), " en Storage con policies para que ADMIN pueda subir/actualizar, y RLS en ", _jsx("code", { children: "events" }), " que permita INSERT a ADMIN."] }) })] }));
}
