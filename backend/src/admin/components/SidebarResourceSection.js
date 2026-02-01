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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var design_system_1 = require("@adminjs/design-system");
var react_router_1 = require("react-router");
var react_redux_1 = require("react-redux");
var adminjs_1 = require("adminjs");
// Inline styles
var styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        color: '#64748b',
        backgroundColor: 'transparent',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
        transition: 'all 0.15s ease',
    },
    menuItemSelected: {
        color: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderLeft: '3px solid #3b82f6',
    },
    separator: {
        border: '0',
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '12px 16px',
    },
    icon: {
        width: '18px',
        height: '18px',
        flexShrink: 0,
    },
    label: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};
/**
 * Flat sidebar menu without navigation groups
 * Role-based visibility:
 * - ADMIN: sees all items
 * - HOST: hides Users, Audit Log, Settings
 * - RECEPTION: hides Users, Audit Log, Settings
 */
var SidebarResourceSection = function () {
    var navigate = (0, react_router_1.useNavigate)();
    var location = (0, react_router_1.useLocation)();
    var pages = (0, react_redux_1.useSelector)(function (state) { return state.pages; }) || [];
    var rootPath = (0, react_redux_1.useSelector)(function (state) { var _a; return (_a = state.paths) === null || _a === void 0 ? void 0 : _a.rootPath; }) || '/admin';
    var currentAdmin = (0, adminjs_1.useCurrentAdmin)()[0];
    var userRole = (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) || 'RECEPTION';
    var isSelected = function (path) {
        if (path === rootPath) {
            return location.pathname === rootPath || location.pathname === "".concat(rootPath, "/");
        }
        return location.pathname.startsWith(path);
    };
    var handleClick = function (path) { return function (e) {
        e.preventDefault();
        navigate(path);
    }; };
    // Get page icons
    var getPageIcon = function (name) {
        var page = pages.find(function (p) { return p.name === name; });
        return (page === null || page === void 0 ? void 0 : page.icon) || 'File';
    };
    // Menu items configuration
    var topMenuItems = [
        { id: 'Dashboard', label: 'Dashboard', icon: 'Home', href: rootPath },
        { id: 'Hosts', label: 'Hosts', icon: 'Briefcase', href: "".concat(rootPath, "/resources/Hosts") },
        { id: 'Deliveries', label: 'Deliveries', icon: 'Package', href: "".concat(rootPath, "/resources/Deliveries") },
        { id: 'Visitors', label: 'Visitors', icon: 'UserCheck', href: "".concat(rootPath, "/resources/Visitors") },
        { id: 'PreRegister', label: 'Pre Register', icon: 'Calendar', href: "".concat(rootPath, "/resources/PreRegister") },
    ];
    // Admin-only items (hidden from HOST and RECEPTION)
    // Reports is visible to all roles (HOST sees only their company, RECEPTION sees all)
    var adminOnlyItems = ['Users', 'AuditLog', 'Settings'];
    var allBottomMenuItems = [
        { id: 'Users', label: 'Users', icon: 'Users', href: "".concat(rootPath, "/resources/Users") },
        { id: 'AuditLog', label: 'Audit Log', icon: 'FileText', href: "".concat(rootPath, "/resources/AuditLog") },
        { id: 'Reports', label: 'Reports', icon: getPageIcon('Reports') || 'BarChart2', href: "".concat(rootPath, "/pages/Reports") },
        { id: 'Settings', label: 'Settings', icon: getPageIcon('Settings') || 'Settings', href: "".concat(rootPath, "/pages/Settings") },
    ];
    // Filter bottom menu items based on role
    var bottomMenuItems = userRole === 'ADMIN'
        ? allBottomMenuItems
        : allBottomMenuItems.filter(function (item) { return !adminOnlyItems.includes(item.id); });
    var getMenuItemStyle = function (selected) { return (__assign(__assign({}, styles.menuItem), (selected ? styles.menuItemSelected : {}))); };
    return (<div style={styles.container}>
      {topMenuItems.map(function (item) { return (<a key={item.id} href={item.href} style={getMenuItemStyle(isSelected(item.href))} onClick={handleClick(item.href)}>
          <design_system_1.Icon icon={item.icon}/>
          <span style={styles.label}>{item.label}</span>
        </a>); })}

      <hr style={styles.separator}/>

      {bottomMenuItems.map(function (item) { return (<a key={item.id} href={item.href} style={getMenuItemStyle(isSelected(item.href))} onClick={handleClick(item.href)}>
          <design_system_1.Icon icon={item.icon}/>
          <span style={styles.label}>{item.label}</span>
        </a>); })}
    </div>);
};
exports.default = SidebarResourceSection;
