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
// Para producción, valida firma del proveedor (ej. X-Signature) aquí.
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var body, provider, status_1, txnId, ticketId, okPaid, payment, e_1;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (req.method === "OPTIONS")
                    return [2 /*return*/, new Response("", { headers: cors() })];
                _j.label = 1;
            case 1:
                _j.trys.push([1, 6, , 7]);
                return [4 /*yield*/, req.json()];
            case 2:
                body = _j.sent();
                provider = body.provider || (((_a = body === null || body === void 0 ? void 0 : body.data) === null || _a === void 0 ? void 0 : _a.object) ? "CULQI" : "MP");
                status_1 = body.status || ((_b = body === null || body === void 0 ? void 0 : body.data) === null || _b === void 0 ? void 0 : _b.outcome_type) || (body === null || body === void 0 ? void 0 : body.type);
                txnId = body.id || ((_c = body === null || body === void 0 ? void 0 : body.data) === null || _c === void 0 ? void 0 : _c.id);
                ticketId = ((_d = body === null || body === void 0 ? void 0 : body.metadata) === null || _d === void 0 ? void 0 : _d.ticket_id)
                    || ((_f = (_e = body === null || body === void 0 ? void 0 : body.data) === null || _e === void 0 ? void 0 : _e.metadata) === null || _f === void 0 ? void 0 : _f.ticket_id)
                    || null;
                if (!ticketId)
                    return [2 /*return*/, json({ error: "metadata.ticket_id ausente" }, 400)];
                okPaid = /approved|success|paid/i.test(String(status_1));
                return [4 /*yield*/, supabase
                        .from("payments")
                        .insert({
                        ticket_id: ticketId,
                        method: provider === "MP" ? "MP" : "CULQI",
                        amount: Number((body === null || body === void 0 ? void 0 : body.amount) || ((_g = body === null || body === void 0 ? void 0 : body.data) === null || _g === void 0 ? void 0 : _g.amount) || 0) / ((body === null || body === void 0 ? void 0 : body.amount) ? 100 : 1),
                        currency: ((body === null || body === void 0 ? void 0 : body.currency) || ((_h = body === null || body === void 0 ? void 0 : body.data) === null || _h === void 0 ? void 0 : _h.currency) || "PEN").toUpperCase(),
                        status: okPaid ? "PAID" : "FAILED",
                        txn_id: txnId,
                        raw: body
                    })
                        .select("*").single()];
            case 3:
                payment = (_j.sent()).data;
                if (!okPaid) return [3 /*break*/, 5];
                return [4 /*yield*/, supabase.from("tickets").update({
                        payment_status: "PAID",
                        payment_method: payment.method
                    }).eq("id", ticketId)];
            case 4:
                _j.sent();
                _j.label = 5;
            case 5: return [2 /*return*/, json({ ok: true }, 200)];
            case 6:
                e_1 = _j.sent();
                return [2 /*return*/, json({ error: String(e_1) }, 500)];
            case 7: return [2 /*return*/];
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
