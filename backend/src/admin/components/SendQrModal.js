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
var react_1 = require("react");
var design_system_1 = require("@adminjs/design-system");
var SendQrModal = function (props) {
    var _a, _b, _c, _d;
    var record = props.record;
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), qrImageUrl = _f[0], setQrImageUrl = _f[1];
    var _g = (0, react_1.useState)(null), message = _g[0], setMessage = _g[1];
    var visitId = (_a = record === null || record === void 0 ? void 0 : record.params) === null || _a === void 0 ? void 0 : _a.id;
    var visitorName = ((_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.visitorName) || 'Visitor';
    var visitorPhone = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.visitorPhone;
    var visitorEmail = (_d = record === null || record === void 0 ? void 0 : record.params) === null || _d === void 0 ? void 0 : _d.visitorEmail;
    (0, react_1.useEffect)(function () {
        // Load QR code image
        if (visitId) {
            loadQrCode();
        }
    }, [visitId]);
    var loadQrCode = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/admin/api/qr/".concat(visitId), {
                            credentials: 'include',
                        })];
                case 1:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    setQrImageUrl(data.qrDataUrl);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Failed to load QR code:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSend = function (method) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!visitId)
                        return [2 /*return*/];
                    setLoading(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/send-qr', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                visitId: visitId,
                                method: method,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setMessage({
                            type: 'success',
                            text: "QR code sent via ".concat(method === 'whatsapp' ? 'WhatsApp' : 'Email', " successfully!"),
                        });
                    }
                    else {
                        setMessage({
                            type: 'error',
                            text: data.message || 'Failed to send QR code',
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    setMessage({
                        type: 'error',
                        text: 'Network error. Please try again.',
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<design_system_1.Box p="xxl">
      <design_system_1.H3 mb="xl">Send QR Code</design_system_1.H3>
      
      <design_system_1.Box mb="xl">
        <design_system_1.Text mb="sm" fontWeight="bold">Visitor: {visitorName}</design_system_1.Text>
        {visitorPhone && <design_system_1.Text mb="sm">Phone: {visitorPhone}</design_system_1.Text>}
        {visitorEmail && <design_system_1.Text mb="sm">Email: {visitorEmail}</design_system_1.Text>}
      </design_system_1.Box>

      {/* QR Code Preview */}
      <design_system_1.Box mb="xl" flex flexDirection="column" alignItems="center" p="xl" bg="grey20" style={{ borderRadius: '8px' }}>
        <design_system_1.H4 mb="lg">QR Code Preview</design_system_1.H4>
        {qrImageUrl ? (<img src={qrImageUrl} alt="QR Code" style={{ width: '200px', height: '200px', background: 'white', padding: '16px', borderRadius: '8px' }}/>) : (<design_system_1.Box flex alignItems="center" justifyContent="center" style={{ width: '200px', height: '200px' }}>
            <design_system_1.Loader />
          </design_system_1.Box>)}
      </design_system_1.Box>

      {/* Message */}
      {message && (<design_system_1.Box mb="xl">
          <design_system_1.MessageBox message={message.text} variant={message.type} onCloseClick={function () { return setMessage(null); }}/>
        </design_system_1.Box>)}

      {/* Send Options */}
      <design_system_1.Box flex flexDirection="column" style={{ gap: '12px' }}>
        <design_system_1.Text fontWeight="bold" mb="sm">Send QR Code via:</design_system_1.Text>
        
        {/* WhatsApp Option */}
        <design_system_1.Button variant="success" disabled={!visitorPhone || loading} onClick={function () { return handleSend('whatsapp'); }} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? (<design_system_1.Loader />) : (<>
              <design_system_1.Icon icon="MessageCircle" mr="sm"/>
              Send via WhatsApp
              {!visitorPhone && <design_system_1.Text ml="sm" fontSize="sm">(No phone number)</design_system_1.Text>}
            </>)}
        </design_system_1.Button>

        {/* Email Option */}
        <design_system_1.Button variant="primary" disabled={!visitorEmail || loading} onClick={function () { return handleSend('email'); }} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? (<design_system_1.Loader />) : (<>
              <design_system_1.Icon icon="Mail" mr="sm"/>
              Send via Email
              {!visitorEmail && <design_system_1.Text ml="sm" fontSize="sm">(No email)</design_system_1.Text>}
            </>)}
        </design_system_1.Button>
      </design_system_1.Box>

      {/* No contact info warning */}
      {!visitorPhone && !visitorEmail && (<design_system_1.Box mt="xl">
          <design_system_1.MessageBox message="No contact information available for this visitor. Please add phone or email to send the QR code." variant="warning"/>
        </design_system_1.Box>)}
    </design_system_1.Box>);
};
exports.default = SendQrModal;
