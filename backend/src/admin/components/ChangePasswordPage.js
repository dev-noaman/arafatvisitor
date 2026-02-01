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
/**
 * Change Password page - accessible from sidebar for any logged-in user.
 * Uses currentAdmin.email from AdminJS session to identify the user.
 */
var ChangePasswordPage = function () {
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _a = (0, react_1.useState)(''), currentPassword = _a[0], setCurrentPassword = _a[1];
    var _b = (0, react_1.useState)(''), newPassword = _b[0], setNewPassword = _b[1];
    var _c = (0, react_1.useState)(''), confirmPassword = _c[0], setConfirmPassword = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), message = _e[0], setMessage = _e[1];
    var userEmail = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.email;
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!userEmail) {
                        setMessage({ type: 'error', text: 'You must be logged in to change password.' });
                        return [2 /*return*/];
                    }
                    if (!currentPassword || !newPassword || !confirmPassword) {
                        setMessage({ type: 'error', text: 'All fields are required' });
                        return [2 /*return*/];
                    }
                    if (newPassword !== confirmPassword) {
                        setMessage({ type: 'error', text: 'New passwords do not match' });
                        return [2 /*return*/];
                    }
                    if (newPassword.length < 6) {
                        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/change-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                currentPassword: currentPassword,
                                newPassword: newPassword,
                                userEmail: userEmail,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setMessage({ type: 'success', text: 'Password changed successfully!' });
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }
                    else {
                        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error. Please try again.' });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (!userEmail) {
        return (<design_system_1.Box variant="grey" p="xxl">
        <design_system_1.H2 mb="lg">Change Password</design_system_1.H2>
        <design_system_1.MessageBox message="You must be logged in to change your password." variant="error"/>
      </design_system_1.Box>);
    }
    return (<design_system_1.Box variant="grey" p="xxl">
      <design_system_1.H2 mb="sm">Change Password</design_system_1.H2>
      <design_system_1.Text color="grey60" mb="xxl">
        Update your password for account: {userEmail}
      </design_system_1.Text>

      {message && (<design_system_1.Box mb="xl">
          <design_system_1.MessageBox message={message.text} variant={message.type} onCloseClick={function () { return setMessage(null); }}/>
        </design_system_1.Box>)}

      <design_system_1.Box bg="white" p="xxl" style={{ borderRadius: '8px', maxWidth: '400px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <design_system_1.Box mb="lg">
            <design_system_1.Label required>Current Password</design_system_1.Label>
            <design_system_1.Input type="password" value={currentPassword} onChange={function (e) { return setCurrentPassword(e.target.value); }} placeholder="Enter current password" disabled={loading}/>
          </design_system_1.Box>

          <design_system_1.Box mb="lg">
            <design_system_1.Label required>New Password</design_system_1.Label>
            <design_system_1.Input type="password" value={newPassword} onChange={function (e) { return setNewPassword(e.target.value); }} placeholder="Enter new password (min 6 characters)" disabled={loading}/>
          </design_system_1.Box>

          <design_system_1.Box mb="xl">
            <design_system_1.Label required>Confirm New Password</design_system_1.Label>
            <design_system_1.Input type="password" value={confirmPassword} onChange={function (e) { return setConfirmPassword(e.target.value); }} placeholder="Confirm new password" disabled={loading}/>
          </design_system_1.Box>

          <design_system_1.Button type="submit" variant="primary" disabled={loading} style={{ minWidth: '140px' }}>
            {loading ? <design_system_1.Loader /> : 'Change Password'}
          </design_system_1.Button>
        </form>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = ChangePasswordPage;
