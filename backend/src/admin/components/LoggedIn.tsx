import React from 'react';
import { CurrentUserNav, Box } from '@adminjs/design-system';

/**
 * Override AdminJS LoggedIn to add:
 * - Edit Profile, Change Password, and Logout in the user dropdown
 */
const LoggedIn: React.FC<{
  session: { email: string; title?: string; avatarUrl?: string; name?: string };
  paths: { logoutPath: string; rootPath?: string };
}> = ({ session, paths }) => {
  const rootPath = paths.rootPath || '/admin';

  const dropActions = [
    {
      label: 'Edit Profile',
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        window.location.href = `${rootPath}/pages/EditProfile`;
      },
      icon: 'User',
    },
    {
      label: 'Change Password',
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        window.location.href = `${rootPath}/pages/ChangePassword`;
      },
      icon: 'Key',
    },
    {
      label: 'Sign Out',
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        window.location.href = paths.logoutPath;
      },
      icon: 'LogOut',
    },
  ];

  return (
    <Box
      display="flex"
      alignItems="center"
      flexShrink={0}
      data-css="logged-in"
      style={{ gap: '12px' }}
    >
      <CurrentUserNav
        name={session.name || session.email}
        title={session.title || session.email}
        avatarUrl={session.avatarUrl}
        dropActions={dropActions}
      />
    </Box>
  );
};

export default LoggedIn;
