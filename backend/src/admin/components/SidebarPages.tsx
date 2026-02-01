import React from 'react';

type Page = { name: string; icon?: string };
type Props = {
  pages?: Page[];
  OriginalComponent?: React.ComponentType<any>;
};

/**
 * Override SidebarPages:
 * - Return null to completely hide the default pages section
 * - Reports and Settings are shown under System via SidebarResourceSection
 */
const SidebarPages: React.FC<Props> = () => {
  // Return null - all pages are handled by SidebarResourceSection
  return null;
};

export default SidebarPages;
