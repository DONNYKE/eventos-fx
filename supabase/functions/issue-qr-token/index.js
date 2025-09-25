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
// Deno Deploy (Supabase Edge Functions)
var server_ts_1 = require("https://deno.land/std@0.224.0/http/server.ts");
var supabase_js_2_45_4_1 = require("https://esm.sh/@supabase/supabase-js@2.45.4");
var supabaseUrl = Deno.env.get("SUPABASE_URL");
var serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
var HMAC_SECRET = Deno.env.get("QR_TOKEN_SECRET"); // pon uno largo
var supabase = (0, supabase_js_2_45_4_1.createClient)(supabaseUrl, serviceKey);
function hmacSHA256(input, key) {
    var enc = new TextEncoder();
    var cryptoKey = crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return cryptoKey.then(function (k) {
        return crypto.subtle.sign("HMAC", k, enc.encode(input));
    }).then(function (sig) {
        var bytes = new Uint8Array(sig);
        return Array.from(bytes).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
}
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, jwt, ticketId, _a, ticket, te, userCheck, callerId, appRole, jti, tokenHash, expAt, _b, tok, ti, qrPayload, e_1;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (req.method === "OPTIONS")
                    return [2 /*return*/, new Response("", { headers: cors() })];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 8, , 9]);
                authHeader = req.headers.get("authorization") || "";
                jwt = authHeader.replace("Bearer ", "");
                return [4 /*yield*/, req.json()];
            case 2:
                ticketId = (_e.sent()).ticketId;
                if (!ticketId)
                    return [2 /*return*/, json({ error: "ticketId requerido" }, 400)];
                return [4 /*yield*/, supabase
                        .from("tickets").select("id, event_id, user_id")
                        .eq("id", ticketId).single()];
            case 3:
                _a = _e.sent(), ticket = _a.data, te = _a.error;
                if (te || !ticket)
                    return [2 /*return*/, json({ error: "Ticket no existe" }, 404)];
                return [4 /*yield*/, fetch("".concat(supabaseUrl, "/auth/v1/user"), {
                        headers: { Authorization: "Bearer ".concat(jwt) }
                    }).then(function (r) { return r.ok ? r.json() : null; })];
            case 4:
                userCheck = _e.sent();
                if (!(userCheck === null || userCheck === void 0 ? void 0 : userCheck.id))
                    return [2 /*return*/, json({ error: "No autenticado" }, 401)];
                callerId = userCheck.id;
                appRole = (_d = (_c = userCheck.app_metadata) === null || _c === void 0 ? void 0 : _c.app_role) !== null && _d !== void 0 ? _d : "SOCIO";
                if (callerId !== ticket.user_id && appRole !== "ADMIN") {
                    return [2 /*return*/, json({ error: "No autorizado" }, 403)];
                }
                jti = crypto.randomUUID();
                return [4 /*yield*/, hmacSHA256(jti, HMAC_SECRET)];
            case 5:
                tokenHash = _e.sent();
                expAt = new Date(Date.now() + 1000 * 60 * 60 * 12);
                return [4 /*yield*/, supabase
                        .from("ticket_tokens")
                        .insert({ ticket_id: ticketId, jti: jti, token_hash: tokenHash, exp_at: expAt.toISOString() })
                        .select("id").single()];
            case 6:
                _b = _e.sent(), tok = _b.data, ti = _b.error;
                if (ti)
                    return [2 /*return*/, json({ error: "No se pudo crear token" }, 500)];
                return [4 /*yield*/, supabase.from("tickets")
                        .update({ qr_last_token_id: tok.id })
                        .eq("id", ticketId)];
            case 7:
                _e.sent();
                qrPayload = "EVT:".concat(ticket.event_id, ".").concat(jti);
                return [2 /*return*/, json({ ok: true, qr: qrPayload, jti: jti, exp_at: expAt }, 200)];
            case 8:
                e_1 = _e.sent();
                return [2 /*return*/, json({ error: String(e_1) }, 500)];
            case 9: return [2 /*return*/];
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
