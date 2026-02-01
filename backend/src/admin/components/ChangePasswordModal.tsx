import React, { useState } from 'react';
import { Box, H3, Text, Button, Input, Label, MessageBox, Loader } from '@adminjs/design-system';

interface ChangePasswordModalProps {
  onClose?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close modal after success
        if (onClose) {
          setTimeout(onClose, 2000);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="xxl" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <H3 mb="xl">Change Password</H3>

      {message && (
        <Box mb="xl">
          <MessageBox
            message={message.text}
            variant={message.type}
            onCloseClick={() => setMessage(null)}
          />
        </Box>
      )}

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
            placeholder="Enter new password"
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

        <Box flex style={{ gap: '12px' }}>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? <Loader /> : 'Change Password'}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="text"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ChangePasswordModal;
