(function (React, designSystem, adminjs, reactRouter, reactRedux) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  const Dashboard = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [loading, setLoading] = React.useState(true);
    const [kpis, setKpis] = React.useState({
      totalHosts: 0,
      visitsToday: 0,
      deliveriesToday: 0
    });
    const [pendingApprovals, setPendingApprovals] = React.useState([]);
    const [receivedDeliveries, setReceivedDeliveries] = React.useState([]);
    const [chartData, setChartData] = React.useState(null);
    const [darkMode, setDarkMode] = React.useState(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('adminjs-theme-preference') === 'dark';
      }
      return false;
    });
    React.useEffect(() => {
      const handleThemeChange = () => {
        const isDark = localStorage.getItem('adminjs-theme-preference') === 'dark';
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
      };

      // Listen for local storage changes
      window.addEventListener('storage', handleThemeChange);
      // Listen for custom event from admin-scripts.js
      window.addEventListener('theme-change', handleThemeChange);

      // Initial check
      handleThemeChange();
      return () => {
        window.removeEventListener('storage', handleThemeChange);
        window.removeEventListener('theme-change', handleThemeChange);
      };
    }, []);
    React.useEffect(() => {
      loadDashboardData();
    }, []);
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch KPIs
        const kpisRes = await fetch('/admin/api/dashboard/kpis', {
          credentials: 'include'
        });
        if (kpisRes.ok) {
          const kpisData = await kpisRes.json();
          setKpis(kpisData);
        }

        // Fetch pending approvals
        const approvalsRes = await fetch('/admin/api/dashboard/pending-approvals', {
          credentials: 'include'
        });
        if (approvalsRes.ok) {
          const approvalsData = await approvalsRes.json();
          setPendingApprovals(approvalsData);
        }

        // Fetch received deliveries
        const deliveriesRes = await fetch('/admin/api/dashboard/received-deliveries', {
          credentials: 'include'
        });
        if (deliveriesRes.ok) {
          const deliveriesData = await deliveriesRes.json();
          setReceivedDeliveries(deliveriesData);
        }

        // Fetch chart data
        const chartsRes = await fetch('/admin/api/dashboard/charts', {
          credentials: 'include'
        });
        if (chartsRes.ok) {
          const chartsData = await chartsRes.json();
          setChartData(chartsData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    const handleApprove = async id => {
      try {
        const res = await fetch(`/admin/api/dashboard/approve/${id}`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          loadDashboardData();
        }
      } catch (error) {
        console.error('Failed to approve:', error);
      }
    };
    const handleReject = async id => {
      try {
        const res = await fetch(`/admin/api/dashboard/reject/${id}`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          loadDashboardData();
        }
      } catch (error) {
        console.error('Failed to reject:', error);
      }
    };
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        flex: true,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
        mt: "lg"
      }, "Loading dashboard..."));
    }
    const role = currentAdmin?.role || 'ADMIN';
    const canApprove = role === 'ADMIN' || role === 'HOST';

    // Styles
    const cardStyle = {
      borderRadius: '8px',
      flex: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      border: 'none'
    };
    const fullWidthCardStyle = {
      borderRadius: '8px',
      width: '100%',
      display: 'block',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      border: 'none'
    };
    const textColor = undefined;
    const mutedColor = 'grey60';
    const bgColor = undefined;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl",
      style: {
        backgroundColor: bgColor
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "flex-start",
      alignItems: "center",
      mb: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      style: {
        color: textColor
      }
    }, "Dashboard")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      mb: "xxl",
      style: {
        gap: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm",
      style: {
        color: mutedColor
      },
      mb: "sm"
    }, "Total Hosts"), /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      style: {
        margin: 0,
        color: textColor
      }
    }, kpis.totalHosts), /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "User",
      color: "primary100",
      size: 32
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm",
      style: {
        color: mutedColor
      },
      mb: "sm"
    }, "Visits Today"), /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      style: {
        margin: 0,
        color: textColor
      }
    }, kpis.visitsToday), /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "UserCheck",
      color: "success",
      size: 32
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm",
      style: {
        color: mutedColor
      },
      mb: "sm"
    }, "Deliveries Today"), /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      style: {
        margin: 0,
        color: textColor
      }
    }, kpis.deliveriesToday), /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Package",
      color: "info",
      size: 32
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xxl",
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xl",
      style: fullWidthCardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg",
      style: {
        color: textColor
      }
    }, "Pre-Register Approval Queue"), pendingApprovals.length === 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: mutedColor
      }
    }, "No pending approvals") : /*#__PURE__*/React__default.default.createElement(designSystem.Table, {
      style: {
        backgroundColor: undefined
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Visitor"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Host"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Company"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Expected"), canApprove && /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Actions"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, pendingApprovals.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: item.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.visitorName), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.hostName), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.hostCompany), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, new Date(item.expectedDate).toLocaleDateString()), canApprove && /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      style: {
        gap: '8px',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "success",
      size: "sm",
      onClick: () => handleApprove(item.id)
    }, "Approve"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "danger",
      size: "sm",
      onClick: () => handleReject(item.id)
    }, "Reject")))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xl",
      style: fullWidthCardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg",
      style: {
        color: textColor
      }
    }, "Deliveries Queue (Received)"), receivedDeliveries.length === 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: mutedColor
      }
    }, "No pending deliveries") : /*#__PURE__*/React__default.default.createElement(designSystem.Table, {
      style: {
        backgroundColor: undefined
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Courier"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Host"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Company"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, "Received"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, receivedDeliveries.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: item.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.courier), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.hostName), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, item.hostCompany), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        color: textColor
      }
    }, new Date(item.receivedAt).toLocaleTimeString()))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      style: {
        gap: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "lg",
      style: {
        color: textColor
      }
    }, "Visits (Last 7 Days)"), chartData?.visitsPerDay ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '8px'
      }
    }, chartData.visitsPerDay.map(day => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: day.date,
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        width: '80px',
        color: textColor
      }
    }, new Date(day.date).toLocaleDateString('en', {
      weekday: 'short'
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "primary100",
      style: {
        height: '20px',
        width: `${Math.min(day.count * 10, 100)}%`,
        borderRadius: '4px',
        minWidth: day.count > 0 ? '20px' : '0'
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: textColor
      }
    }, day.count)))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: mutedColor
      }
    }, "No data available")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "lg",
      style: {
        color: textColor
      }
    }, "Visitor Status Distribution"), chartData?.statusDistribution && chartData.statusDistribution.length > 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '8px'
      }
    }, chartData.statusDistribution.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: item.status,
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: textColor
      }
    }, item.status.replace(/_/g, ' ')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: item.status === 'CHECKED_IN' ? 'success' : item.status === 'PENDING_APPROVAL' ? 'warning' : item.status === 'APPROVED' ? 'info' : 'grey40',
      px: "md",
      py: "sm",
      style: {
        borderRadius: '4px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white"
    }, item.count))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: mutedColor
      }
    }, "No data available")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      p: "xl",
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "lg",
      style: {
        color: textColor
      }
    }, "Deliveries (Last 7 Days)"), chartData?.deliveriesPerDay ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '8px'
      }
    }, chartData.deliveriesPerDay.map(day => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: day.date,
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        width: '80px',
        color: textColor
      }
    }, new Date(day.date).toLocaleDateString('en', {
      weekday: 'short'
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "info",
      style: {
        height: '20px',
        width: `${Math.min(day.count * 10, 100)}%`,
        borderRadius: '4px',
        minWidth: day.count > 0 ? '20px' : '0'
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: textColor
      }
    }, day.count)))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: mutedColor
      }
    }, "No data available"))));
  };

  const SendQrModal = props => {
    const {
      record
    } = props;
    const [loading, setLoading] = React.useState(false);
    const [qrImageUrl, setQrImageUrl] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const visitId = record?.params?.id;
    const visitorName = record?.params?.visitorName || 'Visitor';
    const visitorPhone = record?.params?.visitorPhone;
    const visitorEmail = record?.params?.visitorEmail;
    React.useEffect(() => {
      // Load QR code image
      if (visitId) {
        loadQrCode();
      }
    }, [visitId]);
    const loadQrCode = async () => {
      try {
        const res = await fetch(`/admin/api/qr/${visitId}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setQrImageUrl(data.qrDataUrl);
        }
      } catch (error) {
        console.error('Failed to load QR code:', error);
      }
    };
    const handleSend = async method => {
      if (!visitId) return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/send-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            visitId,
            method
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: `QR code sent via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'} successfully!`
          });
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to send QR code'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "xl"
    }, "Send QR Code"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm",
      fontWeight: "bold"
    }, "Visitor: ", visitorName), visitorPhone && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm"
    }, "Phone: ", visitorPhone), visitorEmail && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm"
    }, "Email: ", visitorEmail)), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl",
      flex: true,
      flexDirection: "column",
      alignItems: "center",
      p: "xl",
      bg: "grey20",
      style: {
        borderRadius: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "lg"
    }, "QR Code Preview"), qrImageUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: qrImageUrl,
      alt: "QR Code",
      style: {
        width: '200px',
        height: '200px',
        background: 'white',
        padding: '16px',
        borderRadius: '8px'
      }
    }) : /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      justifyContent: "center",
      style: {
        width: '200px',
        height: '200px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null))), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: message.text,
      variant: message.type,
      onCloseClick: () => setMessage(null)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold",
      mb: "sm"
    }, "Send QR Code via:"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "success",
      disabled: !visitorPhone || loading,
      onClick: () => handleSend('whatsapp'),
      style: {
        width: '100%',
        justifyContent: 'center'
      }
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "MessageCircle",
      mr: "sm"
    }), "Send via WhatsApp", !visitorPhone && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      ml: "sm",
      fontSize: "sm"
    }, "(No phone number)"))), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      disabled: !visitorEmail || loading,
      onClick: () => handleSend('email'),
      style: {
        width: '100%',
        justifyContent: 'center'
      }
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Mail",
      mr: "sm"
    }), "Send via Email", !visitorEmail && /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      ml: "sm",
      fontSize: "sm"
    }, "(No email)")))), !visitorPhone && !visitorEmail && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: "No contact information available for this visitor. Please add phone or email to send the QR code.",
      variant: "warning"
    })));
  };

  const ChangePasswordModal = ({
    onClose
  }) => {
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);
    const handleSubmit = async e => {
      e.preventDefault();

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage({
          type: 'error',
          text: 'All fields are required'
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({
          type: 'error',
          text: 'New passwords do not match'
        });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({
          type: 'error',
          text: 'New password must be at least 6 characters'
        });
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: 'Password changed successfully!'
          });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');

          // Close modal after success
          if (onClose) {
            setTimeout(onClose, 2000);
          }
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to change password'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xxl",
      style: {
        maxWidth: '400px',
        margin: '0 auto'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "xl"
    }, "Change Password"), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: message.text,
      variant: message.type,
      onCloseClick: () => setMessage(null)
    })), /*#__PURE__*/React__default.default.createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Current Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: currentPassword,
      onChange: e => setCurrentPassword(e.target.value),
      placeholder: "Enter current password",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "New Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: newPassword,
      onChange: e => setNewPassword(e.target.value),
      placeholder: "Enter new password",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Confirm New Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: confirmPassword,
      onChange: e => setConfirmPassword(e.target.value),
      placeholder: "Confirm new password",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "primary",
      disabled: loading,
      style: {
        flex: 1
      }
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Change Password'), onClose && /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "button",
      variant: "text",
      onClick: onClose,
      disabled: loading
    }, "Cancel"))));
  };

  /**
   * Change Password page - accessible from sidebar for any logged-in user.
   * Uses currentAdmin.email from AdminJS session to identify the user.
   */
  const ChangePasswordPage = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);
    const userEmail = currentAdmin?.email;
    const handleSubmit = async e => {
      e.preventDefault();
      if (!userEmail) {
        setMessage({
          type: 'error',
          text: 'You must be logged in to change password.'
        });
        return;
      }
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage({
          type: 'error',
          text: 'All fields are required'
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({
          type: 'error',
          text: 'New passwords do not match'
        });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({
          type: 'error',
          text: 'New password must be at least 6 characters'
        });
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword,
            newPassword,
            userEmail
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: 'Password changed successfully!'
          });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to change password'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    if (!userEmail) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        variant: "grey",
        p: "xxl"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
        mb: "lg"
      }, "Change Password"), /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
        message: "You must be logged in to change your password.",
        variant: "error"
      }));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      mb: "sm"
    }, "Change Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      mb: "xxl"
    }, "Update your password for account: ", userEmail), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: message.text,
      variant: message.type,
      onCloseClick: () => setMessage(null)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xxl",
      style: {
        borderRadius: '8px',
        maxWidth: '400px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Current Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: currentPassword,
      onChange: e => setCurrentPassword(e.target.value),
      placeholder: "Enter current password",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "New Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: newPassword,
      onChange: e => setNewPassword(e.target.value),
      placeholder: "Enter new password (min 6 characters)",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "Confirm New Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: confirmPassword,
      onChange: e => setConfirmPassword(e.target.value),
      placeholder: "Confirm new password",
      disabled: loading
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "primary",
      disabled: loading,
      style: {
        minWidth: '140px'
      }
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Change Password'))));
  };

  const EditProfilePanel = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [profile, setProfile] = React.useState(null);
    const [name, setName] = React.useState('');
    const email = currentAdmin?.email || '';
    React.useEffect(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/admin/api/profile?email=${encodeURIComponent(email)}`, {
            credentials: 'include'
          });
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
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            name
          })
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
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        flex: true,
        alignItems: "center",
        justifyContent: "center",
        height: "70vh"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl",
      style: {
        maxWidth: 640
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, null, "Edit Profile"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Full Name"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: name,
      onChange: e => setName(e.target.value)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Email"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: profile?.email || '',
      disabled: true
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: save,
      disabled: saving
    }, saving ? 'Saving...' : 'Save Changes'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      ml: "lg",
      color: "grey60"
    }, "Role: ", profile?.role || 'N/A')));
  };

  const ReportsPanel = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [activeTab, setActiveTab] = React.useState('visitors');
    const [loading, setLoading] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const role = currentAdmin?.role || 'ADMIN';
    const hostCompany = currentAdmin?.hostCompany || '';
    const isHost = role === 'HOST';
    const [filters, setFilters] = React.useState({
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      location: '',
      company: isHost ? hostCompany : '',
      // Auto-set company for HOST
      status: ''
    });
    const [reportData, setReportData] = React.useState({});
    const [message, setMessage] = React.useState(null);

    // All roles can access reports (ADMIN, HOST, RECEPTION)
    // HOST sees only their company, RECEPTION sees all

    const handleFilterChange = (key, value) => {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    };
    const generateReport = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const params = new URLSearchParams();
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.location) params.append('location', filters.location);
        if (filters.company) params.append('company', filters.company);
        if (filters.status) params.append('status', filters.status);
        const endpoint = activeTab === 'visitors' ? '/admin/api/reports/visitors' : '/admin/api/reports/deliveries';
        const res = await fetch(`${endpoint}?${params}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setReportData(prev => ({
            ...prev,
            [activeTab]: data
          }));
        } else {
          setMessage({
            type: 'error',
            text: 'Failed to generate report'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    const exportReport = async format => {
      setExporting(true);
      setMessage(null);
      try {
        const params = new URLSearchParams();
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.location) params.append('location', filters.location);
        if (filters.company) params.append('company', filters.company);
        if (filters.status) params.append('status', filters.status);
        params.append('format', format);
        const endpoint = activeTab === 'visitors' ? '/admin/api/reports/visitors/export' : '/admin/api/reports/deliveries/export';
        const res = await fetch(`${endpoint}?${params}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setMessage({
            type: 'success',
            text: `Report exported as ${format.toUpperCase()}`
          });
        } else {
          setMessage({
            type: 'error',
            text: 'Failed to export report'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setExporting(false);
      }
    };
    const visitorStatuses = ['CHECKED_IN', 'CHECKED_OUT', 'PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
    const deliveryStatuses = ['RECEIVED', 'PICKED_UP'];
    const locations = ['BARWA_TOWERS', 'MARINA_50', 'ELEMENT_MARIOTT'];
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      mb: "xxl"
    }, "Reports"), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: message.text,
      variant: message.type,
      onCloseClick: () => setMessage(null)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Tabs, null, /*#__PURE__*/React__default.default.createElement(designSystem.Tab, {
      id: "visitors",
      label: "Visitors Report",
      isSelected: activeTab === 'visitors',
      onClick: () => setActiveTab('visitors')
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Tab, {
      id: "deliveries",
      label: "Deliveries Report",
      isSelected: activeTab === 'deliveries',
      onClick: () => setActiveTab('deliveries')
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      mb: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, "Filters"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      style: {
        gap: '16px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minWidth: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Date From"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "date",
      value: filters.dateFrom,
      onChange: e => handleFilterChange('dateFrom', e.target.value)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minWidth: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Date To"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "date",
      value: filters.dateTo,
      onChange: e => handleFilterChange('dateTo', e.target.value)
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minWidth: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Location"), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      value: filters.location,
      onChange: selected => handleFilterChange('location', selected?.value || ''),
      options: [{
        value: '',
        label: 'All Locations'
      }, ...locations.map(l => ({
        value: l,
        label: l.replace('_', ' ')
      }))]
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minWidth: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Company ", isHost && '(Your company)'), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "text",
      value: filters.company,
      onChange: e => handleFilterChange('company', e.target.value),
      placeholder: isHost ? hostCompany : "Filter by company",
      disabled: isHost,
      style: isHost ? {
        backgroundColor: '#f3f4f6'
      } : {}
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        minWidth: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, "Status"), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      value: filters.status,
      onChange: selected => handleFilterChange('status', selected?.value || ''),
      options: [{
        value: '',
        label: 'All Statuses'
      }, ...(activeTab === 'visitors' ? visitorStatuses : deliveryStatuses).map(s => ({
        value: s,
        label: s.replace('_', ' ')
      }))]
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg",
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: generateReport,
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Generate Report'))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl",
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "success",
      onClick: () => exportReport('csv'),
      disabled: exporting || !reportData[activeTab]?.length
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Download",
      mr: "sm"
    }), "Export CSV"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "info",
      onClick: () => exportReport('excel'),
      disabled: exporting || !reportData[activeTab]?.length
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Download",
      mr: "sm"
    }), "Export Excel")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, "Results (", reportData[activeTab]?.length || 0, " records)"), loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "center",
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null)) : activeTab === 'visitors' && reportData.visitors?.length ? /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Visitor"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Company"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Host"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Purpose"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Status"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Check In"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Check Out"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, reportData.visitors.map(v => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: v.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.visitorName), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.visitorCompany), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.host?.name || '-'), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.purpose), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.status), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.checkInAt ? new Date(v.checkInAt).toLocaleString() : '-'), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, v.checkOutAt ? new Date(v.checkOutAt).toLocaleString() : '-'))))) : activeTab === 'deliveries' && reportData.deliveries?.length ? /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Courier"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Recipient"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Host"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Location"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Status"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Received"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Picked Up"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, reportData.deliveries.map(d => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: d.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.courier), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.recipient), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.host?.name || '-'), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.location), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.status), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '-'), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '-'))))) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "No data available. Click \"Generate Report\" to load data.")));
  };

  const SettingsPanel = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [settings, setSettings] = React.useState(null);
    const [testingWhatsapp, setTestingWhatsapp] = React.useState(false);
    const [testingEmail, setTestingEmail] = React.useState(false);
    const [testPhone, setTestPhone] = React.useState('');
    const [testEmail, setTestEmailInput] = React.useState('');
    const [message, setMessage] = React.useState(null);
    const [editingSmtp, setEditingSmtp] = React.useState(false);
    const [smtpForm, setSmtpForm] = React.useState({
      enabled: false,
      host: '',
      port: '587',
      user: '',
      pass: '',
      from: ''
    });
    const role = currentAdmin?.role || 'ADMIN';
    const isAdmin = role === 'ADMIN';
    React.useEffect(() => {
      loadSettings();
    }, []);
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/admin/api/settings', {
          credentials: 'include'
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
        setMessage({
          type: 'error',
          text: 'Please enter a phone number'
        });
        return;
      }
      setTestingWhatsapp(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/settings/test-whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            phone: testPhone
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: 'Test WhatsApp message sent successfully!'
          });
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to send test message'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error'
        });
      } finally {
        setTestingWhatsapp(false);
      }
    };
    const testSmtp = async () => {
      if (!testEmail) {
        setMessage({
          type: 'error',
          text: 'Please enter an email address'
        });
        return;
      }
      setTestingEmail(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/settings/test-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: testEmail
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: 'Test email sent successfully!'
          });
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to send test email'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error'
        });
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
        from: settings?.smtp?.from || ''
      });
      setEditingSmtp(true);
    };
    const saveSmtpSettings = async () => {
      setSaving(true);
      setMessage(null);
      try {
        const res = await fetch('/admin/api/settings/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            smtp: {
              enabled: smtpForm.enabled,
              host: smtpForm.host,
              port: parseInt(smtpForm.port, 10),
              user: smtpForm.user,
              pass: smtpForm.pass || undefined,
              from: smtpForm.from
            }
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: 'SMTP settings saved successfully!'
          });
          setEditingSmtp(false);
          loadSettings(); // Reload settings
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to save settings'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error'
        });
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
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            smtp: {
              enabled: !settings?.smtp?.enabled
            }
          })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({
            type: 'success',
            text: `SMTP ${!settings?.smtp?.enabled ? 'enabled' : 'disabled'} successfully!`
          });
          loadSettings();
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to update settings'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error'
        });
      } finally {
        setSaving(false);
      }
    };
    if (!isAdmin) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        p: "xxl"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
        message: "You don't have permission to access settings.",
        variant: "error"
      }));
    }
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        flex: true,
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      mb: "xxl"
    }, "Settings"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      mb: "xxl"
    }, "Settings are stored in the .env file. To change settings, edit the .env file and restart the server."), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl",
      p: "lg",
      style: {
        borderRadius: '8px',
        backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: message.type === 'error' ? '#dc2626' : '#16a34a',
        fontWeight: 500
      }
    }, message.type === 'error' ? '❌ ' : '✅ ', message.text), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "text",
      size: "sm",
      onClick: () => setMessage(null)
    }, "\u2715")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      mb: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Home",
      mr: "sm"
    }), "Site Settings"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Site Name:"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, settings?.site?.name || 'Arafat VMS')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Timezone:"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, settings?.site?.timezone || 'Asia/Qatar')))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      mb: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "MessageCircle",
      mr: "sm"
    }), "WhatsApp Settings"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Status:"), /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: settings?.whatsapp?.configured ? 'success' : 'danger'
    }, settings?.whatsapp?.configured ? 'Configured' : 'Not Configured')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Provider:"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, settings?.whatsapp?.provider || 'wbiztool')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Enabled:"), /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: settings?.whatsapp?.enabled ? 'success' : 'secondary'
    }, settings?.whatsapp?.enabled ? 'Yes' : 'No'))), settings?.whatsapp?.configured && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg",
      pt: "lg",
      style: {
        borderTop: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "md"
    }, "Test WhatsApp"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "tel",
      placeholder: "Phone number (e.g., +974xxxxxxxx)",
      value: testPhone,
      onChange: e => setTestPhone(e.target.value),
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "success",
      onClick: testWhatsapp,
      disabled: testingWhatsapp
    }, testingWhatsapp ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Send Test')))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      mb: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center",
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      style: {
        margin: 0
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Mail",
      mr: "sm"
    }), "SMTP Settings"), !editingSmtp && /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "text",
      onClick: startEditingSmtp
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Edit",
      mr: "sm"
    }), "Edit")), editingSmtp ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "Enabled:"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: smtpForm.enabled ? 'success' : 'secondary',
      size: "sm",
      onClick: () => setSmtpForm({
        ...smtpForm,
        enabled: !smtpForm.enabled
      })
    }, smtpForm.enabled ? 'Enabled' : 'Disabled')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "Host:"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: smtpForm.host,
      onChange: e => setSmtpForm({
        ...smtpForm,
        host: e.target.value
      }),
      placeholder: "smtp.example.com",
      style: {
        flex: 1
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "Port:"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: smtpForm.port,
      onChange: e => setSmtpForm({
        ...smtpForm,
        port: e.target.value
      }),
      placeholder: "587",
      style: {
        width: '100px'
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "User:"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: smtpForm.user,
      onChange: e => setSmtpForm({
        ...smtpForm,
        user: e.target.value
      }),
      placeholder: "user@example.com",
      style: {
        flex: 1
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "Password:"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      value: smtpForm.pass,
      onChange: e => setSmtpForm({
        ...smtpForm,
        pass: e.target.value
      }),
      placeholder: "Leave blank to keep current",
      style: {
        flex: 1
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        width: '100px'
      }
    }, "From:"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      value: smtpForm.from,
      onChange: e => setSmtpForm({
        ...smtpForm,
        from: e.target.value
      }),
      placeholder: "noreply@example.com",
      style: {
        flex: 1
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '12px',
        marginTop: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: saveSmtpSettings,
      disabled: saving
    }, saving ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Save Settings'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "text",
      onClick: () => setEditingSmtp(false)
    }, "Cancel"))) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Status:"), /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: settings?.smtp?.configured ? 'success' : 'danger'
    }, settings?.smtp?.configured ? 'Configured' : 'Not Configured')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Host:"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, settings?.smtp?.host || 'Not set')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Enabled:"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: settings?.smtp?.enabled ? 'success' : 'secondary'
    }, settings?.smtp?.enabled ? 'Yes' : 'No'), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: settings?.smtp?.enabled ? 'danger' : 'success',
      size: "sm",
      onClick: toggleSmtpEnabled,
      disabled: saving || !settings?.smtp?.configured
    }, settings?.smtp?.enabled ? 'Disable' : 'Enable')))), settings?.smtp?.configured && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg",
      pt: "lg",
      style: {
        borderTop: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "md"
    }, "Test Email"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "email",
      placeholder: "Email address",
      value: testEmail,
      onChange: e => setTestEmailInput(e.target.value),
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: testSmtp,
      disabled: testingEmail
    }, testingEmail ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : 'Send Test'))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Tool",
      mr: "sm"
    }), "Maintenance Mode"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Status:"), /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: settings?.maintenance?.enabled ? 'danger' : 'success'
    }, settings?.maintenance?.enabled ? 'ACTIVE' : 'Inactive')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold"
    }, "Message:"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, settings?.maintenance?.message || 'System under maintenance')))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xxl",
      p: "xl",
      bg: "grey20",
      style: {
        borderRadius: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "md"
    }, "How to Update Settings"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm"
    }, "To change these settings, edit the following environment variables in your .env file:"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "pre",
      p: "md",
      bg: "grey40",
      style: {
        borderRadius: '4px',
        overflow: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      as: "code",
      style: {
        fontFamily: 'monospace'
      }
    }, `# Site Settings
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
MAINTENANCE_MESSAGE=System under maintenance`)), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "md",
      color: "grey60"
    }, "After editing the .env file, restart the server for changes to take effect.")));
  };

  const VisitorCards = () => {
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const [loading, setLoading] = React.useState(true);
    const [visitors, setVisitors] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [checkingOut, setCheckingOut] = React.useState(null);
    React.useEffect(() => {
      loadVisitors();
    }, []);
    const loadVisitors = async () => {
      setLoading(true);
      try {
        const res = await fetch('/admin/api/dashboard/current-visitors', {
          credentials: 'include'
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
    const handleCheckout = async sessionId => {
      setCheckingOut(sessionId);
      try {
        const res = await fetch(`/admin/api/dashboard/checkout/${sessionId}`, {
          method: 'POST',
          credentials: 'include'
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
    const handleSendQr = async (visitor, method) => {
      try {
        const res = await fetch('/admin/api/send-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            visitId: visitor.id,
            method
          })
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
    const filteredVisitors = visitors.filter(v => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return v.visitorName.toLowerCase().includes(searchLower) || v.visitorCompany.toLowerCase().includes(searchLower) || v.hostName.toLowerCase().includes(searchLower) || v.visitorPhone.includes(search);
    });
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        flex: true,
        alignItems: "center",
        justifyContent: "center",
        height: "400px"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      variant: "grey",
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center",
      mb: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H2, null, "Current Visitors (", visitors.length, ")"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "text",
      placeholder: "Search visitors...",
      value: search,
      onChange: e => setSearch(e.target.value),
      style: {
        width: '250px'
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: loadVisitors
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "RefreshCw",
      mr: "sm"
    }), "Refresh"))), filteredVisitors.length === 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      p: "xxl",
      style: {
        borderRadius: '8px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Users",
      size: 48,
      color: "grey40"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "lg",
      color: "grey60"
    }, "No visitors currently checked in")) : /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      style: {
        gap: '24px',
        flexWrap: 'wrap'
      }
    }, filteredVisitors.map(visitor => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: visitor.id,
      bg: "white",
      p: "xl",
      style: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        width: '320px',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "center",
      mb: "lg",
      p: "md",
      bg: "grey20",
      style: {
        borderRadius: '8px'
      }
    }, visitor.qrDataUrl ? /*#__PURE__*/React__default.default.createElement("img", {
      src: visitor.qrDataUrl,
      alt: "QR Code",
      style: {
        width: '150px',
        height: '150px'
      }
    }) : /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      justifyContent: "center",
      style: {
        width: '150px',
        height: '150px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "QrCode",
      size: 64,
      color: "grey40"
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      mb: "sm"
    }, visitor.visitorName), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      mb: "md"
    }, visitor.visitorCompany), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '8px'
      },
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "User",
      size: 16,
      color: "grey60"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm"
    }, "Host: ", visitor.hostName)), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Building",
      size: 16,
      color: "grey60"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm"
    }, "Company: ", visitor.hostCompany)), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Clock",
      size: 16,
      color: "grey60"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm"
    }, "Check-in: ", new Date(visitor.checkInAt).toLocaleTimeString())), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      alignItems: "center",
      style: {
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "FileText",
      size: 16,
      color: "grey60"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontSize: "sm"
    }, "Purpose: ", visitor.purpose))), /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: "success",
      mb: "lg"
    }, "CHECKED IN"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      style: {
        gap: '8px',
        marginTop: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      style: {
        gap: '8px'
      }
    }, visitor.visitorPhone && /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "success",
      size: "sm",
      onClick: () => handleSendQr(visitor, 'whatsapp'),
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "MessageCircle",
      mr: "sm",
      size: 14
    }), "WhatsApp"), visitor.visitorEmail && /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "info",
      size: "sm",
      onClick: () => handleSendQr(visitor, 'email'),
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Mail",
      mr: "sm",
      size: 14
    }), "Email")), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "danger",
      onClick: () => handleCheckout(visitor.sessionId),
      disabled: checkingOut === visitor.sessionId
    }, checkingOut === visitor.sessionId ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "LogOut",
      mr: "sm"
    }), "Check Out")))))));
  };

  const BulkImportHosts = () => {
    const [selectedFileName, setSelectedFileName] = React.useState(null);
    const [fileContent, setFileContent] = React.useState(null);
    const [fileType, setFileType] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [validating, setValidating] = React.useState(false);
    const [validation, setValidation] = React.useState(null);
    const [summary, setSummary] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [editableRejected, setEditableRejected] = React.useState([]);
    const handleFileChange = event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      if (!isCSV && !isXLSX) {
        setMessage({
          type: 'error',
          text: 'Please upload a CSV or Excel (.xlsx) file.'
        });
        return;
      }
      setSelectedFileName(file.name);
      setSummary(null);
      setValidation(null);
      setMessage(null);
      setEditableRejected([]);
      const reader = new FileReader();
      reader.onload = async () => {
        if (isXLSX) {
          const base64 = reader.result.split(',')[1];
          setFileContent(base64);
          setFileType('xlsx');
          await validateFile(base64, 'xlsx');
        } else {
          const text = typeof reader.result === 'string' ? reader.result : '';
          setFileContent(text);
          setFileType('csv');
          await validateFile(text, 'csv');
        }
      };
      reader.onerror = () => {
        setMessage({
          type: 'error',
          text: 'Failed to read the file. Please try again.'
        });
      };
      if (isXLSX) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    };
    const validateFile = async (content, type) => {
      setValidating(true);
      setValidation(null);
      try {
        const body = type === 'xlsx' ? { xlsxContent: content } : { csvContent: content };
        const res = await fetch('/admin/api/hosts/import?validate=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to validate CSV.'
          });
          return;
        }
        const totalProcessed = data.totalProcessed ?? 0;
        const rejected = data.rejected ?? 0;
        const newHosts = data.inserted ?? 0;
        const existingHosts = data.skipped ?? 0;
        const usersToCreate = data.usersCreated ?? 0;
        const rejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];
        setValidation({
          totalRows: totalProcessed,
          validRows: totalProcessed - rejected,
          newHosts,
          existingHosts,
          usersToCreate,
          rejectedRows
        });
        setEditableRejected(rejectedRows);
        if (rejected > 0) {
          setMessage({
            type: 'error',
            text: `${rejected} row(s) have issues. Edit below and retry, or fix your file.`
          });
        } else {
          setMessage({
            type: 'success',
            text: `Ready to import: ${newHosts} new hosts, ${existingHosts} existing hosts, ${usersToCreate} users will be created.`
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error while validating. Please try again.'
        });
      } finally {
        setValidating(false);
      }
    };
    const handleImport = async () => {
      if (!fileContent || !fileType) {
        setMessage({
          type: 'error',
          text: 'Please select a CSV or Excel file first.'
        });
        return;
      }
      setLoading(true);
      setMessage(null);
      setSummary(null);
      try {
        const body = fileType === 'xlsx' ? { xlsxContent: fileContent } : { csvContent: fileContent };
        const res = await fetch('/admin/api/hosts/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to import hosts.'
          });
          return;
        }
        const rejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];
        setSummary({
          totalProcessed: data.totalProcessed ?? 0,
          inserted: data.inserted ?? 0,
          skipped: data.skipped ?? 0,
          rejected: data.rejected ?? 0,
          rejectedRows,
          usersCreated: data.usersCreated ?? 0,
          usersSkipped: data.usersSkipped ?? 0,
          createdCredentials: Array.isArray(data.createdCredentials) ? data.createdCredentials : []
        });
        setEditableRejected(rejectedRows);
        setValidation(null);
        if (data.inserted > 0) {
          setMessage({
            type: 'success',
            text: `Import completed! ${data.inserted} hosts imported, ${data.usersCreated} user accounts created.`
          });
        } else {
          setMessage({
            type: 'success',
            text: 'Import completed. No new hosts were added (all existing or rejected).'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error while importing. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    const handleRetryRejected = async () => {
      if (editableRejected.length === 0) return;
      setLoading(true);
      setMessage(null);

      // Build CSV from edited rejected rows
      const headers = ['ID', 'Name', 'Company', 'Email Address', 'Phone Number', 'Location', 'Status'];
      const rows = editableRejected.map(r => [r.data.id, r.data.name, r.data.company, r.data.email, r.data.phone, r.data.location, r.data.status].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));
      const retryCsvContent = [headers.join(','), ...rows].join('\n');
      try {
        const res = await fetch('/admin/api/hosts/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            csvContent: retryCsvContent
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({
            type: 'error',
            text: data.message || 'Failed to import hosts.'
          });
          return;
        }
        const newRejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];

        // Update summary with new results
        setSummary(prev => {
          if (!prev) {
            return {
              totalProcessed: data.totalProcessed ?? 0,
              inserted: data.inserted ?? 0,
              skipped: data.skipped ?? 0,
              rejected: data.rejected ?? 0,
              rejectedRows: newRejectedRows,
              usersCreated: data.usersCreated ?? 0,
              usersSkipped: data.usersSkipped ?? 0,
              createdCredentials: Array.isArray(data.createdCredentials) ? data.createdCredentials : []
            };
          }
          return {
            ...prev,
            inserted: prev.inserted + (data.inserted ?? 0),
            rejected: newRejectedRows.length,
            rejectedRows: newRejectedRows,
            usersCreated: prev.usersCreated + (data.usersCreated ?? 0),
            createdCredentials: [...prev.createdCredentials, ...(Array.isArray(data.createdCredentials) ? data.createdCredentials : [])]
          };
        });
        setEditableRejected(newRejectedRows);
        if (data.inserted > 0) {
          setMessage({
            type: 'success',
            text: `Retry successful! ${data.inserted} more hosts imported, ${data.usersCreated} users created.${newRejectedRows.length > 0 ? ` ${newRejectedRows.length} still have issues.` : ''}`
          });
        } else if (newRejectedRows.length > 0) {
          setMessage({
            type: 'error',
            text: `Still ${newRejectedRows.length} row(s) with issues. Please fix and retry.`
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Network error while importing. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    const updateRejectedRow = (index, field, value) => {
      setEditableRejected(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          data: {
            ...updated[index].data,
            [field]: value
          }
        };
        return updated;
      });
    };
    const exportCredentials = () => {
      if (!summary || !summary.createdCredentials.length) return;
      const headers = ['Name', 'Email', 'Password', 'Company'];
      const rows = summary.createdCredentials.map(c => [`"${c.name.replace(/"/g, '""')}"`, `"${c.email.replace(/"/g, '""')}"`, `"${c.password}"`, `"${(c.company || '').replace(/"/g, '""')}"`]);
      const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `host-credentials-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    const hasValidationErrors = validation && validation.rejectedRows.length > 0;
    const hasCredentials = summary && summary.createdCredentials && summary.createdCredentials.length > 0;
    const hasEditableRejected = editableRejected.length > 0;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xxl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      mb: "lg"
    }, "Bulk Import Hosts"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "md"
    }, "Upload a CSV file containing host records. Required columns:", /*#__PURE__*/React__default.default.createElement("br", null), /*#__PURE__*/React__default.default.createElement("strong", null, "ID, Name, Company, Email Address, Phone Number (optional), Location, Status")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg",
      p: "lg",
      bg: "grey20",
      flex: true,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      style: {
        borderRadius: '8px',
        border: '1px dashed #ccc'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Upload",
      size: 32,
      mb: "md"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm"
    }, selectedFileName ? `Selected: ${selectedFileName}` : 'Choose a CSV or Excel file to upload'), /*#__PURE__*/React__default.default.createElement("input", {
      type: "file",
      accept: ".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
      onChange: handleFileChange,
      style: {
        marginTop: '8px'
      }
    }), validating && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "md",
      flex: true,
      alignItems: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      ml: "sm"
    }, "Validating..."))), message && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: message.text,
      variant: message.type,
      onCloseClick: () => setMessage(null)
    })), validation && !hasValidationErrors && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg",
      p: "lg",
      style: {
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "md",
      fontWeight: "bold",
      style: {
        color: '#16a34a'
      }
    }, "\u2713 ", validation.validRows, " rows validated successfully"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "sm",
      style: {
        backgroundColor: '#dcfce7',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#16a34a'
      }
    }, validation.newHosts), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '12px',
        color: '#64748b'
      }
    }, "New Hosts")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "sm",
      style: {
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#d97706'
      }
    }, validation.existingHosts), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '12px',
        color: '#64748b'
      }
    }, "Existing Hosts")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "sm",
      style: {
        backgroundColor: '#dbeafe',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2563eb'
      }
    }, validation.usersToCreate), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '12px',
        color: '#64748b'
      }
    }, "Users to Create")))), !hasEditableRejected && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      onClick: handleImport,
      disabled: !fileContent || loading || validating || hasValidationErrors
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "PlayCircle",
      mr: "sm"
    }), "Start Import"))), hasEditableRejected && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg",
      p: "lg",
      style: {
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center",
      mb: "md"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold",
      style: {
        color: '#dc2626'
      }
    }, editableRejected.length, " Row(s) with Issues - Edit and Retry:"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      size: "sm",
      onClick: handleRetryRejected,
      disabled: loading
    }, loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null) : /*#__PURE__*/React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "RefreshCw",
      mr: "sm"
    }), "Retry Import (", editableRejected.length, ")"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        maxHeight: '400px',
        overflowY: 'auto',
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", null, /*#__PURE__*/React__default.default.createElement("tr", {
      style: {
        backgroundColor: '#fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Row"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Issue"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "ID"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Name"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Company"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Email"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Phone"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Location"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #fca5a5'
      }
    }, "Status"))), /*#__PURE__*/React__default.default.createElement("tbody", null, editableRejected.map((row, idx) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: idx,
      style: {
        backgroundColor: idx % 2 === 0 ? '#fff' : '#fef2f2'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '6px',
        borderBottom: '1px solid #fecaca'
      }
    }, row.rowNumber), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '6px',
        borderBottom: '1px solid #fecaca',
        color: '#dc2626',
        fontSize: '11px'
      }
    }, row.reason), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.id,
      onChange: e => updateRejectedRow(idx, 'id', e.target.value),
      style: {
        width: '60px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.name,
      onChange: e => updateRejectedRow(idx, 'name', e.target.value),
      style: {
        width: '100px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.company,
      onChange: e => updateRejectedRow(idx, 'company', e.target.value),
      style: {
        width: '100px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.email,
      onChange: e => updateRejectedRow(idx, 'email', e.target.value),
      style: {
        width: '140px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.phone,
      onChange: e => updateRejectedRow(idx, 'phone', e.target.value),
      style: {
        width: '100px',
        padding: '4px',
        border: row.reason.includes('phone') ? '2px solid #dc2626' : '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      value: row.data.location,
      onChange: e => updateRejectedRow(idx, 'location', e.target.value),
      style: {
        width: '100px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    })), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '4px',
        borderBottom: '1px solid #fecaca'
      }
    }, /*#__PURE__*/React__default.default.createElement("select", {
      value: row.data.status,
      onChange: e => updateRejectedRow(idx, 'status', e.target.value),
      style: {
        padding: '4px',
        border: row.reason.includes('status') ? '2px solid #dc2626' : '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: ""
    }, "Select"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "Active"
    }, "Active"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "Inactive"
    }, "Inactive"))))))))), summary && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "lg",
      style: {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "md",
      fontWeight: "bold"
    }, "Import Summary"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "md",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "md",
      style: {
        backgroundColor: '#dbeafe',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2563eb'
      }
    }, summary.totalProcessed), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: '#64748b'
      }
    }, "Total Processed")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "md",
      style: {
        backgroundColor: '#dcfce7',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#16a34a'
      }
    }, summary.inserted), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: '#64748b'
      }
    }, "Hosts Inserted")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "md",
      style: {
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#d97706'
      }
    }, summary.skipped), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      style: {
        color: '#64748b'
      }
    }, "Skipped (existing)"))), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "lg",
      style: {
        color: '#64748b'
      }
    }, "Users created: ", /*#__PURE__*/React__default.default.createElement("strong", null, summary.usersCreated), " | Users skipped: ", /*#__PURE__*/React__default.default.createElement("strong", null, summary.usersSkipped)), hasCredentials && /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg",
      p: "lg",
      style: {
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      justifyContent: "space-between",
      alignItems: "center",
      mb: "md"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "bold",
      style: {
        color: '#16a34a'
      }
    }, summary.createdCredentials.length, " User Account(s) Created"), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      size: "sm",
      onClick: exportCredentials
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Download",
      mr: "sm"
    }), "Export Credentials CSV")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        maxHeight: '300px',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        fontWeight: 'bold'
      }
    }, "Name"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        fontWeight: 'bold'
      }
    }, "Email"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        fontWeight: 'bold'
      }
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        fontWeight: 'bold'
      }
    }, "Company"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, summary.createdCredentials.map((cred, idx) => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: idx
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, cred.name), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, cred.email), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, /*#__PURE__*/React__default.default.createElement("code", {
      style: {
        backgroundColor: '#e2e8f0',
        padding: '2px 6px',
        borderRadius: '4px'
      }
    }, cred.password)), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, cred.company)))))), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mt: "md",
      style: {
        color: '#dc2626',
        fontSize: '12px'
      }
    }, "\u26A0\uFE0F Save these credentials now! Passwords cannot be retrieved later."))));
  };

  /**
   * Override AdminJS LoggedIn to add:
   * - Edit Profile, Change Password, and Logout in the user dropdown
   */
  const LoggedIn = ({
    session,
    paths
  }) => {
    const rootPath = paths.rootPath || '/admin';
    const dropActions = [{
      label: 'Edit Profile',
      onClick: event => {
        event.preventDefault();
        window.location.href = `${rootPath}/pages/EditProfile`;
      },
      icon: 'User'
    }, {
      label: 'Change Password',
      onClick: event => {
        event.preventDefault();
        window.location.href = `${rootPath}/pages/ChangePassword`;
      },
      icon: 'Key'
    }, {
      label: 'Sign Out',
      onClick: event => {
        event.preventDefault();
        window.location.href = paths.logoutPath;
      },
      icon: 'LogOut'
    }];
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      "data-css": "logged-in",
      style: {
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.CurrentUserNav, {
      name: session.name || session.email,
      title: session.title || session.email,
      avatarUrl: session.avatarUrl,
      dropActions: dropActions
    }));
  };

  /**
   * Override SidebarPages:
   * - Return null to completely hide the default pages section
   * - Reports and Settings are shown under System via SidebarResourceSection
   */
  const SidebarPages = () => {
    // Return null - all pages are handled by SidebarResourceSection
    return null;
  };

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      color: '#64748b',
      backgroundColor: 'transparent',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      borderLeft: '3px solid transparent',
      transition: 'all 0.15s ease'
    },
    menuItemSelected: {
      color: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderLeft: '3px solid #3b82f6'
    },
    separator: {
      border: '0',
      height: '1px',
      backgroundColor: '#e2e8f0',
      margin: '12px 16px'
    },
    label: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  };

  /**
   * Flat sidebar menu without navigation groups
   * Role-based visibility:
   * - ADMIN: sees all items
   * - HOST: hides Users, Audit Log, Settings
   * - RECEPTION: hides Users, Audit Log, Settings
   */
  const SidebarResourceSection = () => {
    const navigate = reactRouter.useNavigate();
    const location = reactRouter.useLocation();
    const pages = reactRedux.useSelector(state => state.pages) || [];
    const rootPath = reactRedux.useSelector(state => state.paths?.rootPath) || '/admin';
    const [currentAdmin] = adminjs.useCurrentAdmin();
    const userRole = currentAdmin?.role || 'RECEPTION';
    const isSelected = path => {
      if (path === rootPath) {
        return location.pathname === rootPath || location.pathname === `${rootPath}/`;
      }
      return location.pathname.startsWith(path);
    };
    const handleClick = path => e => {
      e.preventDefault();
      navigate(path);
    };

    // Get page icons
    const getPageIcon = name => {
      const page = pages.find(p => p.name === name);
      return page?.icon || 'File';
    };

    // Menu items configuration
    const topMenuItems = [{
      id: 'Dashboard',
      label: 'Dashboard',
      icon: 'Home',
      href: rootPath
    }, {
      id: 'Hosts',
      label: 'Hosts',
      icon: 'Briefcase',
      href: `${rootPath}/resources/Hosts`
    }, {
      id: 'Deliveries',
      label: 'Deliveries',
      icon: 'Package',
      href: `${rootPath}/resources/Deliveries`
    }, {
      id: 'Visitors',
      label: 'Visitors',
      icon: 'UserCheck',
      href: `${rootPath}/resources/Visitors`
    }, {
      id: 'PreRegister',
      label: 'Pre Register',
      icon: 'Calendar',
      href: `${rootPath}/resources/PreRegister`
    }];

    // Admin-only items (hidden from HOST and RECEPTION)
    // Reports is visible to all roles (HOST sees only their company, RECEPTION sees all)
    const adminOnlyItems = ['Users', 'AuditLog', 'Settings'];
    const allBottomMenuItems = [{
      id: 'Users',
      label: 'Users',
      icon: 'Users',
      href: `${rootPath}/resources/Users`
    }, {
      id: 'AuditLog',
      label: 'Audit Log',
      icon: 'FileText',
      href: `${rootPath}/resources/AuditLog`
    }, {
      id: 'Reports',
      label: 'Reports',
      icon: getPageIcon('Reports'),
      href: `${rootPath}/pages/Reports`
    }, {
      id: 'Settings',
      label: 'Settings',
      icon: getPageIcon('Settings'),
      href: `${rootPath}/pages/Settings`
    }];

    // Filter bottom menu items based on role
    const bottomMenuItems = userRole === 'ADMIN' ? allBottomMenuItems : allBottomMenuItems.filter(item => !adminOnlyItems.includes(item.id));
    const getMenuItemStyle = selected => ({
      ...styles.menuItem,
      ...(selected ? styles.menuItemSelected : {})
    });
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: styles.container
    }, topMenuItems.map(item => /*#__PURE__*/React__default.default.createElement("a", {
      key: item.id,
      href: item.href,
      style: getMenuItemStyle(isSelected(item.href)),
      onClick: handleClick(item.href)
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: item.icon
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: styles.label
    }, item.label))), /*#__PURE__*/React__default.default.createElement("hr", {
      style: styles.separator
    }), bottomMenuItems.map(item => /*#__PURE__*/React__default.default.createElement("a", {
      key: item.id,
      href: item.href,
      style: getMenuItemStyle(isSelected(item.href)),
      onClick: handleClick(item.href)
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: item.icon
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: styles.label
    }, item.label))));
  };

  const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const handleSubmit = async e => {
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
          credentials: 'include'
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
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      style: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      as: "h1",
      style: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#1f2937',
        marginBottom: '16px'
      }
    }, "Login to Your Account"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      onSubmit: handleSubmit,
      style: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        height: '8px',
        background: 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)'
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      style: {
        padding: '24px 32px'
      }
    }, error && /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: error,
      variant: "danger",
      style: {
        marginBottom: '16px'
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        display: 'block',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '8px'
      }
    }, "Username or Email"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "email",
      name: "email",
      placeholder: "Email",
      value: email,
      onChange: e => setEmail(e.target.value),
      required: true,
      style: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none'
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      style: {
        display: 'block',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '8px'
      }
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "password",
      name: "password",
      placeholder: "Password",
      value: password,
      onChange: e => setPassword(e.target.value),
      required: true,
      style: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none'
      }
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "column",
      alignItems: "center",
      style: {
        gap: '16px',
        marginTop: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      type: "submit",
      variant: "primary",
      disabled: loading,
      style: {
        width: '100%',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }
    }, loading ? 'Signing in...' : 'Submit'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      as: "a",
      href: "#",
      style: {
        fontSize: '14px',
        color: '#6b7280',
        textDecoration: 'none'
      }
    }, "Forgot password?"))))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.SendQrModal = SendQrModal;
  AdminJS.UserComponents.ChangePasswordModal = ChangePasswordModal;
  AdminJS.UserComponents.ChangePasswordPage = ChangePasswordPage;
  AdminJS.UserComponents.EditProfilePanel = EditProfilePanel;
  AdminJS.UserComponents.ReportsPanel = ReportsPanel;
  AdminJS.UserComponents.SettingsPanel = SettingsPanel;
  AdminJS.UserComponents.VisitorCards = VisitorCards;
  AdminJS.UserComponents.BulkImportHosts = BulkImportHosts;
  AdminJS.UserComponents.LoggedIn = LoggedIn;
  AdminJS.UserComponents.SidebarPages = SidebarPages;
  AdminJS.UserComponents.SidebarResourceSection = SidebarResourceSection;
  AdminJS.UserComponents.Login = Login;

})(React, AdminJSDesignSystem, AdminJS, ReactRouter, ReactRedux);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvU2VuZFFyTW9kYWwudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvQ2hhbmdlUGFzc3dvcmRNb2RhbC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9DaGFuZ2VQYXNzd29yZFBhZ2UudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvRWRpdFByb2ZpbGVQYW5lbC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9SZXBvcnRzUGFuZWwudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvU2V0dGluZ3NQYW5lbC50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9WaXNpdG9yQ2FyZHMudHN4IiwiLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvQnVsa0ltcG9ydEhvc3RzLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2dlZEluLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1NpZGViYXJQYWdlcy50c3giLCIuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9TaWRlYmFyUmVzb3VyY2VTZWN0aW9uLnRzeCIsIi4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2luLnRzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3gsIEgyLCBIMywgSDQsIFRleHQsIFRhYmxlLCBUYWJsZVJvdywgVGFibGVDZWxsLCBUYWJsZUhlYWQsIFRhYmxlQm9keSwgSWNvbiwgTG9hZGVyLCBCdXR0b24gfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcclxuaW1wb3J0IHsgdXNlQ3VycmVudEFkbWluIH0gZnJvbSAnYWRtaW5qcyc7XHJcblxyXG5pbnRlcmZhY2UgS1BJRGF0YSB7XHJcbiAgdG90YWxIb3N0czogbnVtYmVyO1xyXG4gIHZpc2l0c1RvZGF5OiBudW1iZXI7XHJcbiAgZGVsaXZlcmllc1RvZGF5OiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQZW5kaW5nQXBwcm92YWwge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgdmlzaXRvck5hbWU6IHN0cmluZztcclxuICB2aXNpdG9yUGhvbmU6IHN0cmluZztcclxuICBob3N0TmFtZTogc3RyaW5nO1xyXG4gIGhvc3RDb21wYW55OiBzdHJpbmc7XHJcbiAgZXhwZWN0ZWREYXRlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSZWNlaXZlZERlbGl2ZXJ5IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGNvdXJpZXI6IHN0cmluZztcclxuICByZWNpcGllbnQ6IHN0cmluZztcclxuICBob3N0TmFtZTogc3RyaW5nO1xyXG4gIGhvc3RDb21wYW55OiBzdHJpbmc7XHJcbiAgcmVjZWl2ZWRBdDogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2hhcnREYXRhIHtcclxuICB2aXNpdHNQZXJEYXk6IHsgZGF0ZTogc3RyaW5nOyBjb3VudDogbnVtYmVyIH1bXTtcclxuICBzdGF0dXNEaXN0cmlidXRpb246IHsgc3RhdHVzOiBzdHJpbmc7IGNvdW50OiBudW1iZXIgfVtdO1xyXG4gIGRlbGl2ZXJpZXNQZXJEYXk6IHsgZGF0ZTogc3RyaW5nOyBjb3VudDogbnVtYmVyIH1bXTtcclxufVxyXG5cclxuY29uc3QgRGFzaGJvYXJkOiBSZWFjdC5GQyA9ICgpID0+IHtcclxuICBjb25zdCBbY3VycmVudEFkbWluXSA9IHVzZUN1cnJlbnRBZG1pbigpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xyXG4gIGNvbnN0IFtrcGlzLCBzZXRLcGlzXSA9IHVzZVN0YXRlPEtQSURhdGE+KHsgdG90YWxIb3N0czogMCwgdmlzaXRzVG9kYXk6IDAsIGRlbGl2ZXJpZXNUb2RheTogMCB9KTtcclxuICBjb25zdCBbcGVuZGluZ0FwcHJvdmFscywgc2V0UGVuZGluZ0FwcHJvdmFsc10gPSB1c2VTdGF0ZTxQZW5kaW5nQXBwcm92YWxbXT4oW10pO1xyXG4gIGNvbnN0IFtyZWNlaXZlZERlbGl2ZXJpZXMsIHNldFJlY2VpdmVkRGVsaXZlcmllc10gPSB1c2VTdGF0ZTxSZWNlaXZlZERlbGl2ZXJ5W10+KFtdKTtcclxuICBjb25zdCBbY2hhcnREYXRhLCBzZXRDaGFydERhdGFdID0gdXNlU3RhdGU8Q2hhcnREYXRhIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW2RhcmtNb2RlLCBzZXREYXJrTW9kZV0gPSB1c2VTdGF0ZSgoKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhZG1pbmpzLXRoZW1lLXByZWZlcmVuY2UnKSA9PT0gJ2RhcmsnO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgaGFuZGxlVGhlbWVDaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGlzRGFyayA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhZG1pbmpzLXRoZW1lLXByZWZlcmVuY2UnKSA9PT0gJ2RhcmsnO1xyXG4gICAgICBzZXREYXJrTW9kZShpc0RhcmspO1xyXG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnZGFyaycsIGlzRGFyayk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgbG9jYWwgc3RvcmFnZSBjaGFuZ2VzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGhhbmRsZVRoZW1lQ2hhbmdlKTtcclxuICAgIC8vIExpc3RlbiBmb3IgY3VzdG9tIGV2ZW50IGZyb20gYWRtaW4tc2NyaXB0cy5qc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RoZW1lLWNoYW5nZScsIGhhbmRsZVRoZW1lQ2hhbmdlKTtcclxuXHJcbiAgICAvLyBJbml0aWFsIGNoZWNrXHJcbiAgICBoYW5kbGVUaGVtZUNoYW5nZSgpO1xyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgaGFuZGxlVGhlbWVDaGFuZ2UpO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGhlbWUtY2hhbmdlJywgaGFuZGxlVGhlbWVDaGFuZ2UpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIFxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbG9hZERhc2hib2FyZERhdGEoKTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IGxvYWREYXNoYm9hcmREYXRhID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEZldGNoIEtQSXNcclxuICAgICAgY29uc3Qga3Bpc1JlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL2Rhc2hib2FyZC9rcGlzJywge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoa3Bpc1Jlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IGtwaXNEYXRhID0gYXdhaXQga3Bpc1Jlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0S3BpcyhrcGlzRGF0YSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZldGNoIHBlbmRpbmcgYXBwcm92YWxzXHJcbiAgICAgIGNvbnN0IGFwcHJvdmFsc1JlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL2Rhc2hib2FyZC9wZW5kaW5nLWFwcHJvdmFscycsIHtcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGFwcHJvdmFsc1Jlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IGFwcHJvdmFsc0RhdGEgPSBhd2FpdCBhcHByb3ZhbHNSZXMuanNvbigpO1xyXG4gICAgICAgIHNldFBlbmRpbmdBcHByb3ZhbHMoYXBwcm92YWxzRGF0YSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZldGNoIHJlY2VpdmVkIGRlbGl2ZXJpZXNcclxuICAgICAgY29uc3QgZGVsaXZlcmllc1JlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL2Rhc2hib2FyZC9yZWNlaXZlZC1kZWxpdmVyaWVzJywge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoZGVsaXZlcmllc1Jlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IGRlbGl2ZXJpZXNEYXRhID0gYXdhaXQgZGVsaXZlcmllc1Jlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0UmVjZWl2ZWREZWxpdmVyaWVzKGRlbGl2ZXJpZXNEYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggY2hhcnQgZGF0YVxyXG4gICAgICBjb25zdCBjaGFydHNSZXMgPSBhd2FpdCBmZXRjaCgnL2FkbWluL2FwaS9kYXNoYm9hcmQvY2hhcnRzJywge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoY2hhcnRzUmVzLm9rKSB7XHJcbiAgICAgICAgY29uc3QgY2hhcnRzRGF0YSA9IGF3YWl0IGNoYXJ0c1Jlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0Q2hhcnREYXRhKGNoYXJ0c0RhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBkYXNoYm9hcmQgZGF0YTonLCBlcnJvcik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVBcHByb3ZlID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvYWRtaW4vYXBpL2Rhc2hib2FyZC9hcHByb3ZlLyR7aWR9YCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgbG9hZERhc2hib2FyZERhdGEoKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGFwcHJvdmU6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZVJlamVjdCA9IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgL2FkbWluL2FwaS9kYXNoYm9hcmQvcmVqZWN0LyR7aWR9YCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgbG9hZERhc2hib2FyZERhdGEoKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHJlamVjdDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPEJveCBcclxuICAgICAgICBmbGV4IFxyXG4gICAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBcclxuICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIiBcclxuICAgICAgICBoZWlnaHQ9XCIxMDB2aFwiXHJcbiAgICAgID5cclxuICAgICAgICA8TG9hZGVyIC8+XHJcbiAgICAgICAgPFRleHQgbXQ9XCJsZ1wiPkxvYWRpbmcgZGFzaGJvYXJkLi4uPC9UZXh0PlxyXG4gICAgICA8L0JveD5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCByb2xlID0gKGN1cnJlbnRBZG1pbiBhcyBhbnkpPy5yb2xlIHx8ICdBRE1JTic7XHJcbiAgY29uc3QgY2FuQXBwcm92ZSA9IHJvbGUgPT09ICdBRE1JTicgfHwgcm9sZSA9PT0gJ0hPU1QnO1xyXG5cclxuICAvLyBTdHlsZXNcclxuICBjb25zdCBjYXJkU3R5bGUgPSB7XHJcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgZmxleDogMSxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZnVsbFdpZHRoQ2FyZFN0eWxlID0ge1xyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICBkaXNwbGF5OiAnYmxvY2snLFxyXG4gICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICBib3JkZXI6ICdub25lJyxcclxuICB9O1xyXG5cclxuICBjb25zdCB0ZXh0Q29sb3IgPSB1bmRlZmluZWQ7XHJcbiAgY29uc3QgbXV0ZWRDb2xvciA9ICdncmV5NjAnO1xyXG4gIGNvbnN0IGJnQ29sb3IgPSB1bmRlZmluZWQ7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCIgcD1cInh4bFwiIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogYmdDb2xvciB9fT5cclxuICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwiZmxleC1zdGFydFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBtYj1cInh4bFwiPlxyXG4gICAgICAgIDxIMiBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PkRhc2hib2FyZDwvSDI+XHJcbiAgICAgIDwvQm94PlxyXG5cclxuICAgICAgey8qIEtQSSBDYXJkcyAqL31cclxuICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBtYj1cInh4bFwiIHN0eWxlPXt7IGdhcDogJzI0cHgnIH19PlxyXG4gICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcD1cInhsXCIgc3R5bGU9e2NhcmRTdHlsZX0+XHJcbiAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cInNtXCIgc3R5bGU9e3sgY29sb3I6IG11dGVkQ29sb3IgfX0gbWI9XCJzbVwiPlRvdGFsIEhvc3RzPC9UZXh0PlxyXG4gICAgICAgICAgPEgyIHN0eWxlPXt7IG1hcmdpbjogMCwgY29sb3I6IHRleHRDb2xvciB9fT57a3Bpcy50b3RhbEhvc3RzfTwvSDI+XHJcbiAgICAgICAgICA8SWNvbiBpY29uPVwiVXNlclwiIGNvbG9yPVwicHJpbWFyeTEwMFwiIHNpemU9ezMyfSAvPlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcD1cInhsXCIgc3R5bGU9e2NhcmRTdHlsZX0+XHJcbiAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cInNtXCIgc3R5bGU9e3sgY29sb3I6IG11dGVkQ29sb3IgfX0gbWI9XCJzbVwiPlZpc2l0cyBUb2RheTwvVGV4dD5cclxuICAgICAgICAgIDxIMiBzdHlsZT17eyBtYXJnaW46IDAsIGNvbG9yOiB0ZXh0Q29sb3IgfX0+e2twaXMudmlzaXRzVG9kYXl9PC9IMj5cclxuICAgICAgICAgIDxJY29uIGljb249XCJVc2VyQ2hlY2tcIiBjb2xvcj1cInN1Y2Nlc3NcIiBzaXplPXszMn0gLz5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHA9XCJ4bFwiIHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgPFRleHQgZm9udFNpemU9XCJzbVwiIHN0eWxlPXt7IGNvbG9yOiBtdXRlZENvbG9yIH19IG1iPVwic21cIj5EZWxpdmVyaWVzIFRvZGF5PC9UZXh0PlxyXG4gICAgICAgICAgPEgyIHN0eWxlPXt7IG1hcmdpbjogMCwgY29sb3I6IHRleHRDb2xvciB9fT57a3Bpcy5kZWxpdmVyaWVzVG9kYXl9PC9IMj5cclxuICAgICAgICAgIDxJY29uIGljb249XCJQYWNrYWdlXCIgY29sb3I9XCJpbmZvXCIgc2l6ZT17MzJ9IC8+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgIDwvQm94PlxyXG5cclxuICAgICAgey8qIE9wZXJhdGlvbmFsIFF1ZXVlcyAtIEVhY2ggaW4gc2VwYXJhdGUgZnVsbC13aWR0aCBjYXJkICovfVxyXG4gICAgICA8Qm94IG1iPVwieHhsXCIgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMjRweCcsIHdpZHRoOiAnMTAwJScgfX0+XHJcbiAgICAgICAgey8qIFByZS1SZWdpc3RlciBBcHByb3ZhbCBRdWV1ZSAqL31cclxuICAgICAgICA8Qm94IHA9XCJ4bFwiIHN0eWxlPXtmdWxsV2lkdGhDYXJkU3R5bGV9PlxyXG4gICAgICAgICAgPEgzIG1iPVwibGdcIiBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PlByZS1SZWdpc3RlciBBcHByb3ZhbCBRdWV1ZTwvSDM+XHJcbiAgICAgICAgICB7cGVuZGluZ0FwcHJvdmFscy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGNvbG9yOiBtdXRlZENvbG9yIH19Pk5vIHBlbmRpbmcgYXBwcm92YWxzPC9UZXh0PlxyXG4gICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgPFRhYmxlIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogdW5kZWZpbmVkIH19PlxyXG4gICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVSb3c+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5WaXNpdG9yPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5Ib3N0PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5Db21wYW55PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5FeHBlY3RlZDwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICB7Y2FuQXBwcm92ZSAmJiA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+QWN0aW9uczwvVGFibGVDZWxsPn1cclxuICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XHJcbiAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XHJcbiAgICAgICAgICAgICAgPFRhYmxlQm9keT5cclxuICAgICAgICAgICAgICAgIHtwZW5kaW5nQXBwcm92YWxzLm1hcCgoaXRlbSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXtpdGVtLmlkfT5cclxuICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+e2l0ZW0udmlzaXRvck5hbWV9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbCBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PntpdGVtLmhvc3ROYW1lfTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT57aXRlbS5ob3N0Q29tcGFueX08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+e25ldyBEYXRlKGl0ZW0uZXhwZWN0ZWREYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKX08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgICB7Y2FuQXBwcm92ZSAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cInJvd1wiIHN0eWxlPXt7IGdhcDogJzhweCcsIHdoaXRlU3BhY2U6ICdub3dyYXAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJzdWNjZXNzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVBcHByb3ZlKGl0ZW0uaWQpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFwcHJvdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiZGFuZ2VyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVSZWplY3QoaXRlbS5pZCl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgIDwvVGFibGVCb2R5PlxyXG4gICAgICAgICAgICA8L1RhYmxlPlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgey8qIERlbGl2ZXJpZXMgUXVldWUgKi99XHJcbiAgICAgICAgPEJveCBwPVwieGxcIiBzdHlsZT17ZnVsbFdpZHRoQ2FyZFN0eWxlfT5cclxuICAgICAgICAgIDxIMyBtYj1cImxnXCIgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5EZWxpdmVyaWVzIFF1ZXVlIChSZWNlaXZlZCk8L0gzPlxyXG4gICAgICAgICAge3JlY2VpdmVkRGVsaXZlcmllcy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGNvbG9yOiBtdXRlZENvbG9yIH19Pk5vIHBlbmRpbmcgZGVsaXZlcmllczwvVGV4dD5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDxUYWJsZSBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IHVuZGVmaW5lZCB9fT5cclxuICAgICAgICAgICAgICA8VGFibGVIZWFkPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlUm93PlxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+Q291cmllcjwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+SG9zdDwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+Q29tcGFueTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+UmVjZWl2ZWQ8L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XHJcbiAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XHJcbiAgICAgICAgICAgICAgPFRhYmxlQm9keT5cclxuICAgICAgICAgICAgICAgIHtyZWNlaXZlZERlbGl2ZXJpZXMubWFwKChpdGVtKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZVJvdyBrZXk9e2l0ZW0uaWR9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT57aXRlbS5jb3VyaWVyfTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT57aXRlbS5ob3N0TmFtZX08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+e2l0ZW0uaG9zdENvbXBhbnl9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbCBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PntuZXcgRGF0ZShpdGVtLnJlY2VpdmVkQXQpLnRvTG9jYWxlVGltZVN0cmluZygpfTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XHJcbiAgICAgICAgICAgIDwvVGFibGU+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICA8L0JveD5cclxuXHJcbiAgICAgIHsvKiBDaGFydHMgU2VjdGlvbiAqL31cclxuICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBzdHlsZT17eyBnYXA6ICcyNHB4JyB9fT5cclxuICAgICAgICB7LyogVmlzaXRzIFBlciBEYXkgKi99XHJcbiAgICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBwPVwieGxcIiBzdHlsZT17Y2FyZFN0eWxlfT5cclxuICAgICAgICAgIDxINCBtYj1cImxnXCIgc3R5bGU9e3sgY29sb3I6IHRleHRDb2xvciB9fT5WaXNpdHMgKExhc3QgNyBEYXlzKTwvSDQ+XHJcbiAgICAgICAgICB7Y2hhcnREYXRhPy52aXNpdHNQZXJEYXkgPyAoXHJcbiAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgc3R5bGU9e3sgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICB7Y2hhcnREYXRhLnZpc2l0c1BlckRheS5tYXAoKGRheSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgPEJveCBrZXk9e2RheS5kYXRlfSBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8VGV4dCBzdHlsZT17eyB3aWR0aDogJzgwcHgnLCBjb2xvcjogdGV4dENvbG9yIH19PntuZXcgRGF0ZShkYXkuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbicsIHsgd2Vla2RheTogJ3Nob3J0JyB9KX08L1RleHQ+XHJcbiAgICAgICAgICAgICAgICAgIDxCb3hcclxuICAgICAgICAgICAgICAgICAgICBiZz1cInByaW1hcnkxMDBcIlxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHtNYXRoLm1pbihkYXkuY291bnQgKiAxMCwgMTAwKX0lYCxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogZGF5LmNvdW50ID4gMCA/ICcyMHB4JyA6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8VGV4dCBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PntkYXkuY291bnR9PC9UZXh0PlxyXG4gICAgICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgPFRleHQgc3R5bGU9e3sgY29sb3I6IG11dGVkQ29sb3IgfX0+Tm8gZGF0YSBhdmFpbGFibGU8L1RleHQ+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvQm94PlxyXG5cclxuICAgICAgICB7LyogU3RhdHVzIERpc3RyaWJ1dGlvbiAqL31cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHA9XCJ4bFwiIHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgPEg0IG1iPVwibGdcIiBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PlZpc2l0b3IgU3RhdHVzIERpc3RyaWJ1dGlvbjwvSDQ+XHJcbiAgICAgICAgICB7Y2hhcnREYXRhPy5zdGF0dXNEaXN0cmlidXRpb24gJiYgY2hhcnREYXRhLnN0YXR1c0Rpc3RyaWJ1dGlvbi5sZW5ndGggPiAwID8gKFxyXG4gICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAge2NoYXJ0RGF0YS5zdGF0dXNEaXN0cmlidXRpb24ubWFwKChpdGVtKSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8Qm94IGtleT17aXRlbS5zdGF0dXN9IGZsZXgganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICA8VGV4dCBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PntpdGVtLnN0YXR1cy5yZXBsYWNlKC9fL2csICcgJyl9PC9UZXh0PlxyXG4gICAgICAgICAgICAgICAgICA8Qm94XHJcbiAgICAgICAgICAgICAgICAgICAgYmc9e2l0ZW0uc3RhdHVzID09PSAnQ0hFQ0tFRF9JTicgPyAnc3VjY2VzcycgOiBpdGVtLnN0YXR1cyA9PT0gJ1BFTkRJTkdfQVBQUk9WQUwnID8gJ3dhcm5pbmcnIDogaXRlbS5zdGF0dXMgPT09ICdBUFBST1ZFRCcgPyAnaW5mbycgOiAnZ3JleTQwJ31cclxuICAgICAgICAgICAgICAgICAgICBweD1cIm1kXCJcclxuICAgICAgICAgICAgICAgICAgICBweT1cInNtXCJcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6ICc0cHgnIH19XHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIndoaXRlXCI+e2l0ZW0uY291bnR9PC9UZXh0PlxyXG4gICAgICAgICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGNvbG9yOiBtdXRlZENvbG9yIH19Pk5vIGRhdGEgYXZhaWxhYmxlPC9UZXh0PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgey8qIERlbGl2ZXJpZXMgUGVyIERheSAqL31cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHA9XCJ4bFwiIHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgPEg0IG1iPVwibGdcIiBzdHlsZT17eyBjb2xvcjogdGV4dENvbG9yIH19PkRlbGl2ZXJpZXMgKExhc3QgNyBEYXlzKTwvSDQ+XHJcbiAgICAgICAgICB7Y2hhcnREYXRhPy5kZWxpdmVyaWVzUGVyRGF5ID8gKFxyXG4gICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAge2NoYXJ0RGF0YS5kZWxpdmVyaWVzUGVyRGF5Lm1hcCgoZGF5KSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8Qm94IGtleT17ZGF5LmRhdGV9IGZsZXggYWxpZ25JdGVtcz1cImNlbnRlclwiIHN0eWxlPXt7IGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IHdpZHRoOiAnODBweCcsIGNvbG9yOiB0ZXh0Q29sb3IgfX0+e25ldyBEYXRlKGRheS5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuJywgeyB3ZWVrZGF5OiAnc2hvcnQnIH0pfTwvVGV4dD5cclxuICAgICAgICAgICAgICAgICAgPEJveFxyXG4gICAgICAgICAgICAgICAgICAgIGJnPVwiaW5mb1wiXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke01hdGgubWluKGRheS5jb3VudCAqIDEwLCAxMDApfSVgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiBkYXkuY291bnQgPiAwID8gJzIwcHgnIDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGNvbG9yOiB0ZXh0Q29sb3IgfX0+e2RheS5jb3VudH08L1RleHQ+XHJcbiAgICAgICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICA8VGV4dCBzdHlsZT17eyBjb2xvcjogbXV0ZWRDb2xvciB9fT5ObyBkYXRhIGF2YWlsYWJsZTwvVGV4dD5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgIDwvQm94PlxyXG4gICAgPC9Cb3g+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZDtcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEJveCwgSDMsIEg0LCBUZXh0LCBCdXR0b24sIEljb24sIExvYWRlciwgTWVzc2FnZUJveCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5pbXBvcnQgeyBBY3Rpb25Qcm9wcyB9IGZyb20gJ2FkbWluanMnO1xyXG5cclxuY29uc3QgU2VuZFFyTW9kYWw6IFJlYWN0LkZDPEFjdGlvblByb3BzPiA9IChwcm9wcykgPT4ge1xyXG4gIGNvbnN0IHsgcmVjb3JkIH0gPSBwcm9wcztcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3FySW1hZ2VVcmwsIHNldFFySW1hZ2VVcmxdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gdXNlU3RhdGU8eyB0eXBlOiAnc3VjY2VzcycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xyXG5cclxuICBjb25zdCB2aXNpdElkID0gcmVjb3JkPy5wYXJhbXM/LmlkO1xyXG4gIGNvbnN0IHZpc2l0b3JOYW1lID0gcmVjb3JkPy5wYXJhbXM/LnZpc2l0b3JOYW1lIHx8ICdWaXNpdG9yJztcclxuICBjb25zdCB2aXNpdG9yUGhvbmUgPSByZWNvcmQ/LnBhcmFtcz8udmlzaXRvclBob25lO1xyXG4gIGNvbnN0IHZpc2l0b3JFbWFpbCA9IHJlY29yZD8ucGFyYW1zPy52aXNpdG9yRW1haWw7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyBMb2FkIFFSIGNvZGUgaW1hZ2VcclxuICAgIGlmICh2aXNpdElkKSB7XHJcbiAgICAgIGxvYWRRckNvZGUoKTtcclxuICAgIH1cclxuICB9LCBbdmlzaXRJZF0pO1xyXG5cclxuICBjb25zdCBsb2FkUXJDb2RlID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYC9hZG1pbi9hcGkvcXIvJHt2aXNpdElkfWAsIHtcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgICAgIHNldFFySW1hZ2VVcmwoZGF0YS5xckRhdGFVcmwpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBRUiBjb2RlOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVTZW5kID0gYXN5bmMgKG1ldGhvZDogJ3doYXRzYXBwJyB8ICdlbWFpbCcpID0+IHtcclxuICAgIGlmICghdmlzaXRJZCkgcmV0dXJuO1xyXG5cclxuICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL3NlbmQtcXInLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICB2aXNpdElkLFxyXG4gICAgICAgICAgbWV0aG9kLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG5cclxuICAgICAgaWYgKHJlcy5vaykge1xyXG4gICAgICAgIHNldE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgdGV4dDogYFFSIGNvZGUgc2VudCB2aWEgJHttZXRob2QgPT09ICd3aGF0c2FwcCcgPyAnV2hhdHNBcHAnIDogJ0VtYWlsJ30gc3VjY2Vzc2Z1bGx5IWAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2V0TWVzc2FnZSh7XHJcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgdGV4dDogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2VuZCBRUiBjb2RlJyxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICB0ZXh0OiAnTmV0d29yayBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi4nLFxyXG4gICAgICB9KTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94IHA9XCJ4eGxcIj5cclxuICAgICAgPEgzIG1iPVwieGxcIj5TZW5kIFFSIENvZGU8L0gzPlxyXG4gICAgICBcclxuICAgICAgPEJveCBtYj1cInhsXCI+XHJcbiAgICAgICAgPFRleHQgbWI9XCJzbVwiIGZvbnRXZWlnaHQ9XCJib2xkXCI+VmlzaXRvcjoge3Zpc2l0b3JOYW1lfTwvVGV4dD5cclxuICAgICAgICB7dmlzaXRvclBob25lICYmIDxUZXh0IG1iPVwic21cIj5QaG9uZToge3Zpc2l0b3JQaG9uZX08L1RleHQ+fVxyXG4gICAgICAgIHt2aXNpdG9yRW1haWwgJiYgPFRleHQgbWI9XCJzbVwiPkVtYWlsOiB7dmlzaXRvckVtYWlsfTwvVGV4dD59XHJcbiAgICAgIDwvQm94PlxyXG5cclxuICAgICAgey8qIFFSIENvZGUgUHJldmlldyAqL31cclxuICAgICAgPEJveFxyXG4gICAgICAgIG1iPVwieGxcIlxyXG4gICAgICAgIGZsZXhcclxuICAgICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcclxuICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcclxuICAgICAgICBwPVwieGxcIlxyXG4gICAgICAgIGJnPVwiZ3JleTIwXCJcclxuICAgICAgICBzdHlsZT17eyBib3JkZXJSYWRpdXM6ICc4cHgnIH19XHJcbiAgICAgID5cclxuICAgICAgICA8SDQgbWI9XCJsZ1wiPlFSIENvZGUgUHJldmlldzwvSDQ+XHJcbiAgICAgICAge3FySW1hZ2VVcmwgPyAoXHJcbiAgICAgICAgICA8aW1nXHJcbiAgICAgICAgICAgIHNyYz17cXJJbWFnZVVybH1cclxuICAgICAgICAgICAgYWx0PVwiUVIgQ29kZVwiXHJcbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMjAwcHgnLCBoZWlnaHQ6ICcyMDBweCcsIGJhY2tncm91bmQ6ICd3aGl0ZScsIHBhZGRpbmc6ICcxNnB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JyB9fVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICApIDogKFxyXG4gICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIHN0eWxlPXt7IHdpZHRoOiAnMjAwcHgnLCBoZWlnaHQ6ICcyMDBweCcgfX0+XHJcbiAgICAgICAgICAgIDxMb2FkZXIgLz5cclxuICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICl9XHJcbiAgICAgIDwvQm94PlxyXG5cclxuICAgICAgey8qIE1lc3NhZ2UgKi99XHJcbiAgICAgIHttZXNzYWdlICYmIChcclxuICAgICAgICA8Qm94IG1iPVwieGxcIj5cclxuICAgICAgICAgIDxNZXNzYWdlQm94XHJcbiAgICAgICAgICAgIG1lc3NhZ2U9e21lc3NhZ2UudGV4dH1cclxuICAgICAgICAgICAgdmFyaWFudD17bWVzc2FnZS50eXBlfVxyXG4gICAgICAgICAgICBvbkNsb3NlQ2xpY2s9eygpID0+IHNldE1lc3NhZ2UobnVsbCl9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qIFNlbmQgT3B0aW9ucyAqL31cclxuICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBzdHlsZT17eyBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICA8VGV4dCBmb250V2VpZ2h0PVwiYm9sZFwiIG1iPVwic21cIj5TZW5kIFFSIENvZGUgdmlhOjwvVGV4dD5cclxuICAgICAgICBcclxuICAgICAgICB7LyogV2hhdHNBcHAgT3B0aW9uICovfVxyXG4gICAgICAgIDxCdXR0b25cclxuICAgICAgICAgIHZhcmlhbnQ9XCJzdWNjZXNzXCJcclxuICAgICAgICAgIGRpc2FibGVkPXshdmlzaXRvclBob25lIHx8IGxvYWRpbmd9XHJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVTZW5kKCd3aGF0c2FwcCcpfVxyXG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge2xvYWRpbmcgPyAoXHJcbiAgICAgICAgICAgIDxMb2FkZXIgLz5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgPEljb24gaWNvbj1cIk1lc3NhZ2VDaXJjbGVcIiBtcj1cInNtXCIgLz5cclxuICAgICAgICAgICAgICBTZW5kIHZpYSBXaGF0c0FwcFxyXG4gICAgICAgICAgICAgIHshdmlzaXRvclBob25lICYmIDxUZXh0IG1sPVwic21cIiBmb250U2l6ZT1cInNtXCI+KE5vIHBob25lIG51bWJlcik8L1RleHQ+fVxyXG4gICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9CdXR0b24+XHJcblxyXG4gICAgICAgIHsvKiBFbWFpbCBPcHRpb24gKi99XHJcbiAgICAgICAgPEJ1dHRvblxyXG4gICAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxyXG4gICAgICAgICAgZGlzYWJsZWQ9eyF2aXNpdG9yRW1haWwgfHwgbG9hZGluZ31cclxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVNlbmQoJ2VtYWlsJyl9XHJcbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICB7bG9hZGluZyA/IChcclxuICAgICAgICAgICAgPExvYWRlciAvPlxyXG4gICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgPD5cclxuICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiTWFpbFwiIG1yPVwic21cIiAvPlxyXG4gICAgICAgICAgICAgIFNlbmQgdmlhIEVtYWlsXHJcbiAgICAgICAgICAgICAgeyF2aXNpdG9yRW1haWwgJiYgPFRleHQgbWw9XCJzbVwiIGZvbnRTaXplPVwic21cIj4oTm8gZW1haWwpPC9UZXh0Pn1cclxuICAgICAgICAgICAgPC8+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICA8L0JveD5cclxuXHJcbiAgICAgIHsvKiBObyBjb250YWN0IGluZm8gd2FybmluZyAqL31cclxuICAgICAgeyF2aXNpdG9yUGhvbmUgJiYgIXZpc2l0b3JFbWFpbCAmJiAoXHJcbiAgICAgICAgPEJveCBtdD1cInhsXCI+XHJcbiAgICAgICAgICA8TWVzc2FnZUJveFxyXG4gICAgICAgICAgICBtZXNzYWdlPVwiTm8gY29udGFjdCBpbmZvcm1hdGlvbiBhdmFpbGFibGUgZm9yIHRoaXMgdmlzaXRvci4gUGxlYXNlIGFkZCBwaG9uZSBvciBlbWFpbCB0byBzZW5kIHRoZSBRUiBjb2RlLlwiXHJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ3YXJuaW5nXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgICl9XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2VuZFFyTW9kYWw7XHJcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgQm94LCBIMywgVGV4dCwgQnV0dG9uLCBJbnB1dCwgTGFiZWwsIE1lc3NhZ2VCb3gsIExvYWRlciB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5cclxuaW50ZXJmYWNlIENoYW5nZVBhc3N3b3JkTW9kYWxQcm9wcyB7XHJcbiAgb25DbG9zZT86ICgpID0+IHZvaWQ7XHJcbn1cclxuXHJcbmNvbnN0IENoYW5nZVBhc3N3b3JkTW9kYWw6IFJlYWN0LkZDPENoYW5nZVBhc3N3b3JkTW9kYWxQcm9wcz4gPSAoeyBvbkNsb3NlIH0pID0+IHtcclxuICBjb25zdCBbY3VycmVudFBhc3N3b3JkLCBzZXRDdXJyZW50UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFtuZXdQYXNzd29yZCwgc2V0TmV3UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFtjb25maXJtUGFzc3dvcmQsIHNldENvbmZpcm1QYXNzd29yZF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlPHsgdHlwZTogJ3N1Y2Nlc3MnIHwgJ2Vycm9yJzsgdGV4dDogc3RyaW5nIH0gfCBudWxsPihudWxsKTtcclxuXHJcbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgXHJcbiAgICAvLyBWYWxpZGF0aW9uXHJcbiAgICBpZiAoIWN1cnJlbnRQYXNzd29yZCB8fCAhbmV3UGFzc3dvcmQgfHwgIWNvbmZpcm1QYXNzd29yZCkge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ0FsbCBmaWVsZHMgYXJlIHJlcXVpcmVkJyB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdQYXNzd29yZCAhPT0gY29uZmlybVBhc3N3b3JkKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnTmV3IHBhc3N3b3JkcyBkbyBub3QgbWF0Y2gnIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld1Bhc3N3b3JkLmxlbmd0aCA8IDYpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdOZXcgcGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMnIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldE1lc3NhZ2UobnVsbCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvY2hhbmdlLXBhc3N3b3JkJywge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgY3VycmVudFBhc3N3b3JkLFxyXG4gICAgICAgICAgbmV3UGFzc3dvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcblxyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogJ1Bhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5IScgfSk7XHJcbiAgICAgICAgc2V0Q3VycmVudFBhc3N3b3JkKCcnKTtcclxuICAgICAgICBzZXROZXdQYXNzd29yZCgnJyk7XHJcbiAgICAgICAgc2V0Q29uZmlybVBhc3N3b3JkKCcnKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDbG9zZSBtb2RhbCBhZnRlciBzdWNjZXNzXHJcbiAgICAgICAgaWYgKG9uQ2xvc2UpIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQob25DbG9zZSwgMjAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiBkYXRhLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3IuIFBsZWFzZSB0cnkgYWdhaW4uJyB9KTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94IHA9XCJ4eGxcIiBzdHlsZT17eyBtYXhXaWR0aDogJzQwMHB4JywgbWFyZ2luOiAnMCBhdXRvJyB9fT5cclxuICAgICAgPEgzIG1iPVwieGxcIj5DaGFuZ2UgUGFzc3dvcmQ8L0gzPlxyXG5cclxuICAgICAge21lc3NhZ2UgJiYgKFxyXG4gICAgICAgIDxCb3ggbWI9XCJ4bFwiPlxyXG4gICAgICAgICAgPE1lc3NhZ2VCb3hcclxuICAgICAgICAgICAgbWVzc2FnZT17bWVzc2FnZS50ZXh0fVxyXG4gICAgICAgICAgICB2YXJpYW50PXttZXNzYWdlLnR5cGV9XHJcbiAgICAgICAgICAgIG9uQ2xvc2VDbGljaz17KCkgPT4gc2V0TWVzc2FnZShudWxsKX1cclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fT5cclxuICAgICAgICA8Qm94IG1iPVwibGdcIj5cclxuICAgICAgICAgIDxMYWJlbCByZXF1aXJlZD5DdXJyZW50IFBhc3N3b3JkPC9MYWJlbD5cclxuICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICB2YWx1ZT17Y3VycmVudFBhc3N3b3JkfVxyXG4gICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEN1cnJlbnRQYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgY3VycmVudCBwYXNzd29yZFwiXHJcbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgPEJveCBtYj1cImxnXCI+XHJcbiAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+TmV3IFBhc3N3b3JkPC9MYWJlbD5cclxuICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICB2YWx1ZT17bmV3UGFzc3dvcmR9XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0TmV3UGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIG5ldyBwYXNzd29yZFwiXHJcbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgPEJveCBtYj1cInhsXCI+XHJcbiAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+Q29uZmlybSBOZXcgUGFzc3dvcmQ8L0xhYmVsPlxyXG4gICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXHJcbiAgICAgICAgICAgIHZhbHVlPXtjb25maXJtUGFzc3dvcmR9XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0Q29uZmlybVBhc3N3b3JkKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJDb25maXJtIG5ldyBwYXNzd29yZFwiXHJcbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgPEJveCBmbGV4IHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPEJ1dHRvblxyXG4gICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcclxuICAgICAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cclxuICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICB7bG9hZGluZyA/IDxMb2FkZXIgLz4gOiAnQ2hhbmdlIFBhc3N3b3JkJ31cclxuICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAge29uQ2xvc2UgJiYgKFxyXG4gICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxyXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xvc2V9XHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBDYW5jZWxcclxuICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICA8L2Zvcm0+XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlUGFzc3dvcmRNb2RhbDtcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3gsIEgyLCBIMywgVGV4dCwgQnV0dG9uLCBJbnB1dCwgTGFiZWwsIE1lc3NhZ2VCb3gsIExvYWRlciB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5pbXBvcnQgeyB1c2VDdXJyZW50QWRtaW4gfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2UgUGFzc3dvcmQgcGFnZSAtIGFjY2Vzc2libGUgZnJvbSBzaWRlYmFyIGZvciBhbnkgbG9nZ2VkLWluIHVzZXIuXHJcbiAqIFVzZXMgY3VycmVudEFkbWluLmVtYWlsIGZyb20gQWRtaW5KUyBzZXNzaW9uIHRvIGlkZW50aWZ5IHRoZSB1c2VyLlxyXG4gKi9cclxuY29uc3QgQ2hhbmdlUGFzc3dvcmRQYWdlOiBSZWFjdC5GQyA9ICgpID0+IHtcclxuICBjb25zdCBbY3VycmVudEFkbWluXSA9IHVzZUN1cnJlbnRBZG1pbigpO1xyXG4gIGNvbnN0IFtjdXJyZW50UGFzc3dvcmQsIHNldEN1cnJlbnRQYXNzd29yZF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW25ld1Bhc3N3b3JkLCBzZXROZXdQYXNzd29yZF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW2NvbmZpcm1QYXNzd29yZCwgc2V0Q29uZmlybVBhc3N3b3JkXSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gdXNlU3RhdGU8eyB0eXBlOiAnc3VjY2VzcycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xyXG5cclxuICBjb25zdCB1c2VyRW1haWwgPSAoY3VycmVudEFkbWluIGFzIGFueSk/LmVtYWlsO1xyXG5cclxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgaWYgKCF1c2VyRW1haWwpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gY2hhbmdlIHBhc3N3b3JkLicgfSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWN1cnJlbnRQYXNzd29yZCB8fCAhbmV3UGFzc3dvcmQgfHwgIWNvbmZpcm1QYXNzd29yZCkge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ0FsbCBmaWVsZHMgYXJlIHJlcXVpcmVkJyB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdQYXNzd29yZCAhPT0gY29uZmlybVBhc3N3b3JkKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnTmV3IHBhc3N3b3JkcyBkbyBub3QgbWF0Y2gnIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld1Bhc3N3b3JkLmxlbmd0aCA8IDYpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdOZXcgcGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMnIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldE1lc3NhZ2UobnVsbCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvY2hhbmdlLXBhc3N3b3JkJywge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgY3VycmVudFBhc3N3b3JkLFxyXG4gICAgICAgICAgbmV3UGFzc3dvcmQsXHJcbiAgICAgICAgICB1c2VyRW1haWwsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcblxyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogJ1Bhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5IScgfSk7XHJcbiAgICAgICAgc2V0Q3VycmVudFBhc3N3b3JkKCcnKTtcclxuICAgICAgICBzZXROZXdQYXNzd29yZCgnJyk7XHJcbiAgICAgICAgc2V0Q29uZmlybVBhc3N3b3JkKCcnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkJyB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdOZXR3b3JrIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLicgfSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoIXVzZXJFbWFpbCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPEJveCB2YXJpYW50PVwiZ3JleVwiIHA9XCJ4eGxcIj5cclxuICAgICAgICA8SDIgbWI9XCJsZ1wiPkNoYW5nZSBQYXNzd29yZDwvSDI+XHJcbiAgICAgICAgPE1lc3NhZ2VCb3ggbWVzc2FnZT1cIllvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBjaGFuZ2UgeW91ciBwYXNzd29yZC5cIiB2YXJpYW50PVwiZXJyb3JcIiAvPlxyXG4gICAgICA8L0JveD5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPEJveCB2YXJpYW50PVwiZ3JleVwiIHA9XCJ4eGxcIj5cclxuICAgICAgPEgyIG1iPVwic21cIj5DaGFuZ2UgUGFzc3dvcmQ8L0gyPlxyXG4gICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiIG1iPVwieHhsXCI+XHJcbiAgICAgICAgVXBkYXRlIHlvdXIgcGFzc3dvcmQgZm9yIGFjY291bnQ6IHt1c2VyRW1haWx9XHJcbiAgICAgIDwvVGV4dD5cclxuXHJcbiAgICAgIHttZXNzYWdlICYmIChcclxuICAgICAgICA8Qm94IG1iPVwieGxcIj5cclxuICAgICAgICAgIDxNZXNzYWdlQm94XHJcbiAgICAgICAgICAgIG1lc3NhZ2U9e21lc3NhZ2UudGV4dH1cclxuICAgICAgICAgICAgdmFyaWFudD17bWVzc2FnZS50eXBlfVxyXG4gICAgICAgICAgICBvbkNsb3NlQ2xpY2s9eygpID0+IHNldE1lc3NhZ2UobnVsbCl9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgPEJveFxyXG4gICAgICAgIGJnPVwid2hpdGVcIlxyXG4gICAgICAgIHA9XCJ4eGxcIlxyXG4gICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIG1heFdpZHRoOiAnNDAwcHgnLCBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyB9fVxyXG4gICAgICA+XHJcbiAgICAgICAgPGZvcm0gb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0+XHJcbiAgICAgICAgICA8Qm94IG1iPVwibGdcIj5cclxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkN1cnJlbnQgUGFzc3dvcmQ8L0xhYmVsPlxyXG4gICAgICAgICAgICA8SW5wdXRcclxuICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgIHZhbHVlPXtjdXJyZW50UGFzc3dvcmR9XHJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRDdXJyZW50UGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgY3VycmVudCBwYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgICA8Qm94IG1iPVwibGdcIj5cclxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPk5ldyBQYXNzd29yZDwvTGFiZWw+XHJcbiAgICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgdmFsdWU9e25ld1Bhc3N3b3JkfVxyXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0TmV3UGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgbmV3IHBhc3N3b3JkIChtaW4gNiBjaGFyYWN0ZXJzKVwiXHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgICA8Qm94IG1iPVwieGxcIj5cclxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPkNvbmZpcm0gTmV3IFBhc3N3b3JkPC9MYWJlbD5cclxuICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICB2YWx1ZT17Y29uZmlybVBhc3N3b3JkfVxyXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0Q29uZmlybVBhc3N3b3JkKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNvbmZpcm0gbmV3IHBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvQm94PlxyXG5cclxuICAgICAgICAgIDxCdXR0b24gdHlwZT1cInN1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgZGlzYWJsZWQ9e2xvYWRpbmd9IHN0eWxlPXt7IG1pbldpZHRoOiAnMTQwcHgnIH19PlxyXG4gICAgICAgICAgICB7bG9hZGluZyA/IDxMb2FkZXIgLz4gOiAnQ2hhbmdlIFBhc3N3b3JkJ31cclxuICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgIDwvZm9ybT5cclxuICAgICAgPC9Cb3g+XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlUGFzc3dvcmRQYWdlO1xyXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJveCwgSDIsIFRleHQsIElucHV0LCBCdXR0b24sIExhYmVsLCBMb2FkZXIgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IHVzZUN1cnJlbnRBZG1pbiB9IGZyb20gJ2FkbWluanMnO1xuXG5pbnRlcmZhY2UgUHJvZmlsZURhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIHJvbGU6IHN0cmluZztcbn1cblxuY29uc3QgRWRpdFByb2ZpbGVQYW5lbDogUmVhY3QuRkMgPSAoKSA9PiB7XG4gIGNvbnN0IFtjdXJyZW50QWRtaW5dID0gdXNlQ3VycmVudEFkbWluKCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbcHJvZmlsZSwgc2V0UHJvZmlsZV0gPSB1c2VTdGF0ZTxQcm9maWxlRGF0YSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbbmFtZSwgc2V0TmFtZV0gPSB1c2VTdGF0ZSgnJyk7XG4gIFxuICBjb25zdCBlbWFpbCA9IChjdXJyZW50QWRtaW4gYXMgYW55KT8uZW1haWwgfHwgJyc7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBsb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvYWRtaW4vYXBpL3Byb2ZpbGU/ZW1haWw9JHtlbmNvZGVVUklDb21wb25lbnQoZW1haWwpfWAsIHsgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyB9KTtcbiAgICAgICAgaWYgKHJlcy5vaykge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICAgIHNldFByb2ZpbGUoZGF0YSk7XG4gICAgICAgICAgc2V0TmFtZShkYXRhLm5hbWUgfHwgJycpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChlbWFpbCkgbG9hZCgpO1xuICB9LCBbZW1haWxdKTtcblxuICBjb25zdCBzYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghZW1haWwpIHJldHVybjtcbiAgICBzZXRTYXZpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL3Byb2ZpbGUvdXBkYXRlJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZW1haWwsIG5hbWUgfSksXG4gICAgICB9KTtcbiAgICAgIGlmIChyZXMub2spIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgIHNldFByb2ZpbGUoZGF0YSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFNhdmluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIiBoZWlnaHQ9XCI3MHZoXCI+XG4gICAgICAgIDxMb2FkZXIgLz5cbiAgICAgIDwvQm94PlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggdmFyaWFudD1cImdyZXlcIiBwPVwieHhsXCIgc3R5bGU9e3sgbWF4V2lkdGg6IDY0MCB9fT5cbiAgICAgIDxIMj5FZGl0IFByb2ZpbGU8L0gyPlxuICAgICAgPEJveCBtdD1cInhsXCI+XG4gICAgICAgIDxMYWJlbD5GdWxsIE5hbWU8L0xhYmVsPlxuICAgICAgICA8SW5wdXQgdmFsdWU9e25hbWV9IG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXROYW1lKGUudGFyZ2V0LnZhbHVlKX0gLz5cbiAgICAgIDwvQm94PlxuICAgICAgPEJveCBtdD1cImxnXCI+XG4gICAgICAgIDxMYWJlbD5FbWFpbDwvTGFiZWw+XG4gICAgICAgIDxJbnB1dCB2YWx1ZT17cHJvZmlsZT8uZW1haWwgfHwgJyd9IGRpc2FibGVkIC8+XG4gICAgICA8L0JveD5cbiAgICAgIFxuICAgICAgPEJveCBtdD1cInhsXCIgZmxleD5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9e3NhdmV9IGRpc2FibGVkPXtzYXZpbmd9PlxuICAgICAgICAgIHtzYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlIENoYW5nZXMnfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPFRleHQgbWw9XCJsZ1wiIGNvbG9yPVwiZ3JleTYwXCI+Um9sZTogeyhwcm9maWxlIGFzIGFueSk/LnJvbGUgfHwgJ04vQSd9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFZGl0UHJvZmlsZVBhbmVsO1xuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3gsIEgyLCBIMywgVGV4dCwgQnV0dG9uLCBJbnB1dCwgTGFiZWwsIFNlbGVjdCwgVGFibGUsIFRhYmxlSGVhZCwgVGFibGVCb2R5LCBUYWJsZVJvdywgVGFibGVDZWxsLCBJY29uLCBMb2FkZXIsIE1lc3NhZ2VCb3gsIFRhYnMsIFRhYiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5pbXBvcnQgeyB1c2VDdXJyZW50QWRtaW4gfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbmludGVyZmFjZSBSZXBvcnRGaWx0ZXJzIHtcclxuICBkYXRlRnJvbTogc3RyaW5nO1xyXG4gIGRhdGVUbzogc3RyaW5nO1xyXG4gIGxvY2F0aW9uOiBzdHJpbmc7XHJcbiAgY29tcGFueTogc3RyaW5nO1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUmVwb3J0RGF0YSB7XHJcbiAgdmlzaXRvcnM/OiBhbnlbXTtcclxuICBkZWxpdmVyaWVzPzogYW55W107XHJcbn1cclxuXHJcbmNvbnN0IFJlcG9ydHNQYW5lbDogUmVhY3QuRkMgPSAoKSA9PiB7XHJcbiAgY29uc3QgW2N1cnJlbnRBZG1pbl0gPSB1c2VDdXJyZW50QWRtaW4oKTtcclxuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGU8J3Zpc2l0b3JzJyB8ICdkZWxpdmVyaWVzJz4oJ3Zpc2l0b3JzJyk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcblxyXG4gIGNvbnN0IHJvbGUgPSAoY3VycmVudEFkbWluIGFzIGFueSk/LnJvbGUgfHwgJ0FETUlOJztcclxuICBjb25zdCBob3N0Q29tcGFueSA9IChjdXJyZW50QWRtaW4gYXMgYW55KT8uaG9zdENvbXBhbnkgfHwgJyc7XHJcbiAgY29uc3QgaXNIb3N0ID0gcm9sZSA9PT0gJ0hPU1QnO1xyXG5cclxuICBjb25zdCBbZmlsdGVycywgc2V0RmlsdGVyc10gPSB1c2VTdGF0ZTxSZXBvcnRGaWx0ZXJzPih7XHJcbiAgICBkYXRlRnJvbTogbmV3IERhdGUoRGF0ZS5ub3coKSAtIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXHJcbiAgICBkYXRlVG86IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxyXG4gICAgbG9jYXRpb246ICcnLFxyXG4gICAgY29tcGFueTogaXNIb3N0ID8gaG9zdENvbXBhbnkgOiAnJywgLy8gQXV0by1zZXQgY29tcGFueSBmb3IgSE9TVFxyXG4gICAgc3RhdHVzOiAnJyxcclxuICB9KTtcclxuICBjb25zdCBbcmVwb3J0RGF0YSwgc2V0UmVwb3J0RGF0YV0gPSB1c2VTdGF0ZTxSZXBvcnREYXRhPih7fSk7XHJcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gdXNlU3RhdGU8eyB0eXBlOiAnc3VjY2VzcycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xyXG5cclxuICAvLyBBbGwgcm9sZXMgY2FuIGFjY2VzcyByZXBvcnRzIChBRE1JTiwgSE9TVCwgUkVDRVBUSU9OKVxyXG4gIC8vIEhPU1Qgc2VlcyBvbmx5IHRoZWlyIGNvbXBhbnksIFJFQ0VQVElPTiBzZWVzIGFsbFxyXG5cclxuICBjb25zdCBoYW5kbGVGaWx0ZXJDaGFuZ2UgPSAoa2V5OiBrZXlvZiBSZXBvcnRGaWx0ZXJzLCB2YWx1ZTogc3RyaW5nKSA9PiB7XHJcbiAgICBzZXRGaWx0ZXJzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBba2V5XTogdmFsdWUgfSkpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdlbmVyYXRlUmVwb3J0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldE1lc3NhZ2UobnVsbCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xyXG4gICAgICBpZiAoZmlsdGVycy5kYXRlRnJvbSkgcGFyYW1zLmFwcGVuZCgnZGF0ZUZyb20nLCBmaWx0ZXJzLmRhdGVGcm9tKTtcclxuICAgICAgaWYgKGZpbHRlcnMuZGF0ZVRvKSBwYXJhbXMuYXBwZW5kKCdkYXRlVG8nLCBmaWx0ZXJzLmRhdGVUbyk7XHJcbiAgICAgIGlmIChmaWx0ZXJzLmxvY2F0aW9uKSBwYXJhbXMuYXBwZW5kKCdsb2NhdGlvbicsIGZpbHRlcnMubG9jYXRpb24pO1xyXG4gICAgICBpZiAoZmlsdGVycy5jb21wYW55KSBwYXJhbXMuYXBwZW5kKCdjb21wYW55JywgZmlsdGVycy5jb21wYW55KTtcclxuICAgICAgaWYgKGZpbHRlcnMuc3RhdHVzKSBwYXJhbXMuYXBwZW5kKCdzdGF0dXMnLCBmaWx0ZXJzLnN0YXR1cyk7XHJcblxyXG4gICAgICBjb25zdCBlbmRwb2ludCA9IGFjdGl2ZVRhYiA9PT0gJ3Zpc2l0b3JzJyBcclxuICAgICAgICA/ICcvYWRtaW4vYXBpL3JlcG9ydHMvdmlzaXRvcnMnIFxyXG4gICAgICAgIDogJy9hZG1pbi9hcGkvcmVwb3J0cy9kZWxpdmVyaWVzJztcclxuXHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke2VuZHBvaW50fT8ke3BhcmFtc31gLCB7XHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0UmVwb3J0RGF0YSgocHJldikgPT4gKHsgLi4ucHJldiwgW2FjdGl2ZVRhYl06IGRhdGEgfSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnRmFpbGVkIHRvIGdlbmVyYXRlIHJlcG9ydCcgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnTmV0d29yayBlcnJvci4gUGxlYXNlIHRyeSBhZ2Fpbi4nIH0pO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZXhwb3J0UmVwb3J0ID0gYXN5bmMgKGZvcm1hdDogJ2NzdicgfCAnZXhjZWwnKSA9PiB7XHJcbiAgICBzZXRFeHBvcnRpbmcodHJ1ZSk7XHJcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcclxuICAgICAgaWYgKGZpbHRlcnMuZGF0ZUZyb20pIHBhcmFtcy5hcHBlbmQoJ2RhdGVGcm9tJywgZmlsdGVycy5kYXRlRnJvbSk7XHJcbiAgICAgIGlmIChmaWx0ZXJzLmRhdGVUbykgcGFyYW1zLmFwcGVuZCgnZGF0ZVRvJywgZmlsdGVycy5kYXRlVG8pO1xyXG4gICAgICBpZiAoZmlsdGVycy5sb2NhdGlvbikgcGFyYW1zLmFwcGVuZCgnbG9jYXRpb24nLCBmaWx0ZXJzLmxvY2F0aW9uKTtcclxuICAgICAgaWYgKGZpbHRlcnMuY29tcGFueSkgcGFyYW1zLmFwcGVuZCgnY29tcGFueScsIGZpbHRlcnMuY29tcGFueSk7XHJcbiAgICAgIGlmIChmaWx0ZXJzLnN0YXR1cykgcGFyYW1zLmFwcGVuZCgnc3RhdHVzJywgZmlsdGVycy5zdGF0dXMpO1xyXG4gICAgICBwYXJhbXMuYXBwZW5kKCdmb3JtYXQnLCBmb3JtYXQpO1xyXG5cclxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBhY3RpdmVUYWIgPT09ICd2aXNpdG9ycydcclxuICAgICAgICA/ICcvYWRtaW4vYXBpL3JlcG9ydHMvdmlzaXRvcnMvZXhwb3J0J1xyXG4gICAgICAgIDogJy9hZG1pbi9hcGkvcmVwb3J0cy9kZWxpdmVyaWVzL2V4cG9ydCc7XHJcblxyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtlbmRwb2ludH0/JHtwYXJhbXN9YCwge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHJlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXMuYmxvYigpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgIGEuZG93bmxvYWQgPSBgJHthY3RpdmVUYWJ9LXJlcG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS4ke2Zvcm1hdCA9PT0gJ2V4Y2VsJyA/ICd4bHN4JyA6ICdjc3YnfWA7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcclxuICAgICAgICBhLmNsaWNrKCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhKTtcclxuICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnc3VjY2VzcycsIHRleHQ6IGBSZXBvcnQgZXhwb3J0ZWQgYXMgJHtmb3JtYXQudG9VcHBlckNhc2UoKX1gIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnRmFpbGVkIHRvIGV4cG9ydCByZXBvcnQnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3IuIFBsZWFzZSB0cnkgYWdhaW4uJyB9KTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldEV4cG9ydGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdmlzaXRvclN0YXR1c2VzID0gWydDSEVDS0VEX0lOJywgJ0NIRUNLRURfT1VUJywgJ1BSRV9SRUdJU1RFUkVEJywgJ1BFTkRJTkdfQVBQUk9WQUwnLCAnQVBQUk9WRUQnLCAnUkVKRUNURUQnXTtcclxuICBjb25zdCBkZWxpdmVyeVN0YXR1c2VzID0gWydSRUNFSVZFRCcsICdQSUNLRURfVVAnXTtcclxuICBjb25zdCBsb2NhdGlvbnMgPSBbJ0JBUldBX1RPV0VSUycsICdNQVJJTkFfNTAnLCAnRUxFTUVOVF9NQVJJT1RUJ107XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94IHZhcmlhbnQ9XCJncmV5XCIgcD1cInh4bFwiPlxyXG4gICAgICA8SDIgbWI9XCJ4eGxcIj5SZXBvcnRzPC9IMj5cclxuXHJcbiAgICAgIHttZXNzYWdlICYmIChcclxuICAgICAgICA8Qm94IG1iPVwieGxcIj5cclxuICAgICAgICAgIDxNZXNzYWdlQm94XHJcbiAgICAgICAgICAgIG1lc3NhZ2U9e21lc3NhZ2UudGV4dH1cclxuICAgICAgICAgICAgdmFyaWFudD17bWVzc2FnZS50eXBlfVxyXG4gICAgICAgICAgICBvbkNsb3NlQ2xpY2s9eygpID0+IHNldE1lc3NhZ2UobnVsbCl9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qIFRhYnMgKi99XHJcbiAgICAgIDxCb3ggbWI9XCJ4bFwiPlxyXG4gICAgICAgIDxUYWJzPlxyXG4gICAgICAgICAgPFRhYlxyXG4gICAgICAgICAgICBpZD1cInZpc2l0b3JzXCJcclxuICAgICAgICAgICAgbGFiZWw9XCJWaXNpdG9ycyBSZXBvcnRcIlxyXG4gICAgICAgICAgICBpc1NlbGVjdGVkPXthY3RpdmVUYWIgPT09ICd2aXNpdG9ycyd9XHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYigndmlzaXRvcnMnKX1cclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8VGFiXHJcbiAgICAgICAgICAgIGlkPVwiZGVsaXZlcmllc1wiXHJcbiAgICAgICAgICAgIGxhYmVsPVwiRGVsaXZlcmllcyBSZXBvcnRcIlxyXG4gICAgICAgICAgICBpc1NlbGVjdGVkPXthY3RpdmVUYWIgPT09ICdkZWxpdmVyaWVzJ31cclxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKCdkZWxpdmVyaWVzJyl9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvVGFicz5cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogRmlsdGVycyAqL31cclxuICAgICAgPEJveCBiZz1cIndoaXRlXCIgcD1cInhsXCIgbWI9XCJ4bFwiIHN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknIH19PlxyXG4gICAgICAgIDxIMyBtYj1cImxnXCI+RmlsdGVyczwvSDM+XHJcbiAgICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBzdHlsZT17eyBnYXA6ICcxNnB4JywgZmxleFdyYXA6ICd3cmFwJyB9fT5cclxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgbWluV2lkdGg6ICcxNTBweCcgfX0+XHJcbiAgICAgICAgICAgIDxMYWJlbD5EYXRlIEZyb208L0xhYmVsPlxyXG4gICAgICAgICAgICA8SW5wdXRcclxuICAgICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXHJcbiAgICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcnMuZGF0ZUZyb219XHJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoJ2RhdGVGcm9tJywgZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1pbldpZHRoOiAnMTUwcHgnIH19PlxyXG4gICAgICAgICAgICA8TGFiZWw+RGF0ZSBUbzwvTGFiZWw+XHJcbiAgICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcclxuICAgICAgICAgICAgICB2YWx1ZT17ZmlsdGVycy5kYXRlVG99XHJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoJ2RhdGVUbycsIGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgPEJveCBzdHlsZT17eyBtaW5XaWR0aDogJzE1MHB4JyB9fT5cclxuICAgICAgICAgICAgPExhYmVsPkxvY2F0aW9uPC9MYWJlbD5cclxuICAgICAgICAgICAgPFNlbGVjdFxyXG4gICAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJzLmxvY2F0aW9ufVxyXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoc2VsZWN0ZWQpID0+IGhhbmRsZUZpbHRlckNoYW5nZSgnbG9jYXRpb24nLCAoc2VsZWN0ZWQgYXMgYW55KT8udmFsdWUgfHwgJycpfVxyXG4gICAgICAgICAgICAgIG9wdGlvbnM9e1tcclxuICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBMb2NhdGlvbnMnIH0sXHJcbiAgICAgICAgICAgICAgICAuLi5sb2NhdGlvbnMubWFwKChsKSA9PiAoeyB2YWx1ZTogbCwgbGFiZWw6IGwucmVwbGFjZSgnXycsICcgJykgfSkpLFxyXG4gICAgICAgICAgICAgIF19XHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgbWluV2lkdGg6ICcxNTBweCcgfX0+XHJcbiAgICAgICAgICAgIDxMYWJlbD5Db21wYW55IHtpc0hvc3QgJiYgJyhZb3VyIGNvbXBhbnkpJ308L0xhYmVsPlxyXG4gICAgICAgICAgICA8SW5wdXRcclxuICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcnMuY29tcGFueX1cclxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IGhhbmRsZUZpbHRlckNoYW5nZSgnY29tcGFueScsIGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17aXNIb3N0ID8gaG9zdENvbXBhbnkgOiBcIkZpbHRlciBieSBjb21wYW55XCJ9XHJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2lzSG9zdH1cclxuICAgICAgICAgICAgICBzdHlsZT17aXNIb3N0ID8geyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjNmNGY2JyB9IDoge319XHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgbWluV2lkdGg6ICcxNTBweCcgfX0+XHJcbiAgICAgICAgICAgIDxMYWJlbD5TdGF0dXM8L0xhYmVsPlxyXG4gICAgICAgICAgICA8U2VsZWN0XHJcbiAgICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcnMuc3RhdHVzfVxyXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoc2VsZWN0ZWQpID0+IGhhbmRsZUZpbHRlckNoYW5nZSgnc3RhdHVzJywgKHNlbGVjdGVkIGFzIGFueSk/LnZhbHVlIHx8ICcnKX1cclxuICAgICAgICAgICAgICBvcHRpb25zPXtbXHJcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgU3RhdHVzZXMnIH0sXHJcbiAgICAgICAgICAgICAgICAuLi4oYWN0aXZlVGFiID09PSAndmlzaXRvcnMnID8gdmlzaXRvclN0YXR1c2VzIDogZGVsaXZlcnlTdGF0dXNlcykubWFwKChzKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogcyxcclxuICAgICAgICAgICAgICAgICAgbGFiZWw6IHMucmVwbGFjZSgnXycsICcgJyksXHJcbiAgICAgICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgICAgXX1cclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICAgIDxCb3ggbXQ9XCJsZ1wiIGZsZXggc3R5bGU9e3sgZ2FwOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17Z2VuZXJhdGVSZXBvcnR9IGRpc2FibGVkPXtsb2FkaW5nfT5cclxuICAgICAgICAgICAge2xvYWRpbmcgPyA8TG9hZGVyIC8+IDogJ0dlbmVyYXRlIFJlcG9ydCd9XHJcbiAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogRXhwb3J0IEJ1dHRvbnMgKi99XHJcbiAgICAgIDxCb3ggbWI9XCJ4bFwiIGZsZXggc3R5bGU9e3sgZ2FwOiAnMTJweCcgfX0+XHJcbiAgICAgICAgPEJ1dHRvblxyXG4gICAgICAgICAgdmFyaWFudD1cInN1Y2Nlc3NcIlxyXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwb3J0UmVwb3J0KCdjc3YnKX1cclxuICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgIXJlcG9ydERhdGFbYWN0aXZlVGFiXT8ubGVuZ3RofVxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxJY29uIGljb249XCJEb3dubG9hZFwiIG1yPVwic21cIiAvPlxyXG4gICAgICAgICAgRXhwb3J0IENTVlxyXG4gICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgIDxCdXR0b25cclxuICAgICAgICAgIHZhcmlhbnQ9XCJpbmZvXCJcclxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydFJlcG9ydCgnZXhjZWwnKX1cclxuICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgIXJlcG9ydERhdGFbYWN0aXZlVGFiXT8ubGVuZ3RofVxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxJY29uIGljb249XCJEb3dubG9hZFwiIG1yPVwic21cIiAvPlxyXG4gICAgICAgICAgRXhwb3J0IEV4Y2VsXHJcbiAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgIDwvQm94PlxyXG5cclxuICAgICAgey8qIFJlc3VsdHMgVGFibGUgKi99XHJcbiAgICAgIDxCb3ggYmc9XCJ3aGl0ZVwiIHA9XCJ4bFwiIHN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknIH19PlxyXG4gICAgICAgIDxIMyBtYj1cImxnXCI+UmVzdWx0cyAoe3JlcG9ydERhdGFbYWN0aXZlVGFiXT8ubGVuZ3RoIHx8IDB9IHJlY29yZHMpPC9IMz5cclxuICAgICAgICBcclxuICAgICAgICB7bG9hZGluZyA/IChcclxuICAgICAgICAgIDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIHA9XCJ4eGxcIj5cclxuICAgICAgICAgICAgPExvYWRlciAvPlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgKSA6IGFjdGl2ZVRhYiA9PT0gJ3Zpc2l0b3JzJyAmJiByZXBvcnREYXRhLnZpc2l0b3JzPy5sZW5ndGggPyAoXHJcbiAgICAgICAgICA8VGFibGU+XHJcbiAgICAgICAgICAgIDxUYWJsZUhlYWQ+XHJcbiAgICAgICAgICAgICAgPFRhYmxlUm93PlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5WaXNpdG9yPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVDZWxsPkNvbXBhbnk8L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+SG9zdDwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5QdXJwb3NlPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlN0YXR1czwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5DaGVjayBJbjwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5DaGVjayBPdXQ8L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICA8L1RhYmxlUm93PlxyXG4gICAgICAgICAgICA8L1RhYmxlSGVhZD5cclxuICAgICAgICAgICAgPFRhYmxlQm9keT5cclxuICAgICAgICAgICAgICB7cmVwb3J0RGF0YS52aXNpdG9ycy5tYXAoKHY6IGFueSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17di5pZH0+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YudmlzaXRvck5hbWV9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YudmlzaXRvckNvbXBhbnl9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YuaG9zdD8ubmFtZSB8fCAnLSd9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YucHVycG9zZX08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57di5zdGF0dXN9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YuY2hlY2tJbkF0ID8gbmV3IERhdGUodi5jaGVja0luQXQpLnRvTG9jYWxlU3RyaW5nKCkgOiAnLSd9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3YuY2hlY2tPdXRBdCA/IG5ldyBEYXRlKHYuY2hlY2tPdXRBdCkudG9Mb2NhbGVTdHJpbmcoKSA6ICctJ308L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvVGFibGVCb2R5PlxyXG4gICAgICAgICAgPC9UYWJsZT5cclxuICAgICAgICApIDogYWN0aXZlVGFiID09PSAnZGVsaXZlcmllcycgJiYgcmVwb3J0RGF0YS5kZWxpdmVyaWVzPy5sZW5ndGggPyAoXHJcbiAgICAgICAgICA8VGFibGU+XHJcbiAgICAgICAgICAgIDxUYWJsZUhlYWQ+XHJcbiAgICAgICAgICAgICAgPFRhYmxlUm93PlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5Db3VyaWVyPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlJlY2lwaWVudDwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5Ib3N0PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVDZWxsPkxvY2F0aW9uPC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlN0YXR1czwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5SZWNlaXZlZDwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5QaWNrZWQgVXA8L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICA8L1RhYmxlUm93PlxyXG4gICAgICAgICAgICA8L1RhYmxlSGVhZD5cclxuICAgICAgICAgICAgPFRhYmxlQm9keT5cclxuICAgICAgICAgICAgICB7cmVwb3J0RGF0YS5kZWxpdmVyaWVzLm1hcCgoZDogYW55KSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXtkLmlkfT5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57ZC5jb3VyaWVyfTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntkLnJlY2lwaWVudH08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57ZC5ob3N0Py5uYW1lIHx8ICctJ308L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57ZC5sb2NhdGlvbn08L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57ZC5zdGF0dXN9PC9UYWJsZUNlbGw+XHJcbiAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e2QucmVjZWl2ZWRBdCA/IG5ldyBEYXRlKGQucmVjZWl2ZWRBdCkudG9Mb2NhbGVTdHJpbmcoKSA6ICctJ308L1RhYmxlQ2VsbD5cclxuICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57ZC5waWNrZWRVcEF0ID8gbmV3IERhdGUoZC5waWNrZWRVcEF0KS50b0xvY2FsZVN0cmluZygpIDogJy0nfTwvVGFibGVDZWxsPlxyXG4gICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9UYWJsZUJvZHk+XHJcbiAgICAgICAgICA8L1RhYmxlPlxyXG4gICAgICAgICkgOiAoXHJcbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPk5vIGRhdGEgYXZhaWxhYmxlLiBDbGljayBcIkdlbmVyYXRlIFJlcG9ydFwiIHRvIGxvYWQgZGF0YS48L1RleHQ+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9Cb3g+XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVwb3J0c1BhbmVsO1xyXG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgQm94LCBIMiwgSDMsIEg0LCBUZXh0LCBCdXR0b24sIElucHV0LCBMYWJlbCwgSWNvbiwgTG9hZGVyLCBNZXNzYWdlQm94LCBCYWRnZSB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5pbXBvcnQgeyB1c2VDdXJyZW50QWRtaW4gfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbmludGVyZmFjZSBTZXR0aW5nc0RhdGEge1xyXG4gIHNpdGU6IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHRpbWV6b25lOiBzdHJpbmc7XHJcbiAgfTtcclxuICB3aGF0c2FwcDoge1xyXG4gICAgZW5hYmxlZDogYm9vbGVhbjtcclxuICAgIHByb3ZpZGVyOiBzdHJpbmc7XHJcbiAgICBjb25maWd1cmVkOiBib29sZWFuO1xyXG4gIH07XHJcbiAgc210cDoge1xyXG4gICAgZW5hYmxlZDogYm9vbGVhbjtcclxuICAgIGhvc3Q6IHN0cmluZztcclxuICAgIHBvcnQ/OiBudW1iZXI7XHJcbiAgICB1c2VyPzogc3RyaW5nO1xyXG4gICAgZnJvbT86IHN0cmluZztcclxuICAgIGNvbmZpZ3VyZWQ6IGJvb2xlYW47XHJcbiAgfTtcclxuICBtYWludGVuYW5jZToge1xyXG4gICAgZW5hYmxlZDogYm9vbGVhbjtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxuICB9O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU210cEZvcm0ge1xyXG4gIGVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgaG9zdDogc3RyaW5nO1xyXG4gIHBvcnQ6IHN0cmluZztcclxuICB1c2VyOiBzdHJpbmc7XHJcbiAgcGFzczogc3RyaW5nO1xyXG4gIGZyb206IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgU2V0dGluZ3NQYW5lbDogUmVhY3QuRkMgPSAoKSA9PiB7XHJcbiAgY29uc3QgW2N1cnJlbnRBZG1pbl0gPSB1c2VDdXJyZW50QWRtaW4oKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtzZXR0aW5ncywgc2V0U2V0dGluZ3NdID0gdXNlU3RhdGU8U2V0dGluZ3NEYXRhIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW3Rlc3RpbmdXaGF0c2FwcCwgc2V0VGVzdGluZ1doYXRzYXBwXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbdGVzdGluZ0VtYWlsLCBzZXRUZXN0aW5nRW1haWxdID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFt0ZXN0UGhvbmUsIHNldFRlc3RQaG9uZV0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW3Rlc3RFbWFpbCwgc2V0VGVzdEVtYWlsSW5wdXRdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlPHsgdHlwZTogJ3N1Y2Nlc3MnIHwgJ2Vycm9yJzsgdGV4dDogc3RyaW5nIH0gfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbZWRpdGluZ1NtdHAsIHNldEVkaXRpbmdTbXRwXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbc210cEZvcm0sIHNldFNtdHBGb3JtXSA9IHVzZVN0YXRlPFNtdHBGb3JtPih7XHJcbiAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgIGhvc3Q6ICcnLFxyXG4gICAgcG9ydDogJzU4NycsXHJcbiAgICB1c2VyOiAnJyxcclxuICAgIHBhc3M6ICcnLFxyXG4gICAgZnJvbTogJycsXHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IHJvbGUgPSAoY3VycmVudEFkbWluIGFzIGFueSk/LnJvbGUgfHwgJ0FETUlOJztcclxuICBjb25zdCBpc0FkbWluID0gcm9sZSA9PT0gJ0FETUlOJztcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGxvYWRTZXR0aW5ncygpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgbG9hZFNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL3NldHRpbmdzJywge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0U2V0dGluZ3MoZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNldHRpbmdzOicsIGVycm9yKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHRlc3RXaGF0c2FwcCA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghdGVzdFBob25lKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnUGxlYXNlIGVudGVyIGEgcGhvbmUgbnVtYmVyJyB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRlc3RpbmdXaGF0c2FwcCh0cnVlKTtcclxuICAgIHNldE1lc3NhZ2UobnVsbCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvc2V0dGluZ3MvdGVzdC13aGF0c2FwcCcsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcGhvbmU6IHRlc3RQaG9uZSB9KSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcclxuICAgICAgaWYgKHJlcy5vaykge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnc3VjY2VzcycsIHRleHQ6ICdUZXN0IFdoYXRzQXBwIG1lc3NhZ2Ugc2VudCBzdWNjZXNzZnVsbHkhJyB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2VuZCB0ZXN0IG1lc3NhZ2UnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3InIH0pO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0VGVzdGluZ1doYXRzYXBwKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCB0ZXN0U210cCA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghdGVzdEVtYWlsKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnUGxlYXNlIGVudGVyIGFuIGVtYWlsIGFkZHJlc3MnIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGVzdGluZ0VtYWlsKHRydWUpO1xyXG4gICAgc2V0TWVzc2FnZShudWxsKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL2FkbWluL2FwaS9zZXR0aW5ncy90ZXN0LWVtYWlsJywge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBlbWFpbDogdGVzdEVtYWlsIH0pLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogJ1Rlc3QgZW1haWwgc2VudCBzdWNjZXNzZnVsbHkhJyB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2VuZCB0ZXN0IGVtYWlsJyB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdOZXR3b3JrIGVycm9yJyB9KTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFRlc3RpbmdFbWFpbChmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc3RhcnRFZGl0aW5nU210cCA9ICgpID0+IHtcclxuICAgIHNldFNtdHBGb3JtKHtcclxuICAgICAgZW5hYmxlZDogc2V0dGluZ3M/LnNtdHA/LmVuYWJsZWQgfHwgZmFsc2UsXHJcbiAgICAgIGhvc3Q6IHNldHRpbmdzPy5zbXRwPy5ob3N0IHx8ICcnLFxyXG4gICAgICBwb3J0OiBTdHJpbmcoc2V0dGluZ3M/LnNtdHA/LnBvcnQgfHwgJzU4NycpLFxyXG4gICAgICB1c2VyOiBzZXR0aW5ncz8uc210cD8udXNlciB8fCAnJyxcclxuICAgICAgcGFzczogJycsXHJcbiAgICAgIGZyb206IHNldHRpbmdzPy5zbXRwPy5mcm9tIHx8ICcnLFxyXG4gICAgfSk7XHJcbiAgICBzZXRFZGl0aW5nU210cCh0cnVlKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzYXZlU210cFNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0U2F2aW5nKHRydWUpO1xyXG4gICAgc2V0TWVzc2FnZShudWxsKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL2FkbWluL2FwaS9zZXR0aW5ncy91cGRhdGUnLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBzbXRwOiB7XHJcbiAgICAgICAgICAgIGVuYWJsZWQ6IHNtdHBGb3JtLmVuYWJsZWQsXHJcbiAgICAgICAgICAgIGhvc3Q6IHNtdHBGb3JtLmhvc3QsXHJcbiAgICAgICAgICAgIHBvcnQ6IHBhcnNlSW50KHNtdHBGb3JtLnBvcnQsIDEwKSxcclxuICAgICAgICAgICAgdXNlcjogc210cEZvcm0udXNlcixcclxuICAgICAgICAgICAgcGFzczogc210cEZvcm0ucGFzcyB8fCB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGZyb206IHNtdHBGb3JtLmZyb20sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdzdWNjZXNzJywgdGV4dDogJ1NNVFAgc2V0dGluZ3Mgc2F2ZWQgc3VjY2Vzc2Z1bGx5IScgfSk7XHJcbiAgICAgICAgc2V0RWRpdGluZ1NtdHAoZmFsc2UpO1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpOyAvLyBSZWxvYWQgc2V0dGluZ3NcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2F2ZSBzZXR0aW5ncycgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnTmV0d29yayBlcnJvcicgfSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRTYXZpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHRvZ2dsZVNtdHBFbmFibGVkID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0U2F2aW5nKHRydWUpO1xyXG4gICAgc2V0TWVzc2FnZShudWxsKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL2FkbWluL2FwaS9zZXR0aW5ncy91cGRhdGUnLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBzbXRwOiB7XHJcbiAgICAgICAgICAgIGVuYWJsZWQ6ICFzZXR0aW5ncz8uc210cD8uZW5hYmxlZCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICAgIGlmIChyZXMub2spIHtcclxuICAgICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ3N1Y2Nlc3MnLCB0ZXh0OiBgU01UUCAkeyFzZXR0aW5ncz8uc210cD8uZW5hYmxlZCA/ICdlbmFibGVkJyA6ICdkaXNhYmxlZCd9IHN1Y2Nlc3NmdWxseSFgIH0pO1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiBkYXRhLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgc2V0dGluZ3MnIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3InIH0pO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0U2F2aW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAoIWlzQWRtaW4pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxCb3ggcD1cInh4bFwiPlxyXG4gICAgICAgIDxNZXNzYWdlQm94IG1lc3NhZ2U9XCJZb3UgZG9uJ3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGFjY2VzcyBzZXR0aW5ncy5cIiB2YXJpYW50PVwiZXJyb3JcIiAvPlxyXG4gICAgICA8L0JveD5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIGhlaWdodD1cIjEwMHZoXCI+XHJcbiAgICAgICAgPExvYWRlciAvPlxyXG4gICAgICA8L0JveD5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPEJveCB2YXJpYW50PVwiZ3JleVwiIHA9XCJ4eGxcIj5cclxuICAgICAgPEgyIG1iPVwieHhsXCI+U2V0dGluZ3M8L0gyPlxyXG5cclxuICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIiBtYj1cInh4bFwiPlxyXG4gICAgICAgIFNldHRpbmdzIGFyZSBzdG9yZWQgaW4gdGhlIC5lbnYgZmlsZS4gVG8gY2hhbmdlIHNldHRpbmdzLCBlZGl0IHRoZSAuZW52IGZpbGUgYW5kIHJlc3RhcnQgdGhlIHNlcnZlci5cclxuICAgICAgPC9UZXh0PlxyXG5cclxuICAgICAge21lc3NhZ2UgJiYgKFxyXG4gICAgICAgIDxCb3hcclxuICAgICAgICAgIG1iPVwieGxcIlxyXG4gICAgICAgICAgcD1cImxnXCJcclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbWVzc2FnZS50eXBlID09PSAnZXJyb3InID8gJyNmZWYyZjInIDogJyNmMGZkZjQnLFxyXG4gICAgICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHttZXNzYWdlLnR5cGUgPT09ICdlcnJvcicgPyAnI2ZlY2FjYScgOiAnI2JiZjdkMCd9YCxcclxuICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJ1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICA8VGV4dCBzdHlsZT17eyBjb2xvcjogbWVzc2FnZS50eXBlID09PSAnZXJyb3InID8gJyNkYzI2MjYnIDogJyMxNmEzNGEnLCBmb250V2VpZ2h0OiA1MDAgfX0+XHJcbiAgICAgICAgICAgIHttZXNzYWdlLnR5cGUgPT09ICdlcnJvcicgPyAn4p2MICcgOiAn4pyFICd9e21lc3NhZ2UudGV4dH1cclxuICAgICAgICAgIDwvVGV4dD5cclxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInRleHRcIiBzaXplPVwic21cIiBvbkNsaWNrPXsoKSA9PiBzZXRNZXNzYWdlKG51bGwpfT7inJU8L0J1dHRvbj5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBTaXRlIFNldHRpbmdzICovfVxyXG4gICAgICA8Qm94IGJnPVwid2hpdGVcIiBwPVwieGxcIiBtYj1cInhsXCIgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScgfX0+XHJcbiAgICAgICAgPEgzIG1iPVwibGdcIj5cclxuICAgICAgICAgIDxJY29uIGljb249XCJIb21lXCIgbXI9XCJzbVwiIC8+XHJcbiAgICAgICAgICBTaXRlIFNldHRpbmdzXHJcbiAgICAgICAgPC9IMz5cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxyXG4gICAgICAgICAgICA8VGV4dCBmb250V2VpZ2h0PVwiYm9sZFwiPlNpdGUgTmFtZTo8L1RleHQ+XHJcbiAgICAgICAgICAgIDxUZXh0PntzZXR0aW5ncz8uc2l0ZT8ubmFtZSB8fCAnQXJhZmF0IFZNUyd9PC9UZXh0PlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICA8Qm94IGZsZXgganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgIDxUZXh0IGZvbnRXZWlnaHQ9XCJib2xkXCI+VGltZXpvbmU6PC9UZXh0PlxyXG4gICAgICAgICAgICA8VGV4dD57c2V0dGluZ3M/LnNpdGU/LnRpbWV6b25lIHx8ICdBc2lhL1FhdGFyJ308L1RleHQ+XHJcbiAgICAgICAgICA8L0JveD5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogV2hhdHNBcHAgU2V0dGluZ3MgKi99XHJcbiAgICAgIDxCb3ggYmc9XCJ3aGl0ZVwiIHA9XCJ4bFwiIG1iPVwieGxcIiBzdHlsZT17eyBib3JkZXJSYWRpdXM6ICc4cHgnLCBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyB9fT5cclxuICAgICAgICA8SDMgbWI9XCJsZ1wiPlxyXG4gICAgICAgICAgPEljb24gaWNvbj1cIk1lc3NhZ2VDaXJjbGVcIiBtcj1cInNtXCIgLz5cclxuICAgICAgICAgIFdoYXRzQXBwIFNldHRpbmdzXHJcbiAgICAgICAgPC9IMz5cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cclxuICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIj5TdGF0dXM6PC9UZXh0PlxyXG4gICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD17c2V0dGluZ3M/LndoYXRzYXBwPy5jb25maWd1cmVkID8gJ3N1Y2Nlc3MnIDogJ2Rhbmdlcid9PlxyXG4gICAgICAgICAgICAgIHtzZXR0aW5ncz8ud2hhdHNhcHA/LmNvbmZpZ3VyZWQgPyAnQ29uZmlndXJlZCcgOiAnTm90IENvbmZpZ3VyZWQnfVxyXG4gICAgICAgICAgICA8L0JhZGdlPlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICA8Qm94IGZsZXgganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XHJcbiAgICAgICAgICAgIDxUZXh0IGZvbnRXZWlnaHQ9XCJib2xkXCI+UHJvdmlkZXI6PC9UZXh0PlxyXG4gICAgICAgICAgICA8VGV4dD57c2V0dGluZ3M/LndoYXRzYXBwPy5wcm92aWRlciB8fCAnd2JpenRvb2wnfTwvVGV4dD5cclxuICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cclxuICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIj5FbmFibGVkOjwvVGV4dD5cclxuICAgICAgICAgICAgPEJhZGdlIHZhcmlhbnQ9e3NldHRpbmdzPy53aGF0c2FwcD8uZW5hYmxlZCA/ICdzdWNjZXNzJyA6ICdzZWNvbmRhcnknfT5cclxuICAgICAgICAgICAgICB7c2V0dGluZ3M/LndoYXRzYXBwPy5lbmFibGVkID8gJ1llcycgOiAnTm8nfVxyXG4gICAgICAgICAgICA8L0JhZGdlPlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgXHJcbiAgICAgICAge3NldHRpbmdzPy53aGF0c2FwcD8uY29uZmlndXJlZCAmJiAoXHJcbiAgICAgICAgICA8Qm94IG10PVwibGdcIiBwdD1cImxnXCIgc3R5bGU9e3sgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNlNWU3ZWInIH19PlxyXG4gICAgICAgICAgICA8SDQgbWI9XCJtZFwiPlRlc3QgV2hhdHNBcHA8L0g0PlxyXG4gICAgICAgICAgICA8Qm94IGZsZXggc3R5bGU9e3sgZ2FwOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICB0eXBlPVwidGVsXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGhvbmUgbnVtYmVyIChlLmcuLCArOTc0eHh4eHh4eHgpXCJcclxuICAgICAgICAgICAgICAgIHZhbHVlPXt0ZXN0UGhvbmV9XHJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRlc3RQaG9uZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxIH19XHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICB2YXJpYW50PVwic3VjY2Vzc1wiXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0ZXN0V2hhdHNhcHB9XHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGVzdGluZ1doYXRzYXBwfVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt0ZXN0aW5nV2hhdHNhcHAgPyA8TG9hZGVyIC8+IDogJ1NlbmQgVGVzdCd9XHJcbiAgICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogU01UUCBTZXR0aW5ncyAqL31cclxuICAgICAgPEJveCBiZz1cIndoaXRlXCIgcD1cInhsXCIgbWI9XCJ4bFwiIHN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknIH19PlxyXG4gICAgICAgIDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgbWI9XCJsZ1wiPlxyXG4gICAgICAgICAgPEgzIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgPEljb24gaWNvbj1cIk1haWxcIiBtcj1cInNtXCIgLz5cclxuICAgICAgICAgICAgU01UUCBTZXR0aW5nc1xyXG4gICAgICAgICAgPC9IMz5cclxuICAgICAgICAgIHshZWRpdGluZ1NtdHAgJiYgKFxyXG4gICAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJ0ZXh0XCIgb25DbGljaz17c3RhcnRFZGl0aW5nU210cH0+XHJcbiAgICAgICAgICAgICAgPEljb24gaWNvbj1cIkVkaXRcIiBtcj1cInNtXCIgLz5cclxuICAgICAgICAgICAgICBFZGl0XHJcbiAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAge2VkaXRpbmdTbXRwID8gKFxyXG4gICAgICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBzdHlsZT17eyBnYXA6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICA8TGFiZWwgc3R5bGU9e3sgd2lkdGg6ICcxMDBweCcgfX0+RW5hYmxlZDo8L0xhYmVsPlxyXG4gICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgIHZhcmlhbnQ9e3NtdHBGb3JtLmVuYWJsZWQgPyAnc3VjY2VzcycgOiAnc2Vjb25kYXJ5J31cclxuICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTbXRwRm9ybSh7IC4uLnNtdHBGb3JtLCBlbmFibGVkOiAhc210cEZvcm0uZW5hYmxlZCB9KX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7c210cEZvcm0uZW5hYmxlZCA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCd9XHJcbiAgICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICA8Qm94IGZsZXggYWxpZ25JdGVtcz1cImNlbnRlclwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgIDxMYWJlbCBzdHlsZT17eyB3aWR0aDogJzEwMHB4JyB9fT5Ib3N0OjwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICB2YWx1ZT17c210cEZvcm0uaG9zdH1cclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U210cEZvcm0oeyAuLi5zbXRwRm9ybSwgaG9zdDogZS50YXJnZXQudmFsdWUgfSl9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInNtdHAuZXhhbXBsZS5jb21cIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICA8Qm94IGZsZXggYWxpZ25JdGVtcz1cImNlbnRlclwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgIDxMYWJlbCBzdHlsZT17eyB3aWR0aDogJzEwMHB4JyB9fT5Qb3J0OjwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICB2YWx1ZT17c210cEZvcm0ucG9ydH1cclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U210cEZvcm0oeyAuLi5zbXRwRm9ybSwgcG9ydDogZS50YXJnZXQudmFsdWUgfSl9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjU4N1wiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMHB4JyB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICA8Qm94IGZsZXggYWxpZ25JdGVtcz1cImNlbnRlclwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgIDxMYWJlbCBzdHlsZT17eyB3aWR0aDogJzEwMHB4JyB9fT5Vc2VyOjwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICB2YWx1ZT17c210cEZvcm0udXNlcn1cclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U210cEZvcm0oeyAuLi5zbXRwRm9ybSwgdXNlcjogZS50YXJnZXQudmFsdWUgfSl9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInVzZXJAZXhhbXBsZS5jb21cIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICA8Qm94IGZsZXggYWxpZ25JdGVtcz1cImNlbnRlclwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgIDxMYWJlbCBzdHlsZT17eyB3aWR0aDogJzEwMHB4JyB9fT5QYXNzd29yZDo8L0xhYmVsPlxyXG4gICAgICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIHZhbHVlPXtzbXRwRm9ybS5wYXNzfVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRTbXRwRm9ybSh7IC4uLnNtdHBGb3JtLCBwYXNzOiBlLnRhcmdldC52YWx1ZSB9KX1cclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTGVhdmUgYmxhbmsgdG8ga2VlcCBjdXJyZW50XCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEgfX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICA8TGFiZWwgc3R5bGU9e3sgd2lkdGg6ICcxMDBweCcgfX0+RnJvbTo8L0xhYmVsPlxyXG4gICAgICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3NtdHBGb3JtLmZyb219XHJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFNtdHBGb3JtKHsgLi4uc210cEZvcm0sIGZyb206IGUudGFyZ2V0LnZhbHVlIH0pfVxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJub3JlcGx5QGV4YW1wbGUuY29tXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEgfX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgPEJveCBmbGV4IHN0eWxlPXt7IGdhcDogJzEycHgnLCBtYXJnaW5Ub3A6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtzYXZlU210cFNldHRpbmdzfSBkaXNhYmxlZD17c2F2aW5nfT5cclxuICAgICAgICAgICAgICAgIHtzYXZpbmcgPyA8TG9hZGVyIC8+IDogJ1NhdmUgU2V0dGluZ3MnfVxyXG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInRleHRcIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0aW5nU210cChmYWxzZSl9PlxyXG4gICAgICAgICAgICAgICAgQ2FuY2VsXHJcbiAgICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgKSA6IChcclxuICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgc3R5bGU9e3sgZ2FwOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgIDxUZXh0IGZvbnRXZWlnaHQ9XCJib2xkXCI+U3RhdHVzOjwvVGV4dD5cclxuICAgICAgICAgICAgICAgIDxCYWRnZSB2YXJpYW50PXtzZXR0aW5ncz8uc210cD8uY29uZmlndXJlZCA/ICdzdWNjZXNzJyA6ICdkYW5nZXInfT5cclxuICAgICAgICAgICAgICAgICAge3NldHRpbmdzPy5zbXRwPy5jb25maWd1cmVkID8gJ0NvbmZpZ3VyZWQnIDogJ05vdCBDb25maWd1cmVkJ31cclxuICAgICAgICAgICAgICAgIDwvQmFkZ2U+XHJcbiAgICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxyXG4gICAgICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIj5Ib3N0OjwvVGV4dD5cclxuICAgICAgICAgICAgICAgIDxUZXh0PntzZXR0aW5ncz8uc210cD8uaG9zdCB8fCAnTm90IHNldCd9PC9UZXh0PlxyXG4gICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgIDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICA8VGV4dCBmb250V2VpZ2h0PVwiYm9sZFwiPkVuYWJsZWQ6PC9UZXh0PlxyXG4gICAgICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD17c2V0dGluZ3M/LnNtdHA/LmVuYWJsZWQgPyAnc3VjY2VzcycgOiAnc2Vjb25kYXJ5J30+XHJcbiAgICAgICAgICAgICAgICAgICAge3NldHRpbmdzPy5zbXRwPy5lbmFibGVkID8gJ1llcycgOiAnTm8nfVxyXG4gICAgICAgICAgICAgICAgICA8L0JhZGdlPlxyXG4gICAgICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD17c2V0dGluZ3M/LnNtdHA/LmVuYWJsZWQgPyAnZGFuZ2VyJyA6ICdzdWNjZXNzJ31cclxuICAgICAgICAgICAgICAgICAgICBzaXplPVwic21cIlxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVNtdHBFbmFibGVkfVxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtzYXZpbmcgfHwgIXNldHRpbmdzPy5zbXRwPy5jb25maWd1cmVkfVxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAge3NldHRpbmdzPy5zbXRwPy5lbmFibGVkID8gJ0Rpc2FibGUnIDogJ0VuYWJsZSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG5cclxuICAgICAgICAgICAge3NldHRpbmdzPy5zbXRwPy5jb25maWd1cmVkICYmIChcclxuICAgICAgICAgICAgICA8Qm94IG10PVwibGdcIiBwdD1cImxnXCIgc3R5bGU9e3sgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNlNWU3ZWInIH19PlxyXG4gICAgICAgICAgICAgICAgPEg0IG1iPVwibWRcIj5UZXN0IEVtYWlsPC9IND5cclxuICAgICAgICAgICAgICAgIDxCb3ggZmxleCBzdHlsZT17eyBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVtYWlsIGFkZHJlc3NcIlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0ZXN0RW1haWx9XHJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRUZXN0RW1haWxJbnB1dChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3Rlc3RTbXRwfVxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0ZXN0aW5nRW1haWx9XHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICB7dGVzdGluZ0VtYWlsID8gPExvYWRlciAvPiA6ICdTZW5kIFRlc3QnfVxyXG4gICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC8+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogTWFpbnRlbmFuY2UgTW9kZSAqL31cclxuICAgICAgPEJveCBiZz1cIndoaXRlXCIgcD1cInhsXCIgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScgfX0+XHJcbiAgICAgICAgPEgzIG1iPVwibGdcIj5cclxuICAgICAgICAgIDxJY29uIGljb249XCJUb29sXCIgbXI9XCJzbVwiIC8+XHJcbiAgICAgICAgICBNYWludGVuYW5jZSBNb2RlXHJcbiAgICAgICAgPC9IMz5cclxuICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cclxuICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIj5TdGF0dXM6PC9UZXh0PlxyXG4gICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD17c2V0dGluZ3M/Lm1haW50ZW5hbmNlPy5lbmFibGVkID8gJ2RhbmdlcicgOiAnc3VjY2Vzcyd9PlxyXG4gICAgICAgICAgICAgIHtzZXR0aW5ncz8ubWFpbnRlbmFuY2U/LmVuYWJsZWQgPyAnQUNUSVZFJyA6ICdJbmFjdGl2ZSd9XHJcbiAgICAgICAgICAgIDwvQmFkZ2U+XHJcbiAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgIDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cclxuICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIj5NZXNzYWdlOjwvVGV4dD5cclxuICAgICAgICAgICAgPFRleHQ+e3NldHRpbmdzPy5tYWludGVuYW5jZT8ubWVzc2FnZSB8fCAnU3lzdGVtIHVuZGVyIG1haW50ZW5hbmNlJ308L1RleHQ+XHJcbiAgICAgICAgICA8L0JveD5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICB7LyogSW5zdHJ1Y3Rpb25zICovfVxyXG4gICAgICA8Qm94IG10PVwieHhsXCIgcD1cInhsXCIgYmc9XCJncmV5MjBcIiBzdHlsZT17eyBib3JkZXJSYWRpdXM6ICc4cHgnIH19PlxyXG4gICAgICAgIDxINCBtYj1cIm1kXCI+SG93IHRvIFVwZGF0ZSBTZXR0aW5nczwvSDQ+XHJcbiAgICAgICAgPFRleHQgbWI9XCJzbVwiPlRvIGNoYW5nZSB0aGVzZSBzZXR0aW5ncywgZWRpdCB0aGUgZm9sbG93aW5nIGVudmlyb25tZW50IHZhcmlhYmxlcyBpbiB5b3VyIC5lbnYgZmlsZTo8L1RleHQ+XHJcbiAgICAgICAgPEJveCBhcz1cInByZVwiIHA9XCJtZFwiIGJnPVwiZ3JleTQwXCIgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAnNHB4Jywgb3ZlcmZsb3c6ICdhdXRvJyB9fT5cclxuICAgICAgICAgIDxUZXh0IGFzPVwiY29kZVwiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdtb25vc3BhY2UnIH19PlxyXG57YCMgU2l0ZSBTZXR0aW5nc1xyXG5TSVRFX05BTUU9QXJhZmF0IFZNU1xyXG5TSVRFX1RJTUVaT05FPUFzaWEvUWF0YXJcclxuXHJcbiMgV2hhdHNBcHAgU2V0dGluZ3NcclxuV0hBVFNBUFBfRU5BQkxFRD10cnVlXHJcbldIQVRTQVBQX0FQSV9VUkw9aHR0cHM6Ly9hcGkud2JpenRvb2wuY29tXHJcbldIQVRTQVBQX0FQSV9UT0tFTj15b3VyLXRva2VuXHJcblxyXG4jIFNNVFAgU2V0dGluZ3NcclxuU01UUF9FTkFCTEVEPXRydWVcclxuU01UUF9IT1NUPXNtdHAuZXhhbXBsZS5jb21cclxuU01UUF9QT1JUPTU4N1xyXG5TTVRQX1VTRVI9dXNlckBleGFtcGxlLmNvbVxyXG5TTVRQX1BBU1M9eW91ci1wYXNzd29yZFxyXG5TTVRQX0ZST009bm9yZXBseUBleGFtcGxlLmNvbVxyXG5cclxuIyBNYWludGVuYW5jZSBNb2RlXHJcbk1BSU5URU5BTkNFX01PREU9ZmFsc2VcclxuTUFJTlRFTkFOQ0VfTUVTU0FHRT1TeXN0ZW0gdW5kZXIgbWFpbnRlbmFuY2VgfVxyXG4gICAgICAgICAgPC9UZXh0PlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICAgIDxUZXh0IG10PVwibWRcIiBjb2xvcj1cImdyZXk2MFwiPkFmdGVyIGVkaXRpbmcgdGhlIC5lbnYgZmlsZSwgcmVzdGFydCB0aGUgc2VydmVyIGZvciBjaGFuZ2VzIHRvIHRha2UgZWZmZWN0LjwvVGV4dD5cclxuICAgICAgPC9Cb3g+XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ3NQYW5lbDtcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEJveCwgSDIsIEgzLCBINCwgVGV4dCwgQnV0dG9uLCBJY29uLCBMb2FkZXIsIEJhZGdlLCBJbnB1dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xyXG5pbXBvcnQgeyB1c2VDdXJyZW50QWRtaW4gfSBmcm9tICdhZG1pbmpzJztcclxuXHJcbmludGVyZmFjZSBWaXNpdG9yIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIHNlc3Npb25JZDogc3RyaW5nO1xyXG4gIHZpc2l0b3JOYW1lOiBzdHJpbmc7XHJcbiAgdmlzaXRvckNvbXBhbnk6IHN0cmluZztcclxuICB2aXNpdG9yUGhvbmU6IHN0cmluZztcclxuICB2aXNpdG9yRW1haWw/OiBzdHJpbmc7XHJcbiAgaG9zdE5hbWU6IHN0cmluZztcclxuICBob3N0Q29tcGFueTogc3RyaW5nO1xyXG4gIHB1cnBvc2U6IHN0cmluZztcclxuICBjaGVja0luQXQ6IHN0cmluZztcclxuICBxclRva2VuPzogc3RyaW5nO1xyXG4gIHFyRGF0YVVybD86IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgVmlzaXRvckNhcmRzOiBSZWFjdC5GQyA9ICgpID0+IHtcclxuICBjb25zdCBbY3VycmVudEFkbWluXSA9IHVzZUN1cnJlbnRBZG1pbigpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xyXG4gIGNvbnN0IFt2aXNpdG9ycywgc2V0VmlzaXRvcnNdID0gdXNlU3RhdGU8VmlzaXRvcltdPihbXSk7XHJcbiAgY29uc3QgW3NlYXJjaCwgc2V0U2VhcmNoXSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbY2hlY2tpbmdPdXQsIHNldENoZWNraW5nT3V0XSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbG9hZFZpc2l0b3JzKCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICBjb25zdCBsb2FkVmlzaXRvcnMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvZGFzaGJvYXJkL2N1cnJlbnQtdmlzaXRvcnMnLCB7XHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXMub2spIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcclxuICAgICAgICBzZXRWaXNpdG9ycyhkYXRhKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdmlzaXRvcnM6JywgZXJyb3IpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGFuZGxlQ2hlY2tvdXQgPSBhc3luYyAoc2Vzc2lvbklkOiBzdHJpbmcpID0+IHtcclxuICAgIHNldENoZWNraW5nT3V0KHNlc3Npb25JZCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgL2FkbWluL2FwaS9kYXNoYm9hcmQvY2hlY2tvdXQvJHtzZXNzaW9uSWR9YCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgbG9hZFZpc2l0b3JzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjaGVja291dDonLCBlcnJvcik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRDaGVja2luZ091dChudWxsKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVTZW5kUXIgPSBhc3luYyAodmlzaXRvcjogVmlzaXRvciwgbWV0aG9kOiAnd2hhdHNhcHAnIHwgJ2VtYWlsJykgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvc2VuZC1xcicsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIHZpc2l0SWQ6IHZpc2l0b3IuaWQsXHJcbiAgICAgICAgICBtZXRob2QsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzLm9rKSB7XHJcbiAgICAgICAgYWxlcnQoYFFSIHNlbnQgdmlhICR7bWV0aG9kfSFgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydCgnRmFpbGVkIHRvIHNlbmQgUVInKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlbmQgUVI6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGZpbHRlcmVkVmlzaXRvcnMgPSB2aXNpdG9ycy5maWx0ZXIoKHYpID0+IHtcclxuICAgIGlmICghc2VhcmNoKSByZXR1cm4gdHJ1ZTtcclxuICAgIGNvbnN0IHNlYXJjaExvd2VyID0gc2VhcmNoLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICB2LnZpc2l0b3JOYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XHJcbiAgICAgIHYudmlzaXRvckNvbXBhbnkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikgfHxcclxuICAgICAgdi5ob3N0TmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxyXG4gICAgICB2LnZpc2l0b3JQaG9uZS5pbmNsdWRlcyhzZWFyY2gpXHJcbiAgICApO1xyXG4gIH0pO1xyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIGhlaWdodD1cIjQwMHB4XCI+XHJcbiAgICAgICAgPExvYWRlciAvPlxyXG4gICAgICA8L0JveD5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPEJveCB2YXJpYW50PVwiZ3JleVwiIHA9XCJ4eGxcIj5cclxuICAgICAgPEJveCBmbGV4IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBtYj1cInh4bFwiPlxyXG4gICAgICAgIDxIMj5DdXJyZW50IFZpc2l0b3JzICh7dmlzaXRvcnMubGVuZ3RofSk8L0gyPlxyXG4gICAgICAgIDxCb3ggZmxleCBzdHlsZT17eyBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHZpc2l0b3JzLi4uXCJcclxuICAgICAgICAgICAgdmFsdWU9e3NlYXJjaH1cclxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRTZWFyY2goZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzI1MHB4JyB9fVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtsb2FkVmlzaXRvcnN9PlxyXG4gICAgICAgICAgICA8SWNvbiBpY29uPVwiUmVmcmVzaEN3XCIgbXI9XCJzbVwiIC8+XHJcbiAgICAgICAgICAgIFJlZnJlc2hcclxuICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICA8L0JveD5cclxuXHJcbiAgICAgIHtmaWx0ZXJlZFZpc2l0b3JzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICA8Qm94XHJcbiAgICAgICAgICBiZz1cIndoaXRlXCJcclxuICAgICAgICAgIHA9XCJ4eGxcIlxyXG4gICAgICAgICAgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAnOHB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxJY29uIGljb249XCJVc2Vyc1wiIHNpemU9ezQ4fSBjb2xvcj1cImdyZXk0MFwiIC8+XHJcbiAgICAgICAgICA8VGV4dCBtdD1cImxnXCIgY29sb3I9XCJncmV5NjBcIj5ObyB2aXNpdG9ycyBjdXJyZW50bHkgY2hlY2tlZCBpbjwvVGV4dD5cclxuICAgICAgICA8L0JveD5cclxuICAgICAgKSA6IChcclxuICAgICAgICA8Qm94XHJcbiAgICAgICAgICBmbGV4XHJcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uPVwicm93XCJcclxuICAgICAgICAgIHN0eWxlPXt7IGdhcDogJzI0cHgnLCBmbGV4V3JhcDogJ3dyYXAnIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAge2ZpbHRlcmVkVmlzaXRvcnMubWFwKCh2aXNpdG9yKSA9PiAoXHJcbiAgICAgICAgICAgIDxCb3hcclxuICAgICAgICAgICAgICBrZXk9e3Zpc2l0b3IuaWR9XHJcbiAgICAgICAgICAgICAgYmc9XCJ3aGl0ZVwiXHJcbiAgICAgICAgICAgICAgcD1cInhsXCJcclxuICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICczMjBweCcsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgey8qIFFSIENvZGUgKi99XHJcbiAgICAgICAgICAgICAgPEJveFxyXG4gICAgICAgICAgICAgICAgZmxleFxyXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxyXG4gICAgICAgICAgICAgICAgbWI9XCJsZ1wiXHJcbiAgICAgICAgICAgICAgICBwPVwibWRcIlxyXG4gICAgICAgICAgICAgICAgYmc9XCJncmV5MjBcIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAnOHB4JyB9fVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt2aXNpdG9yLnFyRGF0YVVybCA/IChcclxuICAgICAgICAgICAgICAgICAgPGltZ1xyXG4gICAgICAgICAgICAgICAgICAgIHNyYz17dmlzaXRvci5xckRhdGFVcmx9XHJcbiAgICAgICAgICAgICAgICAgICAgYWx0PVwiUVIgQ29kZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxNTBweCcsIGhlaWdodDogJzE1MHB4JyB9fVxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgPEJveFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXhcclxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcclxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxNTBweCcsIGhlaWdodDogJzE1MHB4JyB9fVxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIlFyQ29kZVwiIHNpemU9ezY0fSBjb2xvcj1cImdyZXk0MFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgICAgICAgey8qIFZpc2l0b3IgSW5mbyAqL31cclxuICAgICAgICAgICAgICA8SDQgbWI9XCJzbVwiPnt2aXNpdG9yLnZpc2l0b3JOYW1lfTwvSDQ+XHJcbiAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIiBtYj1cIm1kXCI+e3Zpc2l0b3IudmlzaXRvckNvbXBhbnl9PC9UZXh0PlxyXG5cclxuICAgICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzhweCcgfX0gbWI9XCJsZ1wiPlxyXG4gICAgICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiVXNlclwiIHNpemU9ezE2fSBjb2xvcj1cImdyZXk2MFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxUZXh0IGZvbnRTaXplPVwic21cIj5Ib3N0OiB7dmlzaXRvci5ob3N0TmFtZX08L1RleHQ+XHJcbiAgICAgICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgICAgIDxCb3ggZmxleCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgc3R5bGU9e3sgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIkJ1aWxkaW5nXCIgc2l6ZT17MTZ9IGNvbG9yPVwiZ3JleTYwXCIgLz5cclxuICAgICAgICAgICAgICAgICAgPFRleHQgZm9udFNpemU9XCJzbVwiPkNvbXBhbnk6IHt2aXNpdG9yLmhvc3RDb21wYW55fTwvVGV4dD5cclxuICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiQ2xvY2tcIiBzaXplPXsxNn0gY29sb3I9XCJncmV5NjBcIiAvPlxyXG4gICAgICAgICAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cInNtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgQ2hlY2staW46IHtuZXcgRGF0ZSh2aXNpdG9yLmNoZWNrSW5BdCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICAgIDwvVGV4dD5cclxuICAgICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICAgICAgPEJveCBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiRmlsZVRleHRcIiBzaXplPXsxNn0gY29sb3I9XCJncmV5NjBcIiAvPlxyXG4gICAgICAgICAgICAgICAgICA8VGV4dCBmb250U2l6ZT1cInNtXCI+UHVycG9zZToge3Zpc2l0b3IucHVycG9zZX08L1RleHQ+XHJcbiAgICAgICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgICAgICAgPEJhZGdlIHZhcmlhbnQ9XCJzdWNjZXNzXCIgbWI9XCJsZ1wiPkNIRUNLRUQgSU48L0JhZGdlPlxyXG5cclxuICAgICAgICAgICAgICB7LyogQWN0aW9ucyAqL31cclxuICAgICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHN0eWxlPXt7IGdhcDogJzhweCcsIG1hcmdpblRvcDogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgICAgICAgey8qIFNlbmQgUVIgYnV0dG9ucyAqL31cclxuICAgICAgICAgICAgICAgIDxCb3ggZmxleCBzdHlsZT17eyBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICB7dmlzaXRvci52aXNpdG9yUGhvbmUgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJzdWNjZXNzXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVTZW5kUXIodmlzaXRvciwgJ3doYXRzYXBwJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIk1lc3NhZ2VDaXJjbGVcIiBtcj1cInNtXCIgc2l6ZT17MTR9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICBXaGF0c0FwcFxyXG4gICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICB7dmlzaXRvci52aXNpdG9yRW1haWwgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJpbmZvXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVTZW5kUXIodmlzaXRvciwgJ2VtYWlsJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIk1haWxcIiBtcj1cInNtXCIgc2l6ZT17MTR9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICBFbWFpbFxyXG4gICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9Cb3g+XHJcblxyXG4gICAgICAgICAgICAgICAgey8qIENoZWNrIG91dCBidXR0b24gKi99XHJcbiAgICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJkYW5nZXJcIlxyXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVDaGVja291dCh2aXNpdG9yLnNlc3Npb25JZCl9XHJcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjaGVja2luZ091dCA9PT0gdmlzaXRvci5zZXNzaW9uSWR9XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIHtjaGVja2luZ091dCA9PT0gdmlzaXRvci5zZXNzaW9uSWQgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgPExvYWRlciAvPlxyXG4gICAgICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiTG9nT3V0XCIgbXI9XCJzbVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICBDaGVjayBPdXRcclxuICAgICAgICAgICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgICA8L0JveD5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvQm94PlxyXG4gICAgICApfVxyXG4gICAgPC9Cb3g+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpc2l0b3JDYXJkcztcclxuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgQm94LFxuICBIMyxcbiAgVGV4dCxcbiAgQnV0dG9uLFxuICBJY29uLFxuICBMb2FkZXIsXG4gIE1lc3NhZ2VCb3gsXG4gIFRhYmxlLFxuICBUYWJsZUhlYWQsXG4gIFRhYmxlQm9keSxcbiAgVGFibGVSb3csXG4gIFRhYmxlQ2VsbCxcbiAgSW5wdXQsXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb25Qcm9wcyB9IGZyb20gJ2FkbWluanMnO1xuXG50eXBlIFJlamVjdGVkUm93RGF0YSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBjb21wYW55OiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIHBob25lOiBzdHJpbmc7XG4gIGxvY2F0aW9uOiBzdHJpbmc7XG4gIHN0YXR1czogc3RyaW5nO1xufTtcblxudHlwZSBSZWplY3RlZFJvdyA9IHtcbiAgcm93TnVtYmVyOiBudW1iZXI7XG4gIHJlYXNvbjogc3RyaW5nO1xuICBkYXRhOiBSZWplY3RlZFJvd0RhdGE7XG59O1xuXG50eXBlIFZhbGlkYXRpb25SZXN1bHQgPSB7XG4gIHRvdGFsUm93czogbnVtYmVyO1xuICB2YWxpZFJvd3M6IG51bWJlcjtcbiAgbmV3SG9zdHM6IG51bWJlcjtcbiAgZXhpc3RpbmdIb3N0czogbnVtYmVyO1xuICB1c2Vyc1RvQ3JlYXRlOiBudW1iZXI7XG4gIHJlamVjdGVkUm93czogUmVqZWN0ZWRSb3dbXTtcbn07XG5cbnR5cGUgQ3JlZGVudGlhbCA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xuICBjb21wYW55OiBzdHJpbmc7XG59O1xuXG50eXBlIEltcG9ydFN1bW1hcnkgPSB7XG4gIHRvdGFsUHJvY2Vzc2VkOiBudW1iZXI7XG4gIGluc2VydGVkOiBudW1iZXI7XG4gIHNraXBwZWQ6IG51bWJlcjtcbiAgcmVqZWN0ZWQ6IG51bWJlcjtcbiAgcmVqZWN0ZWRSb3dzOiBSZWplY3RlZFJvd1tdO1xuICB1c2Vyc0NyZWF0ZWQ6IG51bWJlcjtcbiAgdXNlcnNTa2lwcGVkOiBudW1iZXI7XG4gIGNyZWF0ZWRDcmVkZW50aWFsczogQ3JlZGVudGlhbFtdO1xufTtcblxuY29uc3QgQnVsa0ltcG9ydEhvc3RzOiBSZWFjdC5GQzxBY3Rpb25Qcm9wcz4gPSAoKSA9PiB7XG4gIGNvbnN0IFtzZWxlY3RlZEZpbGVOYW1lLCBzZXRTZWxlY3RlZEZpbGVOYW1lXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbY3N2Q29udGVudCwgc2V0Q3N2Q29udGVudF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbdmFsaWRhdGluZywgc2V0VmFsaWRhdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt2YWxpZGF0aW9uLCBzZXRWYWxpZGF0aW9uXSA9IHVzZVN0YXRlPFZhbGlkYXRpb25SZXN1bHQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3N1bW1hcnksIHNldFN1bW1hcnldID0gdXNlU3RhdGU8SW1wb3J0U3VtbWFyeSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbbWVzc2FnZSwgc2V0TWVzc2FnZV0gPSB1c2VTdGF0ZTx7IHR5cGU6ICdzdWNjZXNzJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtlZGl0YWJsZVJlamVjdGVkLCBzZXRFZGl0YWJsZVJlamVjdGVkXSA9IHVzZVN0YXRlPFJlamVjdGVkUm93W10+KFtdKTtcblxuICBjb25zdCBoYW5kbGVGaWxlQ2hhbmdlOiBSZWFjdC5DaGFuZ2VFdmVudEhhbmRsZXI8SFRNTElucHV0RWxlbWVudD4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG5cbiAgICBpZiAoIWZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcuY3N2JykpIHtcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnUGxlYXNlIHVwbG9hZCBhIENTViBmaWxlLicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0U2VsZWN0ZWRGaWxlTmFtZShmaWxlLm5hbWUpO1xuICAgIHNldFN1bW1hcnkobnVsbCk7XG4gICAgc2V0VmFsaWRhdGlvbihudWxsKTtcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xuICAgIHNldEVkaXRhYmxlUmVqZWN0ZWQoW10pO1xuXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICByZWFkZXIub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IHR5cGVvZiByZWFkZXIucmVzdWx0ID09PSAnc3RyaW5nJyA/IHJlYWRlci5yZXN1bHQgOiAnJztcbiAgICAgIHNldENzdkNvbnRlbnQodGV4dCk7XG4gICAgICBhd2FpdCB2YWxpZGF0ZUNzdih0ZXh0KTtcbiAgICB9O1xuICAgIHJlYWRlci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdGYWlsZWQgdG8gcmVhZCB0aGUgZmlsZS4gUGxlYXNlIHRyeSBhZ2Fpbi4nIH0pO1xuICAgIH07XG4gICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XG4gIH07XG5cbiAgY29uc3QgdmFsaWRhdGVDc3YgPSBhc3luYyAoY29udGVudDogc3RyaW5nKSA9PiB7XG4gICAgc2V0VmFsaWRhdGluZyh0cnVlKTtcbiAgICBzZXRWYWxpZGF0aW9uKG51bGwpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL2hvc3RzL2ltcG9ydD92YWxpZGF0ZT10cnVlJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3N2Q29udGVudDogY29udGVudCB9KSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcblxuICAgICAgaWYgKCFyZXMub2spIHtcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6IGRhdGEubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHZhbGlkYXRlIENTVi4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRvdGFsUHJvY2Vzc2VkID0gZGF0YS50b3RhbFByb2Nlc3NlZCA/PyAwO1xuICAgICAgY29uc3QgcmVqZWN0ZWQgPSBkYXRhLnJlamVjdGVkID8/IDA7XG4gICAgICBjb25zdCBuZXdIb3N0cyA9IGRhdGEuaW5zZXJ0ZWQgPz8gMDtcbiAgICAgIGNvbnN0IGV4aXN0aW5nSG9zdHMgPSBkYXRhLnNraXBwZWQgPz8gMDtcbiAgICAgIGNvbnN0IHVzZXJzVG9DcmVhdGUgPSBkYXRhLnVzZXJzQ3JlYXRlZCA/PyAwO1xuICAgICAgY29uc3QgcmVqZWN0ZWRSb3dzID0gQXJyYXkuaXNBcnJheShkYXRhLnJlamVjdGVkUm93cykgPyBkYXRhLnJlamVjdGVkUm93cyA6IFtdO1xuXG4gICAgICBzZXRWYWxpZGF0aW9uKHtcbiAgICAgICAgdG90YWxSb3dzOiB0b3RhbFByb2Nlc3NlZCxcbiAgICAgICAgdmFsaWRSb3dzOiB0b3RhbFByb2Nlc3NlZCAtIHJlamVjdGVkLFxuICAgICAgICBuZXdIb3N0cyxcbiAgICAgICAgZXhpc3RpbmdIb3N0cyxcbiAgICAgICAgdXNlcnNUb0NyZWF0ZSxcbiAgICAgICAgcmVqZWN0ZWRSb3dzLFxuICAgICAgfSk7XG5cbiAgICAgIHNldEVkaXRhYmxlUmVqZWN0ZWQocmVqZWN0ZWRSb3dzKTtcblxuICAgICAgaWYgKHJlamVjdGVkID4gMCkge1xuICAgICAgICBzZXRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIHRleHQ6IGAke3JlamVjdGVkfSByb3cocykgaGF2ZSBpc3N1ZXMuIEVkaXQgYmVsb3cgYW5kIHJldHJ5LCBvciBmaXggeW91ciBDU1YuYCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgdGV4dDogYFJlYWR5IHRvIGltcG9ydDogJHtuZXdIb3N0c30gbmV3IGhvc3RzLCAke2V4aXN0aW5nSG9zdHN9IGV4aXN0aW5nIGhvc3RzLCAke3VzZXJzVG9DcmVhdGV9IHVzZXJzIHdpbGwgYmUgY3JlYXRlZC5gLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6ICdOZXR3b3JrIGVycm9yIHdoaWxlIHZhbGlkYXRpbmcuIFBsZWFzZSB0cnkgYWdhaW4uJyB9KTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0VmFsaWRhdGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUltcG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWNzdkNvbnRlbnQpIHtcbiAgICAgIHNldE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCB0ZXh0OiAnUGxlYXNlIHNlbGVjdCBhIENTViBmaWxlIGZpcnN0LicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xuICAgIHNldFN1bW1hcnkobnVsbCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hZG1pbi9hcGkvaG9zdHMvaW1wb3J0Jywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3N2Q29udGVudCB9KSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcblxuICAgICAgaWYgKCFyZXMub2spIHtcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6IGRhdGEubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGltcG9ydCBob3N0cy4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlamVjdGVkUm93cyA9IEFycmF5LmlzQXJyYXkoZGF0YS5yZWplY3RlZFJvd3MpID8gZGF0YS5yZWplY3RlZFJvd3MgOiBbXTtcblxuICAgICAgc2V0U3VtbWFyeSh7XG4gICAgICAgIHRvdGFsUHJvY2Vzc2VkOiBkYXRhLnRvdGFsUHJvY2Vzc2VkID8/IDAsXG4gICAgICAgIGluc2VydGVkOiBkYXRhLmluc2VydGVkID8/IDAsXG4gICAgICAgIHNraXBwZWQ6IGRhdGEuc2tpcHBlZCA/PyAwLFxuICAgICAgICByZWplY3RlZDogZGF0YS5yZWplY3RlZCA/PyAwLFxuICAgICAgICByZWplY3RlZFJvd3MsXG4gICAgICAgIHVzZXJzQ3JlYXRlZDogZGF0YS51c2Vyc0NyZWF0ZWQgPz8gMCxcbiAgICAgICAgdXNlcnNTa2lwcGVkOiBkYXRhLnVzZXJzU2tpcHBlZCA/PyAwLFxuICAgICAgICBjcmVhdGVkQ3JlZGVudGlhbHM6IEFycmF5LmlzQXJyYXkoZGF0YS5jcmVhdGVkQ3JlZGVudGlhbHMpID8gZGF0YS5jcmVhdGVkQ3JlZGVudGlhbHMgOiBbXSxcbiAgICAgIH0pO1xuXG4gICAgICBzZXRFZGl0YWJsZVJlamVjdGVkKHJlamVjdGVkUm93cyk7XG4gICAgICBzZXRWYWxpZGF0aW9uKG51bGwpO1xuXG4gICAgICBpZiAoZGF0YS5pbnNlcnRlZCA+IDApIHtcbiAgICAgICAgc2V0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgIHRleHQ6IGBJbXBvcnQgY29tcGxldGVkISAke2RhdGEuaW5zZXJ0ZWR9IGhvc3RzIGltcG9ydGVkLCAke2RhdGEudXNlcnNDcmVhdGVkfSB1c2VyIGFjY291bnRzIGNyZWF0ZWQuYCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgdGV4dDogJ0ltcG9ydCBjb21wbGV0ZWQuIE5vIG5ldyBob3N0cyB3ZXJlIGFkZGVkIChhbGwgZXhpc3Rpbmcgb3IgcmVqZWN0ZWQpLicsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3Igd2hpbGUgaW1wb3J0aW5nLiBQbGVhc2UgdHJ5IGFnYWluLicgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVSZXRyeVJlamVjdGVkID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmIChlZGl0YWJsZVJlamVjdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRNZXNzYWdlKG51bGwpO1xuXG4gICAgLy8gQnVpbGQgQ1NWIGZyb20gZWRpdGVkIHJlamVjdGVkIHJvd3NcbiAgICBjb25zdCBoZWFkZXJzID0gWydJRCcsICdOYW1lJywgJ0NvbXBhbnknLCAnRW1haWwgQWRkcmVzcycsICdQaG9uZSBOdW1iZXInLCAnTG9jYXRpb24nLCAnU3RhdHVzJ107XG4gICAgY29uc3Qgcm93cyA9IGVkaXRhYmxlUmVqZWN0ZWQubWFwKChyKSA9PiBbXG4gICAgICByLmRhdGEuaWQsXG4gICAgICByLmRhdGEubmFtZSxcbiAgICAgIHIuZGF0YS5jb21wYW55LFxuICAgICAgci5kYXRhLmVtYWlsLFxuICAgICAgci5kYXRhLnBob25lLFxuICAgICAgci5kYXRhLmxvY2F0aW9uLFxuICAgICAgci5kYXRhLnN0YXR1cyxcbiAgICBdLm1hcCgodikgPT4gYFwiJHsodiB8fCAnJykucmVwbGFjZSgvXCIvZywgJ1wiXCInKX1cImApLmpvaW4oJywnKSk7XG5cbiAgICBjb25zdCByZXRyeUNzdkNvbnRlbnQgPSBbaGVhZGVycy5qb2luKCcsJyksIC4uLnJvd3NdLmpvaW4oJ1xcbicpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRtaW4vYXBpL2hvc3RzL2ltcG9ydCcsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNzdkNvbnRlbnQ6IHJldHJ5Q3N2Q29udGVudCB9KSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcblxuICAgICAgaWYgKCFyZXMub2spIHtcbiAgICAgICAgc2V0TWVzc2FnZSh7IHR5cGU6ICdlcnJvcicsIHRleHQ6IGRhdGEubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGltcG9ydCBob3N0cy4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld1JlamVjdGVkUm93cyA9IEFycmF5LmlzQXJyYXkoZGF0YS5yZWplY3RlZFJvd3MpID8gZGF0YS5yZWplY3RlZFJvd3MgOiBbXTtcblxuICAgICAgLy8gVXBkYXRlIHN1bW1hcnkgd2l0aCBuZXcgcmVzdWx0c1xuICAgICAgc2V0U3VtbWFyeSgocHJldikgPT4ge1xuICAgICAgICBpZiAoIXByZXYpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxQcm9jZXNzZWQ6IGRhdGEudG90YWxQcm9jZXNzZWQgPz8gMCxcbiAgICAgICAgICAgIGluc2VydGVkOiBkYXRhLmluc2VydGVkID8/IDAsXG4gICAgICAgICAgICBza2lwcGVkOiBkYXRhLnNraXBwZWQgPz8gMCxcbiAgICAgICAgICAgIHJlamVjdGVkOiBkYXRhLnJlamVjdGVkID8/IDAsXG4gICAgICAgICAgICByZWplY3RlZFJvd3M6IG5ld1JlamVjdGVkUm93cyxcbiAgICAgICAgICAgIHVzZXJzQ3JlYXRlZDogZGF0YS51c2Vyc0NyZWF0ZWQgPz8gMCxcbiAgICAgICAgICAgIHVzZXJzU2tpcHBlZDogZGF0YS51c2Vyc1NraXBwZWQgPz8gMCxcbiAgICAgICAgICAgIGNyZWF0ZWRDcmVkZW50aWFsczogQXJyYXkuaXNBcnJheShkYXRhLmNyZWF0ZWRDcmVkZW50aWFscykgPyBkYXRhLmNyZWF0ZWRDcmVkZW50aWFscyA6IFtdLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgIGluc2VydGVkOiBwcmV2Lmluc2VydGVkICsgKGRhdGEuaW5zZXJ0ZWQgPz8gMCksXG4gICAgICAgICAgcmVqZWN0ZWQ6IG5ld1JlamVjdGVkUm93cy5sZW5ndGgsXG4gICAgICAgICAgcmVqZWN0ZWRSb3dzOiBuZXdSZWplY3RlZFJvd3MsXG4gICAgICAgICAgdXNlcnNDcmVhdGVkOiBwcmV2LnVzZXJzQ3JlYXRlZCArIChkYXRhLnVzZXJzQ3JlYXRlZCA/PyAwKSxcbiAgICAgICAgICBjcmVhdGVkQ3JlZGVudGlhbHM6IFtcbiAgICAgICAgICAgIC4uLnByZXYuY3JlYXRlZENyZWRlbnRpYWxzLFxuICAgICAgICAgICAgLi4uKEFycmF5LmlzQXJyYXkoZGF0YS5jcmVhdGVkQ3JlZGVudGlhbHMpID8gZGF0YS5jcmVhdGVkQ3JlZGVudGlhbHMgOiBbXSksXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICBzZXRFZGl0YWJsZVJlamVjdGVkKG5ld1JlamVjdGVkUm93cyk7XG5cbiAgICAgIGlmIChkYXRhLmluc2VydGVkID4gMCkge1xuICAgICAgICBzZXRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgdGV4dDogYFJldHJ5IHN1Y2Nlc3NmdWwhICR7ZGF0YS5pbnNlcnRlZH0gbW9yZSBob3N0cyBpbXBvcnRlZCwgJHtkYXRhLnVzZXJzQ3JlYXRlZH0gdXNlcnMgY3JlYXRlZC4ke25ld1JlamVjdGVkUm93cy5sZW5ndGggPiAwID8gYCAke25ld1JlamVjdGVkUm93cy5sZW5ndGh9IHN0aWxsIGhhdmUgaXNzdWVzLmAgOiAnJ31gLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAobmV3UmVqZWN0ZWRSb3dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2V0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICB0ZXh0OiBgU3RpbGwgJHtuZXdSZWplY3RlZFJvd3MubGVuZ3RofSByb3cocykgd2l0aCBpc3N1ZXMuIFBsZWFzZSBmaXggYW5kIHJldHJ5LmAsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzZXRNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgdGV4dDogJ05ldHdvcmsgZXJyb3Igd2hpbGUgaW1wb3J0aW5nLiBQbGVhc2UgdHJ5IGFnYWluLicgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB1cGRhdGVSZWplY3RlZFJvdyA9IChpbmRleDogbnVtYmVyLCBmaWVsZDoga2V5b2YgUmVqZWN0ZWRSb3dEYXRhLCB2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgc2V0RWRpdGFibGVSZWplY3RlZCgocHJldikgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZCA9IFsuLi5wcmV2XTtcbiAgICAgIHVwZGF0ZWRbaW5kZXhdID0ge1xuICAgICAgICAuLi51cGRhdGVkW2luZGV4XSxcbiAgICAgICAgZGF0YTogeyAuLi51cGRhdGVkW2luZGV4XS5kYXRhLCBbZmllbGRdOiB2YWx1ZSB9LFxuICAgICAgfTtcbiAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IGV4cG9ydENyZWRlbnRpYWxzID0gKCkgPT4ge1xuICAgIGlmICghc3VtbWFyeSB8fCAhc3VtbWFyeS5jcmVhdGVkQ3JlZGVudGlhbHMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBjb25zdCBoZWFkZXJzID0gWydOYW1lJywgJ0VtYWlsJywgJ1Bhc3N3b3JkJywgJ0NvbXBhbnknXTtcbiAgICBjb25zdCByb3dzID0gc3VtbWFyeS5jcmVhdGVkQ3JlZGVudGlhbHMubWFwKChjKSA9PiBbXG4gICAgICBgXCIke2MubmFtZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYCxcbiAgICAgIGBcIiR7Yy5lbWFpbC5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYCxcbiAgICAgIGBcIiR7Yy5wYXNzd29yZH1cImAsXG4gICAgICBgXCIkeyhjLmNvbXBhbnkgfHwgJycpLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgLFxuICAgIF0pO1xuXG4gICAgY29uc3QgY3N2RGF0YSA9IFtoZWFkZXJzLmpvaW4oJywnKSwgLi4ucm93cy5tYXAoKHIpID0+IHIuam9pbignLCcpKV0uam9pbignXFxuJyk7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjc3ZEYXRhXSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgbGluay5kb3dubG9hZCA9IGBob3N0LWNyZWRlbnRpYWxzLSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19LmNzdmA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICBsaW5rLmNsaWNrKCk7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gIH07XG5cbiAgY29uc3QgaGFzVmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRpb24gJiYgdmFsaWRhdGlvbi5yZWplY3RlZFJvd3MubGVuZ3RoID4gMDtcbiAgY29uc3QgaGFzQ3JlZGVudGlhbHMgPSBzdW1tYXJ5ICYmIHN1bW1hcnkuY3JlYXRlZENyZWRlbnRpYWxzICYmIHN1bW1hcnkuY3JlYXRlZENyZWRlbnRpYWxzLmxlbmd0aCA+IDA7XG4gIGNvbnN0IGhhc0VkaXRhYmxlUmVqZWN0ZWQgPSBlZGl0YWJsZVJlamVjdGVkLmxlbmd0aCA+IDA7XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHA9XCJ4eGxcIj5cbiAgICAgIDxIMyBtYj1cImxnXCI+QnVsayBJbXBvcnQgSG9zdHM8L0gzPlxuXG4gICAgICA8VGV4dCBtYj1cIm1kXCI+XG4gICAgICAgIFVwbG9hZCBhIENTViBmaWxlIGNvbnRhaW5pbmcgaG9zdCByZWNvcmRzLiBSZXF1aXJlZCBjb2x1bW5zOlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgPHN0cm9uZz5JRCwgTmFtZSwgQ29tcGFueSwgRW1haWwgQWRkcmVzcywgUGhvbmUgTnVtYmVyIChvcHRpb25hbCksIExvY2F0aW9uLCBTdGF0dXM8L3N0cm9uZz5cbiAgICAgIDwvVGV4dD5cblxuICAgICAgey8qIEZpbGUgaW5wdXQgKi99XG4gICAgICA8Qm94XG4gICAgICAgIG1iPVwibGdcIlxuICAgICAgICBwPVwibGdcIlxuICAgICAgICBiZz1cImdyZXkyMFwiXG4gICAgICAgIGZsZXhcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICAgIHN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBkYXNoZWQgI2NjYycgfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gaWNvbj1cIlVwbG9hZFwiIHNpemU9ezMyfSBtYj1cIm1kXCIgLz5cbiAgICAgICAgPFRleHQgbWI9XCJzbVwiPlxuICAgICAgICAgIHtzZWxlY3RlZEZpbGVOYW1lID8gYFNlbGVjdGVkOiAke3NlbGVjdGVkRmlsZU5hbWV9YCA6ICdDaG9vc2UgYSBDU1YgZmlsZSB0byB1cGxvYWQnfVxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICBhY2NlcHQ9XCIuY3N2LHRleHQvY3N2XCJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlRmlsZUNoYW5nZX1cbiAgICAgICAgICBzdHlsZT17eyBtYXJnaW5Ub3A6ICc4cHgnIH19XG4gICAgICAgIC8+XG4gICAgICAgIHt2YWxpZGF0aW5nICYmIChcbiAgICAgICAgICA8Qm94IG10PVwibWRcIiBmbGV4IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICAgIDxMb2FkZXIgLz5cbiAgICAgICAgICAgIDxUZXh0IG1sPVwic21cIj5WYWxpZGF0aW5nLi4uPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApfVxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHsvKiBNZXNzYWdlICovfVxuICAgICAge21lc3NhZ2UgJiYgKFxuICAgICAgICA8Qm94IG1iPVwibGdcIj5cbiAgICAgICAgICA8TWVzc2FnZUJveFxuICAgICAgICAgICAgbWVzc2FnZT17bWVzc2FnZS50ZXh0fVxuICAgICAgICAgICAgdmFyaWFudD17bWVzc2FnZS50eXBlfVxuICAgICAgICAgICAgb25DbG9zZUNsaWNrPXsoKSA9PiBzZXRNZXNzYWdlKG51bGwpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cblxuICAgICAgey8qIFZhbGlkYXRpb24gU3VjY2VzcyAqL31cbiAgICAgIHt2YWxpZGF0aW9uICYmICFoYXNWYWxpZGF0aW9uRXJyb3JzICYmIChcbiAgICAgICAgPEJveCBtYj1cImxnXCIgcD1cImxnXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2YwZmRmNCcsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjYmJmN2QwJyB9fT5cbiAgICAgICAgICA8VGV4dCBtYj1cIm1kXCIgZm9udFdlaWdodD1cImJvbGRcIiBzdHlsZT17eyBjb2xvcjogJyMxNmEzNGEnIH19PlxuICAgICAgICAgICAg4pyTIHt2YWxpZGF0aW9uLnZhbGlkUm93c30gcm93cyB2YWxpZGF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KDMsIDFmciknLCBnYXA6ICcxMnB4JyB9fT5cbiAgICAgICAgICAgIDxCb3ggcD1cInNtXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2RjZmNlNycsIGJvcmRlclJhZGl1czogJzZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICdib2xkJywgY29sb3I6ICcjMTZhMzRhJyB9fT57dmFsaWRhdGlvbi5uZXdIb3N0c308L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzY0NzQ4YicgfX0+TmV3IEhvc3RzPC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8Qm94IHA9XCJzbVwiIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmZWYzYzcnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxuICAgICAgICAgICAgICA8VGV4dCBzdHlsZT17eyBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnYm9sZCcsIGNvbG9yOiAnI2Q5NzcwNicgfX0+e3ZhbGlkYXRpb24uZXhpc3RpbmdIb3N0c308L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzY0NzQ4YicgfX0+RXhpc3RpbmcgSG9zdHM8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDxCb3ggcD1cInNtXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2RiZWFmZScsIGJvcmRlclJhZGl1czogJzZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICdib2xkJywgY29sb3I6ICcjMjU2M2ViJyB9fT57dmFsaWRhdGlvbi51c2Vyc1RvQ3JlYXRlfTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNjQ3NDhiJyB9fT5Vc2VycyB0byBDcmVhdGU8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuXG4gICAgICB7LyogSW1wb3J0IGJ1dHRvbiAqL31cbiAgICAgIHshaGFzRWRpdGFibGVSZWplY3RlZCAmJiAoXG4gICAgICAgIDxCb3ggbWI9XCJ4bFwiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUltcG9ydH1cbiAgICAgICAgICAgIGRpc2FibGVkPXshY3N2Q29udGVudCB8fCBsb2FkaW5nIHx8IHZhbGlkYXRpbmcgfHwgaGFzVmFsaWRhdGlvbkVycm9yc31cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7bG9hZGluZyA/IDxMb2FkZXIgLz4gOiAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIlBsYXlDaXJjbGVcIiBtcj1cInNtXCIgLz5cbiAgICAgICAgICAgICAgICBTdGFydCBJbXBvcnRcbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG5cbiAgICAgIHsvKiBFZGl0YWJsZSBSZWplY3RlZCBSb3dzICovfVxuICAgICAge2hhc0VkaXRhYmxlUmVqZWN0ZWQgJiYgKFxuICAgICAgICA8Qm94IG1iPVwibGdcIiBwPVwibGdcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZmVmMmYyJywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNmZWNhY2EnIH19PlxuICAgICAgICAgIDxCb3ggZmxleCBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgbWI9XCJtZFwiPlxuICAgICAgICAgICAgPFRleHQgZm9udFdlaWdodD1cImJvbGRcIiBzdHlsZT17eyBjb2xvcjogJyNkYzI2MjYnIH19PlxuICAgICAgICAgICAgICB7ZWRpdGFibGVSZWplY3RlZC5sZW5ndGh9IFJvdyhzKSB3aXRoIElzc3VlcyAtIEVkaXQgYW5kIFJldHJ5OlxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIHNpemU9XCJzbVwiIG9uQ2xpY2s9e2hhbmRsZVJldHJ5UmVqZWN0ZWR9IGRpc2FibGVkPXtsb2FkaW5nfT5cbiAgICAgICAgICAgICAge2xvYWRpbmcgPyA8TG9hZGVyIC8+IDogKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8SWNvbiBpY29uPVwiUmVmcmVzaEN3XCIgbXI9XCJzbVwiIC8+XG4gICAgICAgICAgICAgICAgICBSZXRyeSBJbXBvcnQgKHtlZGl0YWJsZVJlamVjdGVkLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1heEhlaWdodDogJzQwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycsIG92ZXJmbG93WDogJ2F1dG8nIH19PlxuICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEzcHgnIH19PlxuICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmZWNhY2EnIH19PlxuICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHgnLCB0ZXh0QWxpZ246ICdsZWZ0JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmY2E1YTUnIH19PlJvdzwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzhweCcsIHRleHRBbGlnbjogJ2xlZnQnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZjYTVhNScgfX0+SXNzdWU8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHgnLCB0ZXh0QWxpZ246ICdsZWZ0JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmY2E1YTUnIH19PklEPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnOHB4JywgdGV4dEFsaWduOiAnbGVmdCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZmNhNWE1JyB9fT5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnOHB4JywgdGV4dEFsaWduOiAnbGVmdCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZmNhNWE1JyB9fT5Db21wYW55PC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnOHB4JywgdGV4dEFsaWduOiAnbGVmdCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZmNhNWE1JyB9fT5FbWFpbDwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzhweCcsIHRleHRBbGlnbjogJ2xlZnQnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZjYTVhNScgfX0+UGhvbmU8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHgnLCB0ZXh0QWxpZ246ICdsZWZ0JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmY2E1YTUnIH19PkxvY2F0aW9uPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnOHB4JywgdGV4dEFsaWduOiAnbGVmdCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZmNhNWE1JyB9fT5TdGF0dXM8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICB7ZWRpdGFibGVSZWplY3RlZC5tYXAoKHJvdywgaWR4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtpZHh9IHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogaWR4ICUgMiA9PT0gMCA/ICcjZmZmJyA6ICcjZmVmMmYyJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICc2cHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZlY2FjYScgfX0+e3Jvdy5yb3dOdW1iZXJ9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICc2cHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZlY2FjYScsIGNvbG9yOiAnI2RjMjYyNicsIGZvbnRTaXplOiAnMTFweCcgfX0+e3Jvdy5yZWFzb259PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICc0cHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZlY2FjYScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cm93LmRhdGEuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHVwZGF0ZVJlamVjdGVkUm93KGlkeCwgJ2lkJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICc2MHB4JywgcGFkZGluZzogJzRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnNHB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmZWNhY2EnIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Jvdy5kYXRhLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHVwZGF0ZVJlamVjdGVkUm93KGlkeCwgJ25hbWUnLCBlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMHB4JywgcGFkZGluZzogJzRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnNHB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmZWNhY2EnIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Jvdy5kYXRhLmNvbXBhbnl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHVwZGF0ZVJlamVjdGVkUm93KGlkeCwgJ2NvbXBhbnknLCBlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzEwMHB4JywgcGFkZGluZzogJzRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnNHB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmZWNhY2EnIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Jvdy5kYXRhLmVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB1cGRhdGVSZWplY3RlZFJvdyhpZHgsICdlbWFpbCcsIGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTQwcHgnLCBwYWRkaW5nOiAnNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNkZGQnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICc0cHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZlY2FjYScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cm93LmRhdGEucGhvbmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHVwZGF0ZVJlamVjdGVkUm93KGlkeCwgJ3Bob25lJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDBweCcsIHBhZGRpbmc6ICc0cHgnLCBib3JkZXI6IHJvdy5yZWFzb24uaW5jbHVkZXMoJ3Bob25lJykgPyAnMnB4IHNvbGlkICNkYzI2MjYnIDogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnNHB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmZWNhY2EnIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Jvdy5kYXRhLmxvY2F0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB1cGRhdGVSZWplY3RlZFJvdyhpZHgsICdsb2NhdGlvbicsIGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwcHgnLCBwYWRkaW5nOiAnNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNkZGQnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICc0cHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2ZlY2FjYScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Jvdy5kYXRhLnN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdXBkYXRlUmVqZWN0ZWRSb3coaWR4LCAnc3RhdHVzJywgZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzRweCcsIGJvcmRlcjogcm93LnJlYXNvbi5pbmNsdWRlcygnc3RhdHVzJykgPyAnMnB4IHNvbGlkICNkYzI2MjYnIDogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY3Q8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJBY3RpdmVcIj5BY3RpdmU8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJJbmFjdGl2ZVwiPkluYWN0aXZlPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuXG4gICAgICB7LyogSW1wb3J0IFN1bW1hcnkgKi99XG4gICAgICB7c3VtbWFyeSAmJiAoXG4gICAgICAgIDxCb3ggcD1cImxnXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTJlOGYwJyB9fT5cbiAgICAgICAgICA8VGV4dCBtYj1cIm1kXCIgZm9udFdlaWdodD1cImJvbGRcIj5JbXBvcnQgU3VtbWFyeTwvVGV4dD5cbiAgICAgICAgICA8Qm94IG1iPVwibWRcIiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoMywgMWZyKScsIGdhcDogJzE2cHgnIH19PlxuICAgICAgICAgICAgPEJveCBwPVwibWRcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZGJlYWZlJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICAgICAgPFRleHQgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJ2JvbGQnLCBjb2xvcjogJyMyNTYzZWInIH19PntzdW1tYXJ5LnRvdGFsUHJvY2Vzc2VkfTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgc3R5bGU9e3sgY29sb3I6ICcjNjQ3NDhiJyB9fT5Ub3RhbCBQcm9jZXNzZWQ8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDxCb3ggcD1cIm1kXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2RjZmNlNycsIGJvcmRlclJhZGl1czogJzZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICdib2xkJywgY29sb3I6ICcjMTZhMzRhJyB9fT57c3VtbWFyeS5pbnNlcnRlZH08L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGNvbG9yOiAnIzY0NzQ4YicgfX0+SG9zdHMgSW5zZXJ0ZWQ8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDxCb3ggcD1cIm1kXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2ZlZjNjNycsIGJvcmRlclJhZGl1czogJzZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XG4gICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICdib2xkJywgY29sb3I6ICcjZDk3NzA2JyB9fT57c3VtbWFyeS5za2lwcGVkfTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgc3R5bGU9e3sgY29sb3I6ICcjNjQ3NDhiJyB9fT5Ta2lwcGVkIChleGlzdGluZyk8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8VGV4dCBtYj1cImxnXCIgc3R5bGU9e3sgY29sb3I6ICcjNjQ3NDhiJyB9fT5cbiAgICAgICAgICAgIFVzZXJzIGNyZWF0ZWQ6IDxzdHJvbmc+e3N1bW1hcnkudXNlcnNDcmVhdGVkfTwvc3Ryb25nPiB8IFVzZXJzIHNraXBwZWQ6IDxzdHJvbmc+e3N1bW1hcnkudXNlcnNTa2lwcGVkfTwvc3Ryb25nPlxuICAgICAgICAgIDwvVGV4dD5cblxuICAgICAgICAgIHsvKiBDcmVhdGVkIENyZWRlbnRpYWxzICovfVxuICAgICAgICAgIHtoYXNDcmVkZW50aWFscyAmJiAoXG4gICAgICAgICAgICA8Qm94IG10PVwibGdcIiBwPVwibGdcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjBmZGY0JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNiYmY3ZDAnIH19PlxuICAgICAgICAgICAgICA8Qm94IGZsZXgganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIG1iPVwibWRcIj5cbiAgICAgICAgICAgICAgICA8VGV4dCBmb250V2VpZ2h0PVwiYm9sZFwiIHN0eWxlPXt7IGNvbG9yOiAnIzE2YTM0YScgfX0+XG4gICAgICAgICAgICAgICAgICB7c3VtbWFyeS5jcmVhdGVkQ3JlZGVudGlhbHMubGVuZ3RofSBVc2VyIEFjY291bnQocykgQ3JlYXRlZFxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgc2l6ZT1cInNtXCIgb25DbGljaz17ZXhwb3J0Q3JlZGVudGlhbHN9PlxuICAgICAgICAgICAgICAgICAgPEljb24gaWNvbj1cIkRvd25sb2FkXCIgbXI9XCJzbVwiIC8+XG4gICAgICAgICAgICAgICAgICBFeHBvcnQgQ3JlZGVudGlhbHMgQ1NWXG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICA8Qm94IHN0eWxlPXt7IG1heEhlaWdodDogJzMwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XG4gICAgICAgICAgICAgICAgPFRhYmxlPlxuICAgICAgICAgICAgICAgICAgPFRhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgZm9udFdlaWdodDogJ2JvbGQnIH19Pk5hbWU8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICdib2xkJyB9fT5FbWFpbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgc3R5bGU9e3sgZm9udFdlaWdodDogJ2JvbGQnIH19PlBhc3N3b3JkPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbCBzdHlsZT17eyBmb250V2VpZ2h0OiAnYm9sZCcgfX0+Q29tcGFueTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICA8VGFibGVCb2R5PlxuICAgICAgICAgICAgICAgICAgICB7c3VtbWFyeS5jcmVhdGVkQ3JlZGVudGlhbHMubWFwKChjcmVkLCBpZHgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXtpZHh9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57Y3JlZC5uYW1lfTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57Y3JlZC5lbWFpbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNlMmU4ZjAnLCBwYWRkaW5nOiAnMnB4IDZweCcsIGJvcmRlclJhZGl1czogJzRweCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2NyZWQucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57Y3JlZC5jb21wYW55fTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgIDxUZXh0IG10PVwibWRcIiBzdHlsZT17eyBjb2xvcjogJyNkYzI2MjYnLCBmb250U2l6ZTogJzEycHgnIH19PlxuICAgICAgICAgICAgICAgIOKaoO+4jyBTYXZlIHRoZXNlIGNyZWRlbnRpYWxzIG5vdyEgUGFzc3dvcmRzIGNhbm5vdCBiZSByZXRyaWV2ZWQgbGF0ZXIuXG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cbiAgICA8L0JveD5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJ1bGtJbXBvcnRIb3N0cztcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEN1cnJlbnRVc2VyTmF2LCBCb3ggfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcclxuXHJcbi8qKlxyXG4gKiBPdmVycmlkZSBBZG1pbkpTIExvZ2dlZEluIHRvIGFkZDpcclxuICogLSBFZGl0IFByb2ZpbGUsIENoYW5nZSBQYXNzd29yZCwgYW5kIExvZ291dCBpbiB0aGUgdXNlciBkcm9wZG93blxyXG4gKi9cclxuY29uc3QgTG9nZ2VkSW46IFJlYWN0LkZDPHtcclxuICBzZXNzaW9uOiB7IGVtYWlsOiBzdHJpbmc7IHRpdGxlPzogc3RyaW5nOyBhdmF0YXJVcmw/OiBzdHJpbmc7IG5hbWU/OiBzdHJpbmcgfTtcclxuICBwYXRoczogeyBsb2dvdXRQYXRoOiBzdHJpbmc7IHJvb3RQYXRoPzogc3RyaW5nIH07XHJcbn0+ID0gKHsgc2Vzc2lvbiwgcGF0aHMgfSkgPT4ge1xyXG4gIGNvbnN0IHJvb3RQYXRoID0gcGF0aHMucm9vdFBhdGggfHwgJy9hZG1pbic7XHJcblxyXG4gIGNvbnN0IGRyb3BBY3Rpb25zID0gW1xyXG4gICAge1xyXG4gICAgICBsYWJlbDogJ0VkaXQgUHJvZmlsZScsXHJcbiAgICAgIG9uQ2xpY2s6IChldmVudDogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgJHtyb290UGF0aH0vcGFnZXMvRWRpdFByb2ZpbGVgO1xyXG4gICAgICB9LFxyXG4gICAgICBpY29uOiAnVXNlcicsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBsYWJlbDogJ0NoYW5nZSBQYXNzd29yZCcsXHJcbiAgICAgIG9uQ2xpY2s6IChldmVudDogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgJHtyb290UGF0aH0vcGFnZXMvQ2hhbmdlUGFzc3dvcmRgO1xyXG4gICAgICB9LFxyXG4gICAgICBpY29uOiAnS2V5JyxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGxhYmVsOiAnU2lnbiBPdXQnLFxyXG4gICAgICBvbkNsaWNrOiAoZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcGF0aHMubG9nb3V0UGF0aDtcclxuICAgICAgfSxcclxuICAgICAgaWNvbjogJ0xvZ091dCcsXHJcbiAgICB9LFxyXG4gIF07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94XHJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcclxuICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXHJcbiAgICAgIGZsZXhTaHJpbms9ezB9XHJcbiAgICAgIGRhdGEtY3NzPVwibG9nZ2VkLWluXCJcclxuICAgICAgc3R5bGU9e3sgZ2FwOiAnMTJweCcgfX1cclxuICAgID5cclxuICAgICAgPEN1cnJlbnRVc2VyTmF2XHJcbiAgICAgICAgbmFtZT17c2Vzc2lvbi5uYW1lIHx8IHNlc3Npb24uZW1haWx9XHJcbiAgICAgICAgdGl0bGU9e3Nlc3Npb24udGl0bGUgfHwgc2Vzc2lvbi5lbWFpbH1cclxuICAgICAgICBhdmF0YXJVcmw9e3Nlc3Npb24uYXZhdGFyVXJsfVxyXG4gICAgICAgIGRyb3BBY3Rpb25zPXtkcm9wQWN0aW9uc31cclxuICAgICAgLz5cclxuICAgIDwvQm94PlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2dnZWRJbjtcclxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuXHJcbnR5cGUgUGFnZSA9IHsgbmFtZTogc3RyaW5nOyBpY29uPzogc3RyaW5nIH07XHJcbnR5cGUgUHJvcHMgPSB7XHJcbiAgcGFnZXM/OiBQYWdlW107XHJcbiAgT3JpZ2luYWxDb21wb25lbnQ/OiBSZWFjdC5Db21wb25lbnRUeXBlPGFueT47XHJcbn07XHJcblxyXG4vKipcclxuICogT3ZlcnJpZGUgU2lkZWJhclBhZ2VzOlxyXG4gKiAtIFJldHVybiBudWxsIHRvIGNvbXBsZXRlbHkgaGlkZSB0aGUgZGVmYXVsdCBwYWdlcyBzZWN0aW9uXHJcbiAqIC0gUmVwb3J0cyBhbmQgU2V0dGluZ3MgYXJlIHNob3duIHVuZGVyIFN5c3RlbSB2aWEgU2lkZWJhclJlc291cmNlU2VjdGlvblxyXG4gKi9cclxuY29uc3QgU2lkZWJhclBhZ2VzOiBSZWFjdC5GQzxQcm9wcz4gPSAoKSA9PiB7XHJcbiAgLy8gUmV0dXJuIG51bGwgLSBhbGwgcGFnZXMgYXJlIGhhbmRsZWQgYnkgU2lkZWJhclJlc291cmNlU2VjdGlvblxyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2lkZWJhclBhZ2VzO1xyXG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSWNvbiB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgdXNlTG9jYXRpb24sIHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyJztcbmltcG9ydCB7IHVzZVNlbGVjdG9yIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgdXNlQ3VycmVudEFkbWluIH0gZnJvbSAnYWRtaW5qcyc7XG5cbnR5cGUgUGFnZSA9IHsgbmFtZTogc3RyaW5nOyBpY29uPzogc3RyaW5nIH07XG50eXBlIFByb3BzID0ge1xuICByZXNvdXJjZXM6IGFueVtdO1xuICBPcmlnaW5hbENvbXBvbmVudD86IFJlYWN0LkNvbXBvbmVudFR5cGU8YW55Pjtcbn07XG5cbi8vIElubGluZSBzdHlsZXNcbmNvbnN0IHN0eWxlcyA9IHtcbiAgY29udGFpbmVyOiB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIGFzIGNvbnN0LFxuICAgIHBhZGRpbmc6ICcxNnB4IDAnLFxuICB9LFxuICBtZW51SXRlbToge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICBnYXA6ICcxMnB4JyxcbiAgICBwYWRkaW5nOiAnMTJweCAyNHB4JyxcbiAgICBjb2xvcjogJyM2NDc0OGInLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxuICAgIGZvbnRTaXplOiAnMTRweCcsXG4gICAgZm9udFdlaWdodDogNTAwLFxuICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgIGJvcmRlckxlZnQ6ICczcHggc29saWQgdHJhbnNwYXJlbnQnLFxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4xNXMgZWFzZScsXG4gIH0sXG4gIG1lbnVJdGVtU2VsZWN0ZWQ6IHtcbiAgICBjb2xvcjogJyMzYjgyZjYnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjEpJyxcbiAgICBib3JkZXJMZWZ0OiAnM3B4IHNvbGlkICMzYjgyZjYnLFxuICB9LFxuICBzZXBhcmF0b3I6IHtcbiAgICBib3JkZXI6ICcwJyxcbiAgICBoZWlnaHQ6ICcxcHgnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJyNlMmU4ZjAnLFxuICAgIG1hcmdpbjogJzEycHggMTZweCcsXG4gIH0sXG4gIGljb246IHtcbiAgICB3aWR0aDogJzE4cHgnLFxuICAgIGhlaWdodDogJzE4cHgnLFxuICAgIGZsZXhTaHJpbms6IDAsXG4gIH0sXG4gIGxhYmVsOiB7XG4gICAgd2hpdGVTcGFjZTogJ25vd3JhcCcgYXMgY29uc3QsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgfSxcbn07XG5cbi8qKlxuICogRmxhdCBzaWRlYmFyIG1lbnUgd2l0aG91dCBuYXZpZ2F0aW9uIGdyb3Vwc1xuICogUm9sZS1iYXNlZCB2aXNpYmlsaXR5OlxuICogLSBBRE1JTjogc2VlcyBhbGwgaXRlbXNcbiAqIC0gSE9TVDogaGlkZXMgVXNlcnMsIEF1ZGl0IExvZywgU2V0dGluZ3NcbiAqIC0gUkVDRVBUSU9OOiBoaWRlcyBVc2VycywgQXVkaXQgTG9nLCBTZXR0aW5nc1xuICovXG5jb25zdCBTaWRlYmFyUmVzb3VyY2VTZWN0aW9uOiBSZWFjdC5GQzxQcm9wcz4gPSAoKSA9PiB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpO1xuICBjb25zdCBwYWdlczogUGFnZVtdID0gdXNlU2VsZWN0b3IoKHN0YXRlOiBhbnkpID0+IHN0YXRlLnBhZ2VzKSB8fCBbXTtcbiAgY29uc3Qgcm9vdFBhdGggPSB1c2VTZWxlY3Rvcigoc3RhdGU6IGFueSkgPT4gc3RhdGUucGF0aHM/LnJvb3RQYXRoKSB8fCAnL2FkbWluJztcbiAgY29uc3QgW2N1cnJlbnRBZG1pbl0gPSB1c2VDdXJyZW50QWRtaW4oKTtcbiAgY29uc3QgdXNlclJvbGUgPSAoY3VycmVudEFkbWluIGFzIGFueSk/LnJvbGUgfHwgJ1JFQ0VQVElPTic7XG5cbiAgY29uc3QgaXNTZWxlY3RlZCA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAocGF0aCA9PT0gcm9vdFBhdGgpIHtcbiAgICAgIHJldHVybiBsb2NhdGlvbi5wYXRobmFtZSA9PT0gcm9vdFBhdGggfHwgbG9jYXRpb24ucGF0aG5hbWUgPT09IGAke3Jvb3RQYXRofS9gO1xuICAgIH1cbiAgICByZXR1cm4gbG9jYXRpb24ucGF0aG5hbWUuc3RhcnRzV2l0aChwYXRoKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVDbGljayA9IChwYXRoOiBzdHJpbmcpID0+IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG5hdmlnYXRlKHBhdGgpO1xuICB9O1xuXG4gIC8vIEdldCBwYWdlIGljb25zXG4gIGNvbnN0IGdldFBhZ2VJY29uID0gKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHBhZ2UgPSBwYWdlcy5maW5kKChwKSA9PiBwLm5hbWUgPT09IG5hbWUpO1xuICAgIHJldHVybiBwYWdlPy5pY29uIHx8ICdGaWxlJztcbiAgfTtcblxuICAvLyBNZW51IGl0ZW1zIGNvbmZpZ3VyYXRpb25cbiAgY29uc3QgdG9wTWVudUl0ZW1zID0gW1xuICAgIHsgaWQ6ICdEYXNoYm9hcmQnLCBsYWJlbDogJ0Rhc2hib2FyZCcsIGljb246ICdIb21lJywgaHJlZjogcm9vdFBhdGggfSxcbiAgICB7IGlkOiAnSG9zdHMnLCBsYWJlbDogJ0hvc3RzJywgaWNvbjogJ0JyaWVmY2FzZScsIGhyZWY6IGAke3Jvb3RQYXRofS9yZXNvdXJjZXMvSG9zdHNgIH0sXG4gICAgeyBpZDogJ0RlbGl2ZXJpZXMnLCBsYWJlbDogJ0RlbGl2ZXJpZXMnLCBpY29uOiAnUGFja2FnZScsIGhyZWY6IGAke3Jvb3RQYXRofS9yZXNvdXJjZXMvRGVsaXZlcmllc2AgfSxcbiAgICB7IGlkOiAnVmlzaXRvcnMnLCBsYWJlbDogJ1Zpc2l0b3JzJywgaWNvbjogJ1VzZXJDaGVjaycsIGhyZWY6IGAke3Jvb3RQYXRofS9yZXNvdXJjZXMvVmlzaXRvcnNgIH0sXG4gICAgeyBpZDogJ1ByZVJlZ2lzdGVyJywgbGFiZWw6ICdQcmUgUmVnaXN0ZXInLCBpY29uOiAnQ2FsZW5kYXInLCBocmVmOiBgJHtyb290UGF0aH0vcmVzb3VyY2VzL1ByZVJlZ2lzdGVyYCB9LFxuICBdO1xuXG4gIC8vIEFkbWluLW9ubHkgaXRlbXMgKGhpZGRlbiBmcm9tIEhPU1QgYW5kIFJFQ0VQVElPTilcbiAgLy8gUmVwb3J0cyBpcyB2aXNpYmxlIHRvIGFsbCByb2xlcyAoSE9TVCBzZWVzIG9ubHkgdGhlaXIgY29tcGFueSwgUkVDRVBUSU9OIHNlZXMgYWxsKVxuICBjb25zdCBhZG1pbk9ubHlJdGVtcyA9IFsnVXNlcnMnLCAnQXVkaXRMb2cnLCAnU2V0dGluZ3MnXTtcblxuICBjb25zdCBhbGxCb3R0b21NZW51SXRlbXMgPSBbXG4gICAgeyBpZDogJ1VzZXJzJywgbGFiZWw6ICdVc2VycycsIGljb246ICdVc2VycycsIGhyZWY6IGAke3Jvb3RQYXRofS9yZXNvdXJjZXMvVXNlcnNgIH0sXG4gICAgeyBpZDogJ0F1ZGl0TG9nJywgbGFiZWw6ICdBdWRpdCBMb2cnLCBpY29uOiAnRmlsZVRleHQnLCBocmVmOiBgJHtyb290UGF0aH0vcmVzb3VyY2VzL0F1ZGl0TG9nYCB9LFxuICAgIHsgaWQ6ICdSZXBvcnRzJywgbGFiZWw6ICdSZXBvcnRzJywgaWNvbjogZ2V0UGFnZUljb24oJ1JlcG9ydHMnKSB8fCAnQmFyQ2hhcnQyJywgaHJlZjogYCR7cm9vdFBhdGh9L3BhZ2VzL1JlcG9ydHNgIH0sXG4gICAgeyBpZDogJ1NldHRpbmdzJywgbGFiZWw6ICdTZXR0aW5ncycsIGljb246IGdldFBhZ2VJY29uKCdTZXR0aW5ncycpIHx8ICdTZXR0aW5ncycsIGhyZWY6IGAke3Jvb3RQYXRofS9wYWdlcy9TZXR0aW5nc2AgfSxcbiAgXTtcblxuICAvLyBGaWx0ZXIgYm90dG9tIG1lbnUgaXRlbXMgYmFzZWQgb24gcm9sZVxuICBjb25zdCBib3R0b21NZW51SXRlbXMgPSB1c2VyUm9sZSA9PT0gJ0FETUlOJ1xuICAgID8gYWxsQm90dG9tTWVudUl0ZW1zXG4gICAgOiBhbGxCb3R0b21NZW51SXRlbXMuZmlsdGVyKGl0ZW0gPT4gIWFkbWluT25seUl0ZW1zLmluY2x1ZGVzKGl0ZW0uaWQpKTtcblxuICBjb25zdCBnZXRNZW51SXRlbVN0eWxlID0gKHNlbGVjdGVkOiBib29sZWFuKSA9PiAoe1xuICAgIC4uLnN0eWxlcy5tZW51SXRlbSxcbiAgICAuLi4oc2VsZWN0ZWQgPyBzdHlsZXMubWVudUl0ZW1TZWxlY3RlZCA6IHt9KSxcbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXtzdHlsZXMuY29udGFpbmVyfT5cbiAgICAgIHt0b3BNZW51SXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxhXG4gICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgIGhyZWY9e2l0ZW0uaHJlZn1cbiAgICAgICAgICBzdHlsZT17Z2V0TWVudUl0ZW1TdHlsZShpc1NlbGVjdGVkKGl0ZW0uaHJlZikpfVxuICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsaWNrKGl0ZW0uaHJlZil9XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBpY29uPXtpdGVtLmljb259IC8+XG4gICAgICAgICAgPHNwYW4gc3R5bGU9e3N0eWxlcy5sYWJlbH0+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2E+XG4gICAgICApKX1cblxuICAgICAgPGhyIHN0eWxlPXtzdHlsZXMuc2VwYXJhdG9yfSAvPlxuXG4gICAgICB7Ym90dG9tTWVudUl0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBocmVmPXtpdGVtLmhyZWZ9XG4gICAgICAgICAgc3R5bGU9e2dldE1lbnVJdGVtU3R5bGUoaXNTZWxlY3RlZChpdGVtLmhyZWYpKX1cbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbGljayhpdGVtLmhyZWYpfVxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gaWNvbj17aXRlbS5pY29ufSAvPlxuICAgICAgICAgIDxzcGFuIHN0eWxlPXtzdHlsZXMubGFiZWx9PntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9hPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaWRlYmFyUmVzb3VyY2VTZWN0aW9uO1xuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBCb3gsIExhYmVsLCBJbnB1dCwgQnV0dG9uLCBUZXh0LCBNZXNzYWdlQm94IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XHJcblxyXG5jb25zdCBMb2dpbjogUmVhY3QuRkMgPSAoKSA9PiB7XHJcbiAgY29uc3QgW2VtYWlsLCBzZXRFbWFpbF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBzZXRFcnJvcignJyk7XHJcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZW1haWwnLCBlbWFpbCk7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYWRtaW4vbG9naW4nLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgYm9keTogZm9ybURhdGEsXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2UucmVkaXJlY3RlZCkge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzcG9uc2UudXJsO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHNldEVycm9yKCdJbnZhbGlkIGVtYWlsIG9yIHBhc3N3b3JkJyk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvcignTG9naW4gZmFpbGVkLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxCb3hcclxuICAgICAgZmxleFxyXG4gICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcclxuICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXHJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcclxuICAgICAgc3R5bGU9e3tcclxuICAgICAgICBtaW5IZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y5ZmFmYicsXHJcbiAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICB9fVxyXG4gICAgPlxyXG4gICAgICA8Qm94XHJcbiAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICBtYXhXaWR0aDogJzQwMHB4JyxcclxuICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgfX1cclxuICAgICAgPlxyXG4gICAgICAgIDxUZXh0XHJcbiAgICAgICAgICBhcz1cImgxXCJcclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMS41cmVtJyxcclxuICAgICAgICAgICAgZm9udFdlaWdodDogNjAwLFxyXG4gICAgICAgICAgICBjb2xvcjogJyMxZjI5MzcnLFxyXG4gICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxNnB4JyxcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgTG9naW4gdG8gWW91ciBBY2NvdW50XHJcbiAgICAgICAgPC9UZXh0PlxyXG5cclxuICAgICAgICA8Qm94XHJcbiAgICAgICAgICBhcz1cImZvcm1cIlxyXG4gICAgICAgICAgb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH1cclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgey8qIEluZGlnbyBhY2NlbnQgYmFyICovfVxyXG4gICAgICAgICAgPEJveFxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIGhlaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ2xpbmVhci1ncmFkaWVudCg5MGRlZywgIzgxOGNmOCAwJSwgIzYzNjZmMSAxMDAlKScsXHJcbiAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgIDxCb3ggc3R5bGU9e3sgcGFkZGluZzogJzI0cHggMzJweCcgfX0+XHJcbiAgICAgICAgICAgIHtlcnJvciAmJiAoXHJcbiAgICAgICAgICAgICAgPE1lc3NhZ2VCb3hcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U9e2Vycm9yfVxyXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cImRhbmdlclwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICcxNnB4JyB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICA8Qm94IG1iPVwibGdcIj5cclxuICAgICAgICAgICAgICA8TGFiZWxcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDYwMCxcclxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMzc0MTUxJyxcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgVXNlcm5hbWUgb3IgRW1haWxcclxuICAgICAgICAgICAgICA8L0xhYmVsPlxyXG4gICAgICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcclxuICAgICAgICAgICAgICAgIG5hbWU9XCJlbWFpbFwiXHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVtYWlsXCJcclxuICAgICAgICAgICAgICAgIHZhbHVlPXtlbWFpbH1cclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHNldEVtYWlsKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZDFkNWRiJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L0JveD5cclxuXHJcbiAgICAgICAgICAgIDxCb3ggbWI9XCJsZ1wiPlxyXG4gICAgICAgICAgICAgIDxMYWJlbFxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNjAwLFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICBQYXNzd29yZFxyXG4gICAgICAgICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4gc2V0UGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWQ1ZGInLFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG5cclxuICAgICAgICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgc3R5bGU9e3sgZ2FwOiAnMTZweCcsIG1hcmdpblRvcDogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxyXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cInByaW1hcnlcIlxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzYzNjZmMScsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNTAwLFxyXG4gICAgICAgICAgICAgICAgICBjdXJzb3I6IGxvYWRpbmcgPyAnbm90LWFsbG93ZWQnIDogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiBsb2FkaW5nID8gMC43IDogMSxcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge2xvYWRpbmcgPyAnU2lnbmluZyBpbi4uLicgOiAnU3VibWl0J31cclxuICAgICAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICAgICAgICA8VGV4dFxyXG4gICAgICAgICAgICAgICAgYXM9XCJhXCJcclxuICAgICAgICAgICAgICAgIGhyZWY9XCIjXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIEZvcmdvdCBwYXNzd29yZD9cclxuICAgICAgICAgICAgICA8L1RleHQ+XHJcbiAgICAgICAgICAgIDwvQm94PlxyXG4gICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgIDwvQm94PlxyXG4gICAgPC9Cb3g+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvZ2luO1xyXG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBTZW5kUXJNb2RhbCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9TZW5kUXJNb2RhbCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2VuZFFyTW9kYWwgPSBTZW5kUXJNb2RhbFxuaW1wb3J0IENoYW5nZVBhc3N3b3JkTW9kYWwgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvQ2hhbmdlUGFzc3dvcmRNb2RhbCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQ2hhbmdlUGFzc3dvcmRNb2RhbCA9IENoYW5nZVBhc3N3b3JkTW9kYWxcbmltcG9ydCBDaGFuZ2VQYXNzd29yZFBhZ2UgZnJvbSAnLi4vc3JjL2FkbWluL2NvbXBvbmVudHMvQ2hhbmdlUGFzc3dvcmRQYWdlJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5DaGFuZ2VQYXNzd29yZFBhZ2UgPSBDaGFuZ2VQYXNzd29yZFBhZ2VcbmltcG9ydCBFZGl0UHJvZmlsZVBhbmVsIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0VkaXRQcm9maWxlUGFuZWwnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkVkaXRQcm9maWxlUGFuZWwgPSBFZGl0UHJvZmlsZVBhbmVsXG5pbXBvcnQgUmVwb3J0c1BhbmVsIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1JlcG9ydHNQYW5lbCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUmVwb3J0c1BhbmVsID0gUmVwb3J0c1BhbmVsXG5pbXBvcnQgU2V0dGluZ3NQYW5lbCBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9TZXR0aW5nc1BhbmVsJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TZXR0aW5nc1BhbmVsID0gU2V0dGluZ3NQYW5lbFxuaW1wb3J0IFZpc2l0b3JDYXJkcyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9WaXNpdG9yQ2FyZHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlZpc2l0b3JDYXJkcyA9IFZpc2l0b3JDYXJkc1xuaW1wb3J0IEJ1bGtJbXBvcnRIb3N0cyBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9CdWxrSW1wb3J0SG9zdHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkJ1bGtJbXBvcnRIb3N0cyA9IEJ1bGtJbXBvcnRIb3N0c1xuaW1wb3J0IExvZ2dlZEluIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2dlZEluJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Mb2dnZWRJbiA9IExvZ2dlZEluXG5pbXBvcnQgU2lkZWJhclBhZ2VzIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL1NpZGViYXJQYWdlcydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2lkZWJhclBhZ2VzID0gU2lkZWJhclBhZ2VzXG5pbXBvcnQgU2lkZWJhclJlc291cmNlU2VjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vY29tcG9uZW50cy9TaWRlYmFyUmVzb3VyY2VTZWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TaWRlYmFyUmVzb3VyY2VTZWN0aW9uID0gU2lkZWJhclJlc291cmNlU2VjdGlvblxuaW1wb3J0IExvZ2luIGZyb20gJy4uL3NyYy9hZG1pbi9jb21wb25lbnRzL0xvZ2luJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Mb2dpbiA9IExvZ2luIl0sIm5hbWVzIjpbIkRhc2hib2FyZCIsImN1cnJlbnRBZG1pbiIsInVzZUN1cnJlbnRBZG1pbiIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwidXNlU3RhdGUiLCJrcGlzIiwic2V0S3BpcyIsInRvdGFsSG9zdHMiLCJ2aXNpdHNUb2RheSIsImRlbGl2ZXJpZXNUb2RheSIsInBlbmRpbmdBcHByb3ZhbHMiLCJzZXRQZW5kaW5nQXBwcm92YWxzIiwicmVjZWl2ZWREZWxpdmVyaWVzIiwic2V0UmVjZWl2ZWREZWxpdmVyaWVzIiwiY2hhcnREYXRhIiwic2V0Q2hhcnREYXRhIiwiZGFya01vZGUiLCJzZXREYXJrTW9kZSIsIndpbmRvdyIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJ1c2VFZmZlY3QiLCJoYW5kbGVUaGVtZUNoYW5nZSIsImlzRGFyayIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJsb2FkRGFzaGJvYXJkRGF0YSIsImtwaXNSZXMiLCJmZXRjaCIsImNyZWRlbnRpYWxzIiwib2siLCJrcGlzRGF0YSIsImpzb24iLCJhcHByb3ZhbHNSZXMiLCJhcHByb3ZhbHNEYXRhIiwiZGVsaXZlcmllc1JlcyIsImRlbGl2ZXJpZXNEYXRhIiwiY2hhcnRzUmVzIiwiY2hhcnRzRGF0YSIsImVycm9yIiwiY29uc29sZSIsImhhbmRsZUFwcHJvdmUiLCJpZCIsInJlcyIsIm1ldGhvZCIsImhhbmRsZVJlamVjdCIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsImZsZXgiLCJmbGV4RGlyZWN0aW9uIiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwiaGVpZ2h0IiwiTG9hZGVyIiwiVGV4dCIsIm10Iiwicm9sZSIsImNhbkFwcHJvdmUiLCJjYXJkU3R5bGUiLCJib3JkZXJSYWRpdXMiLCJib3hTaGFkb3ciLCJiYWNrZ3JvdW5kQ29sb3IiLCJib3JkZXIiLCJmdWxsV2lkdGhDYXJkU3R5bGUiLCJ3aWR0aCIsImRpc3BsYXkiLCJ0ZXh0Q29sb3IiLCJ1bmRlZmluZWQiLCJtdXRlZENvbG9yIiwiYmdDb2xvciIsInZhcmlhbnQiLCJwIiwic3R5bGUiLCJtYiIsIkgyIiwiY29sb3IiLCJnYXAiLCJmb250U2l6ZSIsIm1hcmdpbiIsIkljb24iLCJpY29uIiwic2l6ZSIsIkgzIiwibGVuZ3RoIiwiVGFibGUiLCJUYWJsZUhlYWQiLCJUYWJsZVJvdyIsIlRhYmxlQ2VsbCIsIlRhYmxlQm9keSIsIm1hcCIsIml0ZW0iLCJrZXkiLCJ2aXNpdG9yTmFtZSIsImhvc3ROYW1lIiwiaG9zdENvbXBhbnkiLCJEYXRlIiwiZXhwZWN0ZWREYXRlIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwid2hpdGVTcGFjZSIsIkJ1dHRvbiIsIm9uQ2xpY2siLCJjb3VyaWVyIiwicmVjZWl2ZWRBdCIsInRvTG9jYWxlVGltZVN0cmluZyIsIkg0IiwidmlzaXRzUGVyRGF5IiwiZGF5IiwiZGF0ZSIsIndlZWtkYXkiLCJiZyIsIk1hdGgiLCJtaW4iLCJjb3VudCIsIm1pbldpZHRoIiwic3RhdHVzRGlzdHJpYnV0aW9uIiwic3RhdHVzIiwicmVwbGFjZSIsInB4IiwicHkiLCJkZWxpdmVyaWVzUGVyRGF5IiwiU2VuZFFyTW9kYWwiLCJwcm9wcyIsInJlY29yZCIsInFySW1hZ2VVcmwiLCJzZXRRckltYWdlVXJsIiwibWVzc2FnZSIsInNldE1lc3NhZ2UiLCJ2aXNpdElkIiwicGFyYW1zIiwidmlzaXRvclBob25lIiwidmlzaXRvckVtYWlsIiwibG9hZFFyQ29kZSIsImRhdGEiLCJxckRhdGFVcmwiLCJoYW5kbGVTZW5kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwidHlwZSIsInRleHQiLCJmb250V2VpZ2h0Iiwic3JjIiwiYWx0IiwiYmFja2dyb3VuZCIsInBhZGRpbmciLCJNZXNzYWdlQm94Iiwib25DbG9zZUNsaWNrIiwiZGlzYWJsZWQiLCJGcmFnbWVudCIsIm1yIiwibWwiLCJDaGFuZ2VQYXNzd29yZE1vZGFsIiwib25DbG9zZSIsImN1cnJlbnRQYXNzd29yZCIsInNldEN1cnJlbnRQYXNzd29yZCIsIm5ld1Bhc3N3b3JkIiwic2V0TmV3UGFzc3dvcmQiLCJjb25maXJtUGFzc3dvcmQiLCJzZXRDb25maXJtUGFzc3dvcmQiLCJoYW5kbGVTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJzZXRUaW1lb3V0IiwibWF4V2lkdGgiLCJvblN1Ym1pdCIsIkxhYmVsIiwicmVxdWlyZWQiLCJJbnB1dCIsInZhbHVlIiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJwbGFjZWhvbGRlciIsIkNoYW5nZVBhc3N3b3JkUGFnZSIsInVzZXJFbWFpbCIsImVtYWlsIiwiRWRpdFByb2ZpbGVQYW5lbCIsInNhdmluZyIsInNldFNhdmluZyIsInByb2ZpbGUiLCJzZXRQcm9maWxlIiwibmFtZSIsInNldE5hbWUiLCJsb2FkIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2F2ZSIsIlJlcG9ydHNQYW5lbCIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsImV4cG9ydGluZyIsInNldEV4cG9ydGluZyIsImlzSG9zdCIsImZpbHRlcnMiLCJzZXRGaWx0ZXJzIiwiZGF0ZUZyb20iLCJub3ciLCJ0b0lTT1N0cmluZyIsInNwbGl0IiwiZGF0ZVRvIiwibG9jYXRpb24iLCJjb21wYW55IiwicmVwb3J0RGF0YSIsInNldFJlcG9ydERhdGEiLCJoYW5kbGVGaWx0ZXJDaGFuZ2UiLCJwcmV2IiwiZ2VuZXJhdGVSZXBvcnQiLCJVUkxTZWFyY2hQYXJhbXMiLCJhcHBlbmQiLCJlbmRwb2ludCIsImV4cG9ydFJlcG9ydCIsImZvcm1hdCIsImJsb2IiLCJ1cmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJhIiwiaHJlZiIsImRvd25sb2FkIiwiYXBwZW5kQ2hpbGQiLCJjbGljayIsInJlbW92ZUNoaWxkIiwicmV2b2tlT2JqZWN0VVJMIiwidG9VcHBlckNhc2UiLCJ2aXNpdG9yU3RhdHVzZXMiLCJkZWxpdmVyeVN0YXR1c2VzIiwibG9jYXRpb25zIiwiVGFicyIsIlRhYiIsImxhYmVsIiwiaXNTZWxlY3RlZCIsImZsZXhXcmFwIiwiU2VsZWN0Iiwic2VsZWN0ZWQiLCJvcHRpb25zIiwibCIsInMiLCJ2aXNpdG9ycyIsInYiLCJ2aXNpdG9yQ29tcGFueSIsImhvc3QiLCJwdXJwb3NlIiwiY2hlY2tJbkF0IiwidG9Mb2NhbGVTdHJpbmciLCJjaGVja091dEF0IiwiZGVsaXZlcmllcyIsImQiLCJyZWNpcGllbnQiLCJwaWNrZWRVcEF0IiwiU2V0dGluZ3NQYW5lbCIsInNldHRpbmdzIiwic2V0U2V0dGluZ3MiLCJ0ZXN0aW5nV2hhdHNhcHAiLCJzZXRUZXN0aW5nV2hhdHNhcHAiLCJ0ZXN0aW5nRW1haWwiLCJzZXRUZXN0aW5nRW1haWwiLCJ0ZXN0UGhvbmUiLCJzZXRUZXN0UGhvbmUiLCJ0ZXN0RW1haWwiLCJzZXRUZXN0RW1haWxJbnB1dCIsImVkaXRpbmdTbXRwIiwic2V0RWRpdGluZ1NtdHAiLCJzbXRwRm9ybSIsInNldFNtdHBGb3JtIiwiZW5hYmxlZCIsInBvcnQiLCJ1c2VyIiwicGFzcyIsImZyb20iLCJpc0FkbWluIiwibG9hZFNldHRpbmdzIiwidGVzdFdoYXRzYXBwIiwicGhvbmUiLCJ0ZXN0U210cCIsInN0YXJ0RWRpdGluZ1NtdHAiLCJzbXRwIiwiU3RyaW5nIiwic2F2ZVNtdHBTZXR0aW5ncyIsInBhcnNlSW50IiwidG9nZ2xlU210cEVuYWJsZWQiLCJzaXRlIiwidGltZXpvbmUiLCJCYWRnZSIsIndoYXRzYXBwIiwiY29uZmlndXJlZCIsInByb3ZpZGVyIiwicHQiLCJib3JkZXJUb3AiLCJtYXJnaW5Ub3AiLCJtYWludGVuYW5jZSIsImFzIiwib3ZlcmZsb3ciLCJmb250RmFtaWx5IiwiVmlzaXRvckNhcmRzIiwic2V0VmlzaXRvcnMiLCJzZWFyY2giLCJzZXRTZWFyY2giLCJjaGVja2luZ091dCIsInNldENoZWNraW5nT3V0IiwibG9hZFZpc2l0b3JzIiwiaGFuZGxlQ2hlY2tvdXQiLCJzZXNzaW9uSWQiLCJoYW5kbGVTZW5kUXIiLCJ2aXNpdG9yIiwiYWxlcnQiLCJmaWx0ZXJlZFZpc2l0b3JzIiwiZmlsdGVyIiwic2VhcmNoTG93ZXIiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwidGV4dEFsaWduIiwiQnVsa0ltcG9ydEhvc3RzIiwic2VsZWN0ZWRGaWxlTmFtZSIsInNldFNlbGVjdGVkRmlsZU5hbWUiLCJjc3ZDb250ZW50Iiwic2V0Q3N2Q29udGVudCIsInZhbGlkYXRpbmciLCJzZXRWYWxpZGF0aW5nIiwidmFsaWRhdGlvbiIsInNldFZhbGlkYXRpb24iLCJzdW1tYXJ5Iiwic2V0U3VtbWFyeSIsImVkaXRhYmxlUmVqZWN0ZWQiLCJzZXRFZGl0YWJsZVJlamVjdGVkIiwiaGFuZGxlRmlsZUNoYW5nZSIsImV2ZW50IiwiZmlsZSIsImZpbGVzIiwiZW5kc1dpdGgiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVzdWx0IiwidmFsaWRhdGVDc3YiLCJvbmVycm9yIiwicmVhZEFzVGV4dCIsImNvbnRlbnQiLCJ0b3RhbFByb2Nlc3NlZCIsInJlamVjdGVkIiwibmV3SG9zdHMiLCJpbnNlcnRlZCIsImV4aXN0aW5nSG9zdHMiLCJza2lwcGVkIiwidXNlcnNUb0NyZWF0ZSIsInVzZXJzQ3JlYXRlZCIsInJlamVjdGVkUm93cyIsIkFycmF5IiwiaXNBcnJheSIsInRvdGFsUm93cyIsInZhbGlkUm93cyIsImhhbmRsZUltcG9ydCIsInVzZXJzU2tpcHBlZCIsImNyZWF0ZWRDcmVkZW50aWFscyIsImhhbmRsZVJldHJ5UmVqZWN0ZWQiLCJyb3dzIiwiciIsImpvaW4iLCJyZXRyeUNzdkNvbnRlbnQiLCJuZXdSZWplY3RlZFJvd3MiLCJ1cGRhdGVSZWplY3RlZFJvdyIsImluZGV4IiwiZmllbGQiLCJ1cGRhdGVkIiwiZXhwb3J0Q3JlZGVudGlhbHMiLCJjIiwicGFzc3dvcmQiLCJjc3ZEYXRhIiwiQmxvYiIsImxpbmsiLCJoYXNWYWxpZGF0aW9uRXJyb3JzIiwiaGFzQ3JlZGVudGlhbHMiLCJoYXNFZGl0YWJsZVJlamVjdGVkIiwiYWNjZXB0IiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsIm1heEhlaWdodCIsIm92ZXJmbG93WSIsIm92ZXJmbG93WCIsImJvcmRlckNvbGxhcHNlIiwiYm9yZGVyQm90dG9tIiwicm93IiwiaWR4Iiwicm93TnVtYmVyIiwicmVhc29uIiwiY3JlZCIsIkxvZ2dlZEluIiwic2Vzc2lvbiIsInBhdGhzIiwicm9vdFBhdGgiLCJkcm9wQWN0aW9ucyIsImxvZ291dFBhdGgiLCJmbGV4U2hyaW5rIiwiQ3VycmVudFVzZXJOYXYiLCJ0aXRsZSIsImF2YXRhclVybCIsIlNpZGViYXJQYWdlcyIsInN0eWxlcyIsImNvbnRhaW5lciIsIm1lbnVJdGVtIiwidGV4dERlY29yYXRpb24iLCJjdXJzb3IiLCJib3JkZXJMZWZ0IiwidHJhbnNpdGlvbiIsIm1lbnVJdGVtU2VsZWN0ZWQiLCJzZXBhcmF0b3IiLCJ0ZXh0T3ZlcmZsb3ciLCJTaWRlYmFyUmVzb3VyY2VTZWN0aW9uIiwibmF2aWdhdGUiLCJ1c2VOYXZpZ2F0ZSIsInVzZUxvY2F0aW9uIiwicGFnZXMiLCJ1c2VTZWxlY3RvciIsInN0YXRlIiwidXNlclJvbGUiLCJwYXRoIiwicGF0aG5hbWUiLCJzdGFydHNXaXRoIiwiaGFuZGxlQ2xpY2siLCJnZXRQYWdlSWNvbiIsInBhZ2UiLCJmaW5kIiwidG9wTWVudUl0ZW1zIiwiYWRtaW5Pbmx5SXRlbXMiLCJhbGxCb3R0b21NZW51SXRlbXMiLCJib3R0b21NZW51SXRlbXMiLCJnZXRNZW51SXRlbVN0eWxlIiwiTG9naW4iLCJzZXRFbWFpbCIsInNldFBhc3N3b3JkIiwic2V0RXJyb3IiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwicmVzcG9uc2UiLCJyZWRpcmVjdGVkIiwiZXJyIiwibWluSGVpZ2h0IiwibWFyZ2luQm90dG9tIiwib3V0bGluZSIsIm9wYWNpdHkiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFrQ0EsTUFBTUEsU0FBbUIsR0FBR0EsTUFBTTtFQUNoQyxFQUFBLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDLEdBQUdDLHVCQUFlLEVBQUU7SUFDeEMsTUFBTSxDQUFDQyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0VBQzVDLEVBQUEsTUFBTSxDQUFDQyxJQUFJLEVBQUVDLE9BQU8sQ0FBQyxHQUFHRixjQUFRLENBQVU7RUFBRUcsSUFBQUEsVUFBVSxFQUFFLENBQUM7RUFBRUMsSUFBQUEsV0FBVyxFQUFFLENBQUM7RUFBRUMsSUFBQUEsZUFBZSxFQUFFO0VBQUUsR0FBQyxDQUFDO0lBQ2hHLE1BQU0sQ0FBQ0MsZ0JBQWdCLEVBQUVDLG1CQUFtQixDQUFDLEdBQUdQLGNBQVEsQ0FBb0IsRUFBRSxDQUFDO0lBQy9FLE1BQU0sQ0FBQ1Esa0JBQWtCLEVBQUVDLHFCQUFxQixDQUFDLEdBQUdULGNBQVEsQ0FBcUIsRUFBRSxDQUFDO0lBQ3BGLE1BQU0sQ0FBQ1UsU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR1gsY0FBUSxDQUFtQixJQUFJLENBQUM7SUFDbEUsTUFBTSxDQUFDWSxRQUFRLEVBQUVDLFdBQVcsQ0FBQyxHQUFHYixjQUFRLENBQUMsTUFBTTtFQUM3QyxJQUFBLElBQUksT0FBT2MsTUFBTSxLQUFLLFdBQVcsRUFBRTtFQUNqQyxNQUFBLE9BQU9DLFlBQVksQ0FBQ0MsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEtBQUssTUFBTTtFQUNwRSxJQUFBO0VBQ0EsSUFBQSxPQUFPLEtBQUs7RUFDZCxFQUFBLENBQUMsQ0FBQztFQUVGQyxFQUFBQSxlQUFTLENBQUMsTUFBTTtNQUNkLE1BQU1DLGlCQUFpQixHQUFHQSxNQUFNO1FBQzlCLE1BQU1DLE1BQU0sR0FBR0osWUFBWSxDQUFDQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsS0FBSyxNQUFNO1FBQzFFSCxXQUFXLENBQUNNLE1BQU0sQ0FBQztRQUNuQkMsUUFBUSxDQUFDQyxlQUFlLENBQUNDLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLE1BQU0sRUFBRUosTUFBTSxDQUFDO01BQzNELENBQUM7O0VBRUQ7RUFDQUwsSUFBQUEsTUFBTSxDQUFDVSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUVOLGlCQUFpQixDQUFDO0VBQ3JEO0VBQ0FKLElBQUFBLE1BQU0sQ0FBQ1UsZ0JBQWdCLENBQUMsY0FBYyxFQUFFTixpQkFBaUIsQ0FBQzs7RUFFMUQ7RUFDQUEsSUFBQUEsaUJBQWlCLEVBQUU7RUFFbkIsSUFBQSxPQUFPLE1BQU07RUFDWEosTUFBQUEsTUFBTSxDQUFDVyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUVQLGlCQUFpQixDQUFDO0VBQ3hESixNQUFBQSxNQUFNLENBQUNXLG1CQUFtQixDQUFDLGNBQWMsRUFBRVAsaUJBQWlCLENBQUM7TUFDL0QsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUM7RUFJTkQsRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZFMsSUFBQUEsaUJBQWlCLEVBQUU7SUFDckIsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUVOLEVBQUEsTUFBTUEsaUJBQWlCLEdBQUcsWUFBWTtNQUNwQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEIsSUFBSTtFQUNGO0VBQ0EsTUFBQSxNQUFNNEIsT0FBTyxHQUFHLE1BQU1DLEtBQUssQ0FBQywyQkFBMkIsRUFBRTtFQUN2REMsUUFBQUEsV0FBVyxFQUFFO0VBQ2YsT0FBQyxDQUFDO1FBQ0YsSUFBSUYsT0FBTyxDQUFDRyxFQUFFLEVBQUU7RUFDZCxRQUFBLE1BQU1DLFFBQVEsR0FBRyxNQUFNSixPQUFPLENBQUNLLElBQUksRUFBRTtVQUNyQzlCLE9BQU8sQ0FBQzZCLFFBQVEsQ0FBQztFQUNuQixNQUFBOztFQUVBO0VBQ0EsTUFBQSxNQUFNRSxZQUFZLEdBQUcsTUFBTUwsS0FBSyxDQUFDLHdDQUF3QyxFQUFFO0VBQ3pFQyxRQUFBQSxXQUFXLEVBQUU7RUFDZixPQUFDLENBQUM7UUFDRixJQUFJSSxZQUFZLENBQUNILEVBQUUsRUFBRTtFQUNuQixRQUFBLE1BQU1JLGFBQWEsR0FBRyxNQUFNRCxZQUFZLENBQUNELElBQUksRUFBRTtVQUMvQ3pCLG1CQUFtQixDQUFDMkIsYUFBYSxDQUFDO0VBQ3BDLE1BQUE7O0VBRUE7RUFDQSxNQUFBLE1BQU1DLGFBQWEsR0FBRyxNQUFNUCxLQUFLLENBQUMsMENBQTBDLEVBQUU7RUFDNUVDLFFBQUFBLFdBQVcsRUFBRTtFQUNmLE9BQUMsQ0FBQztRQUNGLElBQUlNLGFBQWEsQ0FBQ0wsRUFBRSxFQUFFO0VBQ3BCLFFBQUEsTUFBTU0sY0FBYyxHQUFHLE1BQU1ELGFBQWEsQ0FBQ0gsSUFBSSxFQUFFO1VBQ2pEdkIscUJBQXFCLENBQUMyQixjQUFjLENBQUM7RUFDdkMsTUFBQTs7RUFFQTtFQUNBLE1BQUEsTUFBTUMsU0FBUyxHQUFHLE1BQU1ULEtBQUssQ0FBQyw2QkFBNkIsRUFBRTtFQUMzREMsUUFBQUEsV0FBVyxFQUFFO0VBQ2YsT0FBQyxDQUFDO1FBQ0YsSUFBSVEsU0FBUyxDQUFDUCxFQUFFLEVBQUU7RUFDaEIsUUFBQSxNQUFNUSxVQUFVLEdBQUcsTUFBTUQsU0FBUyxDQUFDTCxJQUFJLEVBQUU7VUFDekNyQixZQUFZLENBQUMyQixVQUFVLENBQUM7RUFDMUIsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPQyxLQUFLLEVBQUU7RUFDZEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFLLENBQUMsZ0NBQWdDLEVBQUVBLEtBQUssQ0FBQztFQUN4RCxJQUFBLENBQUMsU0FBUztRQUNSeEMsVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTTBDLGFBQWEsR0FBRyxNQUFPQyxFQUFVLElBQUs7TUFDMUMsSUFBSTtRQUNGLE1BQU1DLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsQ0FBQSw2QkFBQSxFQUFnQ2MsRUFBRSxFQUFFLEVBQUU7RUFDNURFLFFBQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2RmLFFBQUFBLFdBQVcsRUFBRTtFQUNmLE9BQUMsQ0FBQztRQUNGLElBQUljLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1ZKLFFBQUFBLGlCQUFpQixFQUFFO0VBQ3JCLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT2EsS0FBSyxFQUFFO0VBQ2RDLE1BQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLG9CQUFvQixFQUFFQSxLQUFLLENBQUM7RUFDNUMsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU1NLFlBQVksR0FBRyxNQUFPSCxFQUFVLElBQUs7TUFDekMsSUFBSTtRQUNGLE1BQU1DLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsQ0FBQSw0QkFBQSxFQUErQmMsRUFBRSxFQUFFLEVBQUU7RUFDM0RFLFFBQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2RmLFFBQUFBLFdBQVcsRUFBRTtFQUNmLE9BQUMsQ0FBQztRQUNGLElBQUljLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1ZKLFFBQUFBLGlCQUFpQixFQUFFO0VBQ3JCLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT2EsS0FBSyxFQUFFO0VBQ2RDLE1BQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLG1CQUFtQixFQUFFQSxLQUFLLENBQUM7RUFDM0MsSUFBQTtJQUNGLENBQUM7RUFJRCxFQUFBLElBQUl6QyxPQUFPLEVBQUU7RUFDWCxJQUFBLG9CQUNFZ0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO1FBQ0ZDLElBQUksRUFBQSxJQUFBO0VBQ0pDLE1BQUFBLGFBQWEsRUFBQyxRQUFRO0VBQ3RCQyxNQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUNuQkMsTUFBQUEsY0FBYyxFQUFDLFFBQVE7RUFDdkJDLE1BQUFBLE1BQU0sRUFBQztFQUFPLEtBQUEsZUFFZFAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDTyxtQkFBTSxFQUFBLElBQUUsQ0FBQyxlQUNWUixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ0MsTUFBQUEsRUFBRSxFQUFDO09BQUksRUFBQyxzQkFBMEIsQ0FDckMsQ0FBQztFQUVWLEVBQUE7RUFFQSxFQUFBLE1BQU1DLElBQUksR0FBSTdELFlBQVksRUFBVTZELElBQUksSUFBSSxPQUFPO0lBQ25ELE1BQU1DLFVBQVUsR0FBR0QsSUFBSSxLQUFLLE9BQU8sSUFBSUEsSUFBSSxLQUFLLE1BQU07O0VBRXREO0VBQ0EsRUFBQSxNQUFNRSxTQUFTLEdBQUc7RUFDaEJDLElBQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CWCxJQUFBQSxJQUFJLEVBQUUsQ0FBQztFQUNQWSxJQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDQyxJQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QkMsSUFBQUEsTUFBTSxFQUFFO0tBQ1Q7RUFFRCxFQUFBLE1BQU1DLGtCQUFrQixHQUFHO0VBQ3pCSixJQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQkssSUFBQUEsS0FBSyxFQUFFLE1BQU07RUFDYkMsSUFBQUEsT0FBTyxFQUFFLE9BQU87RUFDaEJMLElBQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENDLElBQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCQyxJQUFBQSxNQUFNLEVBQUU7S0FDVDtJQUVELE1BQU1JLFNBQVMsR0FBR0MsU0FBUztJQUMzQixNQUFNQyxVQUFVLEdBQUcsUUFBUTtJQUMzQixNQUFNQyxPQUFPLEdBQUdGLFNBQVM7RUFFekIsRUFBQSxvQkFDRXRCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDdUIsSUFBQUEsT0FBTyxFQUFDLE1BQU07RUFBQ0MsSUFBQUEsQ0FBQyxFQUFDLEtBQUs7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVYLE1BQUFBLGVBQWUsRUFBRVE7RUFBUTtFQUFFLEdBQUEsZUFDOUR4QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLFlBQVk7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEVBQUUsRUFBQztFQUFLLEdBQUEsZUFDaEU1QixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUMsV0FBYSxDQUMzQyxDQUFDLGVBR05yQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLEtBQUs7RUFBQ3dCLElBQUFBLEVBQUUsRUFBQyxLQUFLO0VBQUNELElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDNUQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRWQ7RUFBVSxHQUFBLGVBQ3ZEYixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VCLElBQUFBLFFBQVEsRUFBQyxJQUFJO0VBQUNMLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVQO09BQWE7RUFBQ0ssSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxFQUFDLGFBQWlCLENBQUMsZUFDNUU1QixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0YsSUFBQUEsS0FBSyxFQUFFO0VBQUVNLE1BQUFBLE1BQU0sRUFBRSxDQUFDO0VBQUVILE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUVsRSxJQUFJLENBQUNFLFVBQWUsQ0FBQyxlQUNsRTJDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lDLGlCQUFJLEVBQUE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLE1BQU07RUFBQ0wsSUFBQUEsS0FBSyxFQUFDLFlBQVk7RUFBQ00sSUFBQUEsSUFBSSxFQUFFO0VBQUcsR0FBRSxDQUM3QyxDQUFDLGVBQ05wQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRWQ7RUFBVSxHQUFBLGVBQ3ZEYixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VCLElBQUFBLFFBQVEsRUFBQyxJQUFJO0VBQUNMLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVQO09BQWE7RUFBQ0ssSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxFQUFDLGNBQWtCLENBQUMsZUFDN0U1QixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0YsSUFBQUEsS0FBSyxFQUFFO0VBQUVNLE1BQUFBLE1BQU0sRUFBRSxDQUFDO0VBQUVILE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUVsRSxJQUFJLENBQUNHLFdBQWdCLENBQUMsZUFDbkUwQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxXQUFXO0VBQUNMLElBQUFBLEtBQUssRUFBQyxTQUFTO0VBQUNNLElBQUFBLElBQUksRUFBRTtFQUFHLEdBQUUsQ0FDL0MsQ0FBQyxlQUNOcEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUVkO0VBQVUsR0FBQSxlQUN2RGIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1QixJQUFBQSxRQUFRLEVBQUMsSUFBSTtFQUFDTCxJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFUDtPQUFhO0VBQUNLLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyxrQkFBc0IsQ0FBQyxlQUNqRjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzRCLGVBQUUsRUFBQTtFQUFDRixJQUFBQSxLQUFLLEVBQUU7RUFBRU0sTUFBQUEsTUFBTSxFQUFFLENBQUM7RUFBRUgsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0tBQUUsRUFBRWxFLElBQUksQ0FBQ0ksZUFBb0IsQ0FBQyxlQUN2RXlDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lDLGlCQUFJLEVBQUE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLFNBQVM7RUFBQ0wsSUFBQUEsS0FBSyxFQUFDLE1BQU07RUFBQ00sSUFBQUEsSUFBSSxFQUFFO0tBQUssQ0FDMUMsQ0FDRixDQUFDLGVBR05wQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQyxLQUFLO0VBQUNELElBQUFBLEtBQUssRUFBRTtFQUFFUCxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUFFaEIsTUFBQUEsYUFBYSxFQUFFLFFBQVE7RUFBRTJCLE1BQUFBLEdBQUcsRUFBRSxNQUFNO0VBQUVaLE1BQUFBLEtBQUssRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUU1Rm5CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDd0IsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFVDtFQUFtQixHQUFBLGVBQ3BDbEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0MsZUFBRSxFQUFBO0VBQUNULElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNELElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7RUFBRSxHQUFBLEVBQUMsNkJBQStCLENBQUMsRUFDeEU3RCxnQkFBZ0IsQ0FBQzhFLE1BQU0sS0FBSyxDQUFDLGdCQUM1QnRDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVA7RUFBVztFQUFFLEdBQUEsRUFBQyxzQkFBMEIsQ0FBQyxnQkFFL0R2QixzQkFBQSxDQUFBQyxhQUFBLENBQUNzQyxrQkFBSyxFQUFBO0VBQUNaLElBQUFBLEtBQUssRUFBRTtFQUFFWCxNQUFBQSxlQUFlLEVBQUVNO0VBQVU7RUFBRSxHQUFBLGVBQzNDdEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDdUMsc0JBQVMscUJBQ1J4QyxzQkFBQSxDQUFBQyxhQUFBLENBQUN3QyxxQkFBUSxFQUFBLElBQUEsZUFDUHpDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtFQUFFLEdBQUEsRUFBQyxTQUFrQixDQUFDLGVBQzNEckIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0VBQUUsR0FBQSxFQUFDLE1BQWUsQ0FBQyxlQUN4RHJCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtFQUFFLEdBQUEsRUFBQyxTQUFrQixDQUFDLGVBQzNEckIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0tBQUUsRUFBQyxVQUFtQixDQUFDLEVBQzNEVCxVQUFVLGlCQUFJWixzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7S0FBRSxFQUFDLFNBQWtCLENBQ2pFLENBQ0QsQ0FBQyxlQUNackIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEMsc0JBQVMsUUFDUG5GLGdCQUFnQixDQUFDb0YsR0FBRyxDQUFFQyxJQUFJLGlCQUN6QjdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dDLHFCQUFRLEVBQUE7TUFBQ0ssR0FBRyxFQUFFRCxJQUFJLENBQUNqRDtFQUFHLEdBQUEsZUFDckJJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUV3QixJQUFJLENBQUNFLFdBQXVCLENBQUMsZUFDdEUvQyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7S0FBRSxFQUFFd0IsSUFBSSxDQUFDRyxRQUFvQixDQUFDLGVBQ25FaEQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0tBQUUsRUFBRXdCLElBQUksQ0FBQ0ksV0FBdUIsQ0FBQyxlQUN0RWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUUsSUFBSTZCLElBQUksQ0FBQ0wsSUFBSSxDQUFDTSxZQUFZLENBQUMsQ0FBQ0Msa0JBQWtCLEVBQWMsQ0FBQyxFQUNyR3hDLFVBQVUsaUJBQ1RaLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxlQUNSMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxLQUFLO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFLEtBQUs7RUFBRXNCLE1BQUFBLFVBQVUsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUN4RXJELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQ2pCVyxJQUFBQSxJQUFJLEVBQUMsSUFBSTtFQUNUbUIsSUFBQUEsT0FBTyxFQUFFQSxNQUFNNUQsYUFBYSxDQUFDa0QsSUFBSSxDQUFDakQsRUFBRTtFQUFFLEdBQUEsRUFDdkMsU0FFTyxDQUFDLGVBQ1RJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxRQUFRO0VBQ2hCVyxJQUFBQSxJQUFJLEVBQUMsSUFBSTtFQUNUbUIsSUFBQUEsT0FBTyxFQUFFQSxNQUFNeEQsWUFBWSxDQUFDOEMsSUFBSSxDQUFDakQsRUFBRTtFQUFFLEdBQUEsRUFDdEMsUUFFTyxDQUNMLENBQ0ksQ0FFTCxDQUNYLENBQ1EsQ0FDTixDQUVOLENBQUMsZUFHTkksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUVUO0VBQW1CLEdBQUEsZUFDcENsQixzQkFBQSxDQUFBQyxhQUFBLENBQUNvQyxlQUFFLEVBQUE7RUFBQ1QsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtFQUFFLEdBQUEsRUFBQyw2QkFBK0IsQ0FBQyxFQUN4RTNELGtCQUFrQixDQUFDNEUsTUFBTSxLQUFLLENBQUMsZ0JBQzlCdEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFUDtFQUFXO0VBQUUsR0FBQSxFQUFDLHVCQUEyQixDQUFDLGdCQUVoRXZCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3NDLGtCQUFLLEVBQUE7RUFBQ1osSUFBQUEsS0FBSyxFQUFFO0VBQUVYLE1BQUFBLGVBQWUsRUFBRU07RUFBVTtFQUFFLEdBQUEsZUFDM0N0QixzQkFBQSxDQUFBQyxhQUFBLENBQUN1QyxzQkFBUyxxQkFDUnhDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dDLHFCQUFRLEVBQUEsSUFBQSxlQUNQekMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0VBQUUsR0FBQSxFQUFDLFNBQWtCLENBQUMsZUFDM0RyQixzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7RUFBRSxHQUFBLEVBQUMsTUFBZSxDQUFDLGVBQ3hEckIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0VBQUUsR0FBQSxFQUFDLFNBQWtCLENBQUMsZUFDM0RyQixzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7S0FBRSxFQUFDLFVBQW1CLENBQ25ELENBQ0QsQ0FBQyxlQUNackIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEMsc0JBQVMsUUFDUGpGLGtCQUFrQixDQUFDa0YsR0FBRyxDQUFFQyxJQUFJLGlCQUMzQjdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dDLHFCQUFRLEVBQUE7TUFBQ0ssR0FBRyxFQUFFRCxJQUFJLENBQUNqRDtFQUFHLEdBQUEsZUFDckJJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUV3QixJQUFJLENBQUNXLE9BQW1CLENBQUMsZUFDbEV4RCxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7S0FBRSxFQUFFd0IsSUFBSSxDQUFDRyxRQUFvQixDQUFDLGVBQ25FaEQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0tBQUUsRUFBRXdCLElBQUksQ0FBQ0ksV0FBdUIsQ0FBQyxlQUN0RWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUUsSUFBSTZCLElBQUksQ0FBQ0wsSUFBSSxDQUFDWSxVQUFVLENBQUMsQ0FBQ0Msa0JBQWtCLEVBQWMsQ0FDM0YsQ0FDWCxDQUNRLENBQ04sQ0FFTixDQUNGLENBQUMsZUFHTjFELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsS0FBSztFQUFDdUIsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUVuRC9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDc0IsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFZDtFQUFVLEdBQUEsZUFDdkRiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBELGVBQUUsRUFBQTtFQUFDL0IsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUMsc0JBQXdCLENBQUMsRUFDakV6RCxTQUFTLEVBQUVnRyxZQUFZLGdCQUN0QjVELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDdUIsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUNwRG5FLFNBQVMsQ0FBQ2dHLFlBQVksQ0FBQ2hCLEdBQUcsQ0FBRWlCLEdBQUcsaUJBQzlCN0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUM0QyxHQUFHLEVBQUVlLEdBQUcsQ0FBQ0MsSUFBSztNQUFDM0QsSUFBSSxFQUFBLElBQUE7RUFBQ0UsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTTtFQUFFLEdBQUEsZUFDakUvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2tCLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsTUFBTTtFQUFFVyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7S0FBRSxFQUFFLElBQUk2QixJQUFJLENBQUNXLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLENBQUNWLGtCQUFrQixDQUFDLElBQUksRUFBRTtFQUFFVyxJQUFBQSxPQUFPLEVBQUU7RUFBUSxHQUFDLENBQVEsQ0FBQyxlQUM1SC9ELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGOEQsSUFBQUEsRUFBRSxFQUFDLFlBQVk7RUFDZnJDLElBQUFBLEtBQUssRUFBRTtFQUNMcEIsTUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZFksTUFBQUEsS0FBSyxFQUFFLENBQUEsRUFBRzhDLElBQUksQ0FBQ0MsR0FBRyxDQUFDTCxHQUFHLENBQUNNLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUEsQ0FBQSxDQUFHO0VBQzFDckQsTUFBQUEsWUFBWSxFQUFFLEtBQUs7UUFDbkJzRCxRQUFRLEVBQUVQLEdBQUcsQ0FBQ00sS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUc7RUFDckM7RUFBRSxHQUNILENBQUMsZUFDRm5FLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtFQUFFLEdBQUEsRUFBRXdDLEdBQUcsQ0FBQ00sS0FBWSxDQUNqRCxDQUNOLENBQ0UsQ0FBQyxnQkFFTm5FLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVA7RUFBVztLQUFFLEVBQUMsbUJBQXVCLENBRTFELENBQUMsZUFHTnZCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDc0IsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFZDtFQUFVLEdBQUEsZUFDdkRiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBELGVBQUUsRUFBQTtFQUFDL0IsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtFQUFFLEdBQUEsRUFBQyw2QkFBK0IsQ0FBQyxFQUN4RXpELFNBQVMsRUFBRXlHLGtCQUFrQixJQUFJekcsU0FBUyxDQUFDeUcsa0JBQWtCLENBQUMvQixNQUFNLEdBQUcsQ0FBQyxnQkFDdkV0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFDcERuRSxTQUFTLENBQUN5RyxrQkFBa0IsQ0FBQ3pCLEdBQUcsQ0FBRUMsSUFBSSxpQkFDckM3QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQzRDLEdBQUcsRUFBRUQsSUFBSSxDQUFDeUIsTUFBTztNQUFDbkUsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLGVBQWU7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDO0VBQVEsR0FBQSxlQUM1RUwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0VBQUUsR0FBQSxFQUFFd0IsSUFBSSxDQUFDeUIsTUFBTSxDQUFDQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBUSxDQUFDLGVBQzFFdkUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQ0Y4RCxFQUFFLEVBQUVuQixJQUFJLENBQUN5QixNQUFNLEtBQUssWUFBWSxHQUFHLFNBQVMsR0FBR3pCLElBQUksQ0FBQ3lCLE1BQU0sS0FBSyxrQkFBa0IsR0FBRyxTQUFTLEdBQUd6QixJQUFJLENBQUN5QixNQUFNLEtBQUssVUFBVSxHQUFHLE1BQU0sR0FBRyxRQUFTO0VBQy9JRSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUNQQyxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUNQOUMsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRTtFQUFNO0VBQUUsR0FBQSxlQUUvQmQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNxQixJQUFBQSxLQUFLLEVBQUM7RUFBTyxHQUFBLEVBQUVlLElBQUksQ0FBQ3NCLEtBQVksQ0FDbkMsQ0FDRixDQUNOLENBQ0UsQ0FBQyxnQkFFTm5FLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVA7RUFBVztLQUFFLEVBQUMsbUJBQXVCLENBRTFELENBQUMsZUFHTnZCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDc0IsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFZDtFQUFVLEdBQUEsZUFDdkRiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBELGVBQUUsRUFBQTtFQUFDL0IsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRVQ7RUFBVTtLQUFFLEVBQUMsMEJBQTRCLENBQUMsRUFDckV6RCxTQUFTLEVBQUU4RyxnQkFBZ0IsZ0JBQzFCMUUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQ3BEbkUsU0FBUyxDQUFDOEcsZ0JBQWdCLENBQUM5QixHQUFHLENBQUVpQixHQUFHLGlCQUNsQzdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDNEMsR0FBRyxFQUFFZSxHQUFHLENBQUNDLElBQUs7TUFBQzNELElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU07RUFBRSxHQUFBLGVBQ2pFL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFBRVcsTUFBQUEsS0FBSyxFQUFFVDtFQUFVO0tBQUUsRUFBRSxJQUFJNkIsSUFBSSxDQUFDVyxHQUFHLENBQUNDLElBQUksQ0FBQyxDQUFDVixrQkFBa0IsQ0FBQyxJQUFJLEVBQUU7RUFBRVcsSUFBQUEsT0FBTyxFQUFFO0VBQVEsR0FBQyxDQUFRLENBQUMsZUFDNUgvRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFDRjhELElBQUFBLEVBQUUsRUFBQyxNQUFNO0VBQ1RyQyxJQUFBQSxLQUFLLEVBQUU7RUFDTHBCLE1BQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2RZLE1BQUFBLEtBQUssRUFBRSxDQUFBLEVBQUc4QyxJQUFJLENBQUNDLEdBQUcsQ0FBQ0wsR0FBRyxDQUFDTSxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBLENBQUEsQ0FBRztFQUMxQ3JELE1BQUFBLFlBQVksRUFBRSxLQUFLO1FBQ25Cc0QsUUFBUSxFQUFFUCxHQUFHLENBQUNNLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHO0VBQ3JDO0VBQUUsR0FDSCxDQUFDLGVBQ0ZuRSxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2tCLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVUO0VBQVU7RUFBRSxHQUFBLEVBQUV3QyxHQUFHLENBQUNNLEtBQVksQ0FDakQsQ0FDTixDQUNFLENBQUMsZ0JBRU5uRSxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2tCLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUVQO0VBQVc7RUFBRSxHQUFBLEVBQUMsbUJBQXVCLENBRTFELENBQ0YsQ0FDRixDQUFDO0VBRVYsQ0FBQzs7RUNyWEQsTUFBTW9ELFdBQWtDLEdBQUlDLEtBQUssSUFBSztJQUNwRCxNQUFNO0VBQUVDLElBQUFBO0VBQU8sR0FBQyxHQUFHRCxLQUFLO0lBQ3hCLE1BQU0sQ0FBQzVILE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0MsTUFBTSxDQUFDNEgsVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBRzdILGNBQVEsQ0FBZ0IsSUFBSSxDQUFDO0lBQ2pFLE1BQU0sQ0FBQzhILE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUcvSCxjQUFRLENBQXFELElBQUksQ0FBQztFQUVoRyxFQUFBLE1BQU1nSSxPQUFPLEdBQUdMLE1BQU0sRUFBRU0sTUFBTSxFQUFFdkYsRUFBRTtJQUNsQyxNQUFNbUQsV0FBVyxHQUFHOEIsTUFBTSxFQUFFTSxNQUFNLEVBQUVwQyxXQUFXLElBQUksU0FBUztFQUM1RCxFQUFBLE1BQU1xQyxZQUFZLEdBQUdQLE1BQU0sRUFBRU0sTUFBTSxFQUFFQyxZQUFZO0VBQ2pELEVBQUEsTUFBTUMsWUFBWSxHQUFHUixNQUFNLEVBQUVNLE1BQU0sRUFBRUUsWUFBWTtFQUVqRGxILEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0VBQ2Q7RUFDQSxJQUFBLElBQUkrRyxPQUFPLEVBQUU7RUFDWEksTUFBQUEsVUFBVSxFQUFFO0VBQ2QsSUFBQTtFQUNGLEVBQUEsQ0FBQyxFQUFFLENBQUNKLE9BQU8sQ0FBQyxDQUFDO0VBRWIsRUFBQSxNQUFNSSxVQUFVLEdBQUcsWUFBWTtNQUM3QixJQUFJO1FBQ0YsTUFBTXpGLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsQ0FBQSxjQUFBLEVBQWlCb0csT0FBTyxFQUFFLEVBQUU7RUFDbERuRyxRQUFBQSxXQUFXLEVBQUU7RUFDZixPQUFDLENBQUM7UUFDRixJQUFJYyxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWLFFBQUEsTUFBTXVHLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7RUFDN0I2RixRQUFBQSxhQUFhLENBQUNRLElBQUksQ0FBQ0MsU0FBUyxDQUFDO0VBQy9CLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBTy9GLEtBQUssRUFBRTtFQUNkQyxNQUFBQSxPQUFPLENBQUNELEtBQUssQ0FBQyx5QkFBeUIsRUFBRUEsS0FBSyxDQUFDO0VBQ2pELElBQUE7SUFDRixDQUFDO0VBRUQsRUFBQSxNQUFNZ0csVUFBVSxHQUFHLE1BQU8zRixNQUE0QixJQUFLO01BQ3pELElBQUksQ0FBQ29GLE9BQU8sRUFBRTtNQUVkakksVUFBVSxDQUFDLElBQUksQ0FBQztNQUNoQmdJLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFFaEIsSUFBSTtFQUNGLE1BQUEsTUFBTXBGLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsb0JBQW9CLEVBQUU7RUFDNUNnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNEYsUUFBQUEsT0FBTyxFQUFFO0VBQUUsVUFBQSxjQUFjLEVBQUU7V0FBb0I7RUFDL0MzRyxRQUFBQSxXQUFXLEVBQUUsU0FBUztFQUN0QjRHLFFBQUFBLElBQUksRUFBRUMsSUFBSSxDQUFDQyxTQUFTLENBQUM7WUFDbkJYLE9BQU87RUFDUHBGLFVBQUFBO1dBQ0Q7RUFDSCxPQUFDLENBQUM7RUFFRixNQUFBLE1BQU15RixJQUFJLEdBQUcsTUFBTTFGLEdBQUcsQ0FBQ1gsSUFBSSxFQUFFO1FBRTdCLElBQUlXLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1ZpRyxRQUFBQSxVQUFVLENBQUM7RUFDVGEsVUFBQUEsSUFBSSxFQUFFLFNBQVM7WUFDZkMsSUFBSSxFQUFFLG9CQUFvQmpHLE1BQU0sS0FBSyxVQUFVLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQSxjQUFBO0VBQ3hFLFNBQUMsQ0FBQztFQUNKLE1BQUEsQ0FBQyxNQUFNO0VBQ0xtRixRQUFBQSxVQUFVLENBQUM7RUFDVGEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFDYkMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUN4QixTQUFDLENBQUM7RUFDSixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU92RixLQUFLLEVBQUU7RUFDZHdGLE1BQUFBLFVBQVUsQ0FBQztFQUNUYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUNiQyxRQUFBQSxJQUFJLEVBQUU7RUFDUixPQUFDLENBQUM7RUFDSixJQUFBLENBQUMsU0FBUztRQUNSOUksVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsb0JBQ0UrQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLElBQUFBLENBQUMsRUFBQztFQUFLLEdBQUEsZUFDVjFCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsY0FBZ0IsQ0FBQyxlQUU3QjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNtQixJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDb0UsSUFBQUEsVUFBVSxFQUFDO0tBQU0sRUFBQyxXQUFTLEVBQUNqRCxXQUFrQixDQUFDLEVBQzVEcUMsWUFBWSxpQkFBSXBGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDbUIsSUFBQUEsRUFBRSxFQUFDO0tBQUksRUFBQyxTQUFPLEVBQUN3RCxZQUFtQixDQUFDLEVBQzFEQyxZQUFZLGlCQUFJckYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNtQixJQUFBQSxFQUFFLEVBQUM7S0FBSSxFQUFDLFNBQU8sRUFBQ3lELFlBQW1CLENBQ3ZELENBQUMsZUFHTnJGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGMEIsSUFBQUEsRUFBRSxFQUFDLElBQUk7TUFDUHpCLElBQUksRUFBQSxJQUFBO0VBQ0pDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQ3RCQyxJQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUNuQnFCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQ05zQyxJQUFBQSxFQUFFLEVBQUMsUUFBUTtFQUNYckMsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRTtFQUFNO0VBQUUsR0FBQSxlQUUvQmQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEQsZUFBRSxFQUFBO0VBQUMvQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsaUJBQW1CLENBQUMsRUFDL0JrRCxVQUFVLGdCQUNUOUUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUNFZ0csSUFBQUEsR0FBRyxFQUFFbkIsVUFBVztFQUNoQm9CLElBQUFBLEdBQUcsRUFBQyxTQUFTO0VBQ2J2RSxJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFLE9BQU87RUFBRVosTUFBQUEsTUFBTSxFQUFFLE9BQU87RUFBRTRGLE1BQUFBLFVBQVUsRUFBRSxPQUFPO0VBQUVDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUV0RixNQUFBQSxZQUFZLEVBQUU7RUFBTTtFQUFFLEdBQ3ZHLENBQUMsZ0JBRUZkLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRSxJQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUFDQyxJQUFBQSxjQUFjLEVBQUMsUUFBUTtFQUFDcUIsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRSxPQUFPO0VBQUVaLE1BQUFBLE1BQU0sRUFBRTtFQUFRO0VBQUUsR0FBQSxlQUMvRlAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDTyxtQkFBTSxNQUFFLENBQ04sQ0FFSixDQUFDLEVBR0x3RSxPQUFPLGlCQUNOaEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Y1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyx1QkFBVSxFQUFBO01BQ1RyQixPQUFPLEVBQUVBLE9BQU8sQ0FBQ2UsSUFBSztNQUN0QnRFLE9BQU8sRUFBRXVELE9BQU8sQ0FBQ2MsSUFBSztFQUN0QlEsSUFBQUEsWUFBWSxFQUFFQSxNQUFNckIsVUFBVSxDQUFDLElBQUk7RUFBRSxHQUN0QyxDQUNFLENBQ04sZUFHRGpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDdUIsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUN0RC9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUYsSUFBQUEsVUFBVSxFQUFDLE1BQU07RUFBQ3BFLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyxtQkFBdUIsQ0FBQyxlQUd4RDVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQ2pCOEUsSUFBQUEsUUFBUSxFQUFFLENBQUNuQixZQUFZLElBQUlwSSxPQUFRO0VBQ25DdUcsSUFBQUEsT0FBTyxFQUFFQSxNQUFNa0MsVUFBVSxDQUFDLFVBQVUsQ0FBRTtFQUN0QzlELElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsTUFBTTtFQUFFYixNQUFBQSxjQUFjLEVBQUU7RUFBUztLQUFFLEVBRWxEdEQsT0FBTyxnQkFDTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQUMsZ0JBRVZSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQUQsc0JBQUEsQ0FBQXdHLFFBQUEscUJBQ0V4RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxlQUFlO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLEVBQUEsbUJBRXJDLEVBQUMsQ0FBQ3JCLFlBQVksaUJBQUlwRixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2lHLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUMxRSxJQUFBQSxRQUFRLEVBQUM7S0FBSSxFQUFDLG1CQUF1QixDQUNyRSxDQUVFLENBQUMsZUFHVGhDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQ2pCOEUsSUFBQUEsUUFBUSxFQUFFLENBQUNsQixZQUFZLElBQUlySSxPQUFRO0VBQ25DdUcsSUFBQUEsT0FBTyxFQUFFQSxNQUFNa0MsVUFBVSxDQUFDLE9BQU8sQ0FBRTtFQUNuQzlELElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsTUFBTTtFQUFFYixNQUFBQSxjQUFjLEVBQUU7RUFBUztLQUFFLEVBRWxEdEQsT0FBTyxnQkFDTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQUMsZ0JBRVZSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQUQsc0JBQUEsQ0FBQXdHLFFBQUEscUJBQ0V4RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLEVBQUEsZ0JBRTVCLEVBQUMsQ0FBQ3BCLFlBQVksaUJBQUlyRixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2lHLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUMxRSxJQUFBQSxRQUFRLEVBQUM7RUFBSSxHQUFBLEVBQUMsWUFBZ0IsQ0FDOUQsQ0FFRSxDQUNMLENBQUMsRUFHTCxDQUFDb0QsWUFBWSxJQUFJLENBQUNDLFlBQVksaUJBQzdCckYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUNRLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVlYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0csdUJBQVUsRUFBQTtFQUNUckIsSUFBQUEsT0FBTyxFQUFDLG1HQUFtRztFQUMzR3ZELElBQUFBLE9BQU8sRUFBQztLQUNULENBQ0UsQ0FFSixDQUFDO0VBRVYsQ0FBQzs7RUN0S0QsTUFBTWtGLG1CQUF1RCxHQUFHQSxDQUFDO0VBQUVDLEVBQUFBO0VBQVEsQ0FBQyxLQUFLO0lBQy9FLE1BQU0sQ0FBQ0MsZUFBZSxFQUFFQyxrQkFBa0IsQ0FBQyxHQUFHNUosY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUMxRCxNQUFNLENBQUM2SixXQUFXLEVBQUVDLGNBQWMsQ0FBQyxHQUFHOUosY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUNsRCxNQUFNLENBQUMrSixlQUFlLEVBQUVDLGtCQUFrQixDQUFDLEdBQUdoSyxjQUFRLENBQUMsRUFBRSxDQUFDO0lBQzFELE1BQU0sQ0FBQ0YsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0MsY0FBUSxDQUFDLEtBQUssQ0FBQztJQUM3QyxNQUFNLENBQUM4SCxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHL0gsY0FBUSxDQUFxRCxJQUFJLENBQUM7RUFFaEcsRUFBQSxNQUFNaUssWUFBWSxHQUFHLE1BQU9DLENBQWtCLElBQUs7TUFDakRBLENBQUMsQ0FBQ0MsY0FBYyxFQUFFOztFQUVsQjtNQUNBLElBQUksQ0FBQ1IsZUFBZSxJQUFJLENBQUNFLFdBQVcsSUFBSSxDQUFDRSxlQUFlLEVBQUU7RUFDeERoQyxNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQTBCLE9BQUMsQ0FBQztFQUM5RCxNQUFBO0VBQ0YsSUFBQTtNQUVBLElBQUlnQixXQUFXLEtBQUtFLGVBQWUsRUFBRTtFQUNuQ2hDLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBNkIsT0FBQyxDQUFDO0VBQ2pFLE1BQUE7RUFDRixJQUFBO0VBRUEsSUFBQSxJQUFJZ0IsV0FBVyxDQUFDekUsTUFBTSxHQUFHLENBQUMsRUFBRTtFQUMxQjJDLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBNkMsT0FBQyxDQUFDO0VBQ2pGLE1BQUE7RUFDRixJQUFBO01BRUE5SSxVQUFVLENBQUMsSUFBSSxDQUFDO01BQ2hCZ0ksVUFBVSxDQUFDLElBQUksQ0FBQztNQUVoQixJQUFJO0VBQ0YsTUFBQSxNQUFNcEYsR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQyw0QkFBNEIsRUFBRTtFQUNwRGdCLFFBQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2Q0RixRQUFBQSxPQUFPLEVBQUU7RUFBRSxVQUFBLGNBQWMsRUFBRTtXQUFvQjtFQUMvQzNHLFFBQUFBLFdBQVcsRUFBRSxTQUFTO0VBQ3RCNEcsUUFBQUEsSUFBSSxFQUFFQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztZQUNuQmdCLGVBQWU7RUFDZkUsVUFBQUE7V0FDRDtFQUNILE9BQUMsQ0FBQztFQUVGLE1BQUEsTUFBTXhCLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7UUFFN0IsSUFBSVcsR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDVmlHLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsU0FBUztFQUFFQyxVQUFBQSxJQUFJLEVBQUU7RUFBaUMsU0FBQyxDQUFDO1VBQ3ZFZSxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7VUFDdEJFLGNBQWMsQ0FBQyxFQUFFLENBQUM7VUFDbEJFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQzs7RUFFdEI7RUFDQSxRQUFBLElBQUlOLE9BQU8sRUFBRTtFQUNYVSxVQUFBQSxVQUFVLENBQUNWLE9BQU8sRUFBRSxJQUFJLENBQUM7RUFDM0IsUUFBQTtFQUNGLE1BQUEsQ0FBQyxNQUFNO0VBQ0wzQixRQUFBQSxVQUFVLENBQUM7RUFBRWEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUE0QixTQUFDLENBQUM7RUFDbEYsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPdkYsS0FBSyxFQUFFO0VBQ2R3RixNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQW1DLE9BQUMsQ0FBQztFQUN6RSxJQUFBLENBQUMsU0FBUztRQUNSOUksVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsb0JBQ0UrQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLElBQUFBLENBQUMsRUFBQyxLQUFLO0VBQUNDLElBQUFBLEtBQUssRUFBRTtFQUFFNEYsTUFBQUEsUUFBUSxFQUFFLE9BQU87RUFBRXRGLE1BQUFBLE1BQU0sRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRGpDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7S0FBSSxFQUFDLGlCQUFtQixDQUFDLEVBRS9Cb0QsT0FBTyxpQkFDTmhGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0csdUJBQVUsRUFBQTtNQUNUckIsT0FBTyxFQUFFQSxPQUFPLENBQUNlLElBQUs7TUFDdEJ0RSxPQUFPLEVBQUV1RCxPQUFPLENBQUNjLElBQUs7RUFDdEJRLElBQUFBLFlBQVksRUFBRUEsTUFBTXJCLFVBQVUsQ0FBQyxJQUFJO0VBQUUsR0FDdEMsQ0FDRSxDQUNOLGVBRURqRixzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU11SCxJQUFBQSxRQUFRLEVBQUVMO0VBQWEsR0FBQSxlQUMzQm5ILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtNQUFDQyxRQUFRLEVBQUE7RUFBQSxHQUFBLEVBQUMsa0JBQXVCLENBQUMsZUFDeEMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFZixlQUFnQjtNQUN2QmdCLFFBQVEsRUFBR1QsQ0FBQyxJQUFLTixrQkFBa0IsQ0FBQ00sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUNwREcsSUFBQUEsV0FBVyxFQUFDLHdCQUF3QjtFQUNwQ3hCLElBQUFBLFFBQVEsRUFBRXZKO0VBQVEsR0FDbkIsQ0FDRSxDQUFDLGVBRU5nRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUE7TUFBQ0MsUUFBUSxFQUFBO0VBQUEsR0FBQSxFQUFDLGNBQW1CLENBQUMsZUFDcEMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFYixXQUFZO01BQ25CYyxRQUFRLEVBQUdULENBQUMsSUFBS0osY0FBYyxDQUFDSSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQ2hERyxJQUFBQSxXQUFXLEVBQUMsb0JBQW9CO0VBQ2hDeEIsSUFBQUEsUUFBUSxFQUFFdko7RUFBUSxHQUNuQixDQUNFLENBQUMsZUFFTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtNQUFDQyxRQUFRLEVBQUE7RUFBQSxHQUFBLEVBQUMsc0JBQTJCLENBQUMsZUFDNUMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFWCxlQUFnQjtNQUN2QlksUUFBUSxFQUFHVCxDQUFDLElBQUtGLGtCQUFrQixDQUFDRSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQ3BERyxJQUFBQSxXQUFXLEVBQUMsc0JBQXNCO0VBQ2xDeEIsSUFBQUEsUUFBUSxFQUFFdko7RUFBUSxHQUNuQixDQUNFLENBQUMsZUFFTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDd0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUMvQi9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTHdDLElBQUFBLElBQUksRUFBQyxRQUFRO0VBQ2JyRSxJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQjhFLElBQUFBLFFBQVEsRUFBRXZKLE9BQVE7RUFDbEIyRSxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FBQSxFQUVsQm5ELE9BQU8sZ0JBQUdnRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUFDLEdBQUcsaUJBQ2xCLENBQUMsRUFDUm9HLE9BQU8saUJBQ041RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQ0x3QyxJQUFBQSxJQUFJLEVBQUMsUUFBUTtFQUNickUsSUFBQUEsT0FBTyxFQUFDLE1BQU07RUFDZDhCLElBQUFBLE9BQU8sRUFBRXFELE9BQVE7RUFDakJMLElBQUFBLFFBQVEsRUFBRXZKO0VBQVEsR0FBQSxFQUNuQixRQUVPLENBRVAsQ0FDRCxDQUNILENBQUM7RUFFVixDQUFDOztFQ3hJRDtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU1nTCxrQkFBNEIsR0FBR0EsTUFBTTtFQUN6QyxFQUFBLE1BQU0sQ0FBQ2xMLFlBQVksQ0FBQyxHQUFHQyx1QkFBZSxFQUFFO0lBQ3hDLE1BQU0sQ0FBQzhKLGVBQWUsRUFBRUMsa0JBQWtCLENBQUMsR0FBRzVKLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDMUQsTUFBTSxDQUFDNkosV0FBVyxFQUFFQyxjQUFjLENBQUMsR0FBRzlKLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDbEQsTUFBTSxDQUFDK0osZUFBZSxFQUFFQyxrQkFBa0IsQ0FBQyxHQUFHaEssY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUMxRCxNQUFNLENBQUNGLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0MsTUFBTSxDQUFDOEgsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBRy9ILGNBQVEsQ0FBcUQsSUFBSSxDQUFDO0VBRWhHLEVBQUEsTUFBTStLLFNBQVMsR0FBSW5MLFlBQVksRUFBVW9MLEtBQUs7RUFFOUMsRUFBQSxNQUFNZixZQUFZLEdBQUcsTUFBT0MsQ0FBa0IsSUFBSztNQUNqREEsQ0FBQyxDQUFDQyxjQUFjLEVBQUU7TUFFbEIsSUFBSSxDQUFDWSxTQUFTLEVBQUU7RUFDZGhELE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBNEMsT0FBQyxDQUFDO0VBQ2hGLE1BQUE7RUFDRixJQUFBO01BRUEsSUFBSSxDQUFDYyxlQUFlLElBQUksQ0FBQ0UsV0FBVyxJQUFJLENBQUNFLGVBQWUsRUFBRTtFQUN4RGhDLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBMEIsT0FBQyxDQUFDO0VBQzlELE1BQUE7RUFDRixJQUFBO01BRUEsSUFBSWdCLFdBQVcsS0FBS0UsZUFBZSxFQUFFO0VBQ25DaEMsTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUE2QixPQUFDLENBQUM7RUFDakUsTUFBQTtFQUNGLElBQUE7RUFFQSxJQUFBLElBQUlnQixXQUFXLENBQUN6RSxNQUFNLEdBQUcsQ0FBQyxFQUFFO0VBQzFCMkMsTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUE2QyxPQUFDLENBQUM7RUFDakYsTUFBQTtFQUNGLElBQUE7TUFFQTlJLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEJnSSxVQUFVLENBQUMsSUFBSSxDQUFDO01BRWhCLElBQUk7RUFDRixNQUFBLE1BQU1wRixHQUFHLEdBQUcsTUFBTWYsS0FBSyxDQUFDLDRCQUE0QixFQUFFO0VBQ3BEZ0IsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZDRGLFFBQUFBLE9BQU8sRUFBRTtFQUFFLFVBQUEsY0FBYyxFQUFFO1dBQW9CO0VBQy9DM0csUUFBQUEsV0FBVyxFQUFFLFNBQVM7RUFDdEI0RyxRQUFBQSxJQUFJLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO1lBQ25CZ0IsZUFBZTtZQUNmRSxXQUFXO0VBQ1hrQixVQUFBQTtXQUNEO0VBQ0gsT0FBQyxDQUFDO0VBRUYsTUFBQSxNQUFNMUMsSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtRQUU3QixJQUFJVyxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWaUcsUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxTQUFTO0VBQUVDLFVBQUFBLElBQUksRUFBRTtFQUFpQyxTQUFDLENBQUM7VUFDdkVlLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztVQUN0QkUsY0FBYyxDQUFDLEVBQUUsQ0FBQztVQUNsQkUsa0JBQWtCLENBQUMsRUFBRSxDQUFDO0VBQ3hCLE1BQUEsQ0FBQyxNQUFNO0VBQ0xqQyxRQUFBQSxVQUFVLENBQUM7RUFBRWEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUE0QixTQUFDLENBQUM7RUFDbEYsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPdkYsS0FBSyxFQUFFO0VBQ2R3RixNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQW1DLE9BQUMsQ0FBQztFQUN6RSxJQUFBLENBQUMsU0FBUztRQUNSOUksVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztJQUVELElBQUksQ0FBQ2dMLFNBQVMsRUFBRTtFQUNkLElBQUEsb0JBQ0VqSSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3VCLE1BQUFBLE9BQU8sRUFBQyxNQUFNO0VBQUNDLE1BQUFBLENBQUMsRUFBQztFQUFLLEtBQUEsZUFDekIxQixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0QsTUFBQUEsRUFBRSxFQUFDO0VBQUksS0FBQSxFQUFDLGlCQUFtQixDQUFDLGVBQ2hDNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0csdUJBQVUsRUFBQTtFQUFDckIsTUFBQUEsT0FBTyxFQUFDLGdEQUFnRDtFQUFDdkQsTUFBQUEsT0FBTyxFQUFDO0VBQU8sS0FBRSxDQUNuRixDQUFDO0VBRVYsRUFBQTtFQUVBLEVBQUEsb0JBQ0V6QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3VCLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQUNDLElBQUFBLENBQUMsRUFBQztFQUFLLEdBQUEsZUFDekIxQixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0QsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxFQUFDLGlCQUFtQixDQUFDLGVBQ2hDNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNxQixJQUFBQSxLQUFLLEVBQUMsUUFBUTtFQUFDRixJQUFBQSxFQUFFLEVBQUM7S0FBSyxFQUFDLG9DQUNNLEVBQUNxRyxTQUMvQixDQUFDLEVBRU5qRCxPQUFPLGlCQUNOaEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Y1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyx1QkFBVSxFQUFBO01BQ1RyQixPQUFPLEVBQUVBLE9BQU8sQ0FBQ2UsSUFBSztNQUN0QnRFLE9BQU8sRUFBRXVELE9BQU8sQ0FBQ2MsSUFBSztFQUN0QlEsSUFBQUEsWUFBWSxFQUFFQSxNQUFNckIsVUFBVSxDQUFDLElBQUk7RUFBRSxHQUN0QyxDQUNFLENBQ04sZUFFRGpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGOEQsSUFBQUEsRUFBRSxFQUFDLE9BQU87RUFDVnRDLElBQUFBLENBQUMsRUFBQyxLQUFLO0VBQ1BDLElBQUFBLEtBQUssRUFBRTtFQUFFYixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFeUcsTUFBQUEsUUFBUSxFQUFFLE9BQU87RUFBRXhHLE1BQUFBLFNBQVMsRUFBRTtFQUE0QjtLQUFFLGVBRTFGZixzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU11SCxJQUFBQSxRQUFRLEVBQUVMO0VBQWEsR0FBQSxlQUMzQm5ILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtNQUFDQyxRQUFRLEVBQUE7RUFBQSxHQUFBLEVBQUMsa0JBQXVCLENBQUMsZUFDeEMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFZixlQUFnQjtNQUN2QmdCLFFBQVEsRUFBR1QsQ0FBQyxJQUFLTixrQkFBa0IsQ0FBQ00sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUNwREcsSUFBQUEsV0FBVyxFQUFDLHdCQUF3QjtFQUNwQ3hCLElBQUFBLFFBQVEsRUFBRXZKO0VBQVEsR0FDbkIsQ0FDRSxDQUFDLGVBRU5nRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUE7TUFBQ0MsUUFBUSxFQUFBO0VBQUEsR0FBQSxFQUFDLGNBQW1CLENBQUMsZUFDcEMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFYixXQUFZO01BQ25CYyxRQUFRLEVBQUdULENBQUMsSUFBS0osY0FBYyxDQUFDSSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQ2hERyxJQUFBQSxXQUFXLEVBQUMsdUNBQXVDO0VBQ25EeEIsSUFBQUEsUUFBUSxFQUFFdko7RUFBUSxHQUNuQixDQUNFLENBQUMsZUFFTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtNQUFDQyxRQUFRLEVBQUE7RUFBQSxHQUFBLEVBQUMsc0JBQTJCLENBQUMsZUFDNUMxSCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmOEIsSUFBQUEsS0FBSyxFQUFFWCxlQUFnQjtNQUN2QlksUUFBUSxFQUFHVCxDQUFDLElBQUtGLGtCQUFrQixDQUFDRSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQ3BERyxJQUFBQSxXQUFXLEVBQUMsc0JBQXNCO0VBQ2xDeEIsSUFBQUEsUUFBUSxFQUFFdko7RUFBUSxHQUNuQixDQUNFLENBQUMsZUFFTmdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFBQ3dDLElBQUFBLElBQUksRUFBQyxRQUFRO0VBQUNyRSxJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUFDOEUsSUFBQUEsUUFBUSxFQUFFdkosT0FBUTtFQUFDMkUsSUFBQUEsS0FBSyxFQUFFO0VBQUV5QyxNQUFBQSxRQUFRLEVBQUU7RUFBUTtFQUFFLEdBQUEsRUFDckZwSCxPQUFPLGdCQUFHZ0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDTyxtQkFBTSxFQUFBLElBQUUsQ0FBQyxHQUFHLGlCQUNsQixDQUNKLENBQ0gsQ0FDRixDQUFDO0VBRVYsQ0FBQzs7RUN2SUQsTUFBTTJILGdCQUEwQixHQUFHQSxNQUFNO0VBQ3ZDLEVBQUEsTUFBTSxDQUFDckwsWUFBWSxDQUFDLEdBQUdDLHVCQUFlLEVBQUU7SUFDeEMsTUFBTSxDQUFDQyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0lBQzVDLE1BQU0sQ0FBQ2tMLE1BQU0sRUFBRUMsU0FBUyxDQUFDLEdBQUduTCxjQUFRLENBQUMsS0FBSyxDQUFDO0lBQzNDLE1BQU0sQ0FBQ29MLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdyTCxjQUFRLENBQXFCLElBQUksQ0FBQztJQUNoRSxNQUFNLENBQUNzTCxJQUFJLEVBQUVDLE9BQU8sQ0FBQyxHQUFHdkwsY0FBUSxDQUFDLEVBQUUsQ0FBQztFQUVwQyxFQUFBLE1BQU1nTCxLQUFLLEdBQUlwTCxZQUFZLEVBQVVvTCxLQUFLLElBQUksRUFBRTtFQUVoRC9KLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0VBQ2QsSUFBQSxNQUFNdUssSUFBSSxHQUFHLFlBQVk7UUFDdkJ6TCxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hCLElBQUk7VUFDRixNQUFNNEMsR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQyxDQUFBLHlCQUFBLEVBQTRCNkosa0JBQWtCLENBQUNULEtBQUssQ0FBQyxDQUFBLENBQUUsRUFBRTtFQUFFbkosVUFBQUEsV0FBVyxFQUFFO0VBQVUsU0FBQyxDQUFDO1VBQzVHLElBQUljLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1YsVUFBQSxNQUFNdUcsSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtZQUM3QnFKLFVBQVUsQ0FBQ2hELElBQUksQ0FBQztFQUNoQmtELFVBQUFBLE9BQU8sQ0FBQ2xELElBQUksQ0FBQ2lELElBQUksSUFBSSxFQUFFLENBQUM7RUFDMUIsUUFBQTtFQUNGLE1BQUEsQ0FBQyxTQUFTO1VBQ1J2TCxVQUFVLENBQUMsS0FBSyxDQUFDO0VBQ25CLE1BQUE7TUFDRixDQUFDO0VBQ0QsSUFBQSxJQUFJaUwsS0FBSyxFQUFFUSxJQUFJLEVBQUU7RUFDbkIsRUFBQSxDQUFDLEVBQUUsQ0FBQ1IsS0FBSyxDQUFDLENBQUM7RUFFWCxFQUFBLE1BQU1VLElBQUksR0FBRyxZQUFZO01BQ3ZCLElBQUksQ0FBQ1YsS0FBSyxFQUFFO01BQ1pHLFNBQVMsQ0FBQyxJQUFJLENBQUM7TUFDZixJQUFJO0VBQ0YsTUFBQSxNQUFNeEksR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQywyQkFBMkIsRUFBRTtFQUNuRGdCLFFBQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2Q0RixRQUFBQSxPQUFPLEVBQUU7RUFBRSxVQUFBLGNBQWMsRUFBRTtXQUFvQjtFQUMvQzNHLFFBQUFBLFdBQVcsRUFBRSxTQUFTO0VBQ3RCNEcsUUFBQUEsSUFBSSxFQUFFQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztZQUFFcUMsS0FBSztFQUFFTSxVQUFBQTtXQUFNO0VBQ3RDLE9BQUMsQ0FBQztRQUNGLElBQUkzSSxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWLFFBQUEsTUFBTXVHLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7VUFDN0JxSixVQUFVLENBQUNoRCxJQUFJLENBQUM7RUFDbEIsTUFBQTtFQUNGLElBQUEsQ0FBQyxTQUFTO1FBQ1I4QyxTQUFTLENBQUMsS0FBSyxDQUFDO0VBQ2xCLElBQUE7SUFDRixDQUFDO0VBRUQsRUFBQSxJQUFJckwsT0FBTyxFQUFFO0VBQ1gsSUFBQSxvQkFDRWdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtRQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRSxNQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUFDQyxNQUFBQSxjQUFjLEVBQUMsUUFBUTtFQUFDQyxNQUFBQSxNQUFNLEVBQUM7RUFBTSxLQUFBLGVBQ2pFUCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUNOLENBQUM7RUFFVixFQUFBO0VBRUEsRUFBQSxvQkFDRVIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN1QixJQUFBQSxPQUFPLEVBQUMsTUFBTTtFQUFDQyxJQUFBQSxDQUFDLEVBQUMsS0FBSztFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRTRGLE1BQUFBLFFBQVEsRUFBRTtFQUFJO0VBQUUsR0FBQSxlQUNuRHZILHNCQUFBLENBQUFDLGFBQUEsQ0FBQzRCLGVBQUUsRUFBQSxJQUFBLEVBQUMsY0FBZ0IsQ0FBQyxlQUNyQjdCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDUSxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1ZWLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUEsSUFBQSxFQUFDLFdBQWdCLENBQUMsZUFDeEJ6SCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQUNDLElBQUFBLEtBQUssRUFBRVksSUFBSztNQUFDWCxRQUFRLEVBQUdULENBQU0sSUFBS3FCLE9BQU8sQ0FBQ3JCLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLO0VBQUUsR0FBRSxDQUNqRSxDQUFDLGVBQ041SCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ1EsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNWVixzQkFBQSxDQUFBQyxhQUFBLENBQUN3SCxrQkFBSyxFQUFBLElBQUEsRUFBQyxPQUFZLENBQUMsZUFDcEJ6SCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQUNDLElBQUFBLEtBQUssRUFBRVUsT0FBTyxFQUFFSixLQUFLLElBQUksRUFBRztNQUFDM0IsUUFBUSxFQUFBO0VBQUEsR0FBRSxDQUMzQyxDQUFDLGVBRU52RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ1EsSUFBQUEsRUFBRSxFQUFDLElBQUk7TUFBQ1AsSUFBSSxFQUFBO0VBQUEsR0FBQSxlQUNmSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQUM3QixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUFDOEIsSUFBQUEsT0FBTyxFQUFFcUYsSUFBSztFQUFDckMsSUFBQUEsUUFBUSxFQUFFNkI7S0FBTyxFQUN2REEsTUFBTSxHQUFHLFdBQVcsR0FBRyxjQUNsQixDQUFDLGVBQ1RwSSxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2lHLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUM1RSxJQUFBQSxLQUFLLEVBQUM7S0FBUSxFQUFDLFFBQU0sRUFBRXdHLE9BQU8sRUFBVTNILElBQUksSUFBSSxLQUFZLENBQ3ZFLENBQ0YsQ0FBQztFQUVWLENBQUM7O0VDbEVELE1BQU1rSSxZQUFzQixHQUFHQSxNQUFNO0VBQ25DLEVBQUEsTUFBTSxDQUFDL0wsWUFBWSxDQUFDLEdBQUdDLHVCQUFlLEVBQUU7SUFDeEMsTUFBTSxDQUFDK0wsU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBRzdMLGNBQVEsQ0FBNEIsVUFBVSxDQUFDO0lBQ2pGLE1BQU0sQ0FBQ0YsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0MsY0FBUSxDQUFDLEtBQUssQ0FBQztJQUM3QyxNQUFNLENBQUM4TCxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHL0wsY0FBUSxDQUFDLEtBQUssQ0FBQztFQUVqRCxFQUFBLE1BQU15RCxJQUFJLEdBQUk3RCxZQUFZLEVBQVU2RCxJQUFJLElBQUksT0FBTztFQUNuRCxFQUFBLE1BQU1zQyxXQUFXLEdBQUluRyxZQUFZLEVBQVVtRyxXQUFXLElBQUksRUFBRTtFQUM1RCxFQUFBLE1BQU1pRyxNQUFNLEdBQUd2SSxJQUFJLEtBQUssTUFBTTtFQUU5QixFQUFBLE1BQU0sQ0FBQ3dJLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdsTSxjQUFRLENBQWdCO0VBQ3BEbU0sSUFBQUEsUUFBUSxFQUFFLElBQUluRyxJQUFJLENBQUNBLElBQUksQ0FBQ29HLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEZDLElBQUFBLE1BQU0sRUFBRSxJQUFJdkcsSUFBSSxFQUFFLENBQUNxRyxXQUFXLEVBQUUsQ0FBQ0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM5Q0UsSUFBQUEsUUFBUSxFQUFFLEVBQUU7RUFDWkMsSUFBQUEsT0FBTyxFQUFFVCxNQUFNLEdBQUdqRyxXQUFXLEdBQUcsRUFBRTtFQUFFO0VBQ3BDcUIsSUFBQUEsTUFBTSxFQUFFO0VBQ1YsR0FBQyxDQUFDO0lBQ0YsTUFBTSxDQUFDc0YsVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBRzNNLGNBQVEsQ0FBYSxFQUFFLENBQUM7SUFDNUQsTUFBTSxDQUFDOEgsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBRy9ILGNBQVEsQ0FBcUQsSUFBSSxDQUFDOztFQUVoRztFQUNBOztFQUVBLEVBQUEsTUFBTTRNLGtCQUFrQixHQUFHQSxDQUFDaEgsR0FBd0IsRUFBRThFLEtBQWEsS0FBSztNQUN0RXdCLFVBQVUsQ0FBRVcsSUFBSSxLQUFNO0VBQUUsTUFBQSxHQUFHQSxJQUFJO0VBQUUsTUFBQSxDQUFDakgsR0FBRyxHQUFHOEU7RUFBTSxLQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0VBRUQsRUFBQSxNQUFNb0MsY0FBYyxHQUFHLFlBQVk7TUFDakMvTSxVQUFVLENBQUMsSUFBSSxDQUFDO01BQ2hCZ0ksVUFBVSxDQUFDLElBQUksQ0FBQztNQUVoQixJQUFJO0VBQ0YsTUFBQSxNQUFNRSxNQUFNLEdBQUcsSUFBSThFLGVBQWUsRUFBRTtFQUNwQyxNQUFBLElBQUlkLE9BQU8sQ0FBQ0UsUUFBUSxFQUFFbEUsTUFBTSxDQUFDK0UsTUFBTSxDQUFDLFVBQVUsRUFBRWYsT0FBTyxDQUFDRSxRQUFRLENBQUM7RUFDakUsTUFBQSxJQUFJRixPQUFPLENBQUNNLE1BQU0sRUFBRXRFLE1BQU0sQ0FBQytFLE1BQU0sQ0FBQyxRQUFRLEVBQUVmLE9BQU8sQ0FBQ00sTUFBTSxDQUFDO0VBQzNELE1BQUEsSUFBSU4sT0FBTyxDQUFDTyxRQUFRLEVBQUV2RSxNQUFNLENBQUMrRSxNQUFNLENBQUMsVUFBVSxFQUFFZixPQUFPLENBQUNPLFFBQVEsQ0FBQztFQUNqRSxNQUFBLElBQUlQLE9BQU8sQ0FBQ1EsT0FBTyxFQUFFeEUsTUFBTSxDQUFDK0UsTUFBTSxDQUFDLFNBQVMsRUFBRWYsT0FBTyxDQUFDUSxPQUFPLENBQUM7RUFDOUQsTUFBQSxJQUFJUixPQUFPLENBQUM3RSxNQUFNLEVBQUVhLE1BQU0sQ0FBQytFLE1BQU0sQ0FBQyxRQUFRLEVBQUVmLE9BQU8sQ0FBQzdFLE1BQU0sQ0FBQztRQUUzRCxNQUFNNkYsUUFBUSxHQUFHckIsU0FBUyxLQUFLLFVBQVUsR0FDckMsNkJBQTZCLEdBQzdCLCtCQUErQjtRQUVuQyxNQUFNakosR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQyxHQUFHcUwsUUFBUSxDQUFBLENBQUEsRUFBSWhGLE1BQU0sQ0FBQSxDQUFFLEVBQUU7RUFDL0NwRyxRQUFBQSxXQUFXLEVBQUU7RUFDZixPQUFDLENBQUM7UUFFRixJQUFJYyxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWLFFBQUEsTUFBTXVHLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7VUFDN0IySyxhQUFhLENBQUVFLElBQUksS0FBTTtFQUFFLFVBQUEsR0FBR0EsSUFBSTtFQUFFLFVBQUEsQ0FBQ2pCLFNBQVMsR0FBR3ZEO0VBQUssU0FBQyxDQUFDLENBQUM7RUFDM0QsTUFBQSxDQUFDLE1BQU07RUFDTE4sUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFVBQUFBLElBQUksRUFBRTtFQUE0QixTQUFDLENBQUM7RUFDbEUsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPdEcsS0FBSyxFQUFFO0VBQ2R3RixNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQW1DLE9BQUMsQ0FBQztFQUN6RSxJQUFBLENBQUMsU0FBUztRQUNSOUksVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTW1OLFlBQVksR0FBRyxNQUFPQyxNQUF1QixJQUFLO01BQ3REcEIsWUFBWSxDQUFDLElBQUksQ0FBQztNQUNsQmhFLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFFaEIsSUFBSTtFQUNGLE1BQUEsTUFBTUUsTUFBTSxHQUFHLElBQUk4RSxlQUFlLEVBQUU7RUFDcEMsTUFBQSxJQUFJZCxPQUFPLENBQUNFLFFBQVEsRUFBRWxFLE1BQU0sQ0FBQytFLE1BQU0sQ0FBQyxVQUFVLEVBQUVmLE9BQU8sQ0FBQ0UsUUFBUSxDQUFDO0VBQ2pFLE1BQUEsSUFBSUYsT0FBTyxDQUFDTSxNQUFNLEVBQUV0RSxNQUFNLENBQUMrRSxNQUFNLENBQUMsUUFBUSxFQUFFZixPQUFPLENBQUNNLE1BQU0sQ0FBQztFQUMzRCxNQUFBLElBQUlOLE9BQU8sQ0FBQ08sUUFBUSxFQUFFdkUsTUFBTSxDQUFDK0UsTUFBTSxDQUFDLFVBQVUsRUFBRWYsT0FBTyxDQUFDTyxRQUFRLENBQUM7RUFDakUsTUFBQSxJQUFJUCxPQUFPLENBQUNRLE9BQU8sRUFBRXhFLE1BQU0sQ0FBQytFLE1BQU0sQ0FBQyxTQUFTLEVBQUVmLE9BQU8sQ0FBQ1EsT0FBTyxDQUFDO0VBQzlELE1BQUEsSUFBSVIsT0FBTyxDQUFDN0UsTUFBTSxFQUFFYSxNQUFNLENBQUMrRSxNQUFNLENBQUMsUUFBUSxFQUFFZixPQUFPLENBQUM3RSxNQUFNLENBQUM7RUFDM0RhLE1BQUFBLE1BQU0sQ0FBQytFLE1BQU0sQ0FBQyxRQUFRLEVBQUVHLE1BQU0sQ0FBQztRQUUvQixNQUFNRixRQUFRLEdBQUdyQixTQUFTLEtBQUssVUFBVSxHQUNyQyxvQ0FBb0MsR0FDcEMsc0NBQXNDO1FBRTFDLE1BQU1qSixHQUFHLEdBQUcsTUFBTWYsS0FBSyxDQUFDLEdBQUdxTCxRQUFRLENBQUEsQ0FBQSxFQUFJaEYsTUFBTSxDQUFBLENBQUUsRUFBRTtFQUMvQ3BHLFFBQUFBLFdBQVcsRUFBRTtFQUNmLE9BQUMsQ0FBQztRQUVGLElBQUljLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1YsUUFBQSxNQUFNc0wsSUFBSSxHQUFHLE1BQU16SyxHQUFHLENBQUN5SyxJQUFJLEVBQUU7VUFDN0IsTUFBTUMsR0FBRyxHQUFHdk0sTUFBTSxDQUFDd00sR0FBRyxDQUFDQyxlQUFlLENBQUNILElBQUksQ0FBQztFQUM1QyxRQUFBLE1BQU1JLENBQUMsR0FBR3BNLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQyxHQUFHLENBQUM7VUFDckN5SyxDQUFDLENBQUNDLElBQUksR0FBR0osR0FBRztFQUNaRyxRQUFBQSxDQUFDLENBQUNFLFFBQVEsR0FBRyxDQUFBLEVBQUc5QixTQUFTLENBQUEsUUFBQSxFQUFXLElBQUk1RixJQUFJLEVBQUUsQ0FBQ3FHLFdBQVcsRUFBRSxDQUFDQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQSxFQUFJYSxNQUFNLEtBQUssT0FBTyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBRTtFQUNuSC9MLFFBQUFBLFFBQVEsQ0FBQ3FILElBQUksQ0FBQ2tGLFdBQVcsQ0FBQ0gsQ0FBQyxDQUFDO1VBQzVCQSxDQUFDLENBQUNJLEtBQUssRUFBRTtFQUNUeE0sUUFBQUEsUUFBUSxDQUFDcUgsSUFBSSxDQUFDb0YsV0FBVyxDQUFDTCxDQUFDLENBQUM7RUFDNUIxTSxRQUFBQSxNQUFNLENBQUN3TSxHQUFHLENBQUNRLGVBQWUsQ0FBQ1QsR0FBRyxDQUFDO0VBQy9CdEYsUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxTQUFTO0VBQUVDLFVBQUFBLElBQUksRUFBRSxDQUFBLG1CQUFBLEVBQXNCc0UsTUFBTSxDQUFDWSxXQUFXLEVBQUUsQ0FBQTtFQUFHLFNBQUMsQ0FBQztFQUNyRixNQUFBLENBQUMsTUFBTTtFQUNMaEcsUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFVBQUFBLElBQUksRUFBRTtFQUEwQixTQUFDLENBQUM7RUFDaEUsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPdEcsS0FBSyxFQUFFO0VBQ2R3RixNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQW1DLE9BQUMsQ0FBQztFQUN6RSxJQUFBLENBQUMsU0FBUztRQUNSa0QsWUFBWSxDQUFDLEtBQUssQ0FBQztFQUNyQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTWlDLGVBQWUsR0FBRyxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztFQUNuSCxFQUFBLE1BQU1DLGdCQUFnQixHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztJQUNsRCxNQUFNQyxTQUFTLEdBQUcsQ0FBQyxjQUFjLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDO0VBRWxFLEVBQUEsb0JBQ0VwTCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3VCLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQUNDLElBQUFBLENBQUMsRUFBQztFQUFLLEdBQUEsZUFDekIxQixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0QsSUFBQUEsRUFBRSxFQUFDO0tBQUssRUFBQyxTQUFXLENBQUMsRUFFeEJvRCxPQUFPLGlCQUNOaEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Y1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyx1QkFBVSxFQUFBO01BQ1RyQixPQUFPLEVBQUVBLE9BQU8sQ0FBQ2UsSUFBSztNQUN0QnRFLE9BQU8sRUFBRXVELE9BQU8sQ0FBQ2MsSUFBSztFQUN0QlEsSUFBQUEsWUFBWSxFQUFFQSxNQUFNckIsVUFBVSxDQUFDLElBQUk7RUFBRSxHQUN0QyxDQUNFLENBQ04sZUFHRGpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDO0tBQUksZUFDVjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29MLGlCQUFJLHFCQUNIckwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUwsZ0JBQUcsRUFBQTtFQUNGMUwsSUFBQUEsRUFBRSxFQUFDLFVBQVU7RUFDYjJMLElBQUFBLEtBQUssRUFBQyxpQkFBaUI7TUFDdkJDLFVBQVUsRUFBRTFDLFNBQVMsS0FBSyxVQUFXO0VBQ3JDdkYsSUFBQUEsT0FBTyxFQUFFQSxNQUFNd0YsWUFBWSxDQUFDLFVBQVU7RUFBRSxHQUN6QyxDQUFDLGVBQ0YvSSxzQkFBQSxDQUFBQyxhQUFBLENBQUNxTCxnQkFBRyxFQUFBO0VBQ0YxTCxJQUFBQSxFQUFFLEVBQUMsWUFBWTtFQUNmMkwsSUFBQUEsS0FBSyxFQUFDLG1CQUFtQjtNQUN6QkMsVUFBVSxFQUFFMUMsU0FBUyxLQUFLLFlBQWE7RUFDdkN2RixJQUFBQSxPQUFPLEVBQUVBLE1BQU13RixZQUFZLENBQUMsWUFBWTtLQUN6QyxDQUNHLENBQ0gsQ0FBQyxlQUdOL0ksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUM4RCxJQUFBQSxFQUFFLEVBQUMsT0FBTztFQUFDdEMsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0UsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVDLE1BQUFBLFNBQVMsRUFBRTtFQUE0QjtFQUFFLEdBQUEsZUFDcEdmLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsU0FBVyxDQUFDLGVBQ3hCNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxLQUFLO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFBRTBKLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUNyRXpMLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDeUIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5QyxNQUFBQSxRQUFRLEVBQUU7RUFBUTtFQUFFLEdBQUEsZUFDaENwRSxzQkFBQSxDQUFBQyxhQUFBLENBQUN3SCxrQkFBSyxFQUFBLElBQUEsRUFBQyxXQUFnQixDQUFDLGVBQ3hCekgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEgsa0JBQUssRUFBQTtFQUNKN0IsSUFBQUEsSUFBSSxFQUFDLE1BQU07TUFDWDhCLEtBQUssRUFBRXVCLE9BQU8sQ0FBQ0UsUUFBUztNQUN4QnhCLFFBQVEsRUFBR1QsQ0FBQyxJQUFLMEMsa0JBQWtCLENBQUMsVUFBVSxFQUFFMUMsQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUs7RUFBRSxHQUNqRSxDQUNFLENBQUMsZUFDTjVILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDeUIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5QyxNQUFBQSxRQUFRLEVBQUU7RUFBUTtFQUFFLEdBQUEsZUFDaENwRSxzQkFBQSxDQUFBQyxhQUFBLENBQUN3SCxrQkFBSyxFQUFBLElBQUEsRUFBQyxTQUFjLENBQUMsZUFDdEJ6SCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsTUFBTTtNQUNYOEIsS0FBSyxFQUFFdUIsT0FBTyxDQUFDTSxNQUFPO01BQ3RCNUIsUUFBUSxFQUFHVCxDQUFDLElBQUswQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUxQyxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSztFQUFFLEdBQy9ELENBQ0UsQ0FBQyxlQUNONUgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN5QixJQUFBQSxLQUFLLEVBQUU7RUFBRXlDLE1BQUFBLFFBQVEsRUFBRTtFQUFRO0VBQUUsR0FBQSxlQUNoQ3BFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUEsSUFBQSxFQUFDLFVBQWUsQ0FBQyxlQUN2QnpILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lMLG1CQUFNLEVBQUE7TUFDTDlELEtBQUssRUFBRXVCLE9BQU8sQ0FBQ08sUUFBUztFQUN4QjdCLElBQUFBLFFBQVEsRUFBRzhELFFBQVEsSUFBSzdCLGtCQUFrQixDQUFDLFVBQVUsRUFBRzZCLFFBQVEsRUFBVS9ELEtBQUssSUFBSSxFQUFFLENBQUU7RUFDdkZnRSxJQUFBQSxPQUFPLEVBQUUsQ0FDUDtFQUFFaEUsTUFBQUEsS0FBSyxFQUFFLEVBQUU7RUFBRTJELE1BQUFBLEtBQUssRUFBRTtFQUFnQixLQUFDLEVBQ3JDLEdBQUdILFNBQVMsQ0FBQ3hJLEdBQUcsQ0FBRWlKLENBQUMsS0FBTTtFQUFFakUsTUFBQUEsS0FBSyxFQUFFaUUsQ0FBQztFQUFFTixNQUFBQSxLQUFLLEVBQUVNLENBQUMsQ0FBQ3RILE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRztFQUFFLEtBQUMsQ0FBQyxDQUFDO0VBQ25FLEdBQ0gsQ0FDRSxDQUFDLGVBQ052RSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3lCLElBQUFBLEtBQUssRUFBRTtFQUFFeUMsTUFBQUEsUUFBUSxFQUFFO0VBQVE7RUFBRSxHQUFBLGVBQ2hDcEUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssUUFBQyxVQUFRLEVBQUN5QixNQUFNLElBQUksZ0JBQXdCLENBQUMsZUFDbkRsSixzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsTUFBTTtNQUNYOEIsS0FBSyxFQUFFdUIsT0FBTyxDQUFDUSxPQUFRO0VBQ3ZCOUIsSUFBQUEsUUFBUSxFQUFHVCxDQUFDLElBQUswQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUxQyxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQy9ERyxJQUFBQSxXQUFXLEVBQUVtQixNQUFNLEdBQUdqRyxXQUFXLEdBQUcsbUJBQW9CO0VBQ3hEc0QsSUFBQUEsUUFBUSxFQUFFMkMsTUFBTztNQUNqQnZILEtBQUssRUFBRXVILE1BQU0sR0FBRztFQUFFbEksTUFBQUEsZUFBZSxFQUFFO0VBQVUsS0FBQyxHQUFHO0VBQUcsR0FDckQsQ0FDRSxDQUFDLGVBQ05oQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3lCLElBQUFBLEtBQUssRUFBRTtFQUFFeUMsTUFBQUEsUUFBUSxFQUFFO0VBQVE7RUFBRSxHQUFBLGVBQ2hDcEUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQSxJQUFBLEVBQUMsUUFBYSxDQUFDLGVBQ3JCekgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUwsbUJBQU0sRUFBQTtNQUNMOUQsS0FBSyxFQUFFdUIsT0FBTyxDQUFDN0UsTUFBTztFQUN0QnVELElBQUFBLFFBQVEsRUFBRzhELFFBQVEsSUFBSzdCLGtCQUFrQixDQUFDLFFBQVEsRUFBRzZCLFFBQVEsRUFBVS9ELEtBQUssSUFBSSxFQUFFLENBQUU7RUFDckZnRSxJQUFBQSxPQUFPLEVBQUUsQ0FDUDtFQUFFaEUsTUFBQUEsS0FBSyxFQUFFLEVBQUU7RUFBRTJELE1BQUFBLEtBQUssRUFBRTtFQUFlLEtBQUMsRUFDcEMsR0FBRyxDQUFDekMsU0FBUyxLQUFLLFVBQVUsR0FBR29DLGVBQWUsR0FBR0MsZ0JBQWdCLEVBQUV2SSxHQUFHLENBQUVrSixDQUFDLEtBQU07RUFDN0VsRSxNQUFBQSxLQUFLLEVBQUVrRSxDQUFDO0VBQ1JQLE1BQUFBLEtBQUssRUFBRU8sQ0FBQyxDQUFDdkgsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHO0VBQzNCLEtBQUMsQ0FBQyxDQUFDO0tBRU4sQ0FDRSxDQUNGLENBQUMsZUFDTnZFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDUSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtNQUFDUCxJQUFJLEVBQUEsSUFBQTtFQUFDd0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUN2Qy9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFBQzdCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQUM4QixJQUFBQSxPQUFPLEVBQUV5RyxjQUFlO0VBQUN6RCxJQUFBQSxRQUFRLEVBQUV2SjtFQUFRLEdBQUEsRUFDbEVBLE9BQU8sZ0JBQUdnRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUFDLEdBQUcsaUJBQ2xCLENBQ0wsQ0FDRixDQUFDLGVBR05SLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDMEIsSUFBQUEsRUFBRSxFQUFDLElBQUk7TUFBQ3pCLElBQUksRUFBQSxJQUFBO0VBQUN3QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ3ZDL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUNMN0IsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFDakI4QixJQUFBQSxPQUFPLEVBQUVBLE1BQU02RyxZQUFZLENBQUMsS0FBSyxDQUFFO01BQ25DN0QsUUFBUSxFQUFFeUMsU0FBUyxJQUFJLENBQUNZLFVBQVUsQ0FBQ2QsU0FBUyxDQUFDLEVBQUV4RztFQUFPLEdBQUEsZUFFdER0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxVQUFVO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLGNBRTFCLENBQUMsZUFDVHpHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQ2Q4QixJQUFBQSxPQUFPLEVBQUVBLE1BQU02RyxZQUFZLENBQUMsT0FBTyxDQUFFO01BQ3JDN0QsUUFBUSxFQUFFeUMsU0FBUyxJQUFJLENBQUNZLFVBQVUsQ0FBQ2QsU0FBUyxDQUFDLEVBQUV4RztFQUFPLEdBQUEsZUFFdER0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxVQUFVO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLGdCQUUxQixDQUNMLENBQUMsZUFHTnpHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDOEQsSUFBQUEsRUFBRSxFQUFDLE9BQU87RUFBQ3RDLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRTtFQUFFYixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFQyxNQUFBQSxTQUFTLEVBQUU7RUFBNEI7RUFBRSxHQUFBLGVBQzVGZixzQkFBQSxDQUFBQyxhQUFBLENBQUNvQyxlQUFFLEVBQUE7RUFBQ1QsSUFBQUEsRUFBRSxFQUFDO0tBQUksRUFBQyxXQUFTLEVBQUNnSSxVQUFVLENBQUNkLFNBQVMsQ0FBQyxFQUFFeEcsTUFBTSxJQUFJLENBQUMsRUFBQyxXQUFhLENBQUMsRUFFdEV0RixPQUFPLGdCQUNOZ0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQyxRQUFRO0VBQUNvQixJQUFBQSxDQUFDLEVBQUM7S0FBSyxlQUN2QzFCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQ04sQ0FBQyxHQUNKc0ksU0FBUyxLQUFLLFVBQVUsSUFBSWMsVUFBVSxDQUFDbUMsUUFBUSxFQUFFekosTUFBTSxnQkFDekR0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNzQyxrQkFBSyxFQUFBLElBQUEsZUFDSnZDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3VDLHNCQUFTLEVBQUEsSUFBQSxlQUNSeEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0MscUJBQVEsRUFBQSxJQUFBLGVBQ1B6QyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBQyxTQUFrQixDQUFDLGVBQzlCMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUMsU0FBa0IsQ0FBQyxlQUM5QjFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLFFBQUMsTUFBZSxDQUFDLGVBQzNCMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUMsU0FBa0IsQ0FBQyxlQUM5QjFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFDLFFBQWlCLENBQUMsZUFDN0IxQyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBQyxVQUFtQixDQUFDLGVBQy9CMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUMsV0FBb0IsQ0FDdkIsQ0FDRCxDQUFDLGVBQ1oxQyxzQkFBQSxDQUFBQyxhQUFBLENBQUMwQyxzQkFBUyxFQUFBLElBQUEsRUFDUGlILFVBQVUsQ0FBQ21DLFFBQVEsQ0FBQ25KLEdBQUcsQ0FBRW9KLENBQU0saUJBQzlCaE0sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0MscUJBQVEsRUFBQTtNQUFDSyxHQUFHLEVBQUVrSixDQUFDLENBQUNwTTtLQUFHLGVBQ2xCSSxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxRQUFFc0osQ0FBQyxDQUFDakosV0FBdUIsQ0FBQyxlQUN0Qy9DLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFc0osQ0FBQyxDQUFDQyxjQUEwQixDQUFDLGVBQ3pDak0sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUVzSixDQUFDLENBQUNFLElBQUksRUFBRTFELElBQUksSUFBSSxHQUFlLENBQUMsZUFDNUN4SSxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBRXNKLENBQUMsQ0FBQ0csT0FBbUIsQ0FBQyxlQUNsQ25NLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFc0osQ0FBQyxDQUFDMUgsTUFBa0IsQ0FBQyxlQUNqQ3RFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFc0osQ0FBQyxDQUFDSSxTQUFTLEdBQUcsSUFBSWxKLElBQUksQ0FBQzhJLENBQUMsQ0FBQ0ksU0FBUyxDQUFDLENBQUNDLGNBQWMsRUFBRSxHQUFHLEdBQWUsQ0FBQyxlQUNuRnJNLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFc0osQ0FBQyxDQUFDTSxVQUFVLEdBQUcsSUFBSXBKLElBQUksQ0FBQzhJLENBQUMsQ0FBQ00sVUFBVSxDQUFDLENBQUNELGNBQWMsRUFBRSxHQUFHLEdBQWUsQ0FDNUUsQ0FDWCxDQUNRLENBQ04sQ0FBQyxHQUNOdkQsU0FBUyxLQUFLLFlBQVksSUFBSWMsVUFBVSxDQUFDMkMsVUFBVSxFQUFFakssTUFBTSxnQkFDN0R0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNzQyxrQkFBSyxFQUFBLElBQUEsZUFDSnZDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3VDLHNCQUFTLEVBQUEsSUFBQSxlQUNSeEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0MscUJBQVEscUJBQ1B6QyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBQyxTQUFrQixDQUFDLGVBQzlCMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUMsV0FBb0IsQ0FBQyxlQUNoQzFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFDLE1BQWUsQ0FBQyxlQUMzQjFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFDLFVBQW1CLENBQUMsZUFDL0IxQyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBQyxRQUFpQixDQUFDLGVBQzdCMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUMsVUFBbUIsQ0FBQyxlQUMvQjFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFDLFdBQW9CLENBQ3ZCLENBQ0QsQ0FBQyxlQUNaMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEMsc0JBQVMsUUFDUGlILFVBQVUsQ0FBQzJDLFVBQVUsQ0FBQzNKLEdBQUcsQ0FBRTRKLENBQU0saUJBQ2hDeE0sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0MscUJBQVEsRUFBQTtNQUFDSyxHQUFHLEVBQUUwSixDQUFDLENBQUM1TTtLQUFHLGVBQ2xCSSxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBRThKLENBQUMsQ0FBQ2hKLE9BQW1CLENBQUMsZUFDbEN4RCxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBRThKLENBQUMsQ0FBQ0MsU0FBcUIsQ0FBQyxlQUNwQ3pNLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFOEosQ0FBQyxDQUFDTixJQUFJLEVBQUUxRCxJQUFJLElBQUksR0FBZSxDQUFDLGVBQzVDeEksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUU4SixDQUFDLENBQUM5QyxRQUFvQixDQUFDLGVBQ25DMUosc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUU4SixDQUFDLENBQUNsSSxNQUFrQixDQUFDLGVBQ2pDdEUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQSxJQUFBLEVBQUU4SixDQUFDLENBQUMvSSxVQUFVLEdBQUcsSUFBSVAsSUFBSSxDQUFDc0osQ0FBQyxDQUFDL0ksVUFBVSxDQUFDLENBQUM0SSxjQUFjLEVBQUUsR0FBRyxHQUFlLENBQUMsZUFDckZyTSxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBRThKLENBQUMsQ0FBQ0UsVUFBVSxHQUFHLElBQUl4SixJQUFJLENBQUNzSixDQUFDLENBQUNFLFVBQVUsQ0FBQyxDQUFDTCxjQUFjLEVBQUUsR0FBRyxHQUFlLENBQzVFLENBQ1gsQ0FDUSxDQUNOLENBQUMsZ0JBRVJyTSxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3FCLElBQUFBLEtBQUssRUFBQztLQUFRLEVBQUMsNERBQThELENBRWxGLENBQ0YsQ0FBQztFQUVWLENBQUM7O0VDOVFELE1BQU02SyxhQUF1QixHQUFHQSxNQUFNO0VBQ3BDLEVBQUEsTUFBTSxDQUFDN1AsWUFBWSxDQUFDLEdBQUdDLHVCQUFlLEVBQUU7SUFDeEMsTUFBTSxDQUFDQyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0lBQzVDLE1BQU0sQ0FBQ2tMLE1BQU0sRUFBRUMsU0FBUyxDQUFDLEdBQUduTCxjQUFRLENBQUMsS0FBSyxDQUFDO0lBQzNDLE1BQU0sQ0FBQzBQLFFBQVEsRUFBRUMsV0FBVyxDQUFDLEdBQUczUCxjQUFRLENBQXNCLElBQUksQ0FBQztJQUNuRSxNQUFNLENBQUM0UCxlQUFlLEVBQUVDLGtCQUFrQixDQUFDLEdBQUc3UCxjQUFRLENBQUMsS0FBSyxDQUFDO0lBQzdELE1BQU0sQ0FBQzhQLFlBQVksRUFBRUMsZUFBZSxDQUFDLEdBQUcvUCxjQUFRLENBQUMsS0FBSyxDQUFDO0lBQ3ZELE1BQU0sQ0FBQ2dRLFNBQVMsRUFBRUMsWUFBWSxDQUFDLEdBQUdqUSxjQUFRLENBQUMsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQ2tRLFNBQVMsRUFBRUMsaUJBQWlCLENBQUMsR0FBR25RLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDbkQsTUFBTSxDQUFDOEgsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBRy9ILGNBQVEsQ0FBcUQsSUFBSSxDQUFDO0lBQ2hHLE1BQU0sQ0FBQ29RLFdBQVcsRUFBRUMsY0FBYyxDQUFDLEdBQUdyUSxjQUFRLENBQUMsS0FBSyxDQUFDO0VBQ3JELEVBQUEsTUFBTSxDQUFDc1EsUUFBUSxFQUFFQyxXQUFXLENBQUMsR0FBR3ZRLGNBQVEsQ0FBVztFQUNqRHdRLElBQUFBLE9BQU8sRUFBRSxLQUFLO0VBQ2R4QixJQUFBQSxJQUFJLEVBQUUsRUFBRTtFQUNSeUIsSUFBQUEsSUFBSSxFQUFFLEtBQUs7RUFDWEMsSUFBQUEsSUFBSSxFQUFFLEVBQUU7RUFDUkMsSUFBQUEsSUFBSSxFQUFFLEVBQUU7RUFDUkMsSUFBQUEsSUFBSSxFQUFFO0VBQ1IsR0FBQyxDQUFDO0VBRUYsRUFBQSxNQUFNbk4sSUFBSSxHQUFJN0QsWUFBWSxFQUFVNkQsSUFBSSxJQUFJLE9BQU87RUFDbkQsRUFBQSxNQUFNb04sT0FBTyxHQUFHcE4sSUFBSSxLQUFLLE9BQU87RUFFaEN4QyxFQUFBQSxlQUFTLENBQUMsTUFBTTtFQUNkNlAsSUFBQUEsWUFBWSxFQUFFO0lBQ2hCLENBQUMsRUFBRSxFQUFFLENBQUM7RUFFTixFQUFBLE1BQU1BLFlBQVksR0FBRyxZQUFZO01BQy9CL1EsVUFBVSxDQUFDLElBQUksQ0FBQztNQUNoQixJQUFJO0VBQ0YsTUFBQSxNQUFNNEMsR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQyxxQkFBcUIsRUFBRTtFQUM3Q0MsUUFBQUEsV0FBVyxFQUFFO0VBQ2YsT0FBQyxDQUFDO1FBQ0YsSUFBSWMsR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDVixRQUFBLE1BQU11RyxJQUFJLEdBQUcsTUFBTTFGLEdBQUcsQ0FBQ1gsSUFBSSxFQUFFO1VBQzdCMk4sV0FBVyxDQUFDdEgsSUFBSSxDQUFDO0VBQ25CLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBTzlGLEtBQUssRUFBRTtFQUNkQyxNQUFBQSxPQUFPLENBQUNELEtBQUssQ0FBQywwQkFBMEIsRUFBRUEsS0FBSyxDQUFDO0VBQ2xELElBQUEsQ0FBQyxTQUFTO1FBQ1J4QyxVQUFVLENBQUMsS0FBSyxDQUFDO0VBQ25CLElBQUE7SUFDRixDQUFDO0VBRUQsRUFBQSxNQUFNZ1IsWUFBWSxHQUFHLFlBQVk7TUFDL0IsSUFBSSxDQUFDZixTQUFTLEVBQUU7RUFDZGpJLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBOEIsT0FBQyxDQUFDO0VBQ2xFLE1BQUE7RUFDRixJQUFBO01BRUFnSCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7TUFDeEI5SCxVQUFVLENBQUMsSUFBSSxDQUFDO01BRWhCLElBQUk7RUFDRixNQUFBLE1BQU1wRixHQUFHLEdBQUcsTUFBTWYsS0FBSyxDQUFDLG1DQUFtQyxFQUFFO0VBQzNEZ0IsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZDRGLFFBQUFBLE9BQU8sRUFBRTtFQUFFLFVBQUEsY0FBYyxFQUFFO1dBQW9CO0VBQy9DM0csUUFBQUEsV0FBVyxFQUFFLFNBQVM7RUFDdEI0RyxRQUFBQSxJQUFJLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO0VBQUVxSSxVQUFBQSxLQUFLLEVBQUVoQjtXQUFXO0VBQzNDLE9BQUMsQ0FBQztFQUVGLE1BQUEsTUFBTTNILElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7UUFDN0IsSUFBSVcsR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDVmlHLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsU0FBUztFQUFFQyxVQUFBQSxJQUFJLEVBQUU7RUFBMkMsU0FBQyxDQUFDO0VBQ25GLE1BQUEsQ0FBQyxNQUFNO0VBQ0xkLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxVQUFBQSxJQUFJLEVBQUVSLElBQUksQ0FBQ1AsT0FBTyxJQUFJO0VBQThCLFNBQUMsQ0FBQztFQUNwRixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU92RixLQUFLLEVBQUU7RUFDZHdGLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBZ0IsT0FBQyxDQUFDO0VBQ3RELElBQUEsQ0FBQyxTQUFTO1FBQ1JnSCxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7RUFDM0IsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU1vQixRQUFRLEdBQUcsWUFBWTtNQUMzQixJQUFJLENBQUNmLFNBQVMsRUFBRTtFQUNkbkksTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUFnQyxPQUFDLENBQUM7RUFDcEUsTUFBQTtFQUNGLElBQUE7TUFFQWtILGVBQWUsQ0FBQyxJQUFJLENBQUM7TUFDckJoSSxVQUFVLENBQUMsSUFBSSxDQUFDO01BRWhCLElBQUk7RUFDRixNQUFBLE1BQU1wRixHQUFHLEdBQUcsTUFBTWYsS0FBSyxDQUFDLGdDQUFnQyxFQUFFO0VBQ3hEZ0IsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZDRGLFFBQUFBLE9BQU8sRUFBRTtFQUFFLFVBQUEsY0FBYyxFQUFFO1dBQW9CO0VBQy9DM0csUUFBQUEsV0FBVyxFQUFFLFNBQVM7RUFDdEI0RyxRQUFBQSxJQUFJLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO0VBQUVxQyxVQUFBQSxLQUFLLEVBQUVrRjtXQUFXO0VBQzNDLE9BQUMsQ0FBQztFQUVGLE1BQUEsTUFBTTdILElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7UUFDN0IsSUFBSVcsR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDVmlHLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsU0FBUztFQUFFQyxVQUFBQSxJQUFJLEVBQUU7RUFBZ0MsU0FBQyxDQUFDO0VBQ3hFLE1BQUEsQ0FBQyxNQUFNO0VBQ0xkLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxVQUFBQSxJQUFJLEVBQUVSLElBQUksQ0FBQ1AsT0FBTyxJQUFJO0VBQTRCLFNBQUMsQ0FBQztFQUNsRixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU92RixLQUFLLEVBQUU7RUFDZHdGLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBZ0IsT0FBQyxDQUFDO0VBQ3RELElBQUEsQ0FBQyxTQUFTO1FBQ1JrSCxlQUFlLENBQUMsS0FBSyxDQUFDO0VBQ3hCLElBQUE7SUFDRixDQUFDO0lBRUQsTUFBTW1CLGdCQUFnQixHQUFHQSxNQUFNO0VBQzdCWCxJQUFBQSxXQUFXLENBQUM7RUFDVkMsTUFBQUEsT0FBTyxFQUFFZCxRQUFRLEVBQUV5QixJQUFJLEVBQUVYLE9BQU8sSUFBSSxLQUFLO0VBQ3pDeEIsTUFBQUEsSUFBSSxFQUFFVSxRQUFRLEVBQUV5QixJQUFJLEVBQUVuQyxJQUFJLElBQUksRUFBRTtRQUNoQ3lCLElBQUksRUFBRVcsTUFBTSxDQUFDMUIsUUFBUSxFQUFFeUIsSUFBSSxFQUFFVixJQUFJLElBQUksS0FBSyxDQUFDO0VBQzNDQyxNQUFBQSxJQUFJLEVBQUVoQixRQUFRLEVBQUV5QixJQUFJLEVBQUVULElBQUksSUFBSSxFQUFFO0VBQ2hDQyxNQUFBQSxJQUFJLEVBQUUsRUFBRTtFQUNSQyxNQUFBQSxJQUFJLEVBQUVsQixRQUFRLEVBQUV5QixJQUFJLEVBQUVQLElBQUksSUFBSTtFQUNoQyxLQUFDLENBQUM7TUFDRlAsY0FBYyxDQUFDLElBQUksQ0FBQztJQUN0QixDQUFDO0VBRUQsRUFBQSxNQUFNZ0IsZ0JBQWdCLEdBQUcsWUFBWTtNQUNuQ2xHLFNBQVMsQ0FBQyxJQUFJLENBQUM7TUFDZnBELFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFFaEIsSUFBSTtFQUNGLE1BQUEsTUFBTXBGLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsNEJBQTRCLEVBQUU7RUFDcERnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNEYsUUFBQUEsT0FBTyxFQUFFO0VBQUUsVUFBQSxjQUFjLEVBQUU7V0FBb0I7RUFDL0MzRyxRQUFBQSxXQUFXLEVBQUUsU0FBUztFQUN0QjRHLFFBQUFBLElBQUksRUFBRUMsSUFBSSxDQUFDQyxTQUFTLENBQUM7RUFDbkJ3SSxVQUFBQSxJQUFJLEVBQUU7Y0FDSlgsT0FBTyxFQUFFRixRQUFRLENBQUNFLE9BQU87Y0FDekJ4QixJQUFJLEVBQUVzQixRQUFRLENBQUN0QixJQUFJO2NBQ25CeUIsSUFBSSxFQUFFYSxRQUFRLENBQUNoQixRQUFRLENBQUNHLElBQUksRUFBRSxFQUFFLENBQUM7Y0FDakNDLElBQUksRUFBRUosUUFBUSxDQUFDSSxJQUFJO0VBQ25CQyxZQUFBQSxJQUFJLEVBQUVMLFFBQVEsQ0FBQ0ssSUFBSSxJQUFJdk0sU0FBUztjQUNoQ3dNLElBQUksRUFBRU4sUUFBUSxDQUFDTTtFQUNqQjtXQUNEO0VBQ0gsT0FBQyxDQUFDO0VBRUYsTUFBQSxNQUFNdkksSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtRQUM3QixJQUFJVyxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWaUcsUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxTQUFTO0VBQUVDLFVBQUFBLElBQUksRUFBRTtFQUFvQyxTQUFDLENBQUM7VUFDMUV3SCxjQUFjLENBQUMsS0FBSyxDQUFDO1VBQ3JCUyxZQUFZLEVBQUUsQ0FBQztFQUNqQixNQUFBLENBQUMsTUFBTTtFQUNML0ksUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFVBQUFBLElBQUksRUFBRVIsSUFBSSxDQUFDUCxPQUFPLElBQUk7RUFBMEIsU0FBQyxDQUFDO0VBQ2hGLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT3ZGLEtBQUssRUFBRTtFQUNkd0YsTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUFnQixPQUFDLENBQUM7RUFDdEQsSUFBQSxDQUFDLFNBQVM7UUFDUnNDLFNBQVMsQ0FBQyxLQUFLLENBQUM7RUFDbEIsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU1vRyxpQkFBaUIsR0FBRyxZQUFZO01BQ3BDcEcsU0FBUyxDQUFDLElBQUksQ0FBQztNQUNmcEQsVUFBVSxDQUFDLElBQUksQ0FBQztNQUVoQixJQUFJO0VBQ0YsTUFBQSxNQUFNcEYsR0FBRyxHQUFHLE1BQU1mLEtBQUssQ0FBQyw0QkFBNEIsRUFBRTtFQUNwRGdCLFFBQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2Q0RixRQUFBQSxPQUFPLEVBQUU7RUFBRSxVQUFBLGNBQWMsRUFBRTtXQUFvQjtFQUMvQzNHLFFBQUFBLFdBQVcsRUFBRSxTQUFTO0VBQ3RCNEcsUUFBQUEsSUFBSSxFQUFFQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztFQUNuQndJLFVBQUFBLElBQUksRUFBRTtFQUNKWCxZQUFBQSxPQUFPLEVBQUUsQ0FBQ2QsUUFBUSxFQUFFeUIsSUFBSSxFQUFFWDtFQUM1QjtXQUNEO0VBQ0gsT0FBQyxDQUFDO0VBRUYsTUFBQSxNQUFNbkksSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtRQUM3QixJQUFJVyxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWaUcsUUFBQUEsVUFBVSxDQUFDO0VBQUVhLFVBQUFBLElBQUksRUFBRSxTQUFTO1lBQUVDLElBQUksRUFBRSxDQUFBLEtBQUEsRUFBUSxDQUFDNkcsUUFBUSxFQUFFeUIsSUFBSSxFQUFFWCxPQUFPLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQSxjQUFBO0VBQWlCLFNBQUMsQ0FBQztFQUNoSE0sUUFBQUEsWUFBWSxFQUFFO0VBQ2hCLE1BQUEsQ0FBQyxNQUFNO0VBQ0wvSSxRQUFBQSxVQUFVLENBQUM7RUFBRWEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUE0QixTQUFDLENBQUM7RUFDbEYsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPdkYsS0FBSyxFQUFFO0VBQ2R3RixNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQWdCLE9BQUMsQ0FBQztFQUN0RCxJQUFBLENBQUMsU0FBUztRQUNSc0MsU0FBUyxDQUFDLEtBQUssQ0FBQztFQUNsQixJQUFBO0lBQ0YsQ0FBQztJQUVELElBQUksQ0FBQzBGLE9BQU8sRUFBRTtFQUNaLElBQUEsb0JBQ0UvTixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLE1BQUFBLENBQUMsRUFBQztFQUFLLEtBQUEsZUFDVjFCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29HLHVCQUFVLEVBQUE7RUFBQ3JCLE1BQUFBLE9BQU8sRUFBQywrQ0FBK0M7RUFBQ3ZELE1BQUFBLE9BQU8sRUFBQztFQUFPLEtBQUUsQ0FDbEYsQ0FBQztFQUVWLEVBQUE7RUFFQSxFQUFBLElBQUl6RSxPQUFPLEVBQUU7RUFDWCxJQUFBLG9CQUNFZ0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO1FBQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLE1BQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNDLE1BQUFBLGNBQWMsRUFBQyxRQUFRO0VBQUNDLE1BQUFBLE1BQU0sRUFBQztFQUFPLEtBQUEsZUFDbEVQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQ04sQ0FBQztFQUVWLEVBQUE7RUFFQSxFQUFBLG9CQUNFUixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3VCLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQUNDLElBQUFBLENBQUMsRUFBQztFQUFLLEdBQUEsZUFDekIxQixzQkFBQSxDQUFBQyxhQUFBLENBQUM0QixlQUFFLEVBQUE7RUFBQ0QsSUFBQUEsRUFBRSxFQUFDO0VBQUssR0FBQSxFQUFDLFVBQVksQ0FBQyxlQUUxQjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDcUIsSUFBQUEsS0FBSyxFQUFDLFFBQVE7RUFBQ0YsSUFBQUEsRUFBRSxFQUFDO0tBQUssRUFBQyxzR0FFeEIsQ0FBQyxFQUVOb0QsT0FBTyxpQkFDTmhGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGMEIsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFDUEYsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFDTkMsSUFBQUEsS0FBSyxFQUFFO0VBQ0xiLE1BQUFBLFlBQVksRUFBRSxLQUFLO1FBQ25CRSxlQUFlLEVBQUVnRSxPQUFPLENBQUNjLElBQUksS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLFNBQVM7UUFDakU3RSxNQUFNLEVBQUUsQ0FBQSxVQUFBLEVBQWErRCxPQUFPLENBQUNjLElBQUksS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQSxDQUFFO0VBQ3ZFMUUsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZmQsTUFBQUEsY0FBYyxFQUFFLGVBQWU7RUFDL0JELE1BQUFBLFVBQVUsRUFBRTtFQUNkO0VBQUUsR0FBQSxlQUVGTCxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2tCLElBQUFBLEtBQUssRUFBRTtRQUFFRyxLQUFLLEVBQUVrRCxPQUFPLENBQUNjLElBQUksS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLFNBQVM7RUFBRUUsTUFBQUEsVUFBVSxFQUFFO0VBQUk7RUFBRSxHQUFBLEVBQ3ZGaEIsT0FBTyxDQUFDYyxJQUFJLEtBQUssT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLEVBQUVkLE9BQU8sQ0FBQ2UsSUFDN0MsQ0FBQyxlQUNQL0Ysc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUFDN0IsSUFBQUEsT0FBTyxFQUFDLE1BQU07RUFBQ1csSUFBQUEsSUFBSSxFQUFDLElBQUk7RUFBQ21CLElBQUFBLE9BQU8sRUFBRUEsTUFBTTBCLFVBQVUsQ0FBQyxJQUFJO0tBQUUsRUFBQyxRQUFTLENBQ3hFLENBQ04sZUFHRGpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDOEQsSUFBQUEsRUFBRSxFQUFDLE9BQU87RUFBQ3RDLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNFLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNELElBQUFBLEtBQUssRUFBRTtFQUFFYixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFQyxNQUFBQSxTQUFTLEVBQUU7RUFBNEI7RUFBRSxHQUFBLGVBQ3BHZixzQkFBQSxDQUFBQyxhQUFBLENBQUNvQyxlQUFFLEVBQUE7RUFBQ1QsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNUNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUFDc0UsSUFBQUEsRUFBRSxFQUFDO0tBQU0sQ0FBQyxpQkFFMUIsQ0FBQyxlQUNMekcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ3REL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQztFQUFlLEdBQUEsZUFDdENOLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUYsSUFBQUEsVUFBVSxFQUFDO0tBQU0sRUFBQyxZQUFnQixDQUFDLGVBQ3pDaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBLElBQUEsRUFBRW1NLFFBQVEsRUFBRThCLElBQUksRUFBRWxHLElBQUksSUFBSSxZQUFtQixDQUMvQyxDQUFDLGVBQ054SSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDO0VBQWUsR0FBQSxlQUN0Q04sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7S0FBTSxFQUFDLFdBQWUsQ0FBQyxlQUN4Q2hHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQSxJQUFBLEVBQUVtTSxRQUFRLEVBQUU4QixJQUFJLEVBQUVDLFFBQVEsSUFBSSxZQUFtQixDQUNuRCxDQUNGLENBQ0YsQ0FBQyxlQUdOM08sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUM4RCxJQUFBQSxFQUFFLEVBQUMsT0FBTztFQUFDdEMsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0UsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ0QsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVDLE1BQUFBLFNBQVMsRUFBRTtFQUE0QjtFQUFFLEdBQUEsZUFDcEdmLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Q1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxlQUFlO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLHFCQUVuQyxDQUFDLGVBQ0x6RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDdEQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLGVBQWU7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDO0VBQVEsR0FBQSxlQUMxREwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7RUFBTSxHQUFBLEVBQUMsU0FBYSxDQUFDLGVBQ3RDaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMk8sa0JBQUssRUFBQTtNQUFDbk4sT0FBTyxFQUFFbUwsUUFBUSxFQUFFaUMsUUFBUSxFQUFFQyxVQUFVLEdBQUcsU0FBUyxHQUFHO0VBQVMsR0FBQSxFQUNuRWxDLFFBQVEsRUFBRWlDLFFBQVEsRUFBRUMsVUFBVSxHQUFHLFlBQVksR0FBRyxnQkFDNUMsQ0FDSixDQUFDLGVBQ045TyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDO0VBQWUsR0FBQSxlQUN0Q04sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7S0FBTSxFQUFDLFdBQWUsQ0FBQyxlQUN4Q2hHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQSxJQUFBLEVBQUVtTSxRQUFRLEVBQUVpQyxRQUFRLEVBQUVFLFFBQVEsSUFBSSxVQUFpQixDQUNyRCxDQUFDLGVBQ04vTyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLGVBQWU7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDO0VBQVEsR0FBQSxlQUMxREwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7RUFBTSxHQUFBLEVBQUMsVUFBYyxDQUFDLGVBQ3ZDaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMk8sa0JBQUssRUFBQTtNQUFDbk4sT0FBTyxFQUFFbUwsUUFBUSxFQUFFaUMsUUFBUSxFQUFFbkIsT0FBTyxHQUFHLFNBQVMsR0FBRztLQUFZLEVBQ25FZCxRQUFRLEVBQUVpQyxRQUFRLEVBQUVuQixPQUFPLEdBQUcsS0FBSyxHQUFHLElBQ2xDLENBQ0osQ0FDRixDQUFDLEVBRUxkLFFBQVEsRUFBRWlDLFFBQVEsRUFBRUMsVUFBVSxpQkFDN0I5TyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ1EsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ3NPLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNyTixJQUFBQSxLQUFLLEVBQUU7RUFBRXNOLE1BQUFBLFNBQVMsRUFBRTtFQUFvQjtFQUFFLEdBQUEsZUFDN0RqUCxzQkFBQSxDQUFBQyxhQUFBLENBQUMwRCxlQUFFLEVBQUE7RUFBQy9CLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyxlQUFpQixDQUFDLGVBQzlCNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUN3QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQy9CL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEgsa0JBQUssRUFBQTtFQUNKN0IsSUFBQUEsSUFBSSxFQUFDLEtBQUs7RUFDVmlDLElBQUFBLFdBQVcsRUFBQyxtQ0FBbUM7RUFDL0NILElBQUFBLEtBQUssRUFBRXNGLFNBQVU7TUFDakJyRixRQUFRLEVBQUdULENBQUMsSUFBSytGLFlBQVksQ0FBQy9GLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLLENBQUU7RUFDOUNqRyxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FDcEIsQ0FBQyxlQUNGSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQ0w3QixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQjhCLElBQUFBLE9BQU8sRUFBRTBLLFlBQWE7RUFDdEIxSCxJQUFBQSxRQUFRLEVBQUV1RztLQUFnQixFQUV6QkEsZUFBZSxnQkFBRzlNLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sTUFBRSxDQUFDLEdBQUcsV0FDMUIsQ0FDTCxDQUNGLENBRUosQ0FBQyxlQUdOUixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzhELElBQUFBLEVBQUUsRUFBQyxPQUFPO0VBQUN0QyxJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDRSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDRCxJQUFBQSxLQUFLLEVBQUU7RUFBRWIsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRUMsTUFBQUEsU0FBUyxFQUFFO0VBQTRCO0VBQUUsR0FBQSxlQUNwR2Ysc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQyxlQUFlO0VBQUNELElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ2xFNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0MsZUFBRSxFQUFBO0VBQUNWLElBQUFBLEtBQUssRUFBRTtFQUFFTSxNQUFBQSxNQUFNLEVBQUU7RUFBRTtFQUFFLEdBQUEsZUFDdkJqQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLEVBQUEsZUFFMUIsQ0FBQyxFQUNKLENBQUM2RyxXQUFXLGlCQUNYdE4sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUFDN0IsSUFBQUEsT0FBTyxFQUFDLE1BQU07RUFBQzhCLElBQUFBLE9BQU8sRUFBRTZLO0VBQWlCLEdBQUEsZUFDL0NwTyxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLEVBQUEsTUFFdEIsQ0FFUCxDQUFDLEVBRUw2RyxXQUFXLGdCQUNWdE4sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ3REL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ25EL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtFQUFDOUYsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRTtFQUFRO0VBQUUsR0FBQSxFQUFDLFVBQWUsQ0FBQyxlQUNsRG5CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBRStMLFFBQVEsQ0FBQ0UsT0FBTyxHQUFHLFNBQVMsR0FBRyxXQUFZO0VBQ3BEdEwsSUFBQUEsSUFBSSxFQUFDLElBQUk7RUFDVG1CLElBQUFBLE9BQU8sRUFBRUEsTUFBTWtLLFdBQVcsQ0FBQztFQUFFLE1BQUEsR0FBR0QsUUFBUTtRQUFFRSxPQUFPLEVBQUUsQ0FBQ0YsUUFBUSxDQUFDRTtPQUFTO0VBQUUsR0FBQSxFQUV2RUYsUUFBUSxDQUFDRSxPQUFPLEdBQUcsU0FBUyxHQUFHLFVBQzFCLENBQ0wsQ0FBQyxlQUNOMU4sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ25EL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtFQUFDOUYsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRTtFQUFRO0VBQUUsR0FBQSxFQUFDLE9BQVksQ0FBQyxlQUMvQ25CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBILGtCQUFLLEVBQUE7TUFDSkMsS0FBSyxFQUFFNEYsUUFBUSxDQUFDdEIsSUFBSztFQUNyQnJFLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcUcsV0FBVyxDQUFDO0VBQUUsTUFBQSxHQUFHRCxRQUFRO0VBQUV0QixNQUFBQSxJQUFJLEVBQUU5RSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0Y7RUFBTSxLQUFDLENBQUU7RUFDcEVHLElBQUFBLFdBQVcsRUFBQyxrQkFBa0I7RUFDOUJwRyxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FDcEIsQ0FDRSxDQUFDLGVBQ05ILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRSxJQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUFDc0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUNuRC9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUE7RUFBQzlGLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUU7RUFBUTtFQUFFLEdBQUEsRUFBQyxPQUFZLENBQUMsZUFDL0NuQixzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO01BQ0pDLEtBQUssRUFBRTRGLFFBQVEsQ0FBQ0csSUFBSztFQUNyQjlGLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcUcsV0FBVyxDQUFDO0VBQUUsTUFBQSxHQUFHRCxRQUFRO0VBQUVHLE1BQUFBLElBQUksRUFBRXZHLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRjtFQUFNLEtBQUMsQ0FBRTtFQUNwRUcsSUFBQUEsV0FBVyxFQUFDLEtBQUs7RUFDakJwRyxJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFO0VBQVE7RUFBRSxHQUMzQixDQUNFLENBQUMsZUFDTm5CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRSxJQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUFDc0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUNuRC9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUE7RUFBQzlGLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUU7RUFBUTtFQUFFLEdBQUEsRUFBQyxPQUFZLENBQUMsZUFDL0NuQixzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO01BQ0pDLEtBQUssRUFBRTRGLFFBQVEsQ0FBQ0ksSUFBSztFQUNyQi9GLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcUcsV0FBVyxDQUFDO0VBQUUsTUFBQSxHQUFHRCxRQUFRO0VBQUVJLE1BQUFBLElBQUksRUFBRXhHLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRjtFQUFNLEtBQUMsQ0FBRTtFQUNwRUcsSUFBQUEsV0FBVyxFQUFDLGtCQUFrQjtFQUM5QnBHLElBQUFBLEtBQUssRUFBRTtFQUFFeEIsTUFBQUEsSUFBSSxFQUFFO0VBQUU7RUFBRSxHQUNwQixDQUNFLENBQUMsZUFDTkgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ25EL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDd0gsa0JBQUssRUFBQTtFQUFDOUYsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRTtFQUFRO0VBQUUsR0FBQSxFQUFDLFdBQWdCLENBQUMsZUFDbkRuQixzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsVUFBVTtNQUNmOEIsS0FBSyxFQUFFNEYsUUFBUSxDQUFDSyxJQUFLO0VBQ3JCaEcsSUFBQUEsUUFBUSxFQUFHVCxDQUFDLElBQUtxRyxXQUFXLENBQUM7RUFBRSxNQUFBLEdBQUdELFFBQVE7RUFBRUssTUFBQUEsSUFBSSxFQUFFekcsQ0FBQyxDQUFDVSxNQUFNLENBQUNGO0VBQU0sS0FBQyxDQUFFO0VBQ3BFRyxJQUFBQSxXQUFXLEVBQUMsNkJBQTZCO0VBQ3pDcEcsSUFBQUEsS0FBSyxFQUFFO0VBQUV4QixNQUFBQSxJQUFJLEVBQUU7RUFBRTtFQUFFLEdBQ3BCLENBQ0UsQ0FBQyxlQUNOSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0UsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDbkQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUN3SCxrQkFBSyxFQUFBO0VBQUM5RixJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFO0VBQVE7RUFBRSxHQUFBLEVBQUMsT0FBWSxDQUFDLGVBQy9DbkIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEgsa0JBQUssRUFBQTtNQUNKQyxLQUFLLEVBQUU0RixRQUFRLENBQUNNLElBQUs7RUFDckJqRyxJQUFBQSxRQUFRLEVBQUdULENBQUMsSUFBS3FHLFdBQVcsQ0FBQztFQUFFLE1BQUEsR0FBR0QsUUFBUTtFQUFFTSxNQUFBQSxJQUFJLEVBQUUxRyxDQUFDLENBQUNVLE1BQU0sQ0FBQ0Y7RUFBTSxLQUFDLENBQUU7RUFDcEVHLElBQUFBLFdBQVcsRUFBQyxxQkFBcUI7RUFDakNwRyxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FDcEIsQ0FDRSxDQUFDLGVBQ05ILHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDd0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRSxNQUFNO0VBQUVtTixNQUFBQSxTQUFTLEVBQUU7RUFBTTtFQUFFLEdBQUEsZUFDakRsUCxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQUM3QixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUFDOEIsSUFBQUEsT0FBTyxFQUFFZ0wsZ0JBQWlCO0VBQUNoSSxJQUFBQSxRQUFRLEVBQUU2QjtFQUFPLEdBQUEsRUFDbkVBLE1BQU0sZ0JBQUdwSSxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUFDLEdBQUcsZUFDakIsQ0FBQyxlQUNUUixzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQUM3QixJQUFBQSxPQUFPLEVBQUMsTUFBTTtFQUFDOEIsSUFBQUEsT0FBTyxFQUFFQSxNQUFNZ0ssY0FBYyxDQUFDLEtBQUs7RUFBRSxHQUFBLEVBQUMsUUFFckQsQ0FDTCxDQUNGLENBQUMsZ0JBRU52TixzQkFBQSxDQUFBQyxhQUFBLENBQUFELHNCQUFBLENBQUF3RyxRQUFBLEVBQUEsSUFBQSxlQUNFeEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ3REL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQyxlQUFlO0VBQUNELElBQUFBLFVBQVUsRUFBQztFQUFRLEdBQUEsZUFDMURMLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUYsSUFBQUEsVUFBVSxFQUFDO0VBQU0sR0FBQSxFQUFDLFNBQWEsQ0FBQyxlQUN0Q2hHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzJPLGtCQUFLLEVBQUE7TUFBQ25OLE9BQU8sRUFBRW1MLFFBQVEsRUFBRXlCLElBQUksRUFBRVMsVUFBVSxHQUFHLFNBQVMsR0FBRztFQUFTLEdBQUEsRUFDL0RsQyxRQUFRLEVBQUV5QixJQUFJLEVBQUVTLFVBQVUsR0FBRyxZQUFZLEdBQUcsZ0JBQ3hDLENBQ0osQ0FBQyxlQUNOOU8sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQztFQUFlLEdBQUEsZUFDdENOLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUYsSUFBQUEsVUFBVSxFQUFDO0tBQU0sRUFBQyxPQUFXLENBQUMsZUFDcENoRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUEsSUFBQSxFQUFFbU0sUUFBUSxFQUFFeUIsSUFBSSxFQUFFbkMsSUFBSSxJQUFJLFNBQWdCLENBQzVDLENBQUMsZUFDTmxNLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRyxJQUFBQSxjQUFjLEVBQUMsZUFBZTtFQUFDRCxJQUFBQSxVQUFVLEVBQUM7RUFBUSxHQUFBLGVBQzFETCxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VGLElBQUFBLFVBQVUsRUFBQztFQUFNLEdBQUEsRUFBQyxVQUFjLENBQUMsZUFDdkNoRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0UsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTTtFQUFFLEdBQUEsZUFDbEQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUMyTyxrQkFBSyxFQUFBO01BQUNuTixPQUFPLEVBQUVtTCxRQUFRLEVBQUV5QixJQUFJLEVBQUVYLE9BQU8sR0FBRyxTQUFTLEdBQUc7RUFBWSxHQUFBLEVBQy9EZCxRQUFRLEVBQUV5QixJQUFJLEVBQUVYLE9BQU8sR0FBRyxLQUFLLEdBQUcsSUFDOUIsQ0FBQyxlQUNSMU4sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtNQUNMN0IsT0FBTyxFQUFFbUwsUUFBUSxFQUFFeUIsSUFBSSxFQUFFWCxPQUFPLEdBQUcsUUFBUSxHQUFHLFNBQVU7RUFDeER0TCxJQUFBQSxJQUFJLEVBQUMsSUFBSTtFQUNUbUIsSUFBQUEsT0FBTyxFQUFFa0wsaUJBQWtCO0VBQzNCbEksSUFBQUEsUUFBUSxFQUFFNkIsTUFBTSxJQUFJLENBQUN3RSxRQUFRLEVBQUV5QixJQUFJLEVBQUVTO0tBQVcsRUFFL0NsQyxRQUFRLEVBQUV5QixJQUFJLEVBQUVYLE9BQU8sR0FBRyxTQUFTLEdBQUcsUUFDakMsQ0FDTCxDQUNGLENBQ0YsQ0FBQyxFQUVMZCxRQUFRLEVBQUV5QixJQUFJLEVBQUVTLFVBQVUsaUJBQ3pCOU8sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUNRLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNzTyxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDck4sSUFBQUEsS0FBSyxFQUFFO0VBQUVzTixNQUFBQSxTQUFTLEVBQUU7RUFBb0I7RUFBRSxHQUFBLGVBQzdEalAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEQsZUFBRSxFQUFBO0VBQUMvQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsWUFBYyxDQUFDLGVBQzNCNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUN3QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQy9CL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEgsa0JBQUssRUFBQTtFQUNKN0IsSUFBQUEsSUFBSSxFQUFDLE9BQU87RUFDWmlDLElBQUFBLFdBQVcsRUFBQyxlQUFlO0VBQzNCSCxJQUFBQSxLQUFLLEVBQUV3RixTQUFVO01BQ2pCdkYsUUFBUSxFQUFHVCxDQUFDLElBQUtpRyxpQkFBaUIsQ0FBQ2pHLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLLENBQUU7RUFDbkRqRyxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FDcEIsQ0FBQyxlQUNGSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQ0w3QixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQjhCLElBQUFBLE9BQU8sRUFBRTRLLFFBQVM7RUFDbEI1SCxJQUFBQSxRQUFRLEVBQUV5RztLQUFhLEVBRXRCQSxZQUFZLGdCQUFHaE4sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDTyxtQkFBTSxNQUFFLENBQUMsR0FBRyxXQUN2QixDQUNMLENBQ0YsQ0FFUCxDQUVELENBQUMsZUFHTlIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUM4RCxJQUFBQSxFQUFFLEVBQUMsT0FBTztFQUFDdEMsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVDLE1BQUFBLFNBQVMsRUFBRTtFQUE0QjtFQUFFLEdBQUEsZUFDNUZmLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Q1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUM7S0FBTSxDQUFDLG9CQUUxQixDQUFDLGVBQ0x6RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDdEQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLGVBQWU7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDO0VBQVEsR0FBQSxlQUMxREwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7RUFBTSxHQUFBLEVBQUMsU0FBYSxDQUFDLGVBQ3RDaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMk8sa0JBQUssRUFBQTtNQUFDbk4sT0FBTyxFQUFFbUwsUUFBUSxFQUFFdUMsV0FBVyxFQUFFekIsT0FBTyxHQUFHLFFBQVEsR0FBRztFQUFVLEdBQUEsRUFDbkVkLFFBQVEsRUFBRXVDLFdBQVcsRUFBRXpCLE9BQU8sR0FBRyxRQUFRLEdBQUcsVUFDeEMsQ0FDSixDQUFDLGVBQ04xTixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDO0VBQWUsR0FBQSxlQUN0Q04sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUM7S0FBTSxFQUFDLFVBQWMsQ0FBQyxlQUN2Q2hHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQSxJQUFBLEVBQUVtTSxRQUFRLEVBQUV1QyxXQUFXLEVBQUVuSyxPQUFPLElBQUksMEJBQWlDLENBQ3ZFLENBQ0YsQ0FDRixDQUFDLGVBR05oRixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ1EsSUFBQUEsRUFBRSxFQUFDLEtBQUs7RUFBQ2dCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNzQyxJQUFBQSxFQUFFLEVBQUMsUUFBUTtFQUFDckMsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRTtFQUFNO0VBQUUsR0FBQSxlQUM5RGQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEQsZUFBRSxFQUFBO0VBQUMvQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsd0JBQTBCLENBQUMsZUFDdkM1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ21CLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyx1RkFBMkYsQ0FBQyxlQUMxRzVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDa1AsSUFBQUEsRUFBRSxFQUFDLEtBQUs7RUFBQzFOLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNzQyxJQUFBQSxFQUFFLEVBQUMsUUFBUTtFQUFDckMsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUV1TyxNQUFBQSxRQUFRLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDaEZyUCxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQzJPLElBQUFBLEVBQUUsRUFBQyxNQUFNO0VBQUN6TixJQUFBQSxLQUFLLEVBQUU7RUFBRTJOLE1BQUFBLFVBQVUsRUFBRTtFQUFZO0tBQUUsRUFDNUQsQ0FBQTtBQUNEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUFBLENBQ2dCLENBQ0gsQ0FBQyxlQUNOdFAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNvQixJQUFBQSxLQUFLLEVBQUM7S0FBUSxFQUFDLDZFQUFpRixDQUMzRyxDQUNGLENBQUM7RUFFVixDQUFDOztFQ3BmRCxNQUFNeU4sWUFBc0IsR0FBR0EsTUFBTTtFQUNuQyxFQUFBLE1BQU0sQ0FBQ3pTLFlBQVksQ0FBQyxHQUFHQyx1QkFBZSxFQUFFO0lBQ3hDLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0MsY0FBUSxDQUFDLElBQUksQ0FBQztJQUM1QyxNQUFNLENBQUM2TyxRQUFRLEVBQUV5RCxXQUFXLENBQUMsR0FBR3RTLGNBQVEsQ0FBWSxFQUFFLENBQUM7SUFDdkQsTUFBTSxDQUFDdVMsTUFBTSxFQUFFQyxTQUFTLENBQUMsR0FBR3hTLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDeEMsTUFBTSxDQUFDeVMsV0FBVyxFQUFFQyxjQUFjLENBQUMsR0FBRzFTLGNBQVEsQ0FBZ0IsSUFBSSxDQUFDO0VBRW5FaUIsRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZDBSLElBQUFBLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUUsRUFBRSxDQUFDO0VBRU4sRUFBQSxNQUFNQSxZQUFZLEdBQUcsWUFBWTtNQUMvQjVTLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEIsSUFBSTtFQUNGLE1BQUEsTUFBTTRDLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsdUNBQXVDLEVBQUU7RUFDL0RDLFFBQUFBLFdBQVcsRUFBRTtFQUNmLE9BQUMsQ0FBQztRQUNGLElBQUljLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1YsUUFBQSxNQUFNdUcsSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtVQUM3QnNRLFdBQVcsQ0FBQ2pLLElBQUksQ0FBQztFQUNuQixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU85RixLQUFLLEVBQUU7RUFDZEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFLLENBQUMsMEJBQTBCLEVBQUVBLEtBQUssQ0FBQztFQUNsRCxJQUFBLENBQUMsU0FBUztRQUNSeEMsVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTTZTLGNBQWMsR0FBRyxNQUFPQyxTQUFpQixJQUFLO01BQ2xESCxjQUFjLENBQUNHLFNBQVMsQ0FBQztNQUN6QixJQUFJO1FBQ0YsTUFBTWxRLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsQ0FBQSw4QkFBQSxFQUFpQ2lSLFNBQVMsRUFBRSxFQUFFO0VBQ3BFalEsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZGYsUUFBQUEsV0FBVyxFQUFFO0VBQ2YsT0FBQyxDQUFDO1FBQ0YsSUFBSWMsR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDVjZRLFFBQUFBLFlBQVksRUFBRTtFQUNoQixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU9wUSxLQUFLLEVBQUU7RUFDZEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFLLENBQUMscUJBQXFCLEVBQUVBLEtBQUssQ0FBQztFQUM3QyxJQUFBLENBQUMsU0FBUztRQUNSbVEsY0FBYyxDQUFDLElBQUksQ0FBQztFQUN0QixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTUksWUFBWSxHQUFHLE9BQU9DLE9BQWdCLEVBQUVuUSxNQUE0QixLQUFLO01BQzdFLElBQUk7RUFDRixNQUFBLE1BQU1ELEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMsb0JBQW9CLEVBQUU7RUFDNUNnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNEYsUUFBQUEsT0FBTyxFQUFFO0VBQUUsVUFBQSxjQUFjLEVBQUU7V0FBb0I7RUFDL0MzRyxRQUFBQSxXQUFXLEVBQUUsU0FBUztFQUN0QjRHLFFBQUFBLElBQUksRUFBRUMsSUFBSSxDQUFDQyxTQUFTLENBQUM7WUFDbkJYLE9BQU8sRUFBRStLLE9BQU8sQ0FBQ3JRLEVBQUU7RUFDbkJFLFVBQUFBO1dBQ0Q7RUFDSCxPQUFDLENBQUM7UUFDRixJQUFJRCxHQUFHLENBQUNiLEVBQUUsRUFBRTtFQUNWa1IsUUFBQUEsS0FBSyxDQUFDLENBQUEsWUFBQSxFQUFlcFEsTUFBTSxDQUFBLENBQUEsQ0FBRyxDQUFDO0VBQ2pDLE1BQUEsQ0FBQyxNQUFNO1VBQ0xvUSxLQUFLLENBQUMsbUJBQW1CLENBQUM7RUFDNUIsTUFBQTtNQUNGLENBQUMsQ0FBQyxPQUFPelEsS0FBSyxFQUFFO0VBQ2RDLE1BQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLG9CQUFvQixFQUFFQSxLQUFLLENBQUM7RUFDNUMsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU0wUSxnQkFBZ0IsR0FBR3BFLFFBQVEsQ0FBQ3FFLE1BQU0sQ0FBRXBFLENBQUMsSUFBSztFQUM5QyxJQUFBLElBQUksQ0FBQ3lELE1BQU0sRUFBRSxPQUFPLElBQUk7RUFDeEIsSUFBQSxNQUFNWSxXQUFXLEdBQUdaLE1BQU0sQ0FBQ2EsV0FBVyxFQUFFO01BQ3hDLE9BQ0V0RSxDQUFDLENBQUNqSixXQUFXLENBQUN1TixXQUFXLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDRixXQUFXLENBQUMsSUFDakRyRSxDQUFDLENBQUNDLGNBQWMsQ0FBQ3FFLFdBQVcsRUFBRSxDQUFDQyxRQUFRLENBQUNGLFdBQVcsQ0FBQyxJQUNwRHJFLENBQUMsQ0FBQ2hKLFFBQVEsQ0FBQ3NOLFdBQVcsRUFBRSxDQUFDQyxRQUFRLENBQUNGLFdBQVcsQ0FBQyxJQUM5Q3JFLENBQUMsQ0FBQzVHLFlBQVksQ0FBQ21MLFFBQVEsQ0FBQ2QsTUFBTSxDQUFDO0VBRW5DLEVBQUEsQ0FBQyxDQUFDO0VBRUYsRUFBQSxJQUFJelMsT0FBTyxFQUFFO0VBQ1gsSUFBQSxvQkFDRWdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtRQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDRSxNQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUFDQyxNQUFBQSxjQUFjLEVBQUMsUUFBUTtFQUFDQyxNQUFBQSxNQUFNLEVBQUM7RUFBTyxLQUFBLGVBQ2xFUCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUNOLENBQUM7RUFFVixFQUFBO0VBRUEsRUFBQSxvQkFDRVIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN1QixJQUFBQSxPQUFPLEVBQUMsTUFBTTtFQUFDQyxJQUFBQSxDQUFDLEVBQUM7RUFBSyxHQUFBLGVBQ3pCMUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQyxlQUFlO0VBQUNELElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxFQUFFLEVBQUM7RUFBSyxHQUFBLGVBQ25FNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDNEIsZUFBRSxFQUFBLElBQUEsRUFBQyxvQkFBa0IsRUFBQ2tLLFFBQVEsQ0FBQ3pKLE1BQU0sRUFBQyxHQUFLLENBQUMsZUFDN0N0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ3dCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDL0IvQixzQkFBQSxDQUFBQyxhQUFBLENBQUMwSCxrQkFBSyxFQUFBO0VBQ0o3QixJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUNYaUMsSUFBQUEsV0FBVyxFQUFDLG9CQUFvQjtFQUNoQ0gsSUFBQUEsS0FBSyxFQUFFNkgsTUFBTztNQUNkNUgsUUFBUSxFQUFHVCxDQUFDLElBQUtzSSxTQUFTLENBQUN0SSxDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQzNDakcsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRTtFQUFRO0VBQUUsR0FDM0IsQ0FBQyxlQUNGbkIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUFDN0IsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFBQzhCLElBQUFBLE9BQU8sRUFBRXNNO0VBQWEsR0FBQSxlQUM5QzdQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lDLGlCQUFJLEVBQUE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLFdBQVc7RUFBQ3NFLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUUsQ0FBQyxFQUFBLFNBRTNCLENBQ0wsQ0FDRixDQUFDLEVBRUwwSixnQkFBZ0IsQ0FBQzdOLE1BQU0sS0FBSyxDQUFDLGdCQUM1QnRDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGOEQsSUFBQUEsRUFBRSxFQUFDLE9BQU87RUFDVnRDLElBQUFBLENBQUMsRUFBQyxLQUFLO0VBQ1BDLElBQUFBLEtBQUssRUFBRTtFQUFFYixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFMFAsTUFBQUEsU0FBUyxFQUFFO0VBQVM7RUFBRSxHQUFBLGVBRXBEeFEsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsT0FBTztFQUFDQyxJQUFBQSxJQUFJLEVBQUUsRUFBRztFQUFDTixJQUFBQSxLQUFLLEVBQUM7RUFBUSxHQUFFLENBQUMsZUFDOUM5QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ0MsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ29CLElBQUFBLEtBQUssRUFBQztLQUFRLEVBQUMsa0NBQXNDLENBQ2hFLENBQUMsZ0JBRU45QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFDRkMsSUFBSSxFQUFBLElBQUE7RUFDSkMsSUFBQUEsYUFBYSxFQUFDLEtBQUs7RUFDbkJ1QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFBRTBKLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0tBQUUsRUFFeEMwRSxnQkFBZ0IsQ0FBQ3ZOLEdBQUcsQ0FBRXFOLE9BQU8saUJBQzVCalEsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQ0Y0QyxHQUFHLEVBQUVtTixPQUFPLENBQUNyUSxFQUFHO0VBQ2hCb0UsSUFBQUEsRUFBRSxFQUFDLE9BQU87RUFDVnRDLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQ05DLElBQUFBLEtBQUssRUFBRTtFQUNMYixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQkMsTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q0ksTUFBQUEsS0FBSyxFQUFFLE9BQU87RUFDZEMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZmhCLE1BQUFBLGFBQWEsRUFBRTtFQUNqQjtFQUFFLEdBQUEsZUFHRkosc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQ0ZDLElBQUksRUFBQSxJQUFBO0VBQ0pHLElBQUFBLGNBQWMsRUFBQyxRQUFRO0VBQ3ZCc0IsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFDUEYsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFDTnNDLElBQUFBLEVBQUUsRUFBQyxRQUFRO0VBQ1hyQyxJQUFBQSxLQUFLLEVBQUU7RUFBRWIsTUFBQUEsWUFBWSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBRTlCbVAsT0FBTyxDQUFDekssU0FBUyxnQkFDaEJ4RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO01BQ0VnRyxHQUFHLEVBQUVnSyxPQUFPLENBQUN6SyxTQUFVO0VBQ3ZCVSxJQUFBQSxHQUFHLEVBQUMsU0FBUztFQUNidkUsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRSxPQUFPO0VBQUVaLE1BQUFBLE1BQU0sRUFBRTtFQUFRO0VBQUUsR0FDNUMsQ0FBQyxnQkFFRlAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQ0ZDLElBQUksRUFBQSxJQUFBO0VBQ0pFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQ25CQyxJQUFBQSxjQUFjLEVBQUMsUUFBUTtFQUN2QnFCLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUFFWixNQUFBQSxNQUFNLEVBQUU7RUFBUTtFQUFFLEdBQUEsZUFFM0NQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lDLGlCQUFJLEVBQUE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLFFBQVE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFFLEVBQUc7RUFBQ04sSUFBQUEsS0FBSyxFQUFDO0tBQVUsQ0FDM0MsQ0FFSixDQUFDLGVBR045QixzQkFBQSxDQUFBQyxhQUFBLENBQUMwRCxlQUFFLEVBQUE7RUFBQy9CLElBQUFBLEVBQUUsRUFBQztLQUFJLEVBQUVxTyxPQUFPLENBQUNsTixXQUFnQixDQUFDLGVBQ3RDL0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNxQixJQUFBQSxLQUFLLEVBQUMsUUFBUTtFQUFDRixJQUFBQSxFQUFFLEVBQUM7S0FBSSxFQUFFcU8sT0FBTyxDQUFDaEUsY0FBcUIsQ0FBQyxlQUU1RGpNLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDQyxJQUFJLEVBQUEsSUFBQTtFQUFDQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUFDdUIsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtPQUFRO0VBQUNILElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDN0Q1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0UsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTTtFQUFFLEdBQUEsZUFDbEQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNDLElBQUFBLElBQUksRUFBRSxFQUFHO0VBQUNOLElBQUFBLEtBQUssRUFBQztFQUFRLEdBQUUsQ0FBQyxlQUM3QzlCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUIsSUFBQUEsUUFBUSxFQUFDO0VBQUksR0FBQSxFQUFDLFFBQU0sRUFBQ2lPLE9BQU8sQ0FBQ2pOLFFBQWUsQ0FDL0MsQ0FBQyxlQUNOaEQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU07RUFBRSxHQUFBLGVBQ2xEL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUFDQyxJQUFBQSxJQUFJLEVBQUUsRUFBRztFQUFDTixJQUFBQSxLQUFLLEVBQUM7RUFBUSxHQUFFLENBQUMsZUFDakQ5QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VCLElBQUFBLFFBQVEsRUFBQztFQUFJLEdBQUEsRUFBQyxXQUFTLEVBQUNpTyxPQUFPLENBQUNoTixXQUFrQixDQUNyRCxDQUFDLGVBQ05qRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0UsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3NCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUU7RUFBTTtFQUFFLEdBQUEsZUFDbEQvQixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxPQUFPO0VBQUNDLElBQUFBLElBQUksRUFBRSxFQUFHO0VBQUNOLElBQUFBLEtBQUssRUFBQztFQUFRLEdBQUUsQ0FBQyxlQUM5QzlCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDdUIsSUFBQUEsUUFBUSxFQUFDO0tBQUksRUFBQyxZQUNSLEVBQUMsSUFBSWtCLElBQUksQ0FBQytNLE9BQU8sQ0FBQzdELFNBQVMsQ0FBQyxDQUFDMUksa0JBQWtCLEVBQ3JELENBQ0gsQ0FBQyxlQUNOMUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNFLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU07RUFBRSxHQUFBLGVBQ2xEL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUFDQyxJQUFBQSxJQUFJLEVBQUUsRUFBRztFQUFDTixJQUFBQSxLQUFLLEVBQUM7RUFBUSxHQUFFLENBQUMsZUFDakQ5QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VCLElBQUFBLFFBQVEsRUFBQztFQUFJLEdBQUEsRUFBQyxXQUFTLEVBQUNpTyxPQUFPLENBQUM5RCxPQUFjLENBQ2pELENBQ0YsQ0FBQyxlQUVObk0sc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMk8sa0JBQUssRUFBQTtFQUFDbk4sSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFBQ0csSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxFQUFDLFlBQWlCLENBQUMsZUFHbkQ1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0MsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEtBQUssRUFBRTtFQUFFSSxNQUFBQSxHQUFHLEVBQUUsS0FBSztFQUFFbU4sTUFBQUEsU0FBUyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBRXhFbFAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUN3QixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFO0VBQU07S0FBRSxFQUM3QmtPLE9BQU8sQ0FBQzdLLFlBQVksaUJBQ25CcEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUNMN0IsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFDakJXLElBQUFBLElBQUksRUFBQyxJQUFJO01BQ1RtQixPQUFPLEVBQUVBLE1BQU15TSxZQUFZLENBQUNDLE9BQU8sRUFBRSxVQUFVLENBQUU7RUFDakR0TyxJQUFBQSxLQUFLLEVBQUU7RUFBRXhCLE1BQUFBLElBQUksRUFBRTtFQUFFO0VBQUUsR0FBQSxlQUVuQkgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsZUFBZTtFQUFDc0UsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ3JFLElBQUFBLElBQUksRUFBRTtFQUFHLEdBQUUsQ0FBQyxFQUFBLFVBRXpDLENBQ1QsRUFDQTZOLE9BQU8sQ0FBQzVLLFlBQVksaUJBQ25CckYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUNMN0IsSUFBQUEsT0FBTyxFQUFDLE1BQU07RUFDZFcsSUFBQUEsSUFBSSxFQUFDLElBQUk7TUFDVG1CLE9BQU8sRUFBRUEsTUFBTXlNLFlBQVksQ0FBQ0MsT0FBTyxFQUFFLE9BQU8sQ0FBRTtFQUM5Q3RPLElBQUFBLEtBQUssRUFBRTtFQUFFeEIsTUFBQUEsSUFBSSxFQUFFO0VBQUU7RUFBRSxHQUFBLGVBRW5CSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQUNzRSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDckUsSUFBQUEsSUFBSSxFQUFFO0tBQUssQ0FBQyxTQUVoQyxDQUVQLENBQUMsZUFHTnBDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTDdCLElBQUFBLE9BQU8sRUFBQyxRQUFRO01BQ2hCOEIsT0FBTyxFQUFFQSxNQUFNdU0sY0FBYyxDQUFDRyxPQUFPLENBQUNGLFNBQVMsQ0FBRTtFQUNqRHhKLElBQUFBLFFBQVEsRUFBRW9KLFdBQVcsS0FBS00sT0FBTyxDQUFDRjtLQUFVLEVBRTNDSixXQUFXLEtBQUtNLE9BQU8sQ0FBQ0YsU0FBUyxnQkFDaEMvUCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUFDLGdCQUVWUixzQkFBQSxDQUFBQyxhQUFBLENBQUFELHNCQUFBLENBQUF3RyxRQUFBLEVBQUEsSUFBQSxlQUNFeEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsUUFBUTtFQUFDc0UsSUFBQUEsRUFBRSxFQUFDO0tBQU0sQ0FBQyxhQUU5QixDQUVFLENBQ0wsQ0FDRixDQUNOLENBQ0UsQ0FFSixDQUFDO0VBRVYsQ0FBQzs7RUNsTUQsTUFBTWdLLGVBQXNDLEdBQUdBLE1BQU07SUFDbkQsTUFBTSxDQUFDQyxnQkFBZ0IsRUFBRUMsbUJBQW1CLENBQUMsR0FBR3pULGNBQVEsQ0FBZ0IsSUFBSSxDQUFDO0lBQzdFLE1BQU0sQ0FBQzBULFVBQVUsRUFBRUMsYUFBYSxDQUFDLEdBQUczVCxjQUFRLENBQWdCLElBQUksQ0FBQztJQUNqRSxNQUFNLENBQUNGLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0MsTUFBTSxDQUFDNFQsVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBRzdULGNBQVEsQ0FBQyxLQUFLLENBQUM7SUFDbkQsTUFBTSxDQUFDOFQsVUFBVSxFQUFFQyxhQUFhLENBQUMsR0FBRy9ULGNBQVEsQ0FBMEIsSUFBSSxDQUFDO0lBQzNFLE1BQU0sQ0FBQ2dVLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdqVSxjQUFRLENBQXVCLElBQUksQ0FBQztJQUNsRSxNQUFNLENBQUM4SCxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHL0gsY0FBUSxDQUFxRCxJQUFJLENBQUM7SUFDaEcsTUFBTSxDQUFDa1UsZ0JBQWdCLEVBQUVDLG1CQUFtQixDQUFDLEdBQUduVSxjQUFRLENBQWdCLEVBQUUsQ0FBQztJQUUzRSxNQUFNb1UsZ0JBQTRELEdBQUlDLEtBQUssSUFBSztNQUM5RSxNQUFNQyxJQUFJLEdBQUdELEtBQUssQ0FBQ3pKLE1BQU0sQ0FBQzJKLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDcEMsSUFBSSxDQUFDRCxJQUFJLEVBQUU7RUFFWCxJQUFBLElBQUksQ0FBQ0EsSUFBSSxDQUFDaEosSUFBSSxDQUFDOEgsV0FBVyxFQUFFLENBQUNvQixRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7RUFDN0N6TSxNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQTRCLE9BQUMsQ0FBQztFQUNoRSxNQUFBO0VBQ0YsSUFBQTtFQUVBNEssSUFBQUEsbUJBQW1CLENBQUNhLElBQUksQ0FBQ2hKLElBQUksQ0FBQztNQUM5QjJJLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEJGLGFBQWEsQ0FBQyxJQUFJLENBQUM7TUFDbkJoTSxVQUFVLENBQUMsSUFBSSxDQUFDO01BQ2hCb00sbUJBQW1CLENBQUMsRUFBRSxDQUFDO0VBRXZCLElBQUEsTUFBTU0sTUFBTSxHQUFHLElBQUlDLFVBQVUsRUFBRTtNQUMvQkQsTUFBTSxDQUFDRSxNQUFNLEdBQUcsWUFBWTtFQUMxQixNQUFBLE1BQU05TCxJQUFJLEdBQUcsT0FBTzRMLE1BQU0sQ0FBQ0csTUFBTSxLQUFLLFFBQVEsR0FBR0gsTUFBTSxDQUFDRyxNQUFNLEdBQUcsRUFBRTtRQUNuRWpCLGFBQWEsQ0FBQzlLLElBQUksQ0FBQztRQUNuQixNQUFNZ00sV0FBVyxDQUFDaE0sSUFBSSxDQUFDO01BQ3pCLENBQUM7TUFDRDRMLE1BQU0sQ0FBQ0ssT0FBTyxHQUFHLE1BQU07RUFDckIvTSxNQUFBQSxVQUFVLENBQUM7RUFBRWEsUUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsUUFBQUEsSUFBSSxFQUFFO0VBQTZDLE9BQUMsQ0FBQztNQUNuRixDQUFDO0VBQ0Q0TCxJQUFBQSxNQUFNLENBQUNNLFVBQVUsQ0FBQ1QsSUFBSSxDQUFDO0lBQ3pCLENBQUM7RUFFRCxFQUFBLE1BQU1PLFdBQVcsR0FBRyxNQUFPRyxPQUFlLElBQUs7TUFDN0NuQixhQUFhLENBQUMsSUFBSSxDQUFDO01BQ25CRSxhQUFhLENBQUMsSUFBSSxDQUFDO01BRW5CLElBQUk7RUFDRixNQUFBLE1BQU1wUixHQUFHLEdBQUcsTUFBTWYsS0FBSyxDQUFDLHVDQUF1QyxFQUFFO0VBQy9EZ0IsUUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZDRGLFFBQUFBLE9BQU8sRUFBRTtFQUFFLFVBQUEsY0FBYyxFQUFFO1dBQW9CO0VBQy9DM0csUUFBQUEsV0FBVyxFQUFFLFNBQVM7RUFDdEI0RyxRQUFBQSxJQUFJLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO0VBQUUrSyxVQUFBQSxVQUFVLEVBQUVzQjtXQUFTO0VBQzlDLE9BQUMsQ0FBQztFQUVGLE1BQUEsTUFBTTNNLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7RUFFN0IsTUFBQSxJQUFJLENBQUNXLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1hpRyxRQUFBQSxVQUFVLENBQUM7RUFBRWEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUEwQixTQUFDLENBQUM7RUFDOUUsUUFBQTtFQUNGLE1BQUE7RUFFQSxNQUFBLE1BQU1tTixjQUFjLEdBQUc1TSxJQUFJLENBQUM0TSxjQUFjLElBQUksQ0FBQztFQUMvQyxNQUFBLE1BQU1DLFFBQVEsR0FBRzdNLElBQUksQ0FBQzZNLFFBQVEsSUFBSSxDQUFDO0VBQ25DLE1BQUEsTUFBTUMsUUFBUSxHQUFHOU0sSUFBSSxDQUFDK00sUUFBUSxJQUFJLENBQUM7RUFDbkMsTUFBQSxNQUFNQyxhQUFhLEdBQUdoTixJQUFJLENBQUNpTixPQUFPLElBQUksQ0FBQztFQUN2QyxNQUFBLE1BQU1DLGFBQWEsR0FBR2xOLElBQUksQ0FBQ21OLFlBQVksSUFBSSxDQUFDO0VBQzVDLE1BQUEsTUFBTUMsWUFBWSxHQUFHQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3ROLElBQUksQ0FBQ29OLFlBQVksQ0FBQyxHQUFHcE4sSUFBSSxDQUFDb04sWUFBWSxHQUFHLEVBQUU7RUFFOUUxQixNQUFBQSxhQUFhLENBQUM7RUFDWjZCLFFBQUFBLFNBQVMsRUFBRVgsY0FBYztVQUN6QlksU0FBUyxFQUFFWixjQUFjLEdBQUdDLFFBQVE7VUFDcENDLFFBQVE7VUFDUkUsYUFBYTtVQUNiRSxhQUFhO0VBQ2JFLFFBQUFBO0VBQ0YsT0FBQyxDQUFDO1FBRUZ0QixtQkFBbUIsQ0FBQ3NCLFlBQVksQ0FBQztRQUVqQyxJQUFJUCxRQUFRLEdBQUcsQ0FBQyxFQUFFO0VBQ2hCbk4sUUFBQUEsVUFBVSxDQUFDO0VBQ1RhLFVBQUFBLElBQUksRUFBRSxPQUFPO1lBQ2JDLElBQUksRUFBRSxHQUFHcU0sUUFBUSxDQUFBLDJEQUFBO0VBQ25CLFNBQUMsQ0FBQztFQUNKLE1BQUEsQ0FBQyxNQUFNO0VBQ0xuTixRQUFBQSxVQUFVLENBQUM7RUFDVGEsVUFBQUEsSUFBSSxFQUFFLFNBQVM7RUFDZkMsVUFBQUEsSUFBSSxFQUFFLENBQUEsaUJBQUEsRUFBb0JzTSxRQUFRLENBQUEsWUFBQSxFQUFlRSxhQUFhLG9CQUFvQkUsYUFBYSxDQUFBLHVCQUFBO0VBQ2pHLFNBQUMsQ0FBQztFQUNKLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT2hULEtBQUssRUFBRTtFQUNkd0YsTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUFvRCxPQUFDLENBQUM7RUFDMUYsSUFBQSxDQUFDLFNBQVM7UUFDUmdMLGFBQWEsQ0FBQyxLQUFLLENBQUM7RUFDdEIsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU1pQyxZQUFZLEdBQUcsWUFBWTtNQUMvQixJQUFJLENBQUNwQyxVQUFVLEVBQUU7RUFDZjNMLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBa0MsT0FBQyxDQUFDO0VBQ3RFLE1BQUE7RUFDRixJQUFBO01BRUE5SSxVQUFVLENBQUMsSUFBSSxDQUFDO01BQ2hCZ0ksVUFBVSxDQUFDLElBQUksQ0FBQztNQUNoQmtNLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFFaEIsSUFBSTtFQUNGLE1BQUEsTUFBTXRSLEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMseUJBQXlCLEVBQUU7RUFDakRnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNEYsUUFBQUEsT0FBTyxFQUFFO0VBQUUsVUFBQSxjQUFjLEVBQUU7V0FBb0I7RUFDL0MzRyxRQUFBQSxXQUFXLEVBQUUsU0FBUztFQUN0QjRHLFFBQUFBLElBQUksRUFBRUMsSUFBSSxDQUFDQyxTQUFTLENBQUM7RUFBRStLLFVBQUFBO1dBQVk7RUFDckMsT0FBQyxDQUFDO0VBRUYsTUFBQSxNQUFNckwsSUFBSSxHQUFHLE1BQU0xRixHQUFHLENBQUNYLElBQUksRUFBRTtFQUU3QixNQUFBLElBQUksQ0FBQ1csR0FBRyxDQUFDYixFQUFFLEVBQUU7RUFDWGlHLFFBQUFBLFVBQVUsQ0FBQztFQUFFYSxVQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxVQUFBQSxJQUFJLEVBQUVSLElBQUksQ0FBQ1AsT0FBTyxJQUFJO0VBQTBCLFNBQUMsQ0FBQztFQUM5RSxRQUFBO0VBQ0YsTUFBQTtFQUVBLE1BQUEsTUFBTTJOLFlBQVksR0FBR0MsS0FBSyxDQUFDQyxPQUFPLENBQUN0TixJQUFJLENBQUNvTixZQUFZLENBQUMsR0FBR3BOLElBQUksQ0FBQ29OLFlBQVksR0FBRyxFQUFFO0VBRTlFeEIsTUFBQUEsVUFBVSxDQUFDO0VBQ1RnQixRQUFBQSxjQUFjLEVBQUU1TSxJQUFJLENBQUM0TSxjQUFjLElBQUksQ0FBQztFQUN4Q0csUUFBQUEsUUFBUSxFQUFFL00sSUFBSSxDQUFDK00sUUFBUSxJQUFJLENBQUM7RUFDNUJFLFFBQUFBLE9BQU8sRUFBRWpOLElBQUksQ0FBQ2lOLE9BQU8sSUFBSSxDQUFDO0VBQzFCSixRQUFBQSxRQUFRLEVBQUU3TSxJQUFJLENBQUM2TSxRQUFRLElBQUksQ0FBQztVQUM1Qk8sWUFBWTtFQUNaRCxRQUFBQSxZQUFZLEVBQUVuTixJQUFJLENBQUNtTixZQUFZLElBQUksQ0FBQztFQUNwQ08sUUFBQUEsWUFBWSxFQUFFMU4sSUFBSSxDQUFDME4sWUFBWSxJQUFJLENBQUM7RUFDcENDLFFBQUFBLGtCQUFrQixFQUFFTixLQUFLLENBQUNDLE9BQU8sQ0FBQ3ROLElBQUksQ0FBQzJOLGtCQUFrQixDQUFDLEdBQUczTixJQUFJLENBQUMyTixrQkFBa0IsR0FBRztFQUN6RixPQUFDLENBQUM7UUFFRjdCLG1CQUFtQixDQUFDc0IsWUFBWSxDQUFDO1FBQ2pDMUIsYUFBYSxDQUFDLElBQUksQ0FBQztFQUVuQixNQUFBLElBQUkxTCxJQUFJLENBQUMrTSxRQUFRLEdBQUcsQ0FBQyxFQUFFO0VBQ3JCck4sUUFBQUEsVUFBVSxDQUFDO0VBQ1RhLFVBQUFBLElBQUksRUFBRSxTQUFTO1lBQ2ZDLElBQUksRUFBRSxxQkFBcUJSLElBQUksQ0FBQytNLFFBQVEsQ0FBQSxpQkFBQSxFQUFvQi9NLElBQUksQ0FBQ21OLFlBQVksQ0FBQSx1QkFBQTtFQUMvRSxTQUFDLENBQUM7RUFDSixNQUFBLENBQUMsTUFBTTtFQUNMek4sUUFBQUEsVUFBVSxDQUFDO0VBQ1RhLFVBQUFBLElBQUksRUFBRSxTQUFTO0VBQ2ZDLFVBQUFBLElBQUksRUFBRTtFQUNSLFNBQUMsQ0FBQztFQUNKLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT3RHLEtBQUssRUFBRTtFQUNkd0YsTUFBQUEsVUFBVSxDQUFDO0VBQUVhLFFBQUFBLElBQUksRUFBRSxPQUFPO0VBQUVDLFFBQUFBLElBQUksRUFBRTtFQUFtRCxPQUFDLENBQUM7RUFDekYsSUFBQSxDQUFDLFNBQVM7UUFDUjlJLFVBQVUsQ0FBQyxLQUFLLENBQUM7RUFDbkIsSUFBQTtJQUNGLENBQUM7RUFFRCxFQUFBLE1BQU1rVyxtQkFBbUIsR0FBRyxZQUFZO0VBQ3RDLElBQUEsSUFBSS9CLGdCQUFnQixDQUFDOU8sTUFBTSxLQUFLLENBQUMsRUFBRTtNQUVuQ3JGLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEJnSSxVQUFVLENBQUMsSUFBSSxDQUFDOztFQUVoQjtFQUNBLElBQUEsTUFBTVMsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO0VBQ2hHLElBQUEsTUFBTTBOLElBQUksR0FBR2hDLGdCQUFnQixDQUFDeE8sR0FBRyxDQUFFeVEsQ0FBQyxJQUFLLENBQ3ZDQSxDQUFDLENBQUM5TixJQUFJLENBQUMzRixFQUFFLEVBQ1R5VCxDQUFDLENBQUM5TixJQUFJLENBQUNpRCxJQUFJLEVBQ1g2SyxDQUFDLENBQUM5TixJQUFJLENBQUNvRSxPQUFPLEVBQ2QwSixDQUFDLENBQUM5TixJQUFJLENBQUMyQyxLQUFLLEVBQ1ptTCxDQUFDLENBQUM5TixJQUFJLENBQUMySSxLQUFLLEVBQ1ptRixDQUFDLENBQUM5TixJQUFJLENBQUNtRSxRQUFRLEVBQ2YySixDQUFDLENBQUM5TixJQUFJLENBQUNqQixNQUFNLENBQ2QsQ0FBQzFCLEdBQUcsQ0FBRW9KLENBQUMsSUFBSyxDQUFBLENBQUEsRUFBSSxDQUFDQSxDQUFDLElBQUksRUFBRSxFQUFFekgsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQyxDQUFDK08sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBRTdELElBQUEsTUFBTUMsZUFBZSxHQUFHLENBQUM3TixPQUFPLENBQUM0TixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBR0YsSUFBSSxDQUFDLENBQUNFLElBQUksQ0FBQyxJQUFJLENBQUM7TUFFL0QsSUFBSTtFQUNGLE1BQUEsTUFBTXpULEdBQUcsR0FBRyxNQUFNZixLQUFLLENBQUMseUJBQXlCLEVBQUU7RUFDakRnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNEYsUUFBQUEsT0FBTyxFQUFFO0VBQUUsVUFBQSxjQUFjLEVBQUU7V0FBb0I7RUFDL0MzRyxRQUFBQSxXQUFXLEVBQUUsU0FBUztFQUN0QjRHLFFBQUFBLElBQUksRUFBRUMsSUFBSSxDQUFDQyxTQUFTLENBQUM7RUFBRStLLFVBQUFBLFVBQVUsRUFBRTJDO1dBQWlCO0VBQ3RELE9BQUMsQ0FBQztFQUVGLE1BQUEsTUFBTWhPLElBQUksR0FBRyxNQUFNMUYsR0FBRyxDQUFDWCxJQUFJLEVBQUU7RUFFN0IsTUFBQSxJQUFJLENBQUNXLEdBQUcsQ0FBQ2IsRUFBRSxFQUFFO0VBQ1hpRyxRQUFBQSxVQUFVLENBQUM7RUFBRWEsVUFBQUEsSUFBSSxFQUFFLE9BQU87RUFBRUMsVUFBQUEsSUFBSSxFQUFFUixJQUFJLENBQUNQLE9BQU8sSUFBSTtFQUEwQixTQUFDLENBQUM7RUFDOUUsUUFBQTtFQUNGLE1BQUE7RUFFQSxNQUFBLE1BQU13TyxlQUFlLEdBQUdaLEtBQUssQ0FBQ0MsT0FBTyxDQUFDdE4sSUFBSSxDQUFDb04sWUFBWSxDQUFDLEdBQUdwTixJQUFJLENBQUNvTixZQUFZLEdBQUcsRUFBRTs7RUFFakY7UUFDQXhCLFVBQVUsQ0FBRXBILElBQUksSUFBSztVQUNuQixJQUFJLENBQUNBLElBQUksRUFBRTtZQUNULE9BQU87RUFDTG9JLFlBQUFBLGNBQWMsRUFBRTVNLElBQUksQ0FBQzRNLGNBQWMsSUFBSSxDQUFDO0VBQ3hDRyxZQUFBQSxRQUFRLEVBQUUvTSxJQUFJLENBQUMrTSxRQUFRLElBQUksQ0FBQztFQUM1QkUsWUFBQUEsT0FBTyxFQUFFak4sSUFBSSxDQUFDaU4sT0FBTyxJQUFJLENBQUM7RUFDMUJKLFlBQUFBLFFBQVEsRUFBRTdNLElBQUksQ0FBQzZNLFFBQVEsSUFBSSxDQUFDO0VBQzVCTyxZQUFBQSxZQUFZLEVBQUVhLGVBQWU7RUFDN0JkLFlBQUFBLFlBQVksRUFBRW5OLElBQUksQ0FBQ21OLFlBQVksSUFBSSxDQUFDO0VBQ3BDTyxZQUFBQSxZQUFZLEVBQUUxTixJQUFJLENBQUMwTixZQUFZLElBQUksQ0FBQztFQUNwQ0MsWUFBQUEsa0JBQWtCLEVBQUVOLEtBQUssQ0FBQ0MsT0FBTyxDQUFDdE4sSUFBSSxDQUFDMk4sa0JBQWtCLENBQUMsR0FBRzNOLElBQUksQ0FBQzJOLGtCQUFrQixHQUFHO2FBQ3hGO0VBQ0gsUUFBQTtVQUNBLE9BQU87RUFDTCxVQUFBLEdBQUduSixJQUFJO1lBQ1B1SSxRQUFRLEVBQUV2SSxJQUFJLENBQUN1SSxRQUFRLElBQUkvTSxJQUFJLENBQUMrTSxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQzlDRixRQUFRLEVBQUVvQixlQUFlLENBQUNsUixNQUFNO0VBQ2hDcVEsVUFBQUEsWUFBWSxFQUFFYSxlQUFlO1lBQzdCZCxZQUFZLEVBQUUzSSxJQUFJLENBQUMySSxZQUFZLElBQUluTixJQUFJLENBQUNtTixZQUFZLElBQUksQ0FBQyxDQUFDO1lBQzFEUSxrQkFBa0IsRUFBRSxDQUNsQixHQUFHbkosSUFBSSxDQUFDbUosa0JBQWtCLEVBQzFCLElBQUlOLEtBQUssQ0FBQ0MsT0FBTyxDQUFDdE4sSUFBSSxDQUFDMk4sa0JBQWtCLENBQUMsR0FBRzNOLElBQUksQ0FBQzJOLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztXQUU3RTtFQUNILE1BQUEsQ0FBQyxDQUFDO1FBRUY3QixtQkFBbUIsQ0FBQ21DLGVBQWUsQ0FBQztFQUVwQyxNQUFBLElBQUlqTyxJQUFJLENBQUMrTSxRQUFRLEdBQUcsQ0FBQyxFQUFFO0VBQ3JCck4sUUFBQUEsVUFBVSxDQUFDO0VBQ1RhLFVBQUFBLElBQUksRUFBRSxTQUFTO1lBQ2ZDLElBQUksRUFBRSxxQkFBcUJSLElBQUksQ0FBQytNLFFBQVEsQ0FBQSxzQkFBQSxFQUF5Qi9NLElBQUksQ0FBQ21OLFlBQVksQ0FBQSxlQUFBLEVBQWtCYyxlQUFlLENBQUNsUixNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUEsQ0FBQSxFQUFJa1IsZUFBZSxDQUFDbFIsTUFBTSxDQUFBLG1CQUFBLENBQXFCLEdBQUcsRUFBRSxDQUFBO0VBQ3ZMLFNBQUMsQ0FBQztFQUNKLE1BQUEsQ0FBQyxNQUFNLElBQUlrUixlQUFlLENBQUNsUixNQUFNLEdBQUcsQ0FBQyxFQUFFO0VBQ3JDMkMsUUFBQUEsVUFBVSxDQUFDO0VBQ1RhLFVBQUFBLElBQUksRUFBRSxPQUFPO0VBQ2JDLFVBQUFBLElBQUksRUFBRSxDQUFBLE1BQUEsRUFBU3lOLGVBQWUsQ0FBQ2xSLE1BQU0sQ0FBQSwwQ0FBQTtFQUN2QyxTQUFDLENBQUM7RUFDSixNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU83QyxLQUFLLEVBQUU7RUFDZHdGLE1BQUFBLFVBQVUsQ0FBQztFQUFFYSxRQUFBQSxJQUFJLEVBQUUsT0FBTztFQUFFQyxRQUFBQSxJQUFJLEVBQUU7RUFBbUQsT0FBQyxDQUFDO0VBQ3pGLElBQUEsQ0FBQyxTQUFTO1FBQ1I5SSxVQUFVLENBQUMsS0FBSyxDQUFDO0VBQ25CLElBQUE7SUFDRixDQUFDO0lBRUQsTUFBTXdXLGlCQUFpQixHQUFHQSxDQUFDQyxLQUFhLEVBQUVDLEtBQTRCLEVBQUUvTCxLQUFhLEtBQUs7TUFDeEZ5SixtQkFBbUIsQ0FBRXRILElBQUksSUFBSztFQUM1QixNQUFBLE1BQU02SixPQUFPLEdBQUcsQ0FBQyxHQUFHN0osSUFBSSxDQUFDO1FBQ3pCNkosT0FBTyxDQUFDRixLQUFLLENBQUMsR0FBRztVQUNmLEdBQUdFLE9BQU8sQ0FBQ0YsS0FBSyxDQUFDO0VBQ2pCbk8sUUFBQUEsSUFBSSxFQUFFO0VBQUUsVUFBQSxHQUFHcU8sT0FBTyxDQUFDRixLQUFLLENBQUMsQ0FBQ25PLElBQUk7RUFBRSxVQUFBLENBQUNvTyxLQUFLLEdBQUcvTDtFQUFNO1NBQ2hEO0VBQ0QsTUFBQSxPQUFPZ00sT0FBTztFQUNoQixJQUFBLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNQyxpQkFBaUIsR0FBR0EsTUFBTTtNQUM5QixJQUFJLENBQUMzQyxPQUFPLElBQUksQ0FBQ0EsT0FBTyxDQUFDZ0Msa0JBQWtCLENBQUM1USxNQUFNLEVBQUU7TUFFcEQsTUFBTW9ELE9BQU8sR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQztNQUN4RCxNQUFNME4sSUFBSSxHQUFHbEMsT0FBTyxDQUFDZ0Msa0JBQWtCLENBQUN0USxHQUFHLENBQUVrUixDQUFDLElBQUssQ0FDakQsQ0FBQSxDQUFBLEVBQUlBLENBQUMsQ0FBQ3RMLElBQUksQ0FBQ2pFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUEsQ0FBQSxDQUFHLEVBQ2pDLENBQUEsQ0FBQSxFQUFJdVAsQ0FBQyxDQUFDNUwsS0FBSyxDQUFDM0QsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFBLENBQUcsRUFDbEMsQ0FBQSxDQUFBLEVBQUl1UCxDQUFDLENBQUNDLFFBQVEsQ0FBQSxDQUFBLENBQUcsRUFDakIsQ0FBQSxDQUFBLEVBQUksQ0FBQ0QsQ0FBQyxDQUFDbkssT0FBTyxJQUFJLEVBQUUsRUFBRXBGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUEsQ0FBQSxDQUFHLENBQzdDLENBQUM7RUFFRixJQUFBLE1BQU15UCxPQUFPLEdBQUcsQ0FBQ3RPLE9BQU8sQ0FBQzROLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHRixJQUFJLENBQUN4USxHQUFHLENBQUV5USxDQUFDLElBQUtBLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQ0EsSUFBSSxDQUFDLElBQUksQ0FBQztNQUMvRSxNQUFNaEosSUFBSSxHQUFHLElBQUkySixJQUFJLENBQUMsQ0FBQ0QsT0FBTyxDQUFDLEVBQUU7RUFBRWxPLE1BQUFBLElBQUksRUFBRTtFQUEwQixLQUFDLENBQUM7RUFDckUsSUFBQSxNQUFNeUUsR0FBRyxHQUFHQyxHQUFHLENBQUNDLGVBQWUsQ0FBQ0gsSUFBSSxDQUFDO0VBQ3JDLElBQUEsTUFBTTRKLElBQUksR0FBRzVWLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQyxHQUFHLENBQUM7TUFDeENpVSxJQUFJLENBQUN2SixJQUFJLEdBQUdKLEdBQUc7TUFDZjJKLElBQUksQ0FBQ3RKLFFBQVEsR0FBRyxDQUFBLGlCQUFBLEVBQW9CLElBQUkxSCxJQUFJLEVBQUUsQ0FBQ3FHLFdBQVcsRUFBRSxDQUFDQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsSUFBQSxDQUFNO0VBQ2hGbEwsSUFBQUEsUUFBUSxDQUFDcUgsSUFBSSxDQUFDa0YsV0FBVyxDQUFDcUosSUFBSSxDQUFDO01BQy9CQSxJQUFJLENBQUNwSixLQUFLLEVBQUU7RUFDWnhNLElBQUFBLFFBQVEsQ0FBQ3FILElBQUksQ0FBQ29GLFdBQVcsQ0FBQ21KLElBQUksQ0FBQztFQUMvQjFKLElBQUFBLEdBQUcsQ0FBQ1EsZUFBZSxDQUFDVCxHQUFHLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU00SixtQkFBbUIsR0FBR25ELFVBQVUsSUFBSUEsVUFBVSxDQUFDMkIsWUFBWSxDQUFDclEsTUFBTSxHQUFHLENBQUM7RUFDNUUsRUFBQSxNQUFNOFIsY0FBYyxHQUFHbEQsT0FBTyxJQUFJQSxPQUFPLENBQUNnQyxrQkFBa0IsSUFBSWhDLE9BQU8sQ0FBQ2dDLGtCQUFrQixDQUFDNVEsTUFBTSxHQUFHLENBQUM7RUFDckcsRUFBQSxNQUFNK1IsbUJBQW1CLEdBQUdqRCxnQkFBZ0IsQ0FBQzlPLE1BQU0sR0FBRyxDQUFDO0VBRXZELEVBQUEsb0JBQ0V0QyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLElBQUFBLENBQUMsRUFBQztFQUFLLEdBQUEsZUFDVjFCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29DLGVBQUUsRUFBQTtFQUFDVCxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQUMsbUJBQXFCLENBQUMsZUFFbEM1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ21CLElBQUFBLEVBQUUsRUFBQztLQUFJLEVBQUMsOERBRVosZUFBQTVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBSyxDQUFDLGVBQ05ELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxFQUFRLDZFQUFtRixDQUN2RixDQUFDLGVBR1BELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNGMEIsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFDUEYsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFDTnNDLElBQUFBLEVBQUUsRUFBQyxRQUFRO01BQ1g3RCxJQUFJLEVBQUEsSUFBQTtFQUNKQyxJQUFBQSxhQUFhLEVBQUMsUUFBUTtFQUN0QkMsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFDbkJDLElBQUFBLGNBQWMsRUFBQyxRQUFRO0VBQ3ZCcUIsSUFBQUEsS0FBSyxFQUFFO0VBQUViLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVHLE1BQUFBLE1BQU0sRUFBRTtFQUFrQjtFQUFFLEdBQUEsZUFFMURqQixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQyxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLElBQUksRUFBQyxRQUFRO0VBQUNDLElBQUFBLElBQUksRUFBRSxFQUFHO0VBQUNSLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUUsQ0FBQyxlQUN4QzVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDbUIsSUFBQUEsRUFBRSxFQUFDO0tBQUksRUFDVjhPLGdCQUFnQixHQUFHLENBQUEsVUFBQSxFQUFhQSxnQkFBZ0IsQ0FBQSxDQUFFLEdBQUcsNkJBQ2xELENBQUMsZUFDUDFRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFDRTZGLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQ1h3TyxJQUFBQSxNQUFNLEVBQUMsZUFBZTtFQUN0QnpNLElBQUFBLFFBQVEsRUFBRXlKLGdCQUFpQjtFQUMzQjNQLElBQUFBLEtBQUssRUFBRTtFQUFFdU4sTUFBQUEsU0FBUyxFQUFFO0VBQU07S0FDM0IsQ0FBQyxFQUNENEIsVUFBVSxpQkFDVDlRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDUSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtNQUFDUCxJQUFJLEVBQUEsSUFBQTtFQUFDRSxJQUFBQSxVQUFVLEVBQUM7RUFBUSxHQUFBLGVBQ25DTCxzQkFBQSxDQUFBQyxhQUFBLENBQUNPLG1CQUFNLEVBQUEsSUFBRSxDQUFDLGVBQ1ZSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDaUcsSUFBQUEsRUFBRSxFQUFDO0tBQUksRUFBQyxlQUFtQixDQUM5QixDQUVKLENBQUMsRUFHTDFCLE9BQU8saUJBQ05oRixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29HLHVCQUFVLEVBQUE7TUFDVHJCLE9BQU8sRUFBRUEsT0FBTyxDQUFDZSxJQUFLO01BQ3RCdEUsT0FBTyxFQUFFdUQsT0FBTyxDQUFDYyxJQUFLO0VBQ3RCUSxJQUFBQSxZQUFZLEVBQUVBLE1BQU1yQixVQUFVLENBQUMsSUFBSTtFQUFFLEdBQ3RDLENBQ0UsQ0FDTixFQUdBK0wsVUFBVSxJQUFJLENBQUNtRCxtQkFBbUIsaUJBQ2pDblUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDRixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRUcsTUFBQUEsTUFBTSxFQUFFO0VBQW9CO0VBQUUsR0FBQSxlQUMxR2pCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDbUIsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ29FLElBQUFBLFVBQVUsRUFBQyxNQUFNO0VBQUNyRSxJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsU0FDekQsRUFBQ2tQLFVBQVUsQ0FBQytCLFNBQVMsRUFBQyw4QkFDcEIsQ0FBQyxlQUNQL1Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN5QixJQUFBQSxLQUFLLEVBQUU7RUFBRVAsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRW1ULE1BQUFBLG1CQUFtQixFQUFFLGdCQUFnQjtFQUFFeFMsTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQ2xGL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRTBQLE1BQUFBLFNBQVMsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRnhRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVnRSxNQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUFFbEUsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFFa1AsVUFBVSxDQUFDcUIsUUFBZSxDQUFDLGVBQ3JHclMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUYsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFDLFdBQWUsQ0FDakUsQ0FBQyxlQUNOOUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRTBQLE1BQUFBLFNBQVMsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRnhRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVnRSxNQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUFFbEUsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFFa1AsVUFBVSxDQUFDdUIsYUFBb0IsQ0FBQyxlQUMxR3ZTLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVGLE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFBQyxnQkFBb0IsQ0FDdEUsQ0FBQyxlQUNOOUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRTBQLE1BQUFBLFNBQVMsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRnhRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVnRSxNQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUFFbEUsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFFa1AsVUFBVSxDQUFDeUIsYUFBb0IsQ0FBQyxlQUMxR3pTLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVGLE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUFDLGlCQUFxQixDQUN2RSxDQUNGLENBQ0YsQ0FDTixFQUdBLENBQUN1UyxtQkFBbUIsaUJBQ25CclUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Y1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNxRCxtQkFBTSxFQUFBO0VBQ0w3QixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQjhCLElBQUFBLE9BQU8sRUFBRXlQLFlBQWE7RUFDdEJ6TSxJQUFBQSxRQUFRLEVBQUUsQ0FBQ3FLLFVBQVUsSUFBSTVULE9BQU8sSUFBSThULFVBQVUsSUFBSXFEO0tBQW9CLEVBRXJFblgsT0FBTyxnQkFBR2dELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQUMsZ0JBQ25CUixzQkFBQSxDQUFBQyxhQUFBLENBQUFELHNCQUFBLENBQUF3RyxRQUFBLHFCQUNFeEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsWUFBWTtFQUFDc0UsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBRSxDQUFDLEVBQUEsY0FFbEMsQ0FFRSxDQUNMLENBQ04sRUFHQTROLG1CQUFtQixpQkFDbEJyVSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNGLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRTtFQUFFWCxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUFFRixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFRyxNQUFBQSxNQUFNLEVBQUU7RUFBb0I7RUFBRSxHQUFBLGVBQzFHakIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNHLElBQUFBLGNBQWMsRUFBQyxlQUFlO0VBQUNELElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUN1QixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ2xFNUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUN1RixJQUFBQSxVQUFVLEVBQUMsTUFBTTtFQUFDckUsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFDakRzUCxnQkFBZ0IsQ0FBQzlPLE1BQU0sRUFBQyx1Q0FDckIsQ0FBQyxlQUNQdEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUQsbUJBQU0sRUFBQTtFQUFDN0IsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFBQ1csSUFBQUEsSUFBSSxFQUFDLElBQUk7RUFBQ21CLElBQUFBLE9BQU8sRUFBRTRQLG1CQUFvQjtFQUFDNU0sSUFBQUEsUUFBUSxFQUFFdko7S0FBUSxFQUNqRkEsT0FBTyxnQkFBR2dELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ08sbUJBQU0sRUFBQSxJQUFFLENBQUMsZ0JBQ25CUixzQkFBQSxDQUFBQyxhQUFBLENBQUFELHNCQUFBLENBQUF3RyxRQUFBLHFCQUNFeEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsV0FBVztFQUFDc0UsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBRSxDQUFDLEVBQUEsZ0JBQ25CLEVBQUMySyxnQkFBZ0IsQ0FBQzlPLE1BQU0sRUFBQyxHQUN2QyxDQUVFLENBQ0wsQ0FBQyxlQUNOdEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN5QixJQUFBQSxLQUFLLEVBQUU7RUFBRTZTLE1BQUFBLFNBQVMsRUFBRSxPQUFPO0VBQUVDLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLFNBQVMsRUFBRTtFQUFPO0tBQUUsZUFDdkUxVSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQU8wQixJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFBRXdULE1BQUFBLGNBQWMsRUFBRSxVQUFVO0VBQUUzUyxNQUFBQSxRQUFRLEVBQUU7RUFBTztFQUFFLEdBQUEsZUFDNUVoQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUVYLE1BQUFBLGVBQWUsRUFBRTtFQUFVO0tBQUUsZUFDeENoQixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVvSyxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFb0UsTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0VBQUUsR0FBQSxFQUFDLEtBQU8sQ0FBQyxlQUM3RjVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSTBCLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW9LLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVvRSxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7RUFBRSxHQUFBLEVBQUMsT0FBUyxDQUFDLGVBQy9GNVUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFb0ssTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRW9FLE1BQUFBLFlBQVksRUFBRTtFQUFvQjtFQUFFLEdBQUEsRUFBQyxJQUFNLENBQUMsZUFDNUY1VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVvSyxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFb0UsTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0VBQUUsR0FBQSxFQUFDLE1BQVEsQ0FBQyxlQUM5RjVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSTBCLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW9LLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVvRSxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7RUFBRSxHQUFBLEVBQUMsU0FBVyxDQUFDLGVBQ2pHNVUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFb0ssTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRW9FLE1BQUFBLFlBQVksRUFBRTtFQUFvQjtFQUFFLEdBQUEsRUFBQyxPQUFTLENBQUMsZUFDL0Y1VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVvSyxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFb0UsTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0VBQUUsR0FBQSxFQUFDLE9BQVMsQ0FBQyxlQUMvRjVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSTBCLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW9LLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVvRSxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7RUFBRSxHQUFBLEVBQUMsVUFBWSxDQUFDLGVBQ2xHNVUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFb0ssTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRW9FLE1BQUFBLFlBQVksRUFBRTtFQUFvQjtLQUFFLEVBQUMsUUFBVSxDQUM3RixDQUNDLENBQUMsZUFDUjVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUNHbVIsZ0JBQWdCLENBQUN4TyxHQUFHLENBQUMsQ0FBQ2lTLEdBQUcsRUFBRUMsR0FBRyxrQkFDN0I5VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUk2QyxJQUFBQSxHQUFHLEVBQUVnUyxHQUFJO0VBQUNuVCxJQUFBQSxLQUFLLEVBQUU7UUFBRVgsZUFBZSxFQUFFOFQsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxHQUFHO0VBQVU7S0FBRSxlQUMzRTlVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSTBCLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRXdPLE1BQUFBLFlBQVksRUFBRTtFQUFvQjtFQUFFLEdBQUEsRUFBRUMsR0FBRyxDQUFDRSxTQUFjLENBQUMsZUFDdEYvVSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUV3TyxNQUFBQSxZQUFZLEVBQUUsbUJBQW1CO0VBQUU5UyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFRSxNQUFBQSxRQUFRLEVBQUU7RUFBTztFQUFFLEdBQUEsRUFBRTZTLEdBQUcsQ0FBQ0csTUFBVyxDQUFDLGVBQ3ZIaFYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFd08sTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0tBQUUsZUFDL0Q1VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQ0U2RixJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUNYOEIsSUFBQUEsS0FBSyxFQUFFaU4sR0FBRyxDQUFDdFAsSUFBSSxDQUFDM0YsRUFBRztFQUNuQmlJLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcU0saUJBQWlCLENBQUNxQixHQUFHLEVBQUUsSUFBSSxFQUFFMU4sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUM5RGpHLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsTUFBTTtFQUFFaUYsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW5GLE1BQUFBLE1BQU0sRUFBRSxnQkFBZ0I7RUFBRUgsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWtCLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FDM0csQ0FDQyxDQUFDLGVBQ0xoQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUV3TyxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7S0FBRSxlQUMvRDVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFDRTZGLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQ1g4QixJQUFBQSxLQUFLLEVBQUVpTixHQUFHLENBQUN0UCxJQUFJLENBQUNpRCxJQUFLO0VBQ3JCWCxJQUFBQSxRQUFRLEVBQUdULENBQUMsSUFBS3FNLGlCQUFpQixDQUFDcUIsR0FBRyxFQUFFLE1BQU0sRUFBRTFOLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLLENBQUU7RUFDaEVqRyxJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFLE9BQU87RUFBRWlGLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVuRixNQUFBQSxNQUFNLEVBQUUsZ0JBQWdCO0VBQUVILE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVrQixNQUFBQSxRQUFRLEVBQUU7RUFBTztFQUFFLEdBQzVHLENBQ0MsQ0FBQyxlQUNMaEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFd08sTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0tBQUUsZUFDL0Q1VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQ0U2RixJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUNYOEIsSUFBQUEsS0FBSyxFQUFFaU4sR0FBRyxDQUFDdFAsSUFBSSxDQUFDb0UsT0FBUTtFQUN4QjlCLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcU0saUJBQWlCLENBQUNxQixHQUFHLEVBQUUsU0FBUyxFQUFFMU4sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUNuRWpHLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUFFaUYsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW5GLE1BQUFBLE1BQU0sRUFBRSxnQkFBZ0I7RUFBRUgsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWtCLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FDNUcsQ0FDQyxDQUFDLGVBQ0xoQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUV3TyxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7S0FBRSxlQUMvRDVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFDRTZGLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQ1g4QixJQUFBQSxLQUFLLEVBQUVpTixHQUFHLENBQUN0UCxJQUFJLENBQUMyQyxLQUFNO0VBQ3RCTCxJQUFBQSxRQUFRLEVBQUdULENBQUMsSUFBS3FNLGlCQUFpQixDQUFDcUIsR0FBRyxFQUFFLE9BQU8sRUFBRTFOLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLLENBQUU7RUFDakVqRyxJQUFBQSxLQUFLLEVBQUU7RUFBRVIsTUFBQUEsS0FBSyxFQUFFLE9BQU87RUFBRWlGLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVuRixNQUFBQSxNQUFNLEVBQUUsZ0JBQWdCO0VBQUVILE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVrQixNQUFBQSxRQUFRLEVBQUU7RUFBTztFQUFFLEdBQzVHLENBQ0MsQ0FBQyxlQUNMaEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RSxNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFd08sTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0tBQUUsZUFDL0Q1VSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQ0U2RixJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUNYOEIsSUFBQUEsS0FBSyxFQUFFaU4sR0FBRyxDQUFDdFAsSUFBSSxDQUFDMkksS0FBTTtFQUN0QnJHLElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcU0saUJBQWlCLENBQUNxQixHQUFHLEVBQUUsT0FBTyxFQUFFMU4sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUNqRWpHLElBQUFBLEtBQUssRUFBRTtFQUFFUixNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUFFaUYsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW5GLE1BQUFBLE1BQU0sRUFBRTRULEdBQUcsQ0FBQ0csTUFBTSxDQUFDekUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLG1CQUFtQixHQUFHLGdCQUFnQjtFQUFFelAsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWtCLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FDakssQ0FDQyxDQUFDLGVBQ0xoQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUkwQixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUV3TyxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7S0FBRSxlQUMvRDVVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUE7RUFDRTZGLElBQUFBLElBQUksRUFBQyxNQUFNO0VBQ1g4QixJQUFBQSxLQUFLLEVBQUVpTixHQUFHLENBQUN0UCxJQUFJLENBQUNtRSxRQUFTO0VBQ3pCN0IsSUFBQUEsUUFBUSxFQUFHVCxDQUFDLElBQUtxTSxpQkFBaUIsQ0FBQ3FCLEdBQUcsRUFBRSxVQUFVLEVBQUUxTixDQUFDLENBQUNVLE1BQU0sQ0FBQ0YsS0FBSyxDQUFFO0VBQ3BFakcsSUFBQUEsS0FBSyxFQUFFO0VBQUVSLE1BQUFBLEtBQUssRUFBRSxPQUFPO0VBQUVpRixNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFbkYsTUFBQUEsTUFBTSxFQUFFLGdCQUFnQjtFQUFFSCxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFa0IsTUFBQUEsUUFBUSxFQUFFO0VBQU87RUFBRSxHQUM1RyxDQUNDLENBQUMsZUFDTGhDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSTBCLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRXdPLE1BQUFBLFlBQVksRUFBRTtFQUFvQjtLQUFFLGVBQy9ENVUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLFFBQUEsRUFBQTtFQUNFMkgsSUFBQUEsS0FBSyxFQUFFaU4sR0FBRyxDQUFDdFAsSUFBSSxDQUFDakIsTUFBTztFQUN2QnVELElBQUFBLFFBQVEsRUFBR1QsQ0FBQyxJQUFLcU0saUJBQWlCLENBQUNxQixHQUFHLEVBQUUsUUFBUSxFQUFFMU4sQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtFQUNsRWpHLElBQUFBLEtBQUssRUFBRTtFQUFFeUUsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRW5GLE1BQUFBLE1BQU0sRUFBRTRULEdBQUcsQ0FBQ0csTUFBTSxDQUFDekUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLG1CQUFtQixHQUFHLGdCQUFnQjtFQUFFelAsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWtCLE1BQUFBLFFBQVEsRUFBRTtFQUFPO0tBQUUsZUFFakpoQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBO0VBQVEySCxJQUFBQSxLQUFLLEVBQUM7RUFBRSxHQUFBLEVBQUMsUUFBYyxDQUFDLGVBQ2hDNUgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLFFBQUEsRUFBQTtFQUFRMkgsSUFBQUEsS0FBSyxFQUFDO0VBQVEsR0FBQSxFQUFDLFFBQWMsQ0FBQyxlQUN0QzVILHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxRQUFBLEVBQUE7RUFBUTJILElBQUFBLEtBQUssRUFBQztFQUFVLEdBQUEsRUFBQyxVQUFnQixDQUNuQyxDQUNOLENBQ0YsQ0FDTCxDQUNJLENBQ0YsQ0FDSixDQUNGLENBQ04sRUFHQXNKLE9BQU8saUJBQ05sUixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRTtFQUFFWCxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUFFRixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFRyxNQUFBQSxNQUFNLEVBQUU7RUFBb0I7RUFBRSxHQUFBLGVBQ2xHakIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNtQixJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDb0UsSUFBQUEsVUFBVSxFQUFDO0VBQU0sR0FBQSxFQUFDLGdCQUFvQixDQUFDLGVBQ3JEaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDRCxJQUFBQSxLQUFLLEVBQUU7RUFBRVAsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRW1ULE1BQUFBLG1CQUFtQixFQUFFLGdCQUFnQjtFQUFFeFMsTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLGVBQzFGL0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRTBQLE1BQUFBLFNBQVMsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRnhRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVnRSxNQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUFFbEUsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFFb1AsT0FBTyxDQUFDaUIsY0FBcUIsQ0FBQyxlQUN4R25TLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVHLE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFBQyxpQkFBcUIsQ0FDckQsQ0FBQyxlQUNOOUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN3QixJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDQyxJQUFBQSxLQUFLLEVBQUU7RUFBRVgsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRUYsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRTBQLE1BQUFBLFNBQVMsRUFBRTtFQUFTO0VBQUUsR0FBQSxlQUMxRnhRLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUFDa0IsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVnRSxNQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUFFbEUsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFFb1AsT0FBTyxDQUFDb0IsUUFBZSxDQUFDLGVBQ2xHdFMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUFDLGdCQUFvQixDQUNwRCxDQUFDLGVBQ045QixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3dCLElBQUFBLENBQUMsRUFBQyxJQUFJO0VBQUNDLElBQUFBLEtBQUssRUFBRTtFQUFFWCxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUFFRixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFMFAsTUFBQUEsU0FBUyxFQUFFO0VBQVM7RUFBRSxHQUFBLGVBQzFGeFEsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNrQixJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRWdFLE1BQUFBLFVBQVUsRUFBRSxNQUFNO0VBQUVsRSxNQUFBQSxLQUFLLEVBQUU7RUFBVTtLQUFFLEVBQUVvUCxPQUFPLENBQUNzQixPQUFjLENBQUMsZUFDakd4UyxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ2tCLElBQUFBLEtBQUssRUFBRTtFQUFFRyxNQUFBQSxLQUFLLEVBQUU7RUFBVTtLQUFFLEVBQUMsb0JBQXdCLENBQ3hELENBQ0YsQ0FBQyxlQUNOOUIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNtQixJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDRCxJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsaUJBQzFCLGVBQUE5QixzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBU2lSLE9BQU8sQ0FBQ3dCLFlBQXFCLENBQUMsRUFBQSxvQkFBa0IsZUFBQTFTLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxFQUFTaVIsT0FBTyxDQUFDK0IsWUFBcUIsQ0FDMUcsQ0FBQyxFQUdObUIsY0FBYyxpQkFDYnBVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDUSxJQUFBQSxFQUFFLEVBQUMsSUFBSTtFQUFDZ0IsSUFBQUEsQ0FBQyxFQUFDLElBQUk7RUFBQ0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVYLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQUVGLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVHLE1BQUFBLE1BQU0sRUFBRTtFQUFvQjtFQUFFLEdBQUEsZUFDMUdqQixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ0MsSUFBSSxFQUFBLElBQUE7RUFBQ0csSUFBQUEsY0FBYyxFQUFDLGVBQWU7RUFBQ0QsSUFBQUEsVUFBVSxFQUFDLFFBQVE7RUFBQ3VCLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDbEU1QixzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFBQ3VGLElBQUFBLFVBQVUsRUFBQyxNQUFNO0VBQUNyRSxJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ2pEb1AsT0FBTyxDQUFDZ0Msa0JBQWtCLENBQUM1USxNQUFNLEVBQUMsMEJBQy9CLENBQUMsZUFDUHRDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFBQzdCLElBQUFBLE9BQU8sRUFBQyxTQUFTO0VBQUNXLElBQUFBLElBQUksRUFBQyxJQUFJO0VBQUNtQixJQUFBQSxPQUFPLEVBQUVzUTtFQUFrQixHQUFBLGVBQzdEN1Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUFDc0UsSUFBQUEsRUFBRSxFQUFDO0tBQU0sQ0FBQywwQkFFMUIsQ0FDTCxDQUFDLGVBQ056RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQ3lCLElBQUFBLEtBQUssRUFBRTtFQUFFNlMsTUFBQUEsU0FBUyxFQUFFLE9BQU87RUFBRUMsTUFBQUEsU0FBUyxFQUFFO0VBQU87S0FBRSxlQUNwRHpVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3NDLGtCQUFLLEVBQUEsSUFBQSxlQUNKdkMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDdUMsc0JBQVMscUJBQ1J4QyxzQkFBQSxDQUFBQyxhQUFBLENBQUN3QyxxQkFBUSxxQkFDUHpDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVxRSxNQUFBQSxVQUFVLEVBQUU7RUFBTztFQUFFLEdBQUEsRUFBQyxNQUFlLENBQUMsZUFDMURoRyxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBO0VBQUNmLElBQUFBLEtBQUssRUFBRTtFQUFFcUUsTUFBQUEsVUFBVSxFQUFFO0VBQU87RUFBRSxHQUFBLEVBQUMsT0FBZ0IsQ0FBQyxlQUMzRGhHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUE7RUFBQ2YsSUFBQUEsS0FBSyxFQUFFO0VBQUVxRSxNQUFBQSxVQUFVLEVBQUU7RUFBTztFQUFFLEdBQUEsRUFBQyxVQUFtQixDQUFDLGVBQzlEaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDeUMsc0JBQVMsRUFBQTtFQUFDZixJQUFBQSxLQUFLLEVBQUU7RUFBRXFFLE1BQUFBLFVBQVUsRUFBRTtFQUFPO0tBQUUsRUFBQyxTQUFrQixDQUNwRCxDQUNELENBQUMsZUFDWmhHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBDLHNCQUFTLEVBQUEsSUFBQSxFQUNQdU8sT0FBTyxDQUFDZ0Msa0JBQWtCLENBQUN0USxHQUFHLENBQUMsQ0FBQ3FTLElBQUksRUFBRUgsR0FBRyxrQkFDeEM5VSxzQkFBQSxDQUFBQyxhQUFBLENBQUN3QyxxQkFBUSxFQUFBO0VBQUNLLElBQUFBLEdBQUcsRUFBRWdTO0VBQUksR0FBQSxlQUNqQjlVLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFdVMsSUFBSSxDQUFDek0sSUFBZ0IsQ0FBQyxlQUNsQ3hJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxFQUFFdVMsSUFBSSxDQUFDL00sS0FBaUIsQ0FBQyxlQUNuQ2xJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3lDLHNCQUFTLEVBQUEsSUFBQSxlQUNSMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNMEIsSUFBQUEsS0FBSyxFQUFFO0VBQUVYLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQUVvRixNQUFBQSxPQUFPLEVBQUUsU0FBUztFQUFFdEYsTUFBQUEsWUFBWSxFQUFFO0VBQU07S0FBRSxFQUNsRm1VLElBQUksQ0FBQ2xCLFFBQ0YsQ0FDRyxDQUFDLGVBQ1ovVCxzQkFBQSxDQUFBQyxhQUFBLENBQUN5QyxzQkFBUyxFQUFBLElBQUEsRUFBRXVTLElBQUksQ0FBQ3RMLE9BQW1CLENBQzVCLENBQ1gsQ0FDUSxDQUNOLENBQ0osQ0FBQyxlQUNOM0osc0JBQUEsQ0FBQUMsYUFBQSxDQUFDUSxpQkFBSSxFQUFBO0VBQUNDLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQUNpQixJQUFBQSxLQUFLLEVBQUU7RUFBRUcsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRUUsTUFBQUEsUUFBUSxFQUFFO0VBQU87RUFBRSxHQUFBLEVBQUMsK0VBRXZELENBQ0gsQ0FFSixDQUVKLENBQUM7RUFFVixDQUFDOztFQ2xsQkQ7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFNa1QsUUFHSixHQUFHQSxDQUFDO0lBQUVDLE9BQU87RUFBRUMsRUFBQUE7RUFBTSxDQUFDLEtBQUs7RUFDM0IsRUFBQSxNQUFNQyxRQUFRLEdBQUdELEtBQUssQ0FBQ0MsUUFBUSxJQUFJLFFBQVE7SUFFM0MsTUFBTUMsV0FBVyxHQUFHLENBQ2xCO0VBQ0UvSixJQUFBQSxLQUFLLEVBQUUsY0FBYztNQUNyQmhJLE9BQU8sRUFBR2dPLEtBQXVCLElBQUs7UUFDcENBLEtBQUssQ0FBQ2xLLGNBQWMsRUFBRTtFQUN0QnJKLE1BQUFBLE1BQU0sQ0FBQzBMLFFBQVEsQ0FBQ2lCLElBQUksR0FBRyxDQUFBLEVBQUcwSyxRQUFRLENBQUEsa0JBQUEsQ0FBb0I7TUFDeEQsQ0FBQztFQUNEbFQsSUFBQUEsSUFBSSxFQUFFO0VBQ1IsR0FBQyxFQUNEO0VBQ0VvSixJQUFBQSxLQUFLLEVBQUUsaUJBQWlCO01BQ3hCaEksT0FBTyxFQUFHZ08sS0FBdUIsSUFBSztRQUNwQ0EsS0FBSyxDQUFDbEssY0FBYyxFQUFFO0VBQ3RCckosTUFBQUEsTUFBTSxDQUFDMEwsUUFBUSxDQUFDaUIsSUFBSSxHQUFHLENBQUEsRUFBRzBLLFFBQVEsQ0FBQSxxQkFBQSxDQUF1QjtNQUMzRCxDQUFDO0VBQ0RsVCxJQUFBQSxJQUFJLEVBQUU7RUFDUixHQUFDLEVBQ0Q7RUFDRW9KLElBQUFBLEtBQUssRUFBRSxVQUFVO01BQ2pCaEksT0FBTyxFQUFHZ08sS0FBdUIsSUFBSztRQUNwQ0EsS0FBSyxDQUFDbEssY0FBYyxFQUFFO0VBQ3RCckosTUFBQUEsTUFBTSxDQUFDMEwsUUFBUSxDQUFDaUIsSUFBSSxHQUFHeUssS0FBSyxDQUFDRyxVQUFVO01BQ3pDLENBQUM7RUFDRHBULElBQUFBLElBQUksRUFBRTtFQUNSLEdBQUMsQ0FDRjtFQUVELEVBQUEsb0JBQ0VuQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFDRmtCLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQ2RmLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQ25CbVYsSUFBQUEsVUFBVSxFQUFFLENBQUU7RUFDZCxJQUFBLFVBQUEsRUFBUyxXQUFXO0VBQ3BCN1QsSUFBQUEsS0FBSyxFQUFFO0VBQUVJLE1BQUFBLEdBQUcsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUV2Qi9CLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dWLDJCQUFjLEVBQUE7RUFDYmpOLElBQUFBLElBQUksRUFBRTJNLE9BQU8sQ0FBQzNNLElBQUksSUFBSTJNLE9BQU8sQ0FBQ2pOLEtBQU07RUFDcEN3TixJQUFBQSxLQUFLLEVBQUVQLE9BQU8sQ0FBQ08sS0FBSyxJQUFJUCxPQUFPLENBQUNqTixLQUFNO01BQ3RDeU4sU0FBUyxFQUFFUixPQUFPLENBQUNRLFNBQVU7RUFDN0JMLElBQUFBLFdBQVcsRUFBRUE7RUFBWSxHQUMxQixDQUNFLENBQUM7RUFFVixDQUFDOztFQ2hERDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTU0sWUFBNkIsR0FBR0EsTUFBTTtFQUMxQztFQUNBLEVBQUEsT0FBTyxJQUFJO0VBQ2IsQ0FBQzs7RUNKRDtFQUNBLE1BQU1DLE1BQU0sR0FBRztFQUNiQyxFQUFBQSxTQUFTLEVBQUU7RUFDVDFVLElBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZoQixJQUFBQSxhQUFhLEVBQUUsUUFBaUI7RUFDaENnRyxJQUFBQSxPQUFPLEVBQUU7S0FDVjtFQUNEMlAsRUFBQUEsUUFBUSxFQUFFO0VBQ1IzVSxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmZixJQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUNwQjBCLElBQUFBLEdBQUcsRUFBRSxNQUFNO0VBQ1hxRSxJQUFBQSxPQUFPLEVBQUUsV0FBVztFQUNwQnRFLElBQUFBLEtBQUssRUFBRSxTQUFTO0VBQ2hCZCxJQUFBQSxlQUFlLEVBQUUsYUFBYTtFQUM5QmdWLElBQUFBLGNBQWMsRUFBRSxNQUFNO0VBQ3RCaFUsSUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJnRSxJQUFBQSxVQUFVLEVBQUUsR0FBRztFQUNmaVEsSUFBQUEsTUFBTSxFQUFFLFNBQVM7RUFDakJDLElBQUFBLFVBQVUsRUFBRSx1QkFBdUI7RUFDbkNDLElBQUFBLFVBQVUsRUFBRTtLQUNiO0VBQ0RDLEVBQUFBLGdCQUFnQixFQUFFO0VBQ2hCdFUsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJkLElBQUFBLGVBQWUsRUFBRSx5QkFBeUI7RUFDMUNrVixJQUFBQSxVQUFVLEVBQUU7S0FDYjtFQUNERyxFQUFBQSxTQUFTLEVBQUU7RUFDVHBWLElBQUFBLE1BQU0sRUFBRSxHQUFHO0VBQ1hWLElBQUFBLE1BQU0sRUFBRSxLQUFLO0VBQ2JTLElBQUFBLGVBQWUsRUFBRSxTQUFTO0VBQzFCaUIsSUFBQUEsTUFBTSxFQUFFO0tBQ1Q7RUFDREUsRUFLQW9KLEtBQUssRUFBRTtFQUNMbEksSUFBQUEsVUFBVSxFQUFFLFFBQWlCO0VBQzdCZ00sSUFBQUEsUUFBUSxFQUFFLFFBQVE7RUFDbEJpSCxJQUFBQSxZQUFZLEVBQUU7RUFDaEI7RUFDRixDQUFDOztFQUVEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTUMsc0JBQXVDLEdBQUdBLE1BQU07RUFDcEQsRUFBQSxNQUFNQyxRQUFRLEdBQUdDLHVCQUFXLEVBQUU7RUFDOUIsRUFBQSxNQUFNL00sUUFBUSxHQUFHZ04sdUJBQVcsRUFBRTtJQUM5QixNQUFNQyxLQUFhLEdBQUdDLHNCQUFXLENBQUVDLEtBQVUsSUFBS0EsS0FBSyxDQUFDRixLQUFLLENBQUMsSUFBSSxFQUFFO0VBQ3BFLEVBQUEsTUFBTXRCLFFBQVEsR0FBR3VCLHNCQUFXLENBQUVDLEtBQVUsSUFBS0EsS0FBSyxDQUFDekIsS0FBSyxFQUFFQyxRQUFRLENBQUMsSUFBSSxRQUFRO0VBQy9FLEVBQUEsTUFBTSxDQUFDdlksWUFBWSxDQUFDLEdBQUdDLHVCQUFlLEVBQUU7RUFDeEMsRUFBQSxNQUFNK1osUUFBUSxHQUFJaGEsWUFBWSxFQUFVNkQsSUFBSSxJQUFJLFdBQVc7SUFFM0QsTUFBTTZLLFVBQVUsR0FBSXVMLElBQVksSUFBSztNQUNuQyxJQUFJQSxJQUFJLEtBQUsxQixRQUFRLEVBQUU7RUFDckIsTUFBQSxPQUFPM0wsUUFBUSxDQUFDc04sUUFBUSxLQUFLM0IsUUFBUSxJQUFJM0wsUUFBUSxDQUFDc04sUUFBUSxLQUFLLENBQUEsRUFBRzNCLFFBQVEsQ0FBQSxDQUFBLENBQUc7RUFDL0UsSUFBQTtFQUNBLElBQUEsT0FBTzNMLFFBQVEsQ0FBQ3NOLFFBQVEsQ0FBQ0MsVUFBVSxDQUFDRixJQUFJLENBQUM7SUFDM0MsQ0FBQztFQUVELEVBQUEsTUFBTUcsV0FBVyxHQUFJSCxJQUFZLElBQU0zUCxDQUFtQixJQUFLO01BQzdEQSxDQUFDLENBQUNDLGNBQWMsRUFBRTtNQUNsQm1QLFFBQVEsQ0FBQ08sSUFBSSxDQUFDO0lBQ2hCLENBQUM7O0VBRUQ7SUFDQSxNQUFNSSxXQUFXLEdBQUkzTyxJQUFZLElBQUs7RUFDcEMsSUFBQSxNQUFNNE8sSUFBSSxHQUFHVCxLQUFLLENBQUNVLElBQUksQ0FBRTNWLENBQUMsSUFBS0EsQ0FBQyxDQUFDOEcsSUFBSSxLQUFLQSxJQUFJLENBQUM7RUFDL0MsSUFBQSxPQUFPNE8sSUFBSSxFQUFFalYsSUFBSSxJQUFJLE1BQU07SUFDN0IsQ0FBQzs7RUFFRDtJQUNBLE1BQU1tVixZQUFZLEdBQUcsQ0FDbkI7RUFBRTFYLElBQUFBLEVBQUUsRUFBRSxXQUFXO0VBQUUyTCxJQUFBQSxLQUFLLEVBQUUsV0FBVztFQUFFcEosSUFBQUEsSUFBSSxFQUFFLE1BQU07RUFBRXdJLElBQUFBLElBQUksRUFBRTBLO0VBQVMsR0FBQyxFQUNyRTtFQUFFelYsSUFBQUEsRUFBRSxFQUFFLE9BQU87RUFBRTJMLElBQUFBLEtBQUssRUFBRSxPQUFPO0VBQUVwSixJQUFBQSxJQUFJLEVBQUUsV0FBVztNQUFFd0ksSUFBSSxFQUFFLEdBQUcwSyxRQUFRLENBQUEsZ0JBQUE7RUFBbUIsR0FBQyxFQUN2RjtFQUFFelYsSUFBQUEsRUFBRSxFQUFFLFlBQVk7RUFBRTJMLElBQUFBLEtBQUssRUFBRSxZQUFZO0VBQUVwSixJQUFBQSxJQUFJLEVBQUUsU0FBUztNQUFFd0ksSUFBSSxFQUFFLEdBQUcwSyxRQUFRLENBQUEscUJBQUE7RUFBd0IsR0FBQyxFQUNwRztFQUFFelYsSUFBQUEsRUFBRSxFQUFFLFVBQVU7RUFBRTJMLElBQUFBLEtBQUssRUFBRSxVQUFVO0VBQUVwSixJQUFBQSxJQUFJLEVBQUUsV0FBVztNQUFFd0ksSUFBSSxFQUFFLEdBQUcwSyxRQUFRLENBQUEsbUJBQUE7RUFBc0IsR0FBQyxFQUNoRztFQUFFelYsSUFBQUEsRUFBRSxFQUFFLGFBQWE7RUFBRTJMLElBQUFBLEtBQUssRUFBRSxjQUFjO0VBQUVwSixJQUFBQSxJQUFJLEVBQUUsVUFBVTtNQUFFd0ksSUFBSSxFQUFFLEdBQUcwSyxRQUFRLENBQUEsc0JBQUE7RUFBeUIsR0FBQyxDQUMxRzs7RUFFRDtFQUNBO0lBQ0EsTUFBTWtDLGNBQWMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0lBRXhELE1BQU1DLGtCQUFrQixHQUFHLENBQ3pCO0VBQUU1WCxJQUFBQSxFQUFFLEVBQUUsT0FBTztFQUFFMkwsSUFBQUEsS0FBSyxFQUFFLE9BQU87RUFBRXBKLElBQUFBLElBQUksRUFBRSxPQUFPO01BQUV3SSxJQUFJLEVBQUUsR0FBRzBLLFFBQVEsQ0FBQSxnQkFBQTtFQUFtQixHQUFDLEVBQ25GO0VBQUV6VixJQUFBQSxFQUFFLEVBQUUsVUFBVTtFQUFFMkwsSUFBQUEsS0FBSyxFQUFFLFdBQVc7RUFBRXBKLElBQUFBLElBQUksRUFBRSxVQUFVO01BQUV3SSxJQUFJLEVBQUUsR0FBRzBLLFFBQVEsQ0FBQSxtQkFBQTtFQUFzQixHQUFDLEVBQ2hHO0VBQUV6VixJQUFBQSxFQUFFLEVBQUUsU0FBUztFQUFFMkwsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRXBKLElBQUFBLElBQUksRUFBRWdWLFdBQVcsQ0FBQyxTQUFTLENBQWdCO01BQUV4TSxJQUFJLEVBQUUsR0FBRzBLLFFBQVEsQ0FBQSxjQUFBO0VBQWlCLEdBQUMsRUFDbkg7RUFBRXpWLElBQUFBLEVBQUUsRUFBRSxVQUFVO0VBQUUyTCxJQUFBQSxLQUFLLEVBQUUsVUFBVTtFQUFFcEosSUFBQUEsSUFBSSxFQUFFZ1YsV0FBVyxDQUFDLFVBQVUsQ0FBZTtNQUFFeE0sSUFBSSxFQUFFLEdBQUcwSyxRQUFRLENBQUEsZUFBQTtFQUFrQixHQUFDLENBQ3ZIOztFQUVEO0lBQ0EsTUFBTW9DLGVBQWUsR0FBR1gsUUFBUSxLQUFLLE9BQU8sR0FDeENVLGtCQUFrQixHQUNsQkEsa0JBQWtCLENBQUNwSCxNQUFNLENBQUN2TixJQUFJLElBQUksQ0FBQzBVLGNBQWMsQ0FBQ2hILFFBQVEsQ0FBQzFOLElBQUksQ0FBQ2pELEVBQUUsQ0FBQyxDQUFDO0lBRXhFLE1BQU04WCxnQkFBZ0IsR0FBSS9MLFFBQWlCLEtBQU07TUFDL0MsR0FBR2tLLE1BQU0sQ0FBQ0UsUUFBUTtFQUNsQixJQUFBLElBQUlwSyxRQUFRLEdBQUdrSyxNQUFNLENBQUNPLGdCQUFnQixHQUFHLEVBQUU7RUFDN0MsR0FBQyxDQUFDO0lBRUYsb0JBQ0VwVyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO01BQUswQixLQUFLLEVBQUVrVSxNQUFNLENBQUNDO0tBQVUsRUFDMUJ3QixZQUFZLENBQUMxVSxHQUFHLENBQUVDLElBQUksaUJBQ3JCN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEdBQUEsRUFBQTtNQUNFNkMsR0FBRyxFQUFFRCxJQUFJLENBQUNqRCxFQUFHO01BQ2IrSyxJQUFJLEVBQUU5SCxJQUFJLENBQUM4SCxJQUFLO01BQ2hCaEosS0FBSyxFQUFFK1YsZ0JBQWdCLENBQUNsTSxVQUFVLENBQUMzSSxJQUFJLENBQUM4SCxJQUFJLENBQUMsQ0FBRTtFQUMvQ3BILElBQUFBLE9BQU8sRUFBRTJULFdBQVcsQ0FBQ3JVLElBQUksQ0FBQzhILElBQUk7RUFBRSxHQUFBLGVBRWhDM0ssc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtNQUFDQyxJQUFJLEVBQUVVLElBQUksQ0FBQ1Y7RUFBSyxHQUFFLENBQUMsZUFDekJuQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO01BQU0wQixLQUFLLEVBQUVrVSxNQUFNLENBQUN0SztLQUFNLEVBQUUxSSxJQUFJLENBQUMwSSxLQUFZLENBQzVDLENBQ0osQ0FBQyxlQUVGdkwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtNQUFJMEIsS0FBSyxFQUFFa1UsTUFBTSxDQUFDUTtLQUFZLENBQUMsRUFFOUJvQixlQUFlLENBQUM3VSxHQUFHLENBQUVDLElBQUksaUJBQ3hCN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEdBQUEsRUFBQTtNQUNFNkMsR0FBRyxFQUFFRCxJQUFJLENBQUNqRCxFQUFHO01BQ2IrSyxJQUFJLEVBQUU5SCxJQUFJLENBQUM4SCxJQUFLO01BQ2hCaEosS0FBSyxFQUFFK1YsZ0JBQWdCLENBQUNsTSxVQUFVLENBQUMzSSxJQUFJLENBQUM4SCxJQUFJLENBQUMsQ0FBRTtFQUMvQ3BILElBQUFBLE9BQU8sRUFBRTJULFdBQVcsQ0FBQ3JVLElBQUksQ0FBQzhILElBQUk7RUFBRSxHQUFBLGVBRWhDM0ssc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUMsaUJBQUksRUFBQTtNQUFDQyxJQUFJLEVBQUVVLElBQUksQ0FBQ1Y7RUFBSyxHQUFFLENBQUMsZUFDekJuQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO01BQU0wQixLQUFLLEVBQUVrVSxNQUFNLENBQUN0SztFQUFNLEdBQUEsRUFBRTFJLElBQUksQ0FBQzBJLEtBQVksQ0FDNUMsQ0FDSixDQUNFLENBQUM7RUFFVixDQUFDOztFQ2pKRCxNQUFNb00sS0FBZSxHQUFHQSxNQUFNO0lBQzVCLE1BQU0sQ0FBQ3pQLEtBQUssRUFBRTBQLFFBQVEsQ0FBQyxHQUFHMWEsY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUN0QyxNQUFNLENBQUM2VyxRQUFRLEVBQUU4RCxXQUFXLENBQUMsR0FBRzNhLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDNUMsTUFBTSxDQUFDdUMsS0FBSyxFQUFFcVksUUFBUSxDQUFDLEdBQUc1YSxjQUFRLENBQUMsRUFBRSxDQUFDO0lBQ3RDLE1BQU0sQ0FBQ0YsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0MsY0FBUSxDQUFDLEtBQUssQ0FBQztFQUU3QyxFQUFBLE1BQU1pSyxZQUFZLEdBQUcsTUFBT0MsQ0FBa0IsSUFBSztNQUNqREEsQ0FBQyxDQUFDQyxjQUFjLEVBQUU7TUFDbEJ5USxRQUFRLENBQUMsRUFBRSxDQUFDO01BQ1o3YSxVQUFVLENBQUMsSUFBSSxDQUFDO01BRWhCLElBQUk7RUFDRixNQUFBLE1BQU04YSxRQUFRLEdBQUcsSUFBSUMsUUFBUSxFQUFFO0VBQy9CRCxNQUFBQSxRQUFRLENBQUM3TixNQUFNLENBQUMsT0FBTyxFQUFFaEMsS0FBSyxDQUFDO0VBQy9CNlAsTUFBQUEsUUFBUSxDQUFDN04sTUFBTSxDQUFDLFVBQVUsRUFBRTZKLFFBQVEsQ0FBQztFQUVyQyxNQUFBLE1BQU1rRSxRQUFRLEdBQUcsTUFBTW5aLEtBQUssQ0FBQyxjQUFjLEVBQUU7RUFDM0NnQixRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkNkYsUUFBQUEsSUFBSSxFQUFFb1MsUUFBUTtFQUNkaFosUUFBQUEsV0FBVyxFQUFFO0VBQ2YsT0FBQyxDQUFDO1FBRUYsSUFBSWtaLFFBQVEsQ0FBQ0MsVUFBVSxFQUFFO0VBQ3ZCbGEsUUFBQUEsTUFBTSxDQUFDMEwsUUFBUSxDQUFDaUIsSUFBSSxHQUFHc04sUUFBUSxDQUFDMU4sR0FBRztFQUNuQyxRQUFBO0VBQ0YsTUFBQTtFQUVBLE1BQUEsSUFBSSxDQUFDME4sUUFBUSxDQUFDalosRUFBRSxFQUFFO1VBQ2hCOFksUUFBUSxDQUFDLDJCQUEyQixDQUFDO0VBQ3ZDLE1BQUE7TUFDRixDQUFDLENBQUMsT0FBT0ssR0FBRyxFQUFFO1FBQ1pMLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQztFQUM3QyxJQUFBLENBQUMsU0FBUztRQUNSN2EsVUFBVSxDQUFDLEtBQUssQ0FBQztFQUNuQixJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsb0JBQ0UrQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFDRkMsSUFBSSxFQUFBLElBQUE7RUFDSkMsSUFBQUEsYUFBYSxFQUFDLFFBQVE7RUFDdEJDLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQ25CQyxJQUFBQSxjQUFjLEVBQUMsUUFBUTtFQUN2QnFCLElBQUFBLEtBQUssRUFBRTtFQUNMeVcsTUFBQUEsU0FBUyxFQUFFLE9BQU87RUFDbEJwWCxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUMxQm9GLE1BQUFBLE9BQU8sRUFBRTtFQUNYO0VBQUUsR0FBQSxlQUVGcEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQ0Z5QixJQUFBQSxLQUFLLEVBQUU7RUFDTFIsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFDYm9HLE1BQUFBLFFBQVEsRUFBRSxPQUFPO0VBQ2pCaUosTUFBQUEsU0FBUyxFQUFFO0VBQ2I7RUFBRSxHQUFBLGVBRUZ4USxzQkFBQSxDQUFBQyxhQUFBLENBQUNRLGlCQUFJLEVBQUE7RUFDSDJPLElBQUFBLEVBQUUsRUFBQyxJQUFJO0VBQ1B6TixJQUFBQSxLQUFLLEVBQUU7RUFDTEssTUFBQUEsUUFBUSxFQUFFLFFBQVE7RUFDbEJnRSxNQUFBQSxVQUFVLEVBQUUsR0FBRztFQUNmbEUsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJ1VyxNQUFBQSxZQUFZLEVBQUU7RUFDaEI7RUFBRSxHQUFBLEVBQ0gsdUJBRUssQ0FBQyxlQUVQclksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQ0ZrUCxJQUFBQSxFQUFFLEVBQUMsTUFBTTtFQUNUNUgsSUFBQUEsUUFBUSxFQUFFTCxZQUFhO0VBQ3ZCeEYsSUFBQUEsS0FBSyxFQUFFO0VBQ0xYLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCRixNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQkMsTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q3NPLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0VBQUUsR0FBQSxlQUdGclAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQ0Z5QixJQUFBQSxLQUFLLEVBQUU7RUFDTHBCLE1BQUFBLE1BQU0sRUFBRSxLQUFLO0VBQ2I0RixNQUFBQSxVQUFVLEVBQUU7RUFDZDtFQUFFLEdBQ0gsQ0FBQyxlQUVGbkcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN5QixJQUFBQSxLQUFLLEVBQUU7RUFBRXlFLE1BQUFBLE9BQU8sRUFBRTtFQUFZO0VBQUUsR0FBQSxFQUNsQzNHLEtBQUssaUJBQ0pPLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29HLHVCQUFVLEVBQUE7RUFDVHJCLElBQUFBLE9BQU8sRUFBRXZGLEtBQU07RUFDZmdDLElBQUFBLE9BQU8sRUFBQyxRQUFRO0VBQ2hCRSxJQUFBQSxLQUFLLEVBQUU7RUFBRTBXLE1BQUFBLFlBQVksRUFBRTtFQUFPO0VBQUUsR0FDakMsQ0FDRixlQUVEclksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMwQixJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLGVBQ1Y1QixzQkFBQSxDQUFBQyxhQUFBLENBQUN3SCxrQkFBSyxFQUFBO0VBQ0o5RixJQUFBQSxLQUFLLEVBQUU7RUFDTFAsTUFBQUEsT0FBTyxFQUFFLE9BQU87RUFDaEI0RSxNQUFBQSxVQUFVLEVBQUUsR0FBRztFQUNmbEUsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJ1VyxNQUFBQSxZQUFZLEVBQUU7RUFDaEI7RUFBRSxHQUFBLEVBQ0gsbUJBRU0sQ0FBQyxlQUNSclksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMEgsa0JBQUssRUFBQTtFQUNKN0IsSUFBQUEsSUFBSSxFQUFDLE9BQU87RUFDWjBDLElBQUFBLElBQUksRUFBQyxPQUFPO0VBQ1pULElBQUFBLFdBQVcsRUFBQyxPQUFPO0VBQ25CSCxJQUFBQSxLQUFLLEVBQUVNLEtBQU07TUFDYkwsUUFBUSxFQUFHVCxDQUFzQyxJQUFLd1EsUUFBUSxDQUFDeFEsQ0FBQyxDQUFDVSxNQUFNLENBQUNGLEtBQUssQ0FBRTtNQUMvRUYsUUFBUSxFQUFBLElBQUE7RUFDUi9GLElBQUFBLEtBQUssRUFBRTtFQUNMUixNQUFBQSxLQUFLLEVBQUUsTUFBTTtFQUNiaUYsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZm5GLE1BQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JILE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25Ca0IsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJzVyxNQUFBQSxPQUFPLEVBQUU7RUFDWDtFQUFFLEdBQ0gsQ0FDRSxDQUFDLGVBRU50WSxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBCLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVjVCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3dILGtCQUFLLEVBQUE7RUFDSjlGLElBQUFBLEtBQUssRUFBRTtFQUNMUCxNQUFBQSxPQUFPLEVBQUUsT0FBTztFQUNoQjRFLE1BQUFBLFVBQVUsRUFBRSxHQUFHO0VBQ2ZsRSxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUNoQnVXLE1BQUFBLFlBQVksRUFBRTtFQUNoQjtFQUFFLEdBQUEsRUFDSCxVQUVNLENBQUMsZUFDUnJZLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzBILGtCQUFLLEVBQUE7RUFDSjdCLElBQUFBLElBQUksRUFBQyxVQUFVO0VBQ2YwQyxJQUFBQSxJQUFJLEVBQUMsVUFBVTtFQUNmVCxJQUFBQSxXQUFXLEVBQUMsVUFBVTtFQUN0QkgsSUFBQUEsS0FBSyxFQUFFbU0sUUFBUztNQUNoQmxNLFFBQVEsRUFBR1QsQ0FBc0MsSUFBS3lRLFdBQVcsQ0FBQ3pRLENBQUMsQ0FBQ1UsTUFBTSxDQUFDRixLQUFLLENBQUU7TUFDbEZGLFFBQVEsRUFBQSxJQUFBO0VBQ1IvRixJQUFBQSxLQUFLLEVBQUU7RUFDTFIsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFDYmlGLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZuRixNQUFBQSxNQUFNLEVBQUUsbUJBQW1CO0VBQzNCSCxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQmtCLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQ2hCc1csTUFBQUEsT0FBTyxFQUFFO0VBQ1g7RUFBRSxHQUNILENBQ0UsQ0FBQyxlQUVOdFksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNDLElBQUksRUFBQSxJQUFBO0VBQUNDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQUNDLElBQUFBLFVBQVUsRUFBQyxRQUFRO0VBQUNzQixJQUFBQSxLQUFLLEVBQUU7RUFBRUksTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFBRW1OLE1BQUFBLFNBQVMsRUFBRTtFQUFPO0VBQUUsR0FBQSxlQUM3RmxQLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FELG1CQUFNLEVBQUE7RUFDTHdDLElBQUFBLElBQUksRUFBQyxRQUFRO0VBQ2JyRSxJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQjhFLElBQUFBLFFBQVEsRUFBRXZKLE9BQVE7RUFDbEIyRSxJQUFBQSxLQUFLLEVBQUU7RUFDTFIsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFDYmlGLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQ3BCcEYsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJjLE1BQUFBLEtBQUssRUFBRSxPQUFPO0VBQ2RiLE1BQUFBLE1BQU0sRUFBRSxNQUFNO0VBQ2RILE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25Ca0YsTUFBQUEsVUFBVSxFQUFFLEdBQUc7RUFDZmlRLE1BQUFBLE1BQU0sRUFBRWpaLE9BQU8sR0FBRyxhQUFhLEdBQUcsU0FBUztFQUMzQ3ViLE1BQUFBLE9BQU8sRUFBRXZiLE9BQU8sR0FBRyxHQUFHLEdBQUc7RUFDM0I7S0FBRSxFQUVEQSxPQUFPLEdBQUcsZUFBZSxHQUFHLFFBQ3ZCLENBQUMsZUFDVGdELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ1EsaUJBQUksRUFBQTtFQUNIMk8sSUFBQUEsRUFBRSxFQUFDLEdBQUc7RUFDTnpFLElBQUFBLElBQUksRUFBQyxHQUFHO0VBQ1JoSixJQUFBQSxLQUFLLEVBQUU7RUFDTEssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJGLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQ2hCa1UsTUFBQUEsY0FBYyxFQUFFO0VBQ2xCO0VBQUUsR0FBQSxFQUNILGtCQUVLLENBQ0gsQ0FDRixDQUNGLENBQ0YsQ0FDRixDQUFDO0VBRVYsQ0FBQzs7RUNoTUR3QyxPQUFPLENBQUNDLGNBQWMsR0FBRyxFQUFFO0VBRTNCRCxPQUFPLENBQUNDLGNBQWMsQ0FBQzViLFNBQVMsR0FBR0EsU0FBUztFQUU1QzJiLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDOVQsV0FBVyxHQUFHQSxXQUFXO0VBRWhENlQsT0FBTyxDQUFDQyxjQUFjLENBQUM5UixtQkFBbUIsR0FBR0EsbUJBQW1CO0VBRWhFNlIsT0FBTyxDQUFDQyxjQUFjLENBQUN6USxrQkFBa0IsR0FBR0Esa0JBQWtCO0VBRTlEd1EsT0FBTyxDQUFDQyxjQUFjLENBQUN0USxnQkFBZ0IsR0FBR0EsZ0JBQWdCO0VBRTFEcVEsT0FBTyxDQUFDQyxjQUFjLENBQUM1UCxZQUFZLEdBQUdBLFlBQVk7RUFFbEQyUCxPQUFPLENBQUNDLGNBQWMsQ0FBQzlMLGFBQWEsR0FBR0EsYUFBYTtFQUVwRDZMLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDbEosWUFBWSxHQUFHQSxZQUFZO0VBRWxEaUosT0FBTyxDQUFDQyxjQUFjLENBQUNoSSxlQUFlLEdBQUdBLGVBQWU7RUFFeEQrSCxPQUFPLENBQUNDLGNBQWMsQ0FBQ3ZELFFBQVEsR0FBR0EsUUFBUTtFQUUxQ3NELE9BQU8sQ0FBQ0MsY0FBYyxDQUFDN0MsWUFBWSxHQUFHQSxZQUFZO0VBRWxENEMsT0FBTyxDQUFDQyxjQUFjLENBQUNsQyxzQkFBc0IsR0FBR0Esc0JBQXNCO0VBRXRFaUMsT0FBTyxDQUFDQyxjQUFjLENBQUNkLEtBQUssR0FBR0EsS0FBSzs7Ozs7OyJ9
