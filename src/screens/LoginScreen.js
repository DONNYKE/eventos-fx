import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
export default function LoginScreen() {
    const nav = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        }
        else {
            nav("/pass"); // redirigir al pase tras login
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto p-6", children: [_jsx("h1", { className: "text-xl font-bold mb-4", children: "Iniciar sesi\u00F3n" }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full border px-3 py-2 rounded-xl" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Contrase\u00F1a" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full border px-3 py-2 rounded-xl" })] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-black text-white py-2 rounded-xl", children: loading ? "Ingresando..." : "Entrar" })] })] }));
}
