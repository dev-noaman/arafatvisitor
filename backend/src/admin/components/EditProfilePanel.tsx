import React, { useEffect, useState } from 'react';
import { Box, H2, Text, Input, Button, Label, Loader } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

interface ProfileData {
  name: string;
  email: string;
  role: string;
}

const EditProfilePanel: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  
  const email = (currentAdmin as any)?.email || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/admin/api/profile?email=${encodeURIComponent(email)}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setName(data.name || '');
        }
      } finally {
        setLoading(false);
      }
    };
    if (email) load();
  }, [email]);

  const save = async () => {
    if (!email) return;
    setSaving(true);
    try {
      const res = await fetch('/admin/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box flex alignItems="center" justifyContent="center" height="70vh">
        <Loader />
      </Box>
    );
  }

  return (
    <Box variant="grey" p="xxl" style={{ maxWidth: 640 }}>
      <H2>Edit Profile</H2>
      <Box mt="xl">
        <Label>Full Name</Label>
        <Input value={name} onChange={(e: any) => setName(e.target.value)} />
      </Box>
      <Box mt="lg">
        <Label>Email</Label>
        <Input value={profile?.email || ''} disabled />
      </Box>
      
      <Box mt="xl" flex>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Text ml="lg" color="grey60">Role: {(profile as any)?.role || 'N/A'}</Text>
      </Box>
    </Box>
  );
};

export default EditProfilePanel;
