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
var Login = function () {
    var _a = (0, react_1.useState)(''), email = _a[0], setEmail = _a[1];
    var _b = (0, react_1.useState)(''), password = _b[0], setPassword = _b[1];
    var _c = (0, react_1.useState)(''), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var formData, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError('');
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    formData = new FormData();
                    formData.append('email', email);
                    formData.append('password', password);
                    return [4 /*yield*/, fetch('/admin/login', {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                        })];
                case 2:
                    response = _a.sent();
                    if (response.redirected) {
                        window.location.href = response.url;
                        return [2 /*return*/];
                    }
                    if (!response.ok) {
                        setError('Invalid email or password');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError('Login failed. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<design_system_1.Box flex flexDirection="column" alignItems="center" justifyContent="center" style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '24px',
        }}>
      <design_system_1.Box style={{
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
        }}>
        <design_system_1.Text as="h1" style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '16px',
        }}>
          Login to Your Account
        </design_system_1.Text>

        <design_system_1.Box as="form" onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
        }}>
          {/* Indigo accent bar */}
          <design_system_1.Box style={{
            height: '8px',
            background: 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)',
        }}/>

          <design_system_1.Box style={{ padding: '24px 32px' }}>
            {error && (<design_system_1.MessageBox message={error} variant="danger" style={{ marginBottom: '16px' }}/>)}

            <design_system_1.Box mb="lg">
              <design_system_1.Label style={{
            display: 'block',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
        }}>
                Username or Email
              </design_system_1.Label>
              <design_system_1.Input type="email" name="email" placeholder="Email" value={email} onChange={function (e) { return setEmail(e.target.value); }} required style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
        }}/>
            </design_system_1.Box>

            <design_system_1.Box mb="lg">
              <design_system_1.Label style={{
            display: 'block',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
        }}>
                Password
              </design_system_1.Label>
              <design_system_1.Input type="password" name="password" placeholder="Password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
        }}/>
            </design_system_1.Box>

            <design_system_1.Box flex flexDirection="column" alignItems="center" style={{ gap: '16px', marginTop: '16px' }}>
              <design_system_1.Button type="submit" variant="primary" disabled={loading} style={{
            width: '100%',
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
        }}>
                {loading ? 'Signing in...' : 'Submit'}
              </design_system_1.Button>
              <design_system_1.Text as="a" href="#" style={{
            fontSize: '14px',
            color: '#6b7280',
            textDecoration: 'none',
        }}>
                Forgot password?
              </design_system_1.Text>
            </design_system_1.Box>
          </design_system_1.Box>
        </design_system_1.Box>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = Login;
