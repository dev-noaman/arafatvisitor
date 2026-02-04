import React from "react";
import {
  Box,
  H3,
  H4,
  Text,
  Badge,
  Icon,
  Button,
} from "@adminjs/design-system";
import { ShowPropertyProps } from "adminjs";

// Timeline step component
const TimelineStep: React.FC<{
  title: string;
  date: string | null;
  isCompleted: boolean;
  isActive: boolean;
  isFailed?: boolean;
  icon: string;
  description?: string;
}> = ({ title, date, isCompleted, isActive, isFailed, icon, description }) => {
  const getStatusColor = () => {
    if (isFailed) return "#EF4444"; // red
    if (isCompleted) return "#10B981"; // green
    if (isActive) return "#3B82F6"; // blue
    return "#9CA3AF"; // gray
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Pending";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box flex style={{ position: "relative", paddingBottom: "24px" }}>
      {/* Vertical line */}
      <Box
        style={{
          position: "absolute",
          left: "19px",
          top: "40px",
          bottom: "0",
          width: "2px",
          backgroundColor: isCompleted ? "#10B981" : isFailed ? "#EF4444" : "#E5E7EB",
        }}
      />

      {/* Circle with icon */}
      <Box
        flex
        alignItems="center"
        justifyContent="center"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          flexShrink: 0,
          zIndex: 1,
          boxShadow: isActive ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none",
        }}
      >
        <Icon icon={icon as any} color="white" size={20} />
      </Box>

      {/* Content */}
      <Box ml="lg" flex flexDirection="column" style={{ flex: 1 }}>
        <Box flex alignItems="center" style={{ gap: "12px" }}>
          <Text
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: isCompleted || isActive || isFailed ? "#111827" : "#9CA3AF",
            }}
          >
            {title}
          </Text>
          {isCompleted && (
            <Badge variant="success" size="sm">
              Done
            </Badge>
          )}
          {isFailed && (
            <Badge variant="danger" size="sm">
              Rejected
            </Badge>
          )}
          {isActive && !isCompleted && !isFailed && (
            <Badge variant="primary" size="sm">
              Current
            </Badge>
          )}
        </Box>

        <Text
          style={{
            fontSize: "13px",
            color: isCompleted || isActive || isFailed ? "#6B7280" : "#D1D5DB",
            marginTop: "4px",
          }}
        >
          {formatDate(date)}
        </Text>

        {description && (
          <Text
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              marginTop: "4px",
            }}
          >
            {description}
          </Text>
        )}
      </Box>
    </Box>
  );
};

// Info card component
const InfoCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  color?: string;
}> = ({ icon, label, value, color = "#4F46E5" }) => (
  <Box
    flex
    alignItems="center"
    p="lg"
    style={{
      backgroundColor: "#F9FAFB",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
    }}
  >
    <Box
      flex
      alignItems="center"
      justifyContent="center"
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        backgroundColor: `${color}15`,
      }}
    >
      <Icon icon={icon as any} color={color} size={22} />
    </Box>
    <Box ml="lg">
      <Text style={{ fontSize: "11px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </Text>
      <Text style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginTop: "2px" }}>
        {value}
      </Text>
    </Box>
  </Box>
);

const PreRegisterShow: React.FC<ShowPropertyProps> = (props) => {
  const { record } = props;
  const params = record?.params || {};

  const status = params.status || "PRE_REGISTERED";
  const visitorName = params.visitorName || "Unknown Visitor";
  const visitorCompany = params.visitorCompany || "";
  const visitorPhone = params.visitorPhone || "";
  const visitorEmail = params.visitorEmail || "";
  const purpose = params.purpose || "Visit";
  const location = params.location || "Unknown";
  const expectedDate = params.expectedDate;
  const approvedAt = params.approvedAt;
  const rejectedAt = params.rejectedAt;
  const rejectionReason = params.rejectionReason;
  const createdAt = params.createdAt;

  // Determine status states
  const isPending = status === "PENDING_APPROVAL";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isRegistered = true; // Always true if we have a record

  const getLocationLabel = (loc: string) => {
    const locations: Record<string, string> = {
      BARWA_TOWERS: "Barwa Towers",
      ELEMENT_MARIOTT: "Element Marriott",
      MARINA_50: "Marina 50",
    };
    return locations[loc] || loc;
  };

  const formatExpectedDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    const badges: Record<string, { variant: any; icon: string; text: string }> = {
      PRE_REGISTERED: { variant: "default", icon: "FileText", text: "Pre-Registered" },
      PENDING_APPROVAL: { variant: "info", icon: "Clock", text: "Awaiting Approval" },
      APPROVED: { variant: "success", icon: "CheckCircle", text: "Approved" },
      REJECTED: { variant: "danger", icon: "XCircle", text: "Rejected" },
    };
    const badge = badges[status] || badges.PRE_REGISTERED;

    return (
      <Badge
        variant={badge.variant}
        size="lg"
        style={{ padding: "8px 16px", fontSize: "14px" }}
      >
        <Icon icon={badge.icon as any} size={16} style={{ marginRight: "6px" }} />
        {badge.text}
      </Badge>
    );
  };

  const getHeaderGradient = () => {
    if (isRejected) return "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
    if (isApproved) return "linear-gradient(135deg, #10B981 0%, #059669 100%)";
    if (isPending) return "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
    return "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)";
  };

  return (
    <Box>
      {/* Header */}
      <Box
        p="xxl"
        style={{
          background: getHeaderGradient(),
          borderRadius: "16px",
          marginBottom: "24px",
        }}
      >
        <Box flex alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: "16px" }}>
          <Box>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "8px" }}>
              Pre-Registration Request
            </Text>
            <H3 style={{ color: "white", margin: 0 }}>
              {visitorName}
            </H3>
            {visitorCompany && (
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", marginTop: "4px" }}>
                {visitorCompany}
              </Text>
            )}
          </Box>
          {getStatusBadge()}
        </Box>
      </Box>

      {/* Expected Date Banner */}
      {expectedDate && (
        <Box
          p="lg"
          mb="lg"
          flex
          alignItems="center"
          style={{
            backgroundColor: "#EEF2FF",
            borderRadius: "12px",
            border: "1px solid #C7D2FE",
          }}
        >
          <Icon icon="Calendar" color="#4F46E5" size={24} />
          <Box ml="lg">
            <Text style={{ fontSize: "12px", color: "#6366F1", fontWeight: 500 }}>
              Expected Visit Date
            </Text>
            <Text style={{ fontSize: "18px", color: "#312E81", fontWeight: 600, marginTop: "2px" }}>
              {formatExpectedDate(expectedDate)}
            </Text>
          </Box>
        </Box>
      )}

      {/* Main content grid */}
      <Box flex style={{ gap: "24px", flexWrap: "wrap" }}>
        {/* Left column - Timeline */}
        <Box style={{ flex: "1", minWidth: "280px" }}>
          <Box
            p="xl"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <H4 style={{ marginBottom: "24px", color: "#111827" }}>
              <Icon icon="Clock" size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              Approval Status
            </H4>

            <Box>
              <TimelineStep
                title="Request Submitted"
                date={createdAt}
                isCompleted={isRegistered}
                isActive={false}
                icon="FileText"
                description="Pre-registration request received"
              />

              <TimelineStep
                title="Pending Approval"
                date={isPending ? null : (approvedAt || rejectedAt)}
                isCompleted={isApproved || isRejected}
                isActive={isPending}
                isFailed={isRejected}
                icon={isRejected ? "XCircle" : "Clock"}
                description={
                  isPending ? "Waiting for host approval" :
                  isRejected ? "Request was rejected by host" :
                  "Host reviewed the request"
                }
              />

              {!isRejected && (
                <TimelineStep
                  title="Approved"
                  date={approvedAt}
                  isCompleted={isApproved}
                  isActive={false}
                  icon="CheckCircle"
                  description={isApproved ? "Ready for visit" : "Awaiting approval"}
                />
              )}
            </Box>
          </Box>

          {/* Rejection Reason */}
          {isRejected && rejectionReason && (
            <Box
              mt="lg"
              p="lg"
              style={{
                backgroundColor: "#FEF2F2",
                borderRadius: "12px",
                border: "1px solid #FECACA",
              }}
            >
              <Box flex alignItems="center" mb="sm">
                <Icon icon="AlertCircle" color="#DC2626" size={18} />
                <Text style={{ marginLeft: "8px", fontWeight: 600, color: "#991B1B" }}>
                  Rejection Reason
                </Text>
              </Box>
              <Text style={{ color: "#7F1D1D" }}>{rejectionReason}</Text>
            </Box>
          )}
        </Box>

        {/* Right column - Details */}
        <Box style={{ flex: "1", minWidth: "280px" }}>
          <Box
            p="xl"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <H4 style={{ marginBottom: "24px", color: "#111827" }}>
              <Icon icon="User" size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              Visitor Information
            </H4>

            <Box flex flexDirection="column" style={{ gap: "12px" }}>
              {visitorPhone && (
                <InfoCard
                  icon="Phone"
                  label="Phone"
                  value={visitorPhone}
                  color="#10B981"
                />
              )}
              {visitorEmail && (
                <InfoCard
                  icon="Mail"
                  label="Email"
                  value={visitorEmail}
                  color="#F59E0B"
                />
              )}
              <InfoCard
                icon="Briefcase"
                label="Purpose"
                value={purpose}
                color="#8B5CF6"
              />
              <InfoCard
                icon="MapPin"
                label="Location"
                value={getLocationLabel(location)}
                color="#EC4899"
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          {isPending && (
            <Box
              mt="lg"
              p="xl"
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <H4 style={{ marginBottom: "16px", color: "#111827" }}>
                <Icon icon="Zap" size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                Quick Actions
              </H4>
              <Box flex style={{ gap: "12px" }}>
                <Button
                  variant="success"
                  size="lg"
                  style={{ flex: 1 }}
                  onClick={async () => {
                    const pathParts = window.location.pathname.split('/');
                    const recordId = pathParts[pathParts.length - 2];

                    try {
                      const response = await fetch(`/admin/api/resources/PreRegister/records/${recordId}/actions/approve`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });

                      if (response.ok) {
                        window.location.reload();
                      } else {
                        const error = await response.json();
                        alert(error.message || 'Failed to approve');
                      }
                    } catch (error) {
                      console.error('Error approving:', error);
                      alert('An error occurred');
                    }
                  }}
                >
                  <Icon icon="Check" size={18} style={{ marginRight: "8px" }} />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  style={{ flex: 1 }}
                  onClick={async () => {
                    const pathParts = window.location.pathname.split('/');
                    const recordId = pathParts[pathParts.length - 2];

                    try {
                      const response = await fetch(`/admin/api/resources/PreRegister/records/${recordId}/actions/reject`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });

                      if (response.ok) {
                        window.location.reload();
                      } else {
                        const error = await response.json();
                        alert(error.message || 'Failed to reject');
                      }
                    } catch (error) {
                      console.error('Error rejecting:', error);
                      alert('An error occurred');
                    }
                  }}
                >
                  <Icon icon="X" size={18} style={{ marginRight: "8px" }} />
                  Reject
                </Button>
              </Box>
            </Box>
          )}

          {/* Re-approve for rejected */}
          {isRejected && (
            <Box
              mt="lg"
              p="xl"
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <H4 style={{ marginBottom: "16px", color: "#111827" }}>
                <Icon icon="RefreshCw" size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                Change Decision
              </H4>
              <Button
                variant="success"
                size="lg"
                style={{ width: "100%" }}
                onClick={async () => {
                  const pathParts = window.location.pathname.split('/');
                  const recordId = pathParts[pathParts.length - 2];

                  try {
                    const response = await fetch(`/admin/api/resources/PreRegister/records/${recordId}/actions/reapprove`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });

                    if (response.ok) {
                      window.location.reload();
                    } else {
                      const error = await response.json();
                      alert(error.message || 'Failed to re-approve');
                    }
                  } catch (error) {
                    console.error('Error re-approving:', error);
                    alert('An error occurred');
                  }
                }}
              >
                <Icon icon="RefreshCw" size={18} style={{ marginRight: "8px" }} />
                Re-approve Request
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PreRegisterShow;
