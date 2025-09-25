import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * Placeholders simples; inserta aquí tu lógica real de sesión/roles si la tienes.
 */
export function RequireAuth({ children }) {
    return _jsx(_Fragment, { children: children });
}
export function RequireAdmin({ children }) {
    return _jsx(_Fragment, { children: children });
}
