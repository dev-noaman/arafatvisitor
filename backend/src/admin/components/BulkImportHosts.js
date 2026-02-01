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
var BulkImportHosts = function () {
    var _a = (0, react_1.useState)(null), selectedFileName = _a[0], setSelectedFileName = _a[1];
    var _b = (0, react_1.useState)(null), csvContent = _b[0], setCsvContent = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), validating = _d[0], setValidating = _d[1];
    var _e = (0, react_1.useState)(null), validation = _e[0], setValidation = _e[1];
    var _f = (0, react_1.useState)(null), summary = _f[0], setSummary = _f[1];
    var _g = (0, react_1.useState)(null), message = _g[0], setMessage = _g[1];
    var _h = (0, react_1.useState)([]), editableRejected = _h[0], setEditableRejected = _h[1];
    var handleFileChange = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setMessage({ type: 'error', text: 'Please upload a CSV file.' });
            return;
        }
        setSelectedFileName(file.name);
        setSummary(null);
        setValidation(null);
        setMessage(null);
        setEditableRejected([]);
        var reader = new FileReader();
        reader.onload = function () { return __awaiter(void 0, void 0, void 0, function () {
            var text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        text = typeof reader.result === 'string' ? reader.result : '';
                        setCsvContent(text);
                        return [4 /*yield*/, validateCsv(text)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        reader.onerror = function () {
            setMessage({ type: 'error', text: 'Failed to read the file. Please try again.' });
        };
        reader.readAsText(file);
    };
    var validateCsv = function (content) { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, totalProcessed, rejected, newHosts, existingHosts, usersToCreate, rejectedRows, error_1;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    setValidating(true);
                    setValidation(null);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/hosts/import?validate=true', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ csvContent: content }),
                        })];
                case 2:
                    res = _f.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _f.sent();
                    if (!res.ok) {
                        setMessage({ type: 'error', text: data.message || 'Failed to validate CSV.' });
                        return [2 /*return*/];
                    }
                    totalProcessed = (_a = data.totalProcessed) !== null && _a !== void 0 ? _a : 0;
                    rejected = (_b = data.rejected) !== null && _b !== void 0 ? _b : 0;
                    newHosts = (_c = data.inserted) !== null && _c !== void 0 ? _c : 0;
                    existingHosts = (_d = data.skipped) !== null && _d !== void 0 ? _d : 0;
                    usersToCreate = (_e = data.usersCreated) !== null && _e !== void 0 ? _e : 0;
                    rejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];
                    setValidation({
                        totalRows: totalProcessed,
                        validRows: totalProcessed - rejected,
                        newHosts: newHosts,
                        existingHosts: existingHosts,
                        usersToCreate: usersToCreate,
                        rejectedRows: rejectedRows,
                    });
                    setEditableRejected(rejectedRows);
                    if (rejected > 0) {
                        setMessage({
                            type: 'error',
                            text: "".concat(rejected, " row(s) have issues. Edit below and retry, or fix your CSV."),
                        });
                    }
                    else {
                        setMessage({
                            type: 'success',
                            text: "Ready to import: ".concat(newHosts, " new hosts, ").concat(existingHosts, " existing hosts, ").concat(usersToCreate, " users will be created."),
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _f.sent();
                    setMessage({ type: 'error', text: 'Network error while validating. Please try again.' });
                    return [3 /*break*/, 6];
                case 5:
                    setValidating(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleImport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, rejectedRows, error_2;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!csvContent) {
                        setMessage({ type: 'error', text: 'Please select a CSV file first.' });
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setMessage(null);
                    setSummary(null);
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/hosts/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ csvContent: csvContent }),
                        })];
                case 2:
                    res = _g.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _g.sent();
                    if (!res.ok) {
                        setMessage({ type: 'error', text: data.message || 'Failed to import hosts.' });
                        return [2 /*return*/];
                    }
                    rejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];
                    setSummary({
                        totalProcessed: (_a = data.totalProcessed) !== null && _a !== void 0 ? _a : 0,
                        inserted: (_b = data.inserted) !== null && _b !== void 0 ? _b : 0,
                        skipped: (_c = data.skipped) !== null && _c !== void 0 ? _c : 0,
                        rejected: (_d = data.rejected) !== null && _d !== void 0 ? _d : 0,
                        rejectedRows: rejectedRows,
                        usersCreated: (_e = data.usersCreated) !== null && _e !== void 0 ? _e : 0,
                        usersSkipped: (_f = data.usersSkipped) !== null && _f !== void 0 ? _f : 0,
                        createdCredentials: Array.isArray(data.createdCredentials) ? data.createdCredentials : [],
                    });
                    setEditableRejected(rejectedRows);
                    setValidation(null);
                    if (data.inserted > 0) {
                        setMessage({
                            type: 'success',
                            text: "Import completed! ".concat(data.inserted, " hosts imported, ").concat(data.usersCreated, " user accounts created."),
                        });
                    }
                    else {
                        setMessage({
                            type: 'success',
                            text: 'Import completed. No new hosts were added (all existing or rejected).',
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _g.sent();
                    setMessage({ type: 'error', text: 'Network error while importing. Please try again.' });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleRetryRejected = function () { return __awaiter(void 0, void 0, void 0, function () {
        var headers, rows, retryCsvContent, res, data_1, newRejectedRows_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (editableRejected.length === 0)
                        return [2 /*return*/];
                    setLoading(true);
                    setMessage(null);
                    headers = ['ID', 'Name', 'Company', 'Email Address', 'Phone Number', 'Location', 'Status'];
                    rows = editableRejected.map(function (r) { return [
                        r.data.id,
                        r.data.name,
                        r.data.company,
                        r.data.email,
                        r.data.phone,
                        r.data.location,
                        r.data.status,
                    ].map(function (v) { return "\"".concat((v || '').replace(/"/g, '""'), "\""); }).join(','); });
                    retryCsvContent = __spreadArray([headers.join(',')], rows, true).join('\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/admin/api/hosts/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ csvContent: retryCsvContent }),
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data_1 = _a.sent();
                    if (!res.ok) {
                        setMessage({ type: 'error', text: data_1.message || 'Failed to import hosts.' });
                        return [2 /*return*/];
                    }
                    newRejectedRows_1 = Array.isArray(data_1.rejectedRows) ? data_1.rejectedRows : [];
                    // Update summary with new results
                    setSummary(function (prev) {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        if (!prev) {
                            return {
                                totalProcessed: (_a = data_1.totalProcessed) !== null && _a !== void 0 ? _a : 0,
                                inserted: (_b = data_1.inserted) !== null && _b !== void 0 ? _b : 0,
                                skipped: (_c = data_1.skipped) !== null && _c !== void 0 ? _c : 0,
                                rejected: (_d = data_1.rejected) !== null && _d !== void 0 ? _d : 0,
                                rejectedRows: newRejectedRows_1,
                                usersCreated: (_e = data_1.usersCreated) !== null && _e !== void 0 ? _e : 0,
                                usersSkipped: (_f = data_1.usersSkipped) !== null && _f !== void 0 ? _f : 0,
                                createdCredentials: Array.isArray(data_1.createdCredentials) ? data_1.createdCredentials : [],
                            };
                        }
                        return __assign(__assign({}, prev), { inserted: prev.inserted + ((_g = data_1.inserted) !== null && _g !== void 0 ? _g : 0), rejected: newRejectedRows_1.length, rejectedRows: newRejectedRows_1, usersCreated: prev.usersCreated + ((_h = data_1.usersCreated) !== null && _h !== void 0 ? _h : 0), createdCredentials: __spreadArray(__spreadArray([], prev.createdCredentials, true), (Array.isArray(data_1.createdCredentials) ? data_1.createdCredentials : []), true) });
                    });
                    setEditableRejected(newRejectedRows_1);
                    if (data_1.inserted > 0) {
                        setMessage({
                            type: 'success',
                            text: "Retry successful! ".concat(data_1.inserted, " more hosts imported, ").concat(data_1.usersCreated, " users created.").concat(newRejectedRows_1.length > 0 ? " ".concat(newRejectedRows_1.length, " still have issues.") : ''),
                        });
                    }
                    else if (newRejectedRows_1.length > 0) {
                        setMessage({
                            type: 'error',
                            text: "Still ".concat(newRejectedRows_1.length, " row(s) with issues. Please fix and retry."),
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    setMessage({ type: 'error', text: 'Network error while importing. Please try again.' });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var updateRejectedRow = function (index, field, value) {
        setEditableRejected(function (prev) {
            var _a;
            var updated = __spreadArray([], prev, true);
            updated[index] = __assign(__assign({}, updated[index]), { data: __assign(__assign({}, updated[index].data), (_a = {}, _a[field] = value, _a)) });
            return updated;
        });
    };
    var exportCredentials = function () {
        if (!summary || !summary.createdCredentials.length)
            return;
        var headers = ['Name', 'Email', 'Password', 'Company'];
        var rows = summary.createdCredentials.map(function (c) { return [
            "\"".concat(c.name.replace(/"/g, '""'), "\""),
            "\"".concat(c.email.replace(/"/g, '""'), "\""),
            "\"".concat(c.password, "\""),
            "\"".concat((c.company || '').replace(/"/g, '""'), "\""),
        ]; });
        var csvData = __spreadArray([headers.join(',')], rows.map(function (r) { return r.join(','); }), true).join('\n');
        var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "host-credentials-".concat(new Date().toISOString().split('T')[0], ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    var hasValidationErrors = validation && validation.rejectedRows.length > 0;
    var hasCredentials = summary && summary.createdCredentials && summary.createdCredentials.length > 0;
    var hasEditableRejected = editableRejected.length > 0;
    return (<design_system_1.Box p="xxl">
      <design_system_1.H3 mb="lg">Bulk Import Hosts</design_system_1.H3>

      <design_system_1.Text mb="md">
        Upload a CSV file containing host records. Required columns:
        <br />
        <strong>ID, Name, Company, Email Address, Phone Number (optional), Location, Status</strong>
      </design_system_1.Text>

      {/* File input */}
      <design_system_1.Box mb="lg" p="lg" bg="grey20" flex flexDirection="column" alignItems="center" justifyContent="center" style={{ borderRadius: '8px', border: '1px dashed #ccc' }}>
        <design_system_1.Icon icon="Upload" size={32} mb="md"/>
        <design_system_1.Text mb="sm">
          {selectedFileName ? "Selected: ".concat(selectedFileName) : 'Choose a CSV file to upload'}
        </design_system_1.Text>
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ marginTop: '8px' }}/>
        {validating && (<design_system_1.Box mt="md" flex alignItems="center">
            <design_system_1.Loader />
            <design_system_1.Text ml="sm">Validating...</design_system_1.Text>
          </design_system_1.Box>)}
      </design_system_1.Box>

      {/* Message */}
      {message && (<design_system_1.Box mb="lg">
          <design_system_1.MessageBox message={message.text} variant={message.type} onCloseClick={function () { return setMessage(null); }}/>
        </design_system_1.Box>)}

      {/* Validation Success */}
      {validation && !hasValidationErrors && (<design_system_1.Box mb="lg" p="lg" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <design_system_1.Text mb="md" fontWeight="bold" style={{ color: '#16a34a' }}>
            ✓ {validation.validRows} rows validated successfully
          </design_system_1.Text>
          <design_system_1.Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <design_system_1.Box p="sm" style={{ backgroundColor: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>{validation.newHosts}</design_system_1.Text>
              <design_system_1.Text style={{ fontSize: '12px', color: '#64748b' }}>New Hosts</design_system_1.Text>
            </design_system_1.Box>
            <design_system_1.Box p="sm" style={{ backgroundColor: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>{validation.existingHosts}</design_system_1.Text>
              <design_system_1.Text style={{ fontSize: '12px', color: '#64748b' }}>Existing Hosts</design_system_1.Text>
            </design_system_1.Box>
            <design_system_1.Box p="sm" style={{ backgroundColor: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{validation.usersToCreate}</design_system_1.Text>
              <design_system_1.Text style={{ fontSize: '12px', color: '#64748b' }}>Users to Create</design_system_1.Text>
            </design_system_1.Box>
          </design_system_1.Box>
        </design_system_1.Box>)}

      {/* Import button */}
      {!hasEditableRejected && (<design_system_1.Box mb="xl">
          <design_system_1.Button variant="primary" onClick={handleImport} disabled={!csvContent || loading || validating || hasValidationErrors}>
            {loading ? <design_system_1.Loader /> : (<>
                <design_system_1.Icon icon="PlayCircle" mr="sm"/>
                Start Import
              </>)}
          </design_system_1.Button>
        </design_system_1.Box>)}

      {/* Editable Rejected Rows */}
      {hasEditableRejected && (<design_system_1.Box mb="lg" p="lg" style={{ backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <design_system_1.Box flex justifyContent="space-between" alignItems="center" mb="md">
            <design_system_1.Text fontWeight="bold" style={{ color: '#dc2626' }}>
              {editableRejected.length} Row(s) with Issues - Edit and Retry:
            </design_system_1.Text>
            <design_system_1.Button variant="primary" size="sm" onClick={handleRetryRejected} disabled={loading}>
              {loading ? <design_system_1.Loader /> : (<>
                  <design_system_1.Icon icon="RefreshCw" mr="sm"/>
                  Retry Import ({editableRejected.length})
                </>)}
            </design_system_1.Button>
          </design_system_1.Box>
          <design_system_1.Box style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#fecaca' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Row</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Issue</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>ID</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Name</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Company</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Email</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Phone</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Location</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {editableRejected.map(function (row, idx) { return (<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fef2f2' }}>
                    <td style={{ padding: '6px', borderBottom: '1px solid #fecaca' }}>{row.rowNumber}</td>
                    <td style={{ padding: '6px', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: '11px' }}>{row.reason}</td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.id} onChange={function (e) { return updateRejectedRow(idx, 'id', e.target.value); }} style={{ width: '60px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.name} onChange={function (e) { return updateRejectedRow(idx, 'name', e.target.value); }} style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.company} onChange={function (e) { return updateRejectedRow(idx, 'company', e.target.value); }} style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.email} onChange={function (e) { return updateRejectedRow(idx, 'email', e.target.value); }} style={{ width: '140px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.phone} onChange={function (e) { return updateRejectedRow(idx, 'phone', e.target.value); }} style={{ width: '100px', padding: '4px', border: row.reason.includes('phone') ? '2px solid #dc2626' : '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input type="text" value={row.data.location} onChange={function (e) { return updateRejectedRow(idx, 'location', e.target.value); }} style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}/>
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <select value={row.data.status} onChange={function (e) { return updateRejectedRow(idx, 'status', e.target.value); }} style={{ padding: '4px', border: row.reason.toLowerCase().includes('status') ? '2px solid #dc2626' : '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>
                        {!row.data.status && <option value="">-- Select Status --</option>}
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </design_system_1.Box>
        </design_system_1.Box>)}

      {/* Import Summary */}
      {summary && (<design_system_1.Box p="lg" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <design_system_1.Text mb="md" fontWeight="bold">Import Summary</design_system_1.Text>
          <design_system_1.Box mb="md" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <design_system_1.Box p="md" style={{ backgroundColor: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{summary.totalProcessed}</design_system_1.Text>
              <design_system_1.Text style={{ color: '#64748b' }}>Total Processed</design_system_1.Text>
            </design_system_1.Box>
            <design_system_1.Box p="md" style={{ backgroundColor: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{summary.inserted}</design_system_1.Text>
              <design_system_1.Text style={{ color: '#64748b' }}>Hosts Inserted</design_system_1.Text>
            </design_system_1.Box>
            <design_system_1.Box p="md" style={{ backgroundColor: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
              <design_system_1.Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{summary.skipped}</design_system_1.Text>
              <design_system_1.Text style={{ color: '#64748b' }}>Skipped (existing)</design_system_1.Text>
            </design_system_1.Box>
          </design_system_1.Box>
          <design_system_1.Text mb="lg" style={{ color: '#64748b' }}>
            Users created: <strong>{summary.usersCreated}</strong> | Users skipped: <strong>{summary.usersSkipped}</strong>
          </design_system_1.Text>

          {/* Created Credentials */}
          {hasCredentials && (<design_system_1.Box mt="lg" p="lg" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <design_system_1.Box flex justifyContent="space-between" alignItems="center" mb="md">
                <design_system_1.Text fontWeight="bold" style={{ color: '#16a34a' }}>
                  {summary.createdCredentials.length} User Account(s) Created
                </design_system_1.Text>
                <design_system_1.Button variant="primary" size="sm" onClick={exportCredentials}>
                  <design_system_1.Icon icon="Download" mr="sm"/>
                  Export Credentials CSV
                </design_system_1.Button>
              </design_system_1.Box>
              <design_system_1.Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <design_system_1.Table>
                  <design_system_1.TableHead>
                    <design_system_1.TableRow>
                      <design_system_1.TableCell style={{ fontWeight: 'bold' }}>Name</design_system_1.TableCell>
                      <design_system_1.TableCell style={{ fontWeight: 'bold' }}>Email</design_system_1.TableCell>
                      <design_system_1.TableCell style={{ fontWeight: 'bold' }}>Password</design_system_1.TableCell>
                      <design_system_1.TableCell style={{ fontWeight: 'bold' }}>Company</design_system_1.TableCell>
                    </design_system_1.TableRow>
                  </design_system_1.TableHead>
                  <design_system_1.TableBody>
                    {summary.createdCredentials.map(function (cred, idx) { return (<design_system_1.TableRow key={idx}>
                        <design_system_1.TableCell>{cred.name}</design_system_1.TableCell>
                        <design_system_1.TableCell>{cred.email}</design_system_1.TableCell>
                        <design_system_1.TableCell>
                          <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                            {cred.password}
                          </code>
                        </design_system_1.TableCell>
                        <design_system_1.TableCell>{cred.company}</design_system_1.TableCell>
                      </design_system_1.TableRow>); })}
                  </design_system_1.TableBody>
                </design_system_1.Table>
              </design_system_1.Box>
              <design_system_1.Text mt="md" style={{ color: '#dc2626', fontSize: '12px' }}>
                ⚠️ Save these credentials now! Passwords cannot be retrieved later.
              </design_system_1.Text>
            </design_system_1.Box>)}
        </design_system_1.Box>)}
    </design_system_1.Box>);
};
exports.default = BulkImportHosts;
