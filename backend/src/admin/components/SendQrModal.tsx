import React, { useState, useEffect } from 'react';
import { Box, H3, H4, Text, Button, Icon, Loader, MessageBox } from '@adminjs/design-system';
import { ActionProps } from 'adminjs';

const SendQrModal: React.FC<ActionProps> = (props) => {
  const { record } = props;
  const [loading, setLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visitId = record?.params?.id;
  const visitorName = record?.params?.visitorName || 'Visitor';
  const visitorPhone = record?.params?.visitorPhone;
  const visitorEmail = record?.params?.visitorEmail;

  useEffect(() => {
    // Load QR code image
    const loadQrCode = async () => {
      try {
        const res = await fetch(`/admin/api/qr/${visitId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setQrImageUrl(data.qrDataUrl);
        }
      } catch (error) {
        console.error('Failed to load QR code:', error);
      }
    };

    if (visitId) {
      loadQrCode();
    }
  }, [visitId]);

  const handleSend = async (method: 'whatsapp' | 'email') => {
    if (!visitId) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/admin/api/send-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          visitId,
          method,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `QR code sent via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'} successfully!`,
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to send QR code',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="xxl">
      <H3 mb="xl">Send QR Code</H3>
      
      <Box mb="xl">
        <Text mb="sm" fontWeight="bold">Visitor: {visitorName}</Text>
        {visitorPhone && <Text mb="sm">Phone: {visitorPhone}</Text>}
        {visitorEmail && <Text mb="sm">Email: {visitorEmail}</Text>}
      </Box>

      {/* QR Code Preview */}
      <Box
        mb="xl"
        flex
        flexDirection="column"
        alignItems="center"
        p="xl"
        bg="grey20"
        style={{ borderRadius: '8px' }}
      >
        <H4 mb="lg">QR Code Preview</H4>
        {qrImageUrl ? (
          <img
            src={qrImageUrl}
            alt="QR Code"
            style={{ width: '200px', height: '200px', background: 'white', padding: '16px', borderRadius: '8px' }}
          />
        ) : (
          <Box flex alignItems="center" justifyContent="center" style={{ width: '200px', height: '200px' }}>
            <Loader />
          </Box>
        )}
      </Box>

      {/* Message */}
      {message && (
        <Box mb="xl">
          <MessageBox
            message={message.text}
            variant={message.type}
            onCloseClick={() => setMessage(null)}
          />
        </Box>
      )}

      {/* Send Options */}
      <Box flex flexDirection="column" style={{ gap: '12px' }}>
        <Text fontWeight="bold" mb="sm">Send QR Code via:</Text>
        
        {/* WhatsApp Option */}
        <Button
          variant="success"
          disabled={!visitorPhone || loading}
          onClick={() => handleSend('whatsapp')}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <Loader />
          ) : (
            <>
              <Icon icon="MessageCircle" mr="sm" />
              Send via WhatsApp
              {!visitorPhone && <Text ml="sm" fontSize="sm">(No phone number)</Text>}
            </>
          )}
        </Button>

        {/* Email Option */}
        <Button
          variant="primary"
          disabled={!visitorEmail || loading}
          onClick={() => handleSend('email')}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <Loader />
          ) : (
            <>
              <Icon icon="Mail" mr="sm" />
              Send via Email
              {!visitorEmail && <Text ml="sm" fontSize="sm">(No email)</Text>}
            </>
          )}
        </Button>
      </Box>

      {/* No contact info warning */}
      {!visitorPhone && !visitorEmail && (
        <Box mt="xl">
          <MessageBox
            message="No contact information available for this visitor. Please add phone or email to send the QR code."
            variant="warning"
          />
        </Box>
      )}
    </Box>
  );
};

export default SendQrModal;
