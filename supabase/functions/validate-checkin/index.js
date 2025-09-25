"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_ts_1 = require("https://deno.land/std@0.224.0/http/server.ts");
var supabase_js_2_45_4_1 = require("https://esm.sh/@supabase/supabase-js@2.45.4");
var supabase = (0, supabase_js_2_45_4_1.createClient)(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
var HMAC_SECRET = Deno.env.get("QR_TOKEN_SECRET");
function hmac(input) {
    return __awaiter(this, void 0, void 0, function () {
        var k, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, crypto.subtle.importKey("raw", new TextEncoder().encode(HMAC_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])];
                case 1:
                    k = _a.sent();
                    return [4 /*yield*/, crypto.subtle.sign("HMAC", k, new TextEncoder().encode(input))];
                case 2:
                    sig = _a.sent();
                    return [2 /*return*/, Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("")];
            }
        });
    });
}
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, qr, deviceId, markPayment, match, _, eventId, jti, tokenHash, _b, token, tokErr, _c, ticket, tErr, nowIso, updates, paymentInserted, method, amount, pay, up1, up2, e_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (req.method === "OPTIONS")
                    return [2 /*return*/, new Response("", { headers: cors() })];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 10, , 11]);
                return [4 /*yield*/, req.json()];
            case 2:
                _a = _e.sent(), qr = _a.qr, deviceId = _a.deviceId, markPayment = _a.markPayment;
                if (!qr || !deviceId)
                    return [2 /*return*/, json({ error: "qr y deviceId requeridos" }, 400)];
                match = /^EVT:([a-f0-9-]+)\.([a-f0-9-]+)$/.exec(qr);
                if (!match)
                    return [2 /*return*/, json({ error: "QR inválido" }, 400)];
                _ = match[0], eventId = match[1], jti = match[2];
                return [4 /*yield*/, hmac(jti)];
            case 3:
                tokenHash = _e.sent();
                return [4 /*yield*/, supabase
                        .from("ticket_tokens")
                        .select("id, ticket_id, exp_at, used_at")
                        .eq("token_hash", tokenHash)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle()];
            case 4:
                _b = _e.sent(), token = _b.data, tokErr = _b.error;
                if (tokErr || !token)
                    return [2 /*return*/, json({ error: "Token no encontrado" }, 404)];
                if (token.used_at)
                    return [2 /*return*/, json({ error: "QR ya usado" }, 409)];
                if (new Date(token.exp_at).getTime() < Date.now())
                    return [2 /*return*/, json({ error: "QR expirado" }, 410)];
                return [4 /*yield*/, supabase
                        .from("tickets")
                        .select("id, event_id, user_id, payment_status, checkin_status, price")
                        .eq("id", token.ticket_id).single()];
            case 5:
                _c = _e.sent(), ticket = _c.data, tErr = _c.error;
                if (tErr || !ticket)
                    return [2 /*return*/, json({ error: "Ticket inválido" }, 404)];
                if (ticket.event_id !== eventId)
                    return [2 /*return*/, json({ error: "QR de otro evento" }, 400)];
                nowIso = new Date().toISOString();
                updates = { checkin_status: "CHECKED_IN", checkin_at: nowIso };
                paymentInserted = null;
                if (!(markPayment && ticket.payment_status === "PENDING")) return [3 /*break*/, 7];
                method = markPayment.method, amount = markPayment.amount;
                return [4 /*yield*/, supabase.from("payments").insert({
                        ticket_id: ticket.id,
                        method: method,
                        amount: amount,
                        status: "PAID",
                        txn_id: "MANUAL-".concat(Date.now())
                    }).select("*").single()];
            case 6:
                pay = _e.sent();
                if (!pay.error) {
                    paymentInserted = pay.data;
                    updates.payment_status = "PAID";
                    updates.payment_method = method;
                }
                _e.label = 7;
            case 7: return [4 /*yield*/, supabase.from("tickets").update(updates).eq("id", ticket.id)];
            case 8:
                up1 = (_e.sent()).error;
                if (up1)
                    return [2 /*return*/, json({ error: "No se pudo actualizar ticket" }, 500)];
                return [4 /*yield*/, supabase.from("ticket_tokens")
                        .update({ used_at: nowIso, device_first: deviceId })
                        .eq("id", token.id)];
            case 9:
                up2 = (_e.sent()).error;
                if (up2)
                    return [2 /*return*/, json({ error: "No se pudo cerrar token" }, 500)];
                return [2 /*return*/, json({
                        ok: true,
                        ticket_id: ticket.id,
                        user_id: ticket.user_id,
                        payment_status: (_d = updates.payment_status) !== null && _d !== void 0 ? _d : ticket.payment_status,
                        checkin_at: nowIso,
                        payment: paymentInserted
                    }, 200)];
            case 10:
                e_1 = _e.sent();
                return [2 /*return*/, json({ error: String(e_1) }, 500)];
            case 11: return [2 /*return*/];
        }
    });
}); });
function cors() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };
}
function json(body, status) {
    if (status === void 0) { status = 200; }
    return new Response(JSON.stringify(body), { status: status, headers: cors() });
}
