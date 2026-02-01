"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Override SidebarPages:
 * - Return null to completely hide the default pages section
 * - Reports and Settings are shown under System via SidebarResourceSection
 */
var SidebarPages = function () {
    // Return null - all pages are handled by SidebarResourceSection
    return null;
};
exports.default = SidebarPages;
