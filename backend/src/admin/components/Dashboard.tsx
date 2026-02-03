import React, { useState, useEffect } from 'react';
import { Box, H2, H3, H4, Text, Table, TableRow, TableCell, TableHead, TableBody, Icon, Loader, Button, Badge } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

interface KPIData {
  totalHosts: number;
  visitsToday: number;
  deliveriesToday: number;
}

interface PendingApproval {
  id: string;
  visitorName: string;
  visitorPhone: string;
  hostName: string;
  hostCompany: string;
  expectedDate: string;
  status: 'PENDING_APPROVAL' | 'REJECTED';
  rejectionReason?: string;
  rejectedAt?: string;
}

interface ReceivedDelivery {
  id: string;
  courier: string;
  recipient: string;
  hostName: string;
  hostCompany: string;
  receivedAt: string;
}

interface ChartData {
  visitsPerDay: { date: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  deliveriesPerDay: { date: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIData>({ totalHosts: 0, visitsToday: 0, deliveriesToday: 0 });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [receivedDeliveries, setReceivedDeliveries] = useState<ReceivedDelivery[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminjs-theme-preference') === 'dark';
    }
    return false;
  });

  useEffect(() => {
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

  

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpisRes = await fetch('/admin/api/dashboard/kpis', {
        credentials: 'include',
      });
      if (kpisRes.ok) {
        const kpisData = await kpisRes.json();
        setKpis(kpisData);
      }

      // Fetch pending approvals
      const approvalsRes = await fetch('/admin/api/dashboard/pending-approvals', {
        credentials: 'include',
      });
      if (approvalsRes.ok) {
        const approvalsData = await approvalsRes.json();
        setPendingApprovals(approvalsData);
      }

      // Fetch received deliveries
      const deliveriesRes = await fetch('/admin/api/dashboard/received-deliveries', {
        credentials: 'include',
      });
      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setReceivedDeliveries(deliveriesData);
      }

      // Fetch chart data
      const chartsRes = await fetch('/admin/api/dashboard/charts', {
        credentials: 'include',
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

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/admin/api/dashboard/approve/${id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/admin/api/dashboard/reject/${id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };



  if (loading) {
    return (
      <Box 
        flex 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh"
      >
        <Loader />
        <Text mt="lg">Loading dashboard...</Text>
      </Box>
    );
  }

  const role = (currentAdmin as any)?.role || 'ADMIN';
  const canApprove = role === 'ADMIN' || role === 'HOST';

  // Styles
  const cardStyle = {
    borderRadius: '8px',
    flex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    border: 'none',
  };

  const fullWidthCardStyle = {
    borderRadius: '8px',
    width: '100%',
    display: 'block',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    border: 'none',
  };

  const textColor = undefined;
  const mutedColor = 'grey60';
  const bgColor = undefined;

  return (
    <Box variant="grey" p="xxl" style={{ backgroundColor: bgColor }}>
      <Box flex justifyContent="flex-start" alignItems="center" mb="xxl">
        <H2 style={{ color: textColor }}>Dashboard</H2>
      </Box>

      {/* KPI Cards */}
      <Box flex flexDirection="row" mb="xxl" style={{ gap: '24px' }}>
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Total Hosts</Text>
          <H2 style={{ margin: 0, color: textColor }}>{kpis.totalHosts}</H2>
          <Icon icon="User" color="primary100" size={32} />
        </Box>
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Visits Today</Text>
          <H2 style={{ margin: 0, color: textColor }}>{kpis.visitsToday}</H2>
          <Icon icon="UserCheck" color="success" size={32} />
        </Box>
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <Text fontSize="sm" style={{ color: mutedColor }} mb="sm">Deliveries Today</Text>
          <H2 style={{ margin: 0, color: textColor }}>{kpis.deliveriesToday}</H2>
          <Icon icon="Package" color="info" size={32} />
        </Box>
      </Box>

      {/* Operational Queues - Each in separate full-width card */}
      <Box mb="xxl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Pre-Register Approval Queue */}
        <Box p="xl" style={fullWidthCardStyle}>
          <H3 mb="lg" style={{ color: textColor }}>Pre-Register Approval Queue</H3>
          {pendingApprovals.length === 0 ? (
            <Text style={{ color: mutedColor }}>No pending approvals</Text>
          ) : (
            <Table style={{ backgroundColor: undefined }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: textColor }}>Visitor</TableCell>
                  <TableCell style={{ color: textColor }}>Host</TableCell>
                  <TableCell style={{ color: textColor }}>Company</TableCell>
                  <TableCell style={{ color: textColor }}>Expected</TableCell>
                  <TableCell style={{ color: textColor }}>Status</TableCell>
                  {canApprove && <TableCell style={{ color: textColor }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ color: textColor }}>{item.visitorName}</TableCell>
                    <TableCell style={{ color: textColor }}>{item.hostName}</TableCell>
                    <TableCell style={{ color: textColor }}>{item.hostCompany}</TableCell>
                    <TableCell style={{ color: textColor }}>{new Date(item.expectedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box flex flexDirection="column" style={{ gap: '4px' }}>
                        <Badge
                          variant={item.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'}
                          outline
                        >
                          {item.status === 'PENDING_APPROVAL' ? 'Pending' : 'Rejected'}
                        </Badge>
                        {item.status === 'REJECTED' && item.rejectedAt && (
                          <Text fontSize="xs" style={{ color: mutedColor }}>
                            {new Date(item.rejectedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </Box>
                    </TableCell>
                    {canApprove && (
                      <TableCell>
                        {item.status === 'PENDING_APPROVAL' ? (
                          <Box flex flexDirection="row" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(item.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                          >
                            Re-approve
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* Deliveries Queue */}
        <Box p="xl" style={fullWidthCardStyle}>
          <H3 mb="lg" style={{ color: textColor }}>Deliveries Queue (Received)</H3>
          {receivedDeliveries.length === 0 ? (
            <Text style={{ color: mutedColor }}>No pending deliveries</Text>
          ) : (
            <Table style={{ backgroundColor: undefined }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: textColor }}>Courier</TableCell>
                  <TableCell style={{ color: textColor }}>Host</TableCell>
                  <TableCell style={{ color: textColor }}>Company</TableCell>
                  <TableCell style={{ color: textColor }}>Received</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receivedDeliveries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ color: textColor }}>{item.courier}</TableCell>
                    <TableCell style={{ color: textColor }}>{item.hostName}</TableCell>
                    <TableCell style={{ color: textColor }}>{item.hostCompany}</TableCell>
                    <TableCell style={{ color: textColor }}>{new Date(item.receivedAt).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* Charts Section */}
      <Box flex flexDirection="row" style={{ gap: '24px' }}>
        {/* Visits Per Day */}
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <H4 mb="lg" style={{ color: textColor }}>Visits (Last 7 Days)</H4>
          {chartData?.visitsPerDay ? (
            <Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.visitsPerDay.map((day) => (
                <Box key={day.date} flex alignItems="center" style={{ gap: '8px' }}>
                  <Text style={{ width: '80px', color: textColor }}>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</Text>
                  <Box
                    bg="primary100"
                    style={{
                      height: '20px',
                      width: `${Math.min(day.count * 10, 100)}%`,
                      borderRadius: '4px',
                      minWidth: day.count > 0 ? '20px' : '0',
                    }}
                  />
                  <Text style={{ color: textColor }}>{day.count}</Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Text style={{ color: mutedColor }}>No data available</Text>
          )}
        </Box>

        {/* Status Distribution */}
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <H4 mb="lg" style={{ color: textColor }}>Visitor Status Distribution</H4>
          {chartData?.statusDistribution && chartData.statusDistribution.length > 0 ? (
            <Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.statusDistribution.map((item) => (
                <Box key={item.status} flex justifyContent="space-between" alignItems="center">
                  <Text style={{ color: textColor }}>{item.status.replace(/_/g, ' ')}</Text>
                  <Box
                    bg={item.status === 'CHECKED_IN' ? 'success' : item.status === 'PENDING_APPROVAL' ? 'warning' : item.status === 'APPROVED' ? 'info' : 'grey40'}
                    px="md"
                    py="sm"
                    style={{ borderRadius: '4px' }}
                  >
                    <Text color="white">{item.count}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Text style={{ color: mutedColor }}>No data available</Text>
          )}
        </Box>

        {/* Deliveries Per Day */}
        <Box flex flexDirection="column" p="xl" style={cardStyle}>
          <H4 mb="lg" style={{ color: textColor }}>Deliveries (Last 7 Days)</H4>
          {chartData?.deliveriesPerDay ? (
            <Box flex flexDirection="column" style={{ gap: '8px' }}>
              {chartData.deliveriesPerDay.map((day) => (
                <Box key={day.date} flex alignItems="center" style={{ gap: '8px' }}>
                  <Text style={{ width: '80px', color: textColor }}>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</Text>
                  <Box
                    bg="info"
                    style={{
                      height: '20px',
                      width: `${Math.min(day.count * 10, 100)}%`,
                      borderRadius: '4px',
                      minWidth: day.count > 0 ? '20px' : '0',
                    }}
                  />
                  <Text style={{ color: textColor }}>{day.count}</Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Text style={{ color: mutedColor }}>No data available</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
