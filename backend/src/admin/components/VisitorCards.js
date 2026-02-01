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
var adminjs_1 = require("adminjs");
var VisitorCards = function () {
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), visitors = _b[0], setVisitors = _b[1];
    var _c = (0, react_1.useState)(''), search = _c[0], setSearch = _c[1];
    var _d = (0, react_1.useState)(null), checkingOut = _d[0], setCheckingOut = _d[1];
    (0, react_1.useEffect)(function () {
        loadVisitors();
    }, []);
    var loadVisitors = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/admin/api/dashboard/current-visitors', {
                            credentials: 'include',
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setVisitors(data);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Failed to load visitors:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleCheckout = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCheckingOut(sessionId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/admin/api/dashboard/checkout/".concat(sessionId), {
                            method: 'POST',
                            credentials: 'include',
                        })];
                case 2:
                    res = _a.sent();
                    if (res.ok) {
                        loadVisitors();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Failed to checkout:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setCheckingOut(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSendQr = function (visitor, method) { return __awaiter(void 0, void 0, void 0, function () {
        var res, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch('/admin/api/send-qr', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                visitId: visitor.id,
                                method: method,
                            }),
                        })];
                case 1:
                    res = _a.sent();
                    if (res.ok) {
                        alert("QR sent via ".concat(method, "!"));
                    }
                    else {
                        alert('Failed to send QR');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to send QR:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var filteredVisitors = visitors.filter(function (v) {
        if (!search)
            return true;
        var searchLower = search.toLowerCase();
        return (v.visitorName.toLowerCase().includes(searchLower) ||
            v.visitorCompany.toLowerCase().includes(searchLower) ||
            v.hostName.toLowerCase().includes(searchLower) ||
            v.visitorPhone.includes(search));
    });
    if (loading) {
        return (<design_system_1.Box flex alignItems="center" justifyContent="center" height="400px">
        <design_system_1.Loader />
      </design_system_1.Box>);
    }
    return (<design_system_1.Box variant="grey" p="xxl">
      <design_system_1.Box flex justifyContent="space-between" alignItems="center" mb="xxl">
        <design_system_1.H2>Current Visitors ({visitors.length})</design_system_1.H2>
        <design_system_1.Box flex style={{ gap: '12px' }}>
          <design_system_1.Input type="text" placeholder="Search visitors..." value={search} onChange={function (e) { return setSearch(e.target.value); }} style={{ width: '250px' }}/>
          <design_system_1.Button variant="primary" onClick={loadVisitors}>
            <design_system_1.Icon icon="RefreshCw" mr="sm"/>
            Refresh
          </design_system_1.Button>
        </design_system_1.Box>
      </design_system_1.Box>

      {filteredVisitors.length === 0 ? (<design_system_1.Box bg="white" p="xxl" style={{ borderRadius: '8px', textAlign: 'center' }}>
          <design_system_1.Icon icon="Users" size={48} color="grey40"/>
          <design_system_1.Text mt="lg" color="grey60">No visitors currently checked in</design_system_1.Text>
        </design_system_1.Box>) : (<design_system_1.Box flex flexDirection="row" style={{ gap: '24px', flexWrap: 'wrap' }}>
          {filteredVisitors.map(function (visitor) { return (<design_system_1.Box key={visitor.id} bg="white" p="xl" style={{
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    width: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
              {/* QR Code */}
              <design_system_1.Box flex justifyContent="center" mb="lg" p="md" bg="grey20" style={{ borderRadius: '8px' }}>
                {visitor.qrDataUrl ? (<img src={visitor.qrDataUrl} alt="QR Code" style={{ width: '150px', height: '150px' }}/>) : (<design_system_1.Box flex alignItems="center" justifyContent="center" style={{ width: '150px', height: '150px' }}>
                    <design_system_1.Icon icon="QrCode" size={64} color="grey40"/>
                  </design_system_1.Box>)}
              </design_system_1.Box>

              {/* Visitor Info */}
              <design_system_1.H4 mb="sm">{visitor.visitorName}</design_system_1.H4>
              <design_system_1.Text color="grey60" mb="md">{visitor.visitorCompany}</design_system_1.Text>

              <design_system_1.Box flex flexDirection="column" style={{ gap: '8px' }} mb="lg">
                <design_system_1.Box flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Icon icon="User" size={16} color="grey60"/>
                  <design_system_1.Text fontSize="sm">Host: {visitor.hostName}</design_system_1.Text>
                </design_system_1.Box>
                <design_system_1.Box flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Icon icon="Building" size={16} color="grey60"/>
                  <design_system_1.Text fontSize="sm">Company: {visitor.hostCompany}</design_system_1.Text>
                </design_system_1.Box>
                <design_system_1.Box flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Icon icon="Clock" size={16} color="grey60"/>
                  <design_system_1.Text fontSize="sm">
                    Check-in: {new Date(visitor.checkInAt).toLocaleTimeString()}
                  </design_system_1.Text>
                </design_system_1.Box>
                <design_system_1.Box flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Icon icon="FileText" size={16} color="grey60"/>
                  <design_system_1.Text fontSize="sm">Purpose: {visitor.purpose}</design_system_1.Text>
                </design_system_1.Box>
              </design_system_1.Box>

              <design_system_1.Badge variant="success" mb="lg">CHECKED IN</design_system_1.Badge>

              {/* Actions */}
              <design_system_1.Box flex flexDirection="column" style={{ gap: '8px', marginTop: 'auto' }}>
                {/* Send QR buttons */}
                <design_system_1.Box flex style={{ gap: '8px' }}>
                  {visitor.visitorPhone && (<design_system_1.Button variant="success" size="sm" onClick={function () { return handleSendQr(visitor, 'whatsapp'); }} style={{ flex: 1 }}>
                      <design_system_1.Icon icon="MessageCircle" mr="sm" size={14}/>
                      WhatsApp
                    </design_system_1.Button>)}
                  {visitor.visitorEmail && (<design_system_1.Button variant="info" size="sm" onClick={function () { return handleSendQr(visitor, 'email'); }} style={{ flex: 1 }}>
                      <design_system_1.Icon icon="Mail" mr="sm" size={14}/>
                      Email
                    </design_system_1.Button>)}
                </design_system_1.Box>

                {/* Check out button */}
                <design_system_1.Button variant="danger" onClick={function () { return handleCheckout(visitor.sessionId); }} disabled={checkingOut === visitor.sessionId}>
                  {checkingOut === visitor.sessionId ? (<design_system_1.Loader />) : (<>
                      <design_system_1.Icon icon="LogOut" mr="sm"/>
                      Check Out
                    </>)}
                </design_system_1.Button>
              </design_system_1.Box>
            </design_system_1.Box>); })}
        </design_system_1.Box>)}
    </design_system_1.Box>);
};
exports.default = VisitorCards;
