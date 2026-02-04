import React, { useState, useEffect } from "react";
import {
  Box,
  H3,
  H4,
  Text,
  Button,
  Icon,
  Loader,
  Badge,
} from "@adminjs/design-system";
import { ActionProps } from "adminjs";

// Info card component
const InfoItem: React.FC<{
  icon: string;
  label: string;
  value: string;
  color?: string;
}> = ({ icon, label, value, color = "#6366F1" }) => (
  <Box flex alignItems="center" style={{ gap: "12px" }}>
    <Box
      flex
      alignItems="center"
      justifyContent="center"
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: `${color}15`,
      }}
    >
      <Icon icon={icon as any} color={color} size={18} />
    </Box>
    <Box>
      <Text style={{ fontSize: "11px", color: "#6B7280", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
        {value}
      </Text>
    </Box>
  </Box>
);

// Send option card component
const SendOptionCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  disabled: boolean;
  disabledReason?: string;
  loading: boolean;
  onClick: () => void;
}> = ({ icon, title, subtitle, color, gradient, disabled, disabledReason, loading, onClick }) => (
  <Box
    p="lg"
    style={{
      backgroundColor: disabled ? "#F3F4F6" : "white",
      borderRadius: "16px",
      border: `2px solid ${disabled ? "#E5E7EB" : color}`,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      opacity: disabled ? 0.6 : 1,
    }}
    onClick={disabled || loading ? undefined : onClick}
  >
    <Box flex alignItems="center" style={{ gap: "16px" }}>
      <Box
        flex
        alignItems="center"
        justifyContent="center"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: disabled ? "#E5E7EB" : gradient,
          flexShrink: 0,
        }}
      >
        {loading ? (
          <Loader />
        ) : (
          <Icon icon={icon as any} color="white" size={28} />
        )}
      </Box>
      <Box style={{ flex: 1 }}>
        <Text style={{ fontSize: "16px", fontWeight: 600, color: disabled ? "#9CA3AF" : "#111827" }}>
          {title}
        </Text>
        <Text style={{ fontSize: "13px", color: disabled ? "#D1D5DB" : "#6B7280", marginTop: "2px" }}>
          {disabled && disabledReason ? disabledReason : subtitle}
        </Text>
      </Box>
      {!disabled && !loading && (
        <Icon icon="ChevronRight" color={color} size={24} />
      )}
    </Box>
  </Box>
);

const SendQrModal: React.FC<ActionProps> = (props) => {
  const { record } = props;
  const [loading, setLoading] = useState<"whatsapp" | "email" | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const visitId = record?.params?.id;
  const visitorName = record?.params?.visitorName || "Visitor";
  const visitorCompany = record?.params?.visitorCompany || "";
  const visitorPhone = record?.params?.visitorPhone;
  const visitorEmail = record?.params?.visitorEmail;
  const purpose = record?.params?.purpose || "";
  const status = record?.params?.status || "";

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const res = await fetch(`/admin/api/qr/${visitId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setQrImageUrl(data.qrDataUrl);
        }
      } catch (error) {
        console.error("Failed to load QR code:", error);
      }
    };

    if (visitId) {
      loadQrCode();
    }
  }, [visitId]);

  const handleSend = async (method: "whatsapp" | "email") => {
    if (!visitId) return;

    setLoading(method);
    setMessage(null);

    try {
      const res = await fetch("/admin/api/send-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          visitId,
          method,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: method === "whatsapp"
            ? `QR code sent to ${visitorPhone} via WhatsApp!`
            : `QR code sent to ${visitorEmail} via Email!`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send QR code",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = () => {
    const badges: Record<string, { variant: any; text: string }> = {
      PRE_REGISTERED: { variant: "default", text: "Pre-Registered" },
      PENDING_APPROVAL: { variant: "info", text: "Pending" },
      APPROVED: { variant: "success", text: "Approved" },
      REJECTED: { variant: "danger", text: "Rejected" },
      CHECKED_IN: { variant: "primary", text: "Checked In" },
      CHECKED_OUT: { variant: "secondary", text: "Checked Out" },
    };
    const badge = badges[status] || badges.PRE_REGISTERED;
    return <Badge variant={badge.variant}>{badge.text}</Badge>;
  };

  return (
    <Box>
      {/* Header */}
      <Box
        p="xl"
        style={{
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          borderRadius: "16px",
          marginBottom: "24px",
        }}
      >
        <Box flex alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: "12px" }}>
          <Box>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginBottom: "4px" }}>
              Send Visitor Pass
            </Text>
            <H3 style={{ color: "white", margin: 0, fontSize: "22px" }}>
              {visitorName}
            </H3>
            {visitorCompany && (
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginTop: "4px" }}>
                {visitorCompany}
              </Text>
            )}
          </Box>
          {getStatusBadge()}
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex style={{ gap: "24px", flexWrap: "wrap" }}>
        {/* Left - QR Code */}
        <Box style={{ flex: "1", minWidth: "240px" }}>
          <Box
            p="xl"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <H4 style={{ marginBottom: "20px", color: "#111827" }}>
              <Icon icon="Grid" size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              QR Code
            </H4>

            <Box
              flex
              justifyContent="center"
              alignItems="center"
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "16px",
                padding: "24px",
                minHeight: "200px",
              }}
            >
              {qrImageUrl ? (
                <Box
                  style={{
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    style={{ width: "160px", height: "160px", display: "block" }}
                  />
                </Box>
              ) : (
                <Box flex flexDirection="column" alignItems="center" style={{ gap: "12px" }}>
                  <Loader />
                  <Text style={{ color: "#6B7280", fontSize: "13px" }}>Loading QR code...</Text>
                </Box>
              )}
            </Box>

            <Text style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "16px" }}>
              Scan to check in at reception
            </Text>
          </Box>
        </Box>

        {/* Right - Visitor Info & Send Options */}
        <Box style={{ flex: "1", minWidth: "280px" }}>
          {/* Visitor Info Card */}
          <Box
            p="xl"
            mb="lg"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <H4 style={{ marginBottom: "20px", color: "#111827" }}>
              <Icon icon="User" size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              Visitor Details
            </H4>

            <Box flex flexDirection="column" style={{ gap: "16px" }}>
              {visitorPhone && (
                <InfoItem icon="Phone" label="Phone" value={visitorPhone} color="#10B981" />
              )}
              {visitorEmail && (
                <InfoItem icon="Mail" label="Email" value={visitorEmail} color="#F59E0B" />
              )}
              {purpose && (
                <InfoItem icon="Briefcase" label="Purpose" value={purpose} color="#8B5CF6" />
              )}
            </Box>
          </Box>

          {/* Success/Error Message */}
          {message && (
            <Box
              p="lg"
              mb="lg"
              style={{
                backgroundColor: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                borderRadius: "12px",
                border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
              }}
            >
              <Box flex alignItems="center" style={{ gap: "12px" }}>
                <Icon
                  icon={message.type === "success" ? "CheckCircle" : "AlertCircle"}
                  color={message.type === "success" ? "#059669" : "#DC2626"}
                  size={20}
                />
                <Text style={{ color: message.type === "success" ? "#065F46" : "#991B1B", fontWeight: 500 }}>
                  {message.text}
                </Text>
              </Box>
            </Box>
          )}

          {/* Send Options */}
          <Box
            p="xl"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <H4 style={{ marginBottom: "20px", color: "#111827" }}>
              <Icon icon="Send" size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              Send QR Code
            </H4>

            <Box flex flexDirection="column" style={{ gap: "12px" }}>
              <SendOptionCard
                icon="MessageCircle"
                title="Send via WhatsApp"
                subtitle={visitorPhone || ""}
                color="#25D366"
                gradient="linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                disabled={!visitorPhone}
                disabledReason="No phone number available"
                loading={loading === "whatsapp"}
                onClick={() => handleSend("whatsapp")}
              />

              <SendOptionCard
                icon="Mail"
                title="Send via Email"
                subtitle={visitorEmail || ""}
                color="#3B82F6"
                gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                disabled={!visitorEmail}
                disabledReason="No email address available"
                loading={loading === "email"}
                onClick={() => handleSend("email")}
              />
            </Box>

            {/* No contact warning */}
            {!visitorPhone && !visitorEmail && (
              <Box
                mt="lg"
                p="lg"
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: "12px",
                  border: "1px solid #FCD34D",
                }}
              >
                <Box flex alignItems="flex-start" style={{ gap: "12px" }}>
                  <Icon icon="AlertTriangle" color="#D97706" size={20} />
                  <Box>
                    <Text style={{ color: "#92400E", fontWeight: 600, fontSize: "14px" }}>
                      No Contact Information
                    </Text>
                    <Text style={{ color: "#A16207", fontSize: "13px", marginTop: "4px" }}>
                      Please add a phone number or email to send the QR code.
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SendQrModal;
