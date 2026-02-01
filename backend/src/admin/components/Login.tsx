import React, { useState } from 'react';
import { Box, Label, Input, Button, Text, MessageBox } from '@adminjs/design-system';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('/admin/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '24px',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <Text
          as="h1"
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '16px',
          }}
        >
          Login to Your Account
        </Text>

        <Box
          as="form"
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Indigo accent bar */}
          <Box
            style={{
              height: '8px',
              background: 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)',
            }}
          />

          <Box style={{ padding: '24px 32px' }}>
            {error && (
              <MessageBox
                message={error}
                variant="danger"
                style={{ marginBottom: '16px' }}
              />
            )}

            <Box mb="lg">
              <Label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Username or Email
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </Box>

            <Box mb="lg">
              <Label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Password
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </Box>

            <Box flex flexDirection="column" alignItems="center" style={{ gap: '16px', marginTop: '16px' }}>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Signing in...' : 'Submit'}
              </Button>
              <Text
                as="a"
                href="#"
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
