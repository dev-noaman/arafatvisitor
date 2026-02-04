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
  icon: string;
  description?: string;
}> = ({ title, date, isCompleted, isActive, icon, description }) => {
  const getStatusColor = () => {
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
    <Box
      flex
      style={{ position: "relative", paddingBottom: "32px" }}
    >
      {/* Vertical line */}
      <Box
        style={{
          position: "absolute",
          left: "19px",
          top: "40px",
          bottom: "0",
          width: "2px",
          backgroundColor: isCompleted ? "#10B981" : "#E5E7EB",
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
              fontSize: "16px",
              fontWeight: 600,
              color: isCompleted || isActive ? "#111827" : "#9CA3AF",
            }}
          >
            {title}
          </Text>
          {isCompleted && (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          )}
          {isActive && !isCompleted && (
            <Badge variant="primary" size="sm">
              Current
            </Badge>
          )}
        </Box>

        <Text
          style={{
            fontSize: "14px",
            color: isCompleted || isActive ? "#6B7280" : "#D1D5DB",
            marginTop: "4px",
          }}
        >
          {formatDate(date)}
        </Text>

        {description && (
          <Text
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              marginTop: "8px",
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
}> = ({ icon, label, value }) => (
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
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: "#EEF2FF",
      }}
    >
      <Icon icon={icon as any} color="#4F46E5" size={24} />
    </Box>
    <Box ml="lg">
      <Text style={{ fontSize: "12px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </Text>
      <Text style={{ fontSize: "16px", fontWeight: 600, color: "#111827", marginTop: "2px" }}>
        {value}
      </Text>
    </Box>
  </Box>
);

const DeliveryShow: React.FC<ShowPropertyProps> = (props) => {
  const { record } = props;
  const params = record?.params || {};

  const status = params.status || "RECEIVED";
  const receivedAt = params.receivedAt;
  const pickedUpAt = params.pickedUpAt;
  const recipient = params.recipient || "Unknown";
  const courier = params.courier || "Unknown";
  const location = params.location || "Unknown";
  const notes = params.notes;
  const createdAt = params.createdAt;

  const isReceived = status === "RECEIVED" || status === "PICKED_UP";
  const isPickedUp = status === "PICKED_UP";

  const getLocationLabel = (loc: string) => {
    const locations: Record<string, string> = {
      BARWA_TOWERS: "Barwa Towers",
      ELEMENT_MARIOTT: "Element Marriott",
      MARINA_50: "Marina 50 Tower",
    };
    return locations[loc] || loc;
  };

  const getStatusBadge = () => {
    if (status === "PICKED_UP") {
      return (
        <Badge
          variant="success"
          size="lg"
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          <Icon icon="CheckCircle" size={16} style={{ marginRight: "6px" }} />
          Picked Up
        </Badge>
      );
    }
    return (
      <Badge
        variant="info"
        size="lg"
        style={{ padding: "8px 16px", fontSize: "14px" }}
      >
        <Icon icon="Package" size={16} style={{ marginRight: "6px" }} />
        Awaiting Pickup
      </Badge>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        p="xxl"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          marginBottom: "24px",
        }}
      >
        <Box flex alignItems="center" justifyContent="space-between">
          <Box>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "8px" }}>
              Delivery Tracking
            </Text>
            <H3 style={{ color: "white", margin: 0 }}>
              Package for {recipient}
            </H3>
          </Box>
          {getStatusBadge()}
        </Box>
      </Box>

      {/* Main content grid */}
      <Box flex style={{ gap: "24px", flexWrap: "wrap" }}>
        {/* Left column - Timeline */}
        <Box style={{ flex: "1", minWidth: "300px" }}>
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
              Tracking History
            </H4>

            <Box>
              <TimelineStep
                title="Package Received"
                date={receivedAt}
                isCompleted={isReceived}
                isActive={isReceived && !isPickedUp}
                icon="Package"
                description="Package received at reception desk"
              />

              <TimelineStep
                title="Picked Up"
                date={pickedUpAt}
                isCompleted={isPickedUp}
                isActive={false}
                icon="CheckCircle"
                description={isPickedUp ? "Package collected by recipient" : "Waiting for recipient to collect"}
              />
            </Box>
          </Box>
        </Box>

        {/* Right column - Details */}
        <Box style={{ flex: "1", minWidth: "300px" }}>
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
              <Icon icon="FileText" size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
              Delivery Details
            </H4>

            <Box flex flexDirection="column" style={{ gap: "16px" }}>
              <InfoCard
                icon="User"
                label="Recipient"
                value={recipient}
              />
              <InfoCard
                icon="Truck"
                label="Courier"
                value={courier}
              />
              <InfoCard
                icon="MapPin"
                label="Location"
                value={getLocationLabel(location)}
              />
              {createdAt && (
                <InfoCard
                  icon="Calendar"
                  label="Created"
                  value={new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              )}
            </Box>

            {notes && (
              <Box
                mt="xl"
                p="lg"
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: "12px",
                  border: "1px solid #FCD34D",
                }}
              >
                <Box flex alignItems="center" mb="sm">
                  <Icon icon="MessageSquare" color="#D97706" size={16} />
                  <Text style={{ marginLeft: "8px", fontWeight: 600, color: "#92400E" }}>
                    Notes
                  </Text>
                </Box>
                <Text style={{ color: "#78350F" }}>{notes}</Text>
              </Box>
            )}
          </Box>

          {/* Action buttons */}
          {status === "RECEIVED" && (
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
              <Button
                variant="success"
                size="lg"
                style={{ width: "100%" }}
                onClick={async () => {
                  // Get the record ID from the current path
                  const pathParts = window.location.pathname.split('/');
                  const recordId = pathParts[pathParts.length - 1];
                  
                  try {
                    // Call the AdminJS action API
                    const response = await fetch(`/admin/resources/Deliveries/records/${recordId}/actions/markPickedUp`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    if (response.ok) {
                      // Reload the page to show updated status
                      window.location.reload();
                    } else {
                      const error = await response.json();
                      alert(error.message || 'Failed to mark as picked up');
                    }
                  } catch (error) {
                    console.error('Error marking as picked up:', error);
                    alert('An error occurred while marking as picked up');
                  }
                }}
              >
                <Icon icon="CheckCircle" size={18} style={{ marginRight: "8px" }} />
                Mark as Picked Up
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DeliveryShow;
