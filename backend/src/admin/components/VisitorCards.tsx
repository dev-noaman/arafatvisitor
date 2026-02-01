import React, { useState, useEffect } from 'react';
import { Box, H2, H3, H4, Text, Button, Icon, Loader, Badge, Input } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

interface Visitor {
  id: string;
  sessionId: string;
  visitorName: string;
  visitorCompany: string;
  visitorPhone: string;
  visitorEmail?: string;
  hostName: string;
  hostCompany: string;
  purpose: string;
  checkInAt: string;
  qrToken?: string;
  qrDataUrl?: string;
}

const VisitorCards: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin/api/dashboard/current-visitors', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (error) {
      console.error('Failed to load visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (sessionId: string) => {
    setCheckingOut(sessionId);
    try {
      const res = await fetch(`/admin/api/dashboard/checkout/${sessionId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        loadVisitors();
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
    } finally {
      setCheckingOut(null);
    }
  };

  const handleSendQr = async (visitor: Visitor, method: 'whatsapp' | 'email') => {
    try {
      const res = await fetch('/admin/api/send-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          visitId: visitor.id,
          method,
        }),
      });
      if (res.ok) {
        alert(`QR sent via ${method}!`);
      } else {
        alert('Failed to send QR');
      }
    } catch (error) {
      console.error('Failed to send QR:', error);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      v.visitorName.toLowerCase().includes(searchLower) ||
      v.visitorCompany.toLowerCase().includes(searchLower) ||
      v.hostName.toLowerCase().includes(searchLower) ||
      v.visitorPhone.includes(search)
    );
  });

  if (loading) {
    return (
      <Box flex alignItems="center" justifyContent="center" height="400px">
        <Loader />
      </Box>
    );
  }

  return (
    <Box variant="grey" p="xxl">
      <Box flex justifyContent="space-between" alignItems="center" mb="xxl">
        <H2>Current Visitors ({visitors.length})</H2>
        <Box flex style={{ gap: '12px' }}>
          <Input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '250px' }}
          />
          <Button variant="primary" onClick={loadVisitors}>
            <Icon icon="RefreshCw" mr="sm" />
            Refresh
          </Button>
        </Box>
      </Box>

      {filteredVisitors.length === 0 ? (
        <Box
          bg="white"
          p="xxl"
          style={{ borderRadius: '8px', textAlign: 'center' }}
        >
          <Icon icon="Users" size={48} color="grey40" />
          <Text mt="lg" color="grey60">No visitors currently checked in</Text>
        </Box>
      ) : (
        <Box
          flex
          flexDirection="row"
          style={{ gap: '24px', flexWrap: 'wrap' }}
        >
          {filteredVisitors.map((visitor) => (
            <Box
              key={visitor.id}
              bg="white"
              p="xl"
              style={{
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* QR Code */}
              <Box
                flex
                justifyContent="center"
                mb="lg"
                p="md"
                bg="grey20"
                style={{ borderRadius: '8px' }}
              >
                {visitor.qrDataUrl ? (
                  <img
                    src={visitor.qrDataUrl}
                    alt="QR Code"
                    style={{ width: '150px', height: '150px' }}
                  />
                ) : (
                  <Box
                    flex
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <Icon icon="QrCode" size={64} color="grey40" />
                  </Box>
                )}
              </Box>

              {/* Visitor Info */}
              <H4 mb="sm">{visitor.visitorName}</H4>
              <Text color="grey60" mb="md">{visitor.visitorCompany}</Text>

              <Box flex flexDirection="column" style={{ gap: '8px' }} mb="lg">
                <Box flex alignItems="center" style={{ gap: '8px' }}>
                  <Icon icon="User" size={16} color="grey60" />
                  <Text fontSize="sm">Host: {visitor.hostName}</Text>
                </Box>
                <Box flex alignItems="center" style={{ gap: '8px' }}>
                  <Icon icon="Building" size={16} color="grey60" />
                  <Text fontSize="sm">Company: {visitor.hostCompany}</Text>
                </Box>
                <Box flex alignItems="center" style={{ gap: '8px' }}>
                  <Icon icon="Clock" size={16} color="grey60" />
                  <Text fontSize="sm">
                    Check-in: {new Date(visitor.checkInAt).toLocaleTimeString()}
                  </Text>
                </Box>
                <Box flex alignItems="center" style={{ gap: '8px' }}>
                  <Icon icon="FileText" size={16} color="grey60" />
                  <Text fontSize="sm">Purpose: {visitor.purpose}</Text>
                </Box>
              </Box>

              <Badge variant="success" mb="lg">CHECKED IN</Badge>

              {/* Actions */}
              <Box flex flexDirection="column" style={{ gap: '8px', marginTop: 'auto' }}>
                {/* Send QR buttons */}
                <Box flex style={{ gap: '8px' }}>
                  {visitor.visitorPhone && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSendQr(visitor, 'whatsapp')}
                      style={{ flex: 1 }}
                    >
                      <Icon icon="MessageCircle" mr="sm" size={14} />
                      WhatsApp
                    </Button>
                  )}
                  {visitor.visitorEmail && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleSendQr(visitor, 'email')}
                      style={{ flex: 1 }}
                    >
                      <Icon icon="Mail" mr="sm" size={14} />
                      Email
                    </Button>
                  )}
                </Box>

                {/* Check out button */}
                <Button
                  variant="danger"
                  onClick={() => handleCheckout(visitor.sessionId)}
                  disabled={checkingOut === visitor.sessionId}
                >
                  {checkingOut === visitor.sessionId ? (
                    <Loader />
                  ) : (
                    <>
                      <Icon icon="LogOut" mr="sm" />
                      Check Out
                    </>
                  )}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default VisitorCards;
