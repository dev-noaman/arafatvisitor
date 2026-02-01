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
var EditProfilePanel = function () {
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(false), saving = _b[0], setSaving = _b[1];
    var _c = (0, react_1.useState)(null), profile = _c[0], setProfile = _c[1];
    var _d = (0, react_1.useState)(''), name = _d[0], setName = _d[1];
    var email = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.email) || '';
    (0, react_1.useEffect)(function () {
        var load = function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 5, 6]);
                        return [4 /*yield*/, fetch("/admin/api/profile?email=".concat(encodeURIComponent(email)), { credentials: 'include' })];
                    case 2:
                        res = _a.sent();
                        if (!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _a.sent();
                        setProfile(data);
                        setName(data.name || '');
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        if (email)
            load();
    }, [email]);
    var save = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email)
                        return [2 /*return*/];
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/profile/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ email: email, name: name }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setProfile(data);
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<design_system_1.Box flex alignItems="center" justifyContent="center" height="70vh">
        <design_system_1.Loader />
      </design_system_1.Box>);
    }
    return (<design_system_1.Box variant="grey" p="xxl" style={{ maxWidth: 640 }}>
      <design_system_1.H2>Edit Profile</design_system_1.H2>
      <design_system_1.Box mt="xl">
        <design_system_1.Label>Full Name</design_system_1.Label>
        <design_system_1.Input value={name} onChange={function (e) { return setName(e.target.value); }}/>
      </design_system_1.Box>
      <design_system_1.Box mt="lg">
        <design_system_1.Label>Email</design_system_1.Label>
        <design_system_1.Input value={(profile === null || profile === void 0 ? void 0 : profile.email) || ''} disabled/>
      </design_system_1.Box>
      
      <design_system_1.Box mt="xl" flex>
        <design_system_1.Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </design_system_1.Button>
        <design_system_1.Text ml="lg" color="grey60">Role: {(profile === null || profile === void 0 ? void 0 : profile.role) || 'N/A'}</design_system_1.Text>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = EditProfilePanel;
