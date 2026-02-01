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
var dotenv = require("dotenv");
dotenv.config();
function testWhatsApp() {
    return __awaiter(this, void 0, void 0, function () {
        var config, testPhone, testMessage, url, normalizedPhone, countryCode, phoneNumber, payload, res, text, json, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        endpoint: process.env.WHATSAPP_ENDPOINT,
                        clientId: Number(process.env.WHATSAPP_CLIENT_ID),
                        whatsappClient: Number(process.env.WHATSAPP_CLIENT),
                        apiKey: process.env.WHATSAPP_API_KEY,
                    };
                    console.log('WhatsApp Configuration:');
                    console.log('  Endpoint:', config.endpoint);
                    console.log('  Client ID:', config.clientId);
                    console.log('  WhatsApp Client:', config.whatsappClient);
                    console.log('  API Key:', config.apiKey ? "".concat(config.apiKey.substring(0, 8), "...") : 'NOT SET');
                    console.log('');
                    if (!config.endpoint || !config.clientId || !config.whatsappClient || !config.apiKey) {
                        console.error('Missing WhatsApp configuration in .env');
                        process.exit(1);
                    }
                    testPhone = process.argv[2] || '97450707317';
                    testMessage = 'Test message from Arafat VMS - WhatsApp integration test';
                    console.log("Testing WhatsApp send to: ".concat(testPhone));
                    console.log("Message: ".concat(testMessage));
                    console.log('');
                    url = "".concat(config.endpoint.replace(/\/$/, ''), "/send_msg/");
                    console.log("POST ".concat(url));
                    normalizedPhone = testPhone.replace(/\D/g, '').replace(/^0/, '');
                    countryCode = '974';
                    phoneNumber = normalizedPhone;
                    if (normalizedPhone.startsWith('974')) {
                        countryCode = '974';
                        phoneNumber = normalizedPhone.slice(3);
                    }
                    payload = {
                        client_id: config.clientId,
                        api_key: config.apiKey,
                        whatsapp_client: config.whatsappClient,
                        msg_type: 0,
                        msg: testMessage,
                        phone: phoneNumber,
                        country_code: countryCode,
                    };
                    console.log('Payload:', JSON.stringify(payload, null, 2));
                    console.log('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        })];
                case 2:
                    res = _a.sent();
                    console.log('Response Status:', res.status, res.statusText);
                    console.log('Response Headers:', Object.fromEntries(res.headers.entries()));
                    return [4 /*yield*/, res.text()];
                case 3:
                    text = _a.sent();
                    console.log('Response Body:', text);
                    try {
                        json = JSON.parse(text);
                        console.log('Parsed JSON:', JSON.stringify(json, null, 2));
                    }
                    catch (_b) {
                        console.log('(Response is not JSON)');
                    }
                    if (res.ok) {
                        console.log('\nWhatsApp message sent successfully!');
                    }
                    else {
                        console.log('\nWhatsApp send failed with status:', res.status);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error('\nFetch error:', err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
testWhatsApp();
