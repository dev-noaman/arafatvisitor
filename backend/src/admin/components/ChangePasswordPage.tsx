import React, { useState } from 'react';
import { Box, H2, H3, Text, Button, Input, Label, MessageBox, Loader } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

/**
 * Change Password page - accessible from sidebar for any logged-in user.
 * Uses currentAdmin.email from AdminJS session to identify the user.
 */
const ChangePasswordPage: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userEmail = (currentAdmin as any)?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      setMessage({ type: 'error', text: 'You must be logged in to change password.' });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <Box variant="grey" p="xxl">
        <H2 mb="lg">Change Password</H2>
        <MessageBox message="You must be logged in to change your password." variant="error" />
      </Box>
    );
  }

  return (
    <Box variant="grey" p="xxl">
      <H2 mb="sm">Change Password</H2>
      <Text color="grey60" mb="xxl">
        Update your password for account: {userEmail}
      </Text>

      {message && (
        <Box mb="xl">
          <MessageBox
            message={message.text}
            variant={message.type}
            onCloseClick={() => setMessage(null)}
          />
        </Box>
      )}

      <Box
        bg="white"
        p="xxl"
        style={{ borderRadius: '8px', maxWidth: '400px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <form onSubmit={handleSubmit}>
          <Box mb="lg">
            <Label required>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
            />
          </Box>

          <Box mb="lg">
            <Label required>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              disabled={loading}
            />
          </Box>

          <Box mb="xl">
            <Label required>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
            />
          </Box>

          <Button type="submit" variant="primary" disabled={loading} style={{ minWidth: '140px' }}>
            {loading ? <Loader /> : 'Change Password'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
