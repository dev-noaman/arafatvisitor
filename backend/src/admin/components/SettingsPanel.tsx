import React, { useState, useEffect } from 'react';
import { Box, H2, H3, H4, Text, Button, Input, Label, Icon, Loader, MessageBox, Badge } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

interface SettingsData {
  site: {
    name: string;
    timezone: string;
  };
  whatsapp: {
    enabled: boolean;
    provider: string;
    configured: boolean;
  };
  smtp: {
    enabled: boolean;
    host: string;
    port?: number;
    user?: string;
    from?: string;
    configured: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

interface SmtpForm {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
}

const SettingsPanel: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmailInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingSmtp, setEditingSmtp] = useState(false);
  const [smtpForm, setSmtpForm] = useState<SmtpForm>({
    enabled: false,
    host: '',
    port: '587',
    user: '',
    pass: '',
    from: '',
  });

  const role = (currentAdmin as any)?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin/api/settings', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWhatsapp = async () => {
    if (!testPhone) {
      setMessage({ type: 'error', text: 'Please enter a phone number' });
      return;
    }

    setTestingWhatsapp(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/settings/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: testPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Test WhatsApp message sent successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send test message' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setTestingWhatsapp(false);
    }
  };

  const testSmtp = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setTestingEmail(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Test email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setTestingEmail(false);
    }
  };

  const startEditingSmtp = () => {
    setSmtpForm({
      enabled: settings?.smtp?.enabled || false,
      host: settings?.smtp?.host || '',
      port: String(settings?.smtp?.port || '587'),
      user: settings?.smtp?.user || '',
      pass: '',
      from: settings?.smtp?.from || '',
    });
    setEditingSmtp(true);
  };

  const saveSmtpSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          smtp: {
            enabled: smtpForm.enabled,
            host: smtpForm.host,
            port: parseInt(smtpForm.port, 10),
            user: smtpForm.user,
            pass: smtpForm.pass || undefined,
            from: smtpForm.from,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'SMTP settings saved successfully!' });
        setEditingSmtp(false);
        loadSettings(); // Reload settings
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSmtpEnabled = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          smtp: {
            enabled: !settings?.smtp?.enabled,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `SMTP ${!settings?.smtp?.enabled ? 'enabled' : 'disabled'} successfully!` });
        loadSettings();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box p="xxl">
        <MessageBox message="You don't have permission to access settings." variant="error" />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box flex alignItems="center" justifyContent="center" height="100vh">
        <Loader />
      </Box>
    );
  }

  return (
    <Box variant="grey" p="xxl">
      <H2 mb="xxl">Settings</H2>

      <Text color="grey60" mb="xxl">
        Settings are stored in the .env file. To change settings, edit the .env file and restart the server.
      </Text>

      {message && (
        <Box
          mb="xl"
          p="lg"
          style={{
            borderRadius: '8px',
            backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: message.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
            {message.type === 'error' ? '❌ ' : '✅ '}{message.text}
          </Text>
          <Button variant="text" size="sm" onClick={() => setMessage(null)}>✕</Button>
        </Box>
      )}

      {/* Site Settings */}
      <Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H3 mb="lg">
          <Icon icon="Home" mr="sm" />
          Site Settings
        </H3>
        <Box flex flexDirection="column" style={{ gap: '12px' }}>
          <Box flex justifyContent="space-between">
            <Text fontWeight="bold">Site Name:</Text>
            <Text>{settings?.site?.name || 'Arafat VMS'}</Text>
          </Box>
          <Box flex justifyContent="space-between">
            <Text fontWeight="bold">Timezone:</Text>
            <Text>{settings?.site?.timezone || 'Asia/Qatar'}</Text>
          </Box>
        </Box>
      </Box>

      {/* WhatsApp Settings */}
      <Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H3 mb="lg">
          <Icon icon="MessageCircle" mr="sm" />
          WhatsApp Settings
        </H3>
        <Box flex flexDirection="column" style={{ gap: '12px' }}>
          <Box flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Status:</Text>
            <Badge variant={settings?.whatsapp?.configured ? 'success' : 'danger'}>
              {settings?.whatsapp?.configured ? 'Configured' : 'Not Configured'}
            </Badge>
          </Box>
          <Box flex justifyContent="space-between">
            <Text fontWeight="bold">Provider:</Text>
            <Text>{settings?.whatsapp?.provider || 'wbiztool'}</Text>
          </Box>
          <Box flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Enabled:</Text>
            <Badge variant={settings?.whatsapp?.enabled ? 'success' : 'secondary'}>
              {settings?.whatsapp?.enabled ? 'Yes' : 'No'}
            </Badge>
          </Box>
        </Box>
        
        {settings?.whatsapp?.configured && (
          <Box mt="lg" pt="lg" style={{ borderTop: '1px solid #e5e7eb' }}>
            <H4 mb="md">Test WhatsApp</H4>
            <Box flex style={{ gap: '12px' }}>
              <Input
                type="tel"
                placeholder="Phone number (e.g., +974xxxxxxxx)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                variant="success"
                onClick={testWhatsapp}
                disabled={testingWhatsapp}
              >
                {testingWhatsapp ? <Loader /> : 'Send Test'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* SMTP Settings */}
      <Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Box flex justifyContent="space-between" alignItems="center" mb="lg">
          <H3 style={{ margin: 0 }}>
            <Icon icon="Mail" mr="sm" />
            SMTP Settings
          </H3>
          {!editingSmtp && (
            <Button variant="text" onClick={startEditingSmtp}>
              <Icon icon="Edit" mr="sm" />
              Edit
            </Button>
          )}
        </Box>

        {editingSmtp ? (
          <Box flex flexDirection="column" style={{ gap: '16px' }}>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>Enabled:</Label>
              <Button
                variant={smtpForm.enabled ? 'success' : 'secondary'}
                size="sm"
                onClick={() => setSmtpForm({ ...smtpForm, enabled: !smtpForm.enabled })}
              >
                {smtpForm.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </Box>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>Host:</Label>
              <Input
                value={smtpForm.host}
                onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                placeholder="smtp.example.com"
                style={{ flex: 1 }}
              />
            </Box>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>Port:</Label>
              <Input
                value={smtpForm.port}
                onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                placeholder="587"
                style={{ width: '100px' }}
              />
            </Box>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>User:</Label>
              <Input
                value={smtpForm.user}
                onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                placeholder="user@example.com"
                style={{ flex: 1 }}
              />
            </Box>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>Password:</Label>
              <Input
                type="password"
                value={smtpForm.pass}
                onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                placeholder="Leave blank to keep current"
                style={{ flex: 1 }}
              />
            </Box>
            <Box flex alignItems="center" style={{ gap: '12px' }}>
              <Label style={{ width: '100px' }}>From:</Label>
              <Input
                value={smtpForm.from}
                onChange={(e) => setSmtpForm({ ...smtpForm, from: e.target.value })}
                placeholder="noreply@example.com"
                style={{ flex: 1 }}
              />
            </Box>
            <Box flex style={{ gap: '12px', marginTop: '8px' }}>
              <Button variant="primary" onClick={saveSmtpSettings} disabled={saving}>
                {saving ? <Loader /> : 'Save Settings'}
              </Button>
              <Button variant="text" onClick={() => setEditingSmtp(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box flex flexDirection="column" style={{ gap: '12px' }}>
              <Box flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Status:</Text>
                <Badge variant={settings?.smtp?.configured ? 'success' : 'danger'}>
                  {settings?.smtp?.configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </Box>
              <Box flex justifyContent="space-between">
                <Text fontWeight="bold">Host:</Text>
                <Text>{settings?.smtp?.host || 'Not set'}</Text>
              </Box>
              <Box flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Enabled:</Text>
                <Box flex alignItems="center" style={{ gap: '8px' }}>
                  <Badge variant={settings?.smtp?.enabled ? 'success' : 'secondary'}>
                    {settings?.smtp?.enabled ? 'Yes' : 'No'}
                  </Badge>
                  <Button
                    variant={settings?.smtp?.enabled ? 'danger' : 'success'}
                    size="sm"
                    onClick={toggleSmtpEnabled}
                    disabled={saving || !settings?.smtp?.configured}
                  >
                    {settings?.smtp?.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </Box>
              </Box>
            </Box>

            {settings?.smtp?.configured && (
              <Box mt="lg" pt="lg" style={{ borderTop: '1px solid #e5e7eb' }}>
                <H4 mb="md">Test Email</H4>
                <Box flex style={{ gap: '12px' }}>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={testEmail}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="primary"
                    onClick={testSmtp}
                    disabled={testingEmail}
                  >
                    {testingEmail ? <Loader /> : 'Send Test'}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Maintenance Mode */}
      <Box bg="white" p="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H3 mb="lg">
          <Icon icon="Tool" mr="sm" />
          Maintenance Mode
        </H3>
        <Box flex flexDirection="column" style={{ gap: '12px' }}>
          <Box flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Status:</Text>
            <Badge variant={settings?.maintenance?.enabled ? 'danger' : 'success'}>
              {settings?.maintenance?.enabled ? 'ACTIVE' : 'Inactive'}
            </Badge>
          </Box>
          <Box flex justifyContent="space-between">
            <Text fontWeight="bold">Message:</Text>
            <Text>{settings?.maintenance?.message || 'System under maintenance'}</Text>
          </Box>
        </Box>
      </Box>

      {/* Instructions */}
      <Box mt="xxl" p="xl" bg="grey20" style={{ borderRadius: '8px' }}>
        <H4 mb="md">How to Update Settings</H4>
        <Text mb="sm">To change these settings, edit the following environment variables in your .env file:</Text>
        <Box as="pre" p="md" bg="grey40" style={{ borderRadius: '4px', overflow: 'auto' }}>
          <Text as="code" style={{ fontFamily: 'monospace' }}>
{`# Site Settings
SITE_NAME=Arafat VMS
SITE_TIMEZONE=Asia/Qatar

# WhatsApp Settings
WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://api.wbiztool.com
WHATSAPP_API_TOKEN=your-token

# SMTP Settings
SMTP_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=System under maintenance`}
          </Text>
        </Box>
        <Text mt="md" color="grey60">After editing the .env file, restart the server for changes to take effect.</Text>
      </Box>
    </Box>
  );
};

export default SettingsPanel;
