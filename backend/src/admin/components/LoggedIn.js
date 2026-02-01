"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var design_system_1 = require("@adminjs/design-system");
/**
 * Override AdminJS LoggedIn to add:
 * - Edit Profile, Change Password, and Logout in the user dropdown
 */
var LoggedIn = function (_a) {
    var session = _a.session, paths = _a.paths;
    var rootPath = paths.rootPath || '/admin';
    var dropActions = [
        {
            label: 'Edit Profile',
            onClick: function (event) {
                event.preventDefault();
                window.location.href = "".concat(rootPath, "/pages/EditProfile");
            },
            icon: 'User',
        },
        {
            label: 'Change Password',
            onClick: function (event) {
                event.preventDefault();
                window.location.href = "".concat(rootPath, "/pages/ChangePassword");
            },
            icon: 'Key',
        },
        {
            label: 'Sign Out',
            onClick: function (event) {
                event.preventDefault();
                window.location.href = paths.logoutPath;
            },
            icon: 'LogOut',
        },
    ];
    return (<design_system_1.Box display="flex" alignItems="center" flexShrink={0} data-css="logged-in" style={{ gap: '12px' }}>
      <design_system_1.CurrentUserNav name={session.name || session.email} title={session.title || session.email} avatarUrl={session.avatarUrl} dropActions={dropActions}/>
    </design_system_1.Box>);
};
exports.default = LoggedIn;
