// AdminJS Custom Scripts
// Force light mode (no toggle), sidebar always open

(function () {
  'use strict';

  // ========================================
  // FORCE LIGHT MODE PERMANENTLY
  // ========================================

  function forceLightMode() {
    try {
      // Remove dark class
      document.documentElement.classList.remove('dark');
      // Set light mode in storage
      localStorage.setItem('adminjs-theme-preference', 'light');
    } catch (e) { }
  }

  // ========================================
  // HIDE LIGHT/DARK MODE TOGGLE COMPLETELY
  // ========================================

  function hideThemeToggle() {
    try {
      // Target only standalone buttons with exactly "Dark" or "Light" text
      // Be careful not to hide user dropdown or other elements
      document.querySelectorAll('button').forEach(function (btn) {
        var text = btn.textContent ? btn.textContent.trim() : '';

        // Only hide if button text is exactly "Dark" or "Light" (theme toggle)
        if (text === 'Dark' || text === 'Light') {
          // Make sure it's not inside the user dropdown (logged-in area)
          var isInUserMenu = btn.closest('[data-css="logged-in"]') ||
                             btn.closest('[class*="CurrentUserNav"]') ||
                             btn.closest('[class*="Dropdown"]');
          if (!isInUserMenu) {
            btn.style.setProperty('display', 'none', 'important');
          }
        }
      });

      // Also find spans with Dark/Light that might be labels for theme toggle
      document.querySelectorAll('span').forEach(function (span) {
        var text = span.textContent ? span.textContent.trim() : '';
        if (text === 'Dark' || text === 'Light' || text === 'Dark Mode' || text === 'Light Mode') {
          // Check if this is NOT in user dropdown area
          var isInUserMenu = span.closest('[data-css="logged-in"]') ||
                             span.closest('[class*="CurrentUserNav"]') ||
                             span.closest('[class*="Dropdown"]') ||
                             span.closest('[role="menu"]');
          if (!isInUserMenu) {
            // Find parent button or small container and hide it
            var btn = span.closest('button');
            if (btn) {
              btn.style.setProperty('display', 'none', 'important');
            } else {
              // Hide the span and nearby toggle element
              var parent = span.parentElement;
              if (parent) {
                var rect = parent.getBoundingClientRect();
                // Only hide if it's a small toggle-like container
                if (rect.width < 200 && rect.height < 100) {
                  parent.style.setProperty('display', 'none', 'important');
                }
              }
            }
          }
        }
      });

      // Hide any right-side theme panel
      document.querySelectorAll('[data-css="right-sidebar"], [class*="RightSidebar"]').forEach(function (el) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('width', '0', 'important');
      });
    } catch (e) { }
  }

  // ========================================
  // FORCE SIDEBAR OPEN (Apply hamburger action by default)
  // ========================================

  function forceSidebarOpen() {
    try {
      var sidebar = document.querySelector('[data-css="sidebar"]');

      if (sidebar) {
        // Remove any collapsed/hidden state
        sidebar.classList.remove('collapsed', 'hidden', 'closed');

        // Force sidebar to be visible via inline styles
        sidebar.style.setProperty('transform', 'translateX(0)', 'important');
        sidebar.style.setProperty('display', 'flex', 'important');
        sidebar.style.setProperty('visibility', 'visible', 'important');
        sidebar.style.setProperty('opacity', '1', 'important');
        sidebar.style.setProperty('position', 'relative', 'important');
        sidebar.style.setProperty('left', '0', 'important');
        sidebar.style.setProperty('width', '240px', 'important');
        sidebar.style.setProperty('min-width', '240px', 'important');
        sidebar.style.setProperty('flex-shrink', '0', 'important');
      }

      // Hide the hamburger button completely
      var hamburgerSelectors = [
        'button[data-css="hamburger"]',
        '[data-css="topbar"] button:first-child',
        'header button:first-child',
        'nav button:first-child'
      ];

      hamburgerSelectors.forEach(function (selector) {
        var btn = document.querySelector(selector);
        if (btn) {
          var svg = btn.querySelector('svg');
          // Check if it's a hamburger (menu) button by looking at SVG content
          if (svg && btn.getBoundingClientRect().width < 60) {
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
          }
        }
      });

      // Find hamburger by SVG pattern (3 horizontal lines)
      document.querySelectorAll('button').forEach(function (btn) {
        var svg = btn.querySelector('svg');
        if (svg) {
          var rect = btn.getBoundingClientRect();
          // Small square button likely hamburger
          if (rect.width > 20 && rect.width < 60 && rect.height > 20 && rect.height < 60) {
            var lines = svg.querySelectorAll('line');
            // Hamburger icon typically has 3 lines
            if (lines.length === 3) {
              btn.style.setProperty('display', 'none', 'important');
            }
          }
        }
      });
    } catch (e) { }
  }

  // ========================================
  // CLEAN UP ANY STALE NAVIGATION ELEMENTS
  // ========================================

  function cleanupNavigation() {
    try {
      var sidebar = document.querySelector('[data-css="sidebar"]');
      if (!sidebar) return;

      // Hide any navigation group labels that might still appear
      sidebar.querySelectorAll('label, [class*="Label"]').forEach(function (label) {
        var text = label.textContent ? label.textContent.trim().toUpperCase() : '';
        if (text === 'OPERATIONS' || text === 'SYSTEM' || text === 'PAGES' || text === 'NAVIGATION') {
          label.style.setProperty('display', 'none', 'important');
        }
      });
    } catch (e) { }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function init() {
    forceLightMode();
    forceSidebarOpen();
    hideThemeToggle();
    cleanupNavigation();
  }

  // Run immediately
  forceLightMode();

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Run after React hydration - use setInterval to catch SPA updates
  setInterval(init, 1000);
})();
