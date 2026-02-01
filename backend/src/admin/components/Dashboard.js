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
var Dashboard = function () {
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)({ totalHosts: 0, visitsToday: 0, deliveriesToday: 0 }), kpis = _b[0], setKpis = _b[1];
    var _c = (0, react_1.useState)([]), pendingApprovals = _c[0], setPendingApprovals = _c[1];
    var _d = (0, react_1.useState)([]), receivedDeliveries = _d[0], setReceivedDeliveries = _d[1];
    var _e = (0, react_1.useState)(null), chartData = _e[0], setChartData = _e[1];
    var _f = (0, react_1.useState)(function () {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminjs-theme-preference') === 'dark';
        }
        return false;
    }), darkMode = _f[0], setDarkMode = _f[1];
    (0, react_1.useEffect)(function () {
        var handleThemeChange = function () {
            var isDark = localStorage.getItem('adminjs-theme-preference') === 'dark';
            setDarkMode(isDark);
            document.documentElement.classList.toggle('dark', isDark);
        };
        // Listen for local storage changes
        window.addEventListener('storage', handleThemeChange);
        // Listen for custom event from admin-scripts.js
        window.addEventListener('theme-change', handleThemeChange);
        // Initial check
        handleThemeChange();
        return function () {
            window.removeEventListener('storage', handleThemeChange);
            window.removeEventListener('theme-change', handleThemeChange);
        };
    }, []);
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, []);
    var loadDashboardData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var kpisRes, kpisData, approvalsRes, approvalsData, deliveriesRes, deliveriesData, chartsRes, chartsData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 14, 15, 16]);
                    return [4 /*yield*/, fetch('/admin/api/dashboard/kpis', {
                            credentials: 'include',
                        })];
                case 2:
                    kpisRes = _a.sent();
                    if (!kpisRes.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, kpisRes.json()];
                case 3:
                    kpisData = _a.sent();
                    setKpis(kpisData);
                    _a.label = 4;
                case 4: return [4 /*yield*/, fetch('/admin/api/dashboard/pending-approvals', {
                        credentials: 'include',
                    })];
                case 5:
                    approvalsRes = _a.sent();
                    if (!approvalsRes.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, approvalsRes.json()];
                case 6:
                    approvalsData = _a.sent();
                    setPendingApprovals(approvalsData);
                    _a.label = 7;
                case 7: return [4 /*yield*/, fetch('/admin/api/dashboard/received-deliveries', {
                        credentials: 'include',
                    })];
                case 8:
                    deliveriesRes = _a.sent();
                    if (!deliveriesRes.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, deliveriesRes.json()];
                case 9:
                    deliveriesData = _a.sent();
                    setReceivedDeliveries(deliveriesData);
                    _a.label = 10;
                case 10: return [4 /*yield*/, fetch('/admin/api/dashboard/charts', {
                        credentials: 'include',
                    })];
                case 11:
                    chartsRes = _a.sent();
                    if (!chartsRes.ok) return [3 /*break*/, 13];
                    return [4 /*yield*/, chartsRes.json()];
                case 12:
                    chartsData = _a.sent();
                    setChartData(chartsData);
                    _a.label = 13;
                case 13: return [3 /*break*/, 16];
                case 14:
                    error_1 = _a.sent();
                    console.error('Failed to load dashboard data:', error_1);
                    return [3 /*break*/, 16];
                case 15:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    }); };
    var handleApprove = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/admin/api/dashboard/approve/".concat(id), {
                            method: 'POST',
                            credentials: 'include',
                        })];
                case 1:
                    res = _a.sent();
                    if (res.ok) {
                        loadDashboardData();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to approve:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var res, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/admin/api/dashboard/reject/".concat(id), {
                            method: 'POST',
                            credentials: 'include',
                        })];
                case 1:
                    res = _a.sent();
                    if (res.ok) {
                        loadDashboardData();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to reject:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<design_system_1.Box flex flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <design_system_1.Loader />
        <design_system_1.Text mt="lg">Loading dashboard...</design_system_1.Text>
      </design_system_1.Box>);
    }
    var role = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) || 'ADMIN';
    var canApprove = role === 'ADMIN' || role === 'HOST';
    // Styles
    var cardStyle = {
        borderRadius: '8px',
        flex: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        border: 'none',
    };
    var fullWidthCardStyle = {
        borderRadius: '8px',
        width: '100%',
        display: 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        border: 'none',
    };
    var textColor = undefined;
    var mutedColor = 'grey60';
    var bgColor = undefined;
    return (<design_system_1.Box variant="grey" p="xxl" style={{ backgroundColor: bgColor }}>
      <design_system_1.Box flex justifyContent="flex-start" alignItems="center" mb="xxl">
        <design_system_1.H2 style={{ color: textColor }}>Dashboard</design_system_1.H2>
      </design_system_1.Box>

      {/* KPI Cards */}
      <design_system_1.Box flex flexDirection="row" mb="xxl" style={{ gap: '24px' }}>
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Total Hosts</design_system_1.Text>
          <design_system_1.H2 style={{ margin: 0, color: textColor }}>{kpis.totalHosts}</design_system_1.H2>
          <design_system_1.Icon icon="User" color="primary100" size={32}/>
        </design_system_1.Box>
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Visits Today</design_system_1.Text>
          <design_system_1.H2 style={{ margin: 0, color: textColor }}>{kpis.visitsToday}</design_system_1.H2>
          <design_system_1.Icon icon="UserCheck" color="success" size={32}/>
        </design_system_1.Box>
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Deliveries Today</design_system_1.Text>
          <design_system_1.H2 style={{ margin: 0, color: textColor }}>{kpis.deliveriesToday}</design_system_1.H2>
          <design_system_1.Icon icon="Package" color="info" size={32}/>
        </design_system_1.Box>
      </design_system_1.Box>

      {/* Operational Queues - Each in separate full-width card */}
      <design_system_1.Box mb="xxl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Pre-Register Approval Queue */}
        <design_system_1.Box p="xl" style={fullWidthCardStyle}>
          <design_system_1.H3 mb="lg" style={{ color: textColor }}>Pre-Register Approval Queue</design_system_1.H3>
          {pendingApprovals.length === 0 ? (<design_system_1.Text style={{ color: mutedColor }}>No pending approvals</design_system_1.Text>) : (<design_system_1.Table style={{ backgroundColor: undefined }}>
              <design_system_1.TableHead>
                <design_system_1.TableRow>
                  <design_system_1.TableCell style={{ color: textColor }}>Visitor</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Host</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Company</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Expected</design_system_1.TableCell>
                  {canApprove && <design_system_1.TableCell style={{ color: textColor }}>Actions</design_system_1.TableCell>}
                </design_system_1.TableRow>
              </design_system_1.TableHead>
              <design_system_1.TableBody>
                {pendingApprovals.map(function (item) { return (<design_system_1.TableRow key={item.id}>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.visitorName}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.hostName}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.hostCompany}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{new Date(item.expectedDate).toLocaleDateString()}</design_system_1.TableCell>
                    {canApprove && (<design_system_1.TableCell>
                        <design_system_1.Box flex flexDirection="row" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                          <design_system_1.Button variant="success" size="sm" onClick={function () { return handleApprove(item.id); }}>
                            Approve
                          </design_system_1.Button>
                          <design_system_1.Button variant="danger" size="sm" onClick={function () { return handleReject(item.id); }}>
                            Reject
                          </design_system_1.Button>
                        </design_system_1.Box>
                      </design_system_1.TableCell>)}
                  </design_system_1.TableRow>); })}
              </design_system_1.TableBody>
            </design_system_1.Table>)}
        </design_system_1.Box>

        {/* Deliveries Queue */}
        <design_system_1.Box p="xl" style={fullWidthCardStyle}>
          <design_system_1.H3 mb="lg" style={{ color: textColor }}>Deliveries Queue (Received)</design_system_1.H3>
          {receivedDeliveries.length === 0 ? (<design_system_1.Text style={{ color: mutedColor }}>No pending deliveries</design_system_1.Text>) : (<design_system_1.Table style={{ backgroundColor: undefined }}>
              <design_system_1.TableHead>
                <design_system_1.TableRow>
                  <design_system_1.TableCell style={{ color: textColor }}>Courier</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Host</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Company</design_system_1.TableCell>
                  <design_system_1.TableCell style={{ color: textColor }}>Received</design_system_1.TableCell>
                </design_system_1.TableRow>
              </design_system_1.TableHead>
              <design_system_1.TableBody>
                {receivedDeliveries.map(function (item) { return (<design_system_1.TableRow key={item.id}>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.courier}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.hostName}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{item.hostCompany}</design_system_1.TableCell>
                    <design_system_1.TableCell style={{ color: textColor }}>{new Date(item.receivedAt).toLocaleTimeString()}</design_system_1.TableCell>
                  </design_system_1.TableRow>); })}
              </design_system_1.TableBody>
            </design_system_1.Table>)}
        </design_system_1.Box>
      </design_system_1.Box>

      {/* Charts Section */}
      <design_system_1.Box flex flexDirection="row" style={{ gap: '24px' }}>
        {/* Visits Per Day */}
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.H4 mb="lg" style={{ color: textColor }}>Visits (Last 7 Days)</design_system_1.H4>
          {(chartData === null || chartData === void 0 ? void 0 : chartData.visitsPerDay) ? (<design_system_1.Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.visitsPerDay.map(function (day) { return (<design_system_1.Box key={day.date} flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Text style={{ width: '80px', color: textColor }}>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</design_system_1.Text>
                  <design_system_1.Box bg="primary100" style={{
                    height: '20px',
                    width: "".concat(Math.min(day.count * 10, 100), "%"),
                    borderRadius: '4px',
                    minWidth: day.count > 0 ? '20px' : '0',
                }}/>
                  <design_system_1.Text style={{ color: textColor }}>{day.count}</design_system_1.Text>
                </design_system_1.Box>); })}
            </design_system_1.Box>) : (<design_system_1.Text style={{ color: mutedColor }}>No data available</design_system_1.Text>)}
        </design_system_1.Box>

        {/* Status Distribution */}
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.H4 mb="lg" style={{ color: textColor }}>Visitor Status Distribution</design_system_1.H4>
          {(chartData === null || chartData === void 0 ? void 0 : chartData.statusDistribution) && chartData.statusDistribution.length > 0 ? (<design_system_1.Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.statusDistribution.map(function (item) { return (<design_system_1.Box key={item.status} flex justifyContent="space-between" alignItems="center">
                  <design_system_1.Text style={{ color: textColor }}>{item.status.replace(/_/g, ' ')}</design_system_1.Text>
                  <design_system_1.Box bg={item.status === 'CHECKED_IN' ? 'success' : item.status === 'PENDING_APPROVAL' ? 'warning' : item.status === 'APPROVED' ? 'info' : 'grey40'} px="md" py="sm" style={{ borderRadius: '4px' }}>
                    <design_system_1.Text color="white">{item.count}</design_system_1.Text>
                  </design_system_1.Box>
                </design_system_1.Box>); })}
            </design_system_1.Box>) : (<design_system_1.Text style={{ color: mutedColor }}>No data available</design_system_1.Text>)}
        </design_system_1.Box>

        {/* Deliveries Per Day */}
        <design_system_1.Box flex flexDirection="column" p="xl" style={cardStyle}>
          <design_system_1.H4 mb="lg" style={{ color: textColor }}>Deliveries (Last 7 Days)</design_system_1.H4>
          {(chartData === null || chartData === void 0 ? void 0 : chartData.deliveriesPerDay) ? (<design_system_1.Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.deliveriesPerDay.map(function (day) { return (<design_system_1.Box key={day.date} flex alignItems="center" style={{ gap: '8px' }}>
                  <design_system_1.Text style={{ width: '80px', color: textColor }}>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</design_system_1.Text>
                  <design_system_1.Box bg="info" style={{
                    height: '20px',
                    width: "".concat(Math.min(day.count * 10, 100), "%"),
                    borderRadius: '4px',
                    minWidth: day.count > 0 ? '20px' : '0',
                }}/>
                  <design_system_1.Text style={{ color: textColor }}>{day.count}</design_system_1.Text>
                </design_system_1.Box>); })}
            </design_system_1.Box>) : (<design_system_1.Text style={{ color: mutedColor }}>No data available</design_system_1.Text>)}
        </design_system_1.Box>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.default = Dashboard;
