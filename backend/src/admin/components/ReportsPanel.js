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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var design_system_1 = require("@adminjs/design-system");
var adminjs_1 = require("adminjs");
var ReportsPanel = function () {
    var _a, _b, _c, _d, _e;
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _f = (0, react_1.useState)('visitors'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(false), exporting = _h[0], setExporting = _h[1];
    var role = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) || 'ADMIN';
    var hostCompany = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostCompany) || '';
    var isHost = role === 'HOST';
    var _j = (0, react_1.useState)({
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        location: '',
        company: isHost ? hostCompany : '', // Auto-set company for HOST
        status: '',
    }), filters = _j[0], setFilters = _j[1];
    var _k = (0, react_1.useState)({}), reportData = _k[0], setReportData = _k[1];
    var _l = (0, react_1.useState)(null), message = _l[0], setMessage = _l[1];
    // All roles can access reports (ADMIN, HOST, RECEPTION)
    // HOST sees only their company, RECEPTION sees all
    var handleFilterChange = function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var generateReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, endpoint, res, data_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    params = new URLSearchParams();
                    if (filters.dateFrom)
                        params.append('dateFrom', filters.dateFrom);
                    if (filters.dateTo)
                        params.append('dateTo', filters.dateTo);
                    if (filters.location)
                        params.append('location', filters.location);
                    if (filters.company)
                        params.append('company', filters.company);
                    if (filters.status)
                        params.append('status', filters.status);
                    endpoint = activeTab === 'visitors'
                        ? '/admin/api/reports/visitors'
                        : '/admin/api/reports/deliveries';
                    return [4 /*yield*/, fetch("".concat(endpoint, "?").concat(params), {
                            credentials: 'include',
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data_1 = _a.sent();
                    setReportData(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[activeTab] = data_1, _a)));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setMessage({ type: 'error', text: 'Failed to generate report' });
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error. Please try again.' });
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var exportReport = function (format) { return __awaiter(void 0, void 0, void 0, function () {
        var params, endpoint, res, blob, url, a, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setExporting(true);
                    setMessage(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    params = new URLSearchParams();
                    if (filters.dateFrom)
                        params.append('dateFrom', filters.dateFrom);
                    if (filters.dateTo)
                        params.append('dateTo', filters.dateTo);
                    if (filters.location)
                        params.append('location', filters.location);
                    if (filters.company)
                        params.append('company', filters.company);
                    if (filters.status)
                        params.append('status', filters.status);
                    params.append('format', format);
                    endpoint = activeTab === 'visitors'
                        ? '/admin/api/reports/visitors/export'
                        : '/admin/api/reports/deliveries/export';
                    return [4 /*yield*/, fetch("".concat(endpoint, "?").concat(params), {
                            credentials: 'include',
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.blob()];
                case 3:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "".concat(activeTab, "-report-").concat(new Date().toISOString().split('T')[0], ".").concat(format === 'excel' ? 'xlsx' : 'csv');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    setMessage({ type: 'success', text: "Report exported as ".concat(format.toUpperCase()) });
                    return [3 /*break*/, 5];
                case 4:
                    setMessage({ type: 'error', text: 'Failed to export report' });
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error. Please try again.' });
                    return [3 /*break*/, 8];
                case 7:
                    setExporting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var visitorStatuses = ['CHECKED_IN', 'CHECKED_OUT', 'PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
    var deliveryStatuses = ['RECEIVED', 'PICKED_UP'];
    var locations = ['BARWA_TOWERS', 'MARINA_50', 'ELEMENT_MARIOTT'];
    return (<design_system_1.Box variant="grey" p="xxl">
      <design_system_1.H2 mb="xxl">Reports</design_system_1.H2>

      {message && (<design_system_1.Box mb="xl">
          <design_system_1.MessageBox message={message.text} variant={message.type} onCloseClick={function () { return setMessage(null); }}/>
        </design_system_1.Box>)}

      {/* Tabs */}
      <design_system_1.Box mb="xl">
        <design_system_1.Tabs>
          <design_system_1.Tab id="visitors" label="Visitors Report" isSelected={activeTab === 'visitors'} onClick={function () { return setActiveTab('visitors'); }}/>
          <design_system_1.Tab id="deliveries" label="Deliveries Report" isSelected={activeTab === 'deliveries'} onClick={function () { return setActiveTab('deliveries'); }}/>
        </design_system_1.Tabs>
      </design_system_1.Box>

      {/* Filters */}
      <design_system_1.Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.H3 mb="lg">Filters</design_system_1.H3>
        <design_system_1.Box flex flexDirection="row" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <design_system_1.Box style={{ minWidth: '150px' }}>
            <design_system_1.Label>Date From</design_system_1.Label>
            <design_system_1.Input type="date" value={filters.dateFrom} onChange={function (e) { return handleFilterChange('dateFrom', e.target.value); }}/>
          </design_system_1.Box>
          <design_system_1.Box style={{ minWidth: '150px' }}>
            <design_system_1.Label>Date To</design_system_1.Label>
            <design_system_1.Input type="date" value={filters.dateTo} onChange={function (e) { return handleFilterChange('dateTo', e.target.value); }}/>
          </design_system_1.Box>
          <design_system_1.Box style={{ minWidth: '150px' }}>
            <design_system_1.Label>Location</design_system_1.Label>
            <design_system_1.Select value={filters.location} onChange={function (selected) { return handleFilterChange('location', (selected === null || selected === void 0 ? void 0 : selected.value) || ''); }} options={__spreadArray([
            { value: '', label: 'All Locations' }
        ], locations.map(function (l) { return ({ value: l, label: l.replace('_', ' ') }); }), true)}/>
          </design_system_1.Box>
          <design_system_1.Box style={{ minWidth: '150px' }}>
            <design_system_1.Label>Company {isHost && '(Your company)'}</design_system_1.Label>
            <design_system_1.Input type="text" value={filters.company} onChange={function (e) { return handleFilterChange('company', e.target.value); }} placeholder={isHost ? hostCompany : "Filter by company"} disabled={isHost} style={isHost ? { backgroundColor: '#f3f4f6' } : {}}/>
          </design_system_1.Box>
          <design_system_1.Box style={{ minWidth: '150px' }}>
            <design_system_1.Label>Status</design_system_1.Label>
            <design_system_1.Select value={filters.status} onChange={function (selected) { return handleFilterChange('status', (selected === null || selected === void 0 ? void 0 : selected.value) || ''); }} options={__spreadArray([
            { value: '', label: 'All Statuses' }
        ], (activeTab === 'visitors' ? visitorStatuses : deliveryStatuses).map(function (s) { return ({
            value: s,
            label: s.replace('_', ' '),
        }); }), true)}/>
          </design_system_1.Box>
        </design_system_1.Box>
        <design_system_1.Box mt="lg" flex style={{ gap: '12px' }}>
          <design_system_1.Button variant="primary" onClick={generateReport} disabled={loading}>
            {loading ? <design_system_1.Loader /> : 'Generate Report'}
          </design_system_1.Button>
        </design_system_1.Box>
      </design_system_1.Box>

      {/* Export Buttons */}
      <design_system_1.Box mb="xl" flex style={{ gap: '12px' }}>
        <design_system_1.Button variant="success" onClick={function () { return exportReport('csv'); }} disabled={exporting || !((_a = reportData[activeTab]) === null || _a === void 0 ? void 0 : _a.length)}>
          <design_system_1.Icon icon="Download" mr="sm"/>
          Export CSV
        </design_system_1.Button>
        <design_system_1.Button variant="info" onClick={function () { return exportReport('excel'); }} disabled={exporting || !((_b = reportData[activeTab]) === null || _b === void 0 ? void 0 : _b.length)}>
          <design_system_1.Icon icon="Download" mr="sm"/>
          Export Excel
        </design_system_1.Button>
      </design_system_1.Box>

      {/* Results Table */}
      <design_system_1.Box bg="white" p="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <design_system_1.H3 mb="lg">Results ({((_c = reportData[activeTab]) === null || _c === void 0 ? void 0 : _c.length) || 0} records)</design_system_1.H3>
        
        {loading ? (<design_system_1.Box flex justifyContent="center" p="xxl">
            <design_system_1.Loader />
          </design_system_1.Box>) : activeTab === 'visitors' && ((_d = reportData.visitors) === null || _d === void 0 ? void 0 : _d.length) ? (<design_system_1.Table>
            <design_system_1.TableHead>
              <design_system_1.TableRow>
                <design_system_1.TableCell>Visitor</design_system_1.TableCell>
                <design_system_1.TableCell>Company</design_system_1.TableCell>
                <design_system_1.TableCell>Host</design_system_1.TableCell>
                <design_system_1.TableCell>Purpose</design_system_1.TableCell>
                <design_system_1.TableCell>Status</design_system_1.TableCell>
                <design_system_1.TableCell>Check In</design_system_1.TableCell>
                <design_system_1.TableCell>Check Out</design_system_1.TableCell>
              </design_system_1.TableRow>
            </design_system_1.TableHead>
            <design_system_1.TableBody>
              {reportData.visitors.map(function (v) {
                var _a;
                return (<design_system_1.TableRow key={v.id}>
                  <design_system_1.TableCell>{v.visitorName}</design_system_1.TableCell>
                  <design_system_1.TableCell>{v.visitorCompany}</design_system_1.TableCell>
                  <design_system_1.TableCell>{((_a = v.host) === null || _a === void 0 ? void 0 : _a.name) || '-'}</design_system_1.TableCell>
                  <design_system_1.TableCell>{v.purpose}</design_system_1.TableCell>
                  <design_system_1.TableCell>{v.status}</design_system_1.TableCell>
                  <design_system_1.TableCell>{v.checkInAt ? new Date(v.checkInAt).toLocaleString() : '-'}</design_system_1.TableCell>
                  <design_system_1.TableCell>{v.checkOutAt ? new Date(v.checkOutAt).toLocaleString() : '-'}</design_system_1.TableCell>
                </design_system_1.TableRow>);
            })}
            </design_system_1.TableBody>
          </design_system_1.Table>) : activeTab === 'deliveries' && ((_e = reportData.deliveries) === null || _e === void 0 ? void 0 : _e.length) ? (<design_system_1.Table>
            <design_system_1.TableHead>
              <design_system_1.TableRow>
                <design_system_1.TableCell>Courier</design_system_1.TableCell>
                <design_system_1.TableCell>Recipient</design_system_1.TableCell>
                <design_system_1.TableCell>Host</design_system_1.TableCell>
                <design_system_1.TableCell>Location</design_system_1.TableCell>
                <design_system_1.TableCell>Status</design_system_1.TableCell>
                <design_system_1.TableCell>Received</design_system_1.TableCell>
                <design_system_1.TableCell>Picked Up</design_system_1.TableCell>
              </design_system_1.TableRow>
            </design_system_1.TableHead>
            <design_system_1.TableBody>
              {reportData.deliveries.map(function (d) {
                var _a;
                return (<design_system_1.TableRow key={d.id}>
                  <design_system_1.TableCell>{d.courier}</design_system_1.TableCell>
                  <design_system_1.TableCell>{d.recipient}</design_system_1.TableCell>
                  <design_system_1.TableCell>{((_a = d.host) === null || _a === void 0 ? void 0 : _a.name) || '-'}</design_system_1.TableCell>
                  <design_system_1.TableCell>{d.location}</design_system_1.TableCell>
                  <design_system_1.TableCell>{d.status}</design_system_1.TableCell>
                  <design_system_1.TableCell>{d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '-'}</design_system_1.TableCell>
                  <design_system_1.TableCell>{d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '-'}</design_system_1.TableCell>
                </design_system_1.TableRow>);
            })}
            </design_system_1.TableBody>
          </design_system_1.Table>) : (<design_system_1.Text color="grey60">No data available. Click "Generate Report" to load data.</design_system_1.Text>)}
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = ReportsPanel;
