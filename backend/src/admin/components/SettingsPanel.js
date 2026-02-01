"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var SettingsPanel = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _w = (0, react_1.useState)(true), loading = _w[0], setLoading = _w[1];
    var _x = (0, react_1.useState)(false), saving = _x[0], setSaving = _x[1];
    var _y = (0, react_1.useState)(null), settings = _y[0], setSettings = _y[1];
    var _z = (0, react_1.useState)(false), testingWhatsapp = _z[0], setTestingWhatsapp = _z[1];
    var _0 = (0, react_1.useState)(false), testingEmail = _0[0], setTestingEmail = _0[1];
    var _1 = (0, react_1.useState)(''), testPhone = _1[0], setTestPhone = _1[1];
    var _2 = (0, react_1.useState)(''), testEmail = _2[0], setTestEmailInput = _2[1];
    var _3 = (0, react_1.useState)(null), message = _3[0], setMessage = _3[1];
    var _4 = (0, react_1.useState)(false), editingSmtp = _4[0], setEditingSmtp = _4[1];
    var _5 = (0, react_1.useState)({
        enabled: false,
        host: '',
        port: '587',
        user: '',
        pass: '',
        from: '',
    }), smtpForm = _5[0], setSmtpForm = _5[1];
    var role = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) || 'ADMIN';
    var isAdmin = role === 'ADMIN';
    (0, react_1.useEffect)(function () {
        loadSettings();
    }, []);
    var loadSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/admin/api/settings', {
                            credentials: 'include',
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setSettings(data);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Failed to load settings:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var testWhatsapp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testPhone) {
                        setMessage({ type: 'error', text: 'Please enter a phone number' });
                        return [2 /*return*/];
                    }
                    setTestingWhatsapp(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/settings/test-whatsapp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ phone: testPhone }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setMessage({ type: 'success', text: 'Test WhatsApp message sent successfully!' });
                    }
                    else {
                        setMessage({ type: 'error', text: data.message || 'Failed to send test message' });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error' });
                    return [3 /*break*/, 6];
                case 5:
                    setTestingWhatsapp(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var testSmtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!testEmail) {
                        setMessage({ type: 'error', text: 'Please enter an email address' });
                        return [2 /*return*/];
                    }
                    setTestingEmail(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/settings/test-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ email: testEmail }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setMessage({ type: 'success', text: 'Test email sent successfully!' });
                    }
                    else {
                        setMessage({ type: 'error', text: data.message || 'Failed to send test email' });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error' });
                    return [3 /*break*/, 6];
                case 5:
                    setTestingEmail(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var startEditingSmtp = function () {
        var _a, _b, _c, _d, _e;
        setSmtpForm({
            enabled: ((_a = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _a === void 0 ? void 0 : _a.enabled) || false,
            host: ((_b = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _b === void 0 ? void 0 : _b.host) || '',
            port: String(((_c = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _c === void 0 ? void 0 : _c.port) || '587'),
            user: ((_d = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _d === void 0 ? void 0 : _d.user) || '',
            pass: '',
            from: ((_e = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _e === void 0 ? void 0 : _e.from) || '',
        });
        setEditingSmtp(true);
    };
    var saveSmtpSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSaving(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/settings/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                smtp: {
                                    enabled: smtpForm.enabled,
                                    host: smtpForm.host,
                                    port: parseInt(smtpForm.port, 10),
                                    user: smtpForm.user,
                                    pass: smtpForm.pass || undefined,
                                    from: smtpForm.from,
                                },
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setMessage({ type: 'success', text: 'SMTP settings saved successfully!' });
                        setEditingSmtp(false);
                        loadSettings(); // Reload settings
                    }
                    else {
                        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error' });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var toggleSmtpEnabled = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setSaving(true);
                    setMessage(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/settings/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                smtp: {
                                    enabled: !((_a = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _a === void 0 ? void 0 : _a.enabled),
                                },
                            }),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (res.ok) {
                        setMessage({ type: 'success', text: "SMTP ".concat(!((_b = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _b === void 0 ? void 0 : _b.enabled) ? 'enabled' : 'disabled', " successfully!") });
                        loadSettings();
                    }
                    else {
                        setMessage({ type: 'error', text: data.message || 'Failed to update settings' });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_5 = _c.sent();
                    setMessage({ type: 'error', text: 'Network error' });
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (!isAdmin) {
        return (<design_system_1.Box p="xxl">
        <design_system_1.MessageBox message="You don't have permission to access settings." variant="error"/>
      </design_system_1.Box>);
    }
    if (loading) {
        return (<design_system_1.Box flex alignItems="center" justifyContent="center" height="100vh">
        <design_system_1.Loader />
      </design_system_1.Box>);
    }
    return (<design_system_1.Box variant="grey" p="xxl">
      <design_system_1.H2 mb="xxl">Settings</design_system_1.H2>

      <design_system_1.Text color="grey60" mb="xxl">
        Settings are stored in the .env file. To change settings, edit the .env file and restart the server.
      </design_system_1.Text>

      {message && (<design_system_1.Box mb="xl" p="lg" style={{
                borderRadius: '8px',
                backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: "1px solid ".concat(message.type === 'error' ? '#fecaca' : '#bbf7d0'),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
          <design_system_1.Text style={{ color: message.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
            {message.type === 'error' ? '❌ ' : '✅ '}{message.text}
          </design_system_1.Text>
          <design_system_1.Button variant="text" size="sm" onClick={function () { return setMessage(null); }}>✕</design_system_1.Button>
        </design_system_1.Box>)}

      {/* Site Settings */}
      <design_system_1.Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.H3 mb="lg">
          <design_system_1.Icon icon="Home" mr="sm"/>
          Site Settings
        </design_system_1.H3>
        <design_system_1.Box flex flexDirection="column" style={{ gap: '12px' }}>
          <design_system_1.Box flex justifyContent="space-between">
            <design_system_1.Text fontWeight="bold">Site Name:</design_system_1.Text>
            <design_system_1.Text>{((_a = settings === null || settings === void 0 ? void 0 : settings.site) === null || _a === void 0 ? void 0 : _a.name) || 'Arafat VMS'}</design_system_1.Text>
          </design_system_1.Box>
          <design_system_1.Box flex justifyContent="space-between">
            <design_system_1.Text fontWeight="bold">Timezone:</design_system_1.Text>
            <design_system_1.Text>{((_b = settings === null || settings === void 0 ? void 0 : settings.site) === null || _b === void 0 ? void 0 : _b.timezone) || 'Asia/Qatar'}</design_system_1.Text>
          </design_system_1.Box>
        </design_system_1.Box>
      </design_system_1.Box>

      {/* WhatsApp Settings */}
      <design_system_1.Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.H3 mb="lg">
          <design_system_1.Icon icon="MessageCircle" mr="sm"/>
          WhatsApp Settings
        </design_system_1.H3>
        <design_system_1.Box flex flexDirection="column" style={{ gap: '12px' }}>
          <design_system_1.Box flex justifyContent="space-between" alignItems="center">
            <design_system_1.Text fontWeight="bold">Status:</design_system_1.Text>
            <design_system_1.Badge variant={((_c = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _c === void 0 ? void 0 : _c.configured) ? 'success' : 'danger'}>
              {((_d = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _d === void 0 ? void 0 : _d.configured) ? 'Configured' : 'Not Configured'}
            </design_system_1.Badge>
          </design_system_1.Box>
          <design_system_1.Box flex justifyContent="space-between">
            <design_system_1.Text fontWeight="bold">Provider:</design_system_1.Text>
            <design_system_1.Text>{((_e = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _e === void 0 ? void 0 : _e.provider) || 'wbiztool'}</design_system_1.Text>
          </design_system_1.Box>
          <design_system_1.Box flex justifyContent="space-between" alignItems="center">
            <design_system_1.Text fontWeight="bold">Enabled:</design_system_1.Text>
            <design_system_1.Badge variant={((_f = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _f === void 0 ? void 0 : _f.enabled) ? 'success' : 'secondary'}>
              {((_g = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _g === void 0 ? void 0 : _g.enabled) ? 'Yes' : 'No'}
            </design_system_1.Badge>
          </design_system_1.Box>
        </design_system_1.Box>
        
        {((_h = settings === null || settings === void 0 ? void 0 : settings.whatsapp) === null || _h === void 0 ? void 0 : _h.configured) && (<design_system_1.Box mt="lg" pt="lg" style={{ borderTop: '1px solid #e5e7eb' }}>
            <design_system_1.H4 mb="md">Test WhatsApp</design_system_1.H4>
            <design_system_1.Box flex style={{ gap: '12px' }}>
              <design_system_1.Input type="tel" placeholder="Phone number (e.g., +974xxxxxxxx)" value={testPhone} onChange={function (e) { return setTestPhone(e.target.value); }} style={{ flex: 1 }}/>
              <design_system_1.Button variant="success" onClick={testWhatsapp} disabled={testingWhatsapp}>
                {testingWhatsapp ? <design_system_1.Loader /> : 'Send Test'}
              </design_system_1.Button>
            </design_system_1.Box>
          </design_system_1.Box>)}
      </design_system_1.Box>

      {/* SMTP Settings */}
      <design_system_1.Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.Box flex justifyContent="space-between" alignItems="center" mb="lg">
          <design_system_1.H3 style={{ margin: 0 }}>
            <design_system_1.Icon icon="Mail" mr="sm"/>
            SMTP Settings
          </design_system_1.H3>
          {!editingSmtp && (<design_system_1.Button variant="text" onClick={startEditingSmtp}>
              <design_system_1.Icon icon="Edit" mr="sm"/>
              Edit
            </design_system_1.Button>)}
        </design_system_1.Box>

        {editingSmtp ? (<design_system_1.Box flex flexDirection="column" style={{ gap: '16px' }}>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>Enabled:</design_system_1.Label>
              <design_system_1.Button variant={smtpForm.enabled ? 'success' : 'secondary'} size="sm" onClick={function () { return setSmtpForm(__assign(__assign({}, smtpForm), { enabled: !smtpForm.enabled })); }}>
                {smtpForm.enabled ? 'Enabled' : 'Disabled'}
              </design_system_1.Button>
            </design_system_1.Box>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>Host:</design_system_1.Label>
              <design_system_1.Input value={smtpForm.host} onChange={function (e) { return setSmtpForm(__assign(__assign({}, smtpForm), { host: e.target.value })); }} placeholder="smtp.example.com" style={{ flex: 1 }}/>
            </design_system_1.Box>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>Port:</design_system_1.Label>
              <design_system_1.Input value={smtpForm.port} onChange={function (e) { return setSmtpForm(__assign(__assign({}, smtpForm), { port: e.target.value })); }} placeholder="587" style={{ width: '100px' }}/>
            </design_system_1.Box>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>User:</design_system_1.Label>
              <design_system_1.Input value={smtpForm.user} onChange={function (e) { return setSmtpForm(__assign(__assign({}, smtpForm), { user: e.target.value })); }} placeholder="user@example.com" style={{ flex: 1 }}/>
            </design_system_1.Box>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>Password:</design_system_1.Label>
              <design_system_1.Input type="password" value={smtpForm.pass} onChange={function (e) { return setSmtpForm(__assign(__assign({}, smtpForm), { pass: e.target.value })); }} placeholder="Leave blank to keep current" style={{ flex: 1 }}/>
            </design_system_1.Box>
            <design_system_1.Box flex alignItems="center" style={{ gap: '12px' }}>
              <design_system_1.Label style={{ width: '100px' }}>From:</design_system_1.Label>
              <design_system_1.Input value={smtpForm.from} onChange={function (e) { return setSmtpForm(__assign(__assign({}, smtpForm), { from: e.target.value })); }} placeholder="noreply@example.com" style={{ flex: 1 }}/>
            </design_system_1.Box>
            <design_system_1.Box flex style={{ gap: '12px', marginTop: '8px' }}>
              <design_system_1.Button variant="primary" onClick={saveSmtpSettings} disabled={saving}>
                {saving ? <design_system_1.Loader /> : 'Save Settings'}
              </design_system_1.Button>
              <design_system_1.Button variant="text" onClick={function () { return setEditingSmtp(false); }}>
                Cancel
              </design_system_1.Button>
            </design_system_1.Box>
          </design_system_1.Box>) : (<>
            <design_system_1.Box flex flexDirection="column" style={{ gap: '12px' }}>
              <design_system_1.Box flex justifyContent="space-between" alignItems="center">
                <design_system_1.Text fontWeight="bold">Status:</design_system_1.Text>
                <design_system_1.Badge variant={((_j = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _j === void 0 ? void 0 : _j.configured) ? 'success' : 'danger'}>
                  {((_k = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _k === void 0 ? void 0 : _k.configured) ? 'Configured' : 'Not Configured'}
                </design_system_1.Badge>
              </design_system_1.Box>
              <design_system_1.Box flex justifyContent="space-between">
                <design_system_1.Text fontWeight="bold">Host:</design_system_1.Text>
                <design_system_1.Text>{((_l = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _l === void 0 ? void 0 : _l.host) || 'Not set'}</design_system_1.Text>
              </design_system_1.Box>
              <design_system_1.Box flex justifyContent="space-between" alignItems="center">
                <design_system_1.Text fontWeight="bold">Enabled:</design_system_1.Text>
                <design_system_1.Box flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Badge variant={((_m = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _m === void 0 ? void 0 : _m.enabled) ? 'success' : 'secondary'}>
                    {((_o = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _o === void 0 ? void 0 : _o.enabled) ? 'Yes' : 'No'}
                  </design_system_1.Badge>
                  <design_system_1.Button variant={((_p = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _p === void 0 ? void 0 : _p.enabled) ? 'danger' : 'success'} size="sm" onClick={toggleSmtpEnabled} disabled={saving || !((_q = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _q === void 0 ? void 0 : _q.configured)}>
                    {((_r = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _r === void 0 ? void 0 : _r.enabled) ? 'Disable' : 'Enable'}
                  </design_system_1.Button>
                </design_system_1.Box>
              </design_system_1.Box>
            </design_system_1.Box>

            {((_s = settings === null || settings === void 0 ? void 0 : settings.smtp) === null || _s === void 0 ? void 0 : _s.configured) && (<design_system_1.Box mt="lg" pt="lg" style={{ borderTop: '1px solid #e5e7eb' }}>
                <design_system_1.H4 mb="md">Test Email</design_system_1.H4>
                <design_system_1.Box flex style={{ gap: '12px' }}>
                  <design_system_1.Input type="email" placeholder="Email address" value={testEmail} onChange={function (e) { return setTestEmailInput(e.target.value); }} style={{ flex: 1 }}/>
                  <design_system_1.Button variant="primary" onClick={testSmtp} disabled={testingEmail}>
                    {testingEmail ? <design_system_1.Loader /> : 'Send Test'}
                  </design_system_1.Button>
                </design_system_1.Box>
              </design_system_1.Box>)}
          </>)}
      </design_system_1.Box>

      {/* Maintenance Mode */}
      <design_system_1.Box bg="white" p="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.H3 mb="lg">
          <design_system_1.Icon icon="Tool" mr="sm"/>
          Maintenance Mode
        </design_system_1.H3>
        <design_system_1.Box flex flexDirection="column" style={{ gap: '12px' }}>
          <design_system_1.Box flex justifyContent="space-between" alignItems="center">
            <design_system_1.Text fontWeight="bold">Status:</design_system_1.Text>
            <design_system_1.Badge variant={((_t = settings === null || settings === void 0 ? void 0 : settings.maintenance) === null || _t === void 0 ? void 0 : _t.enabled) ? 'danger' : 'success'}>
              {((_u = settings === null || settings === void 0 ? void 0 : settings.maintenance) === null || _u === void 0 ? void 0 : _u.enabled) ? 'ACTIVE' : 'Inactive'}
            </design_system_1.Badge>
          </design_system_1.Box>
          <design_system_1.Box flex justifyContent="space-between">
            <design_system_1.Text fontWeight="bold">Message:</design_system_1.Text>
            <design_system_1.Text>{((_v = settings === null || settings === void 0 ? void 0 : settings.maintenance) === null || _v === void 0 ? void 0 : _v.message) || 'System under maintenance'}</design_system_1.Text>
          </design_system_1.Box>
        </design_system_1.Box>
      </design_system_1.Box>

      {/* Instructions */}
      <design_system_1.Box mt="xxl" p="xl" bg="grey20" style={{ borderRadius: '8px' }}>
        <design_system_1.H4 mb="md">How to Update Settings</design_system_1.H4>
        <design_system_1.Text mb="sm">To change these settings, edit the following environment variables in your .env file:</design_system_1.Text>
        <design_system_1.Box as="pre" p="md" bg="grey40" style={{ borderRadius: '4px', overflow: 'auto' }}>
          <design_system_1.Text as="code" style={{ fontFamily: 'monospace' }}>
        {"# Site Settings\nSITE_NAME=Arafat VMS\nSITE_TIMEZONE=Asia/Qatar\n\n# WhatsApp Settings\nWHATSAPP_ENABLED=true\nWHATSAPP_API_URL=https://api.wbiztool.com\nWHATSAPP_API_TOKEN=your-token\n\n# SMTP Settings\nSMTP_ENABLED=true\nSMTP_HOST=smtp.example.com\nSMTP_PORT=587\nSMTP_USER=user@example.com\nSMTP_PASS=your-password\nSMTP_FROM=noreply@example.com\n\n# Maintenance Mode\nMAINTENANCE_MODE=false\nMAINTENANCE_MESSAGE=System under maintenance"}
          </design_system_1.Text>
        </design_system_1.Box>
        <design_system_1.Text mt="md" color="grey60">After editing the .env file, restart the server for changes to take effect.</design_system_1.Text>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = SettingsPanel;
