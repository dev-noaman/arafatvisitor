import React, { useState } from 'react';
import { Box, H2, H3, Text, Button, Input, Label, Select, Table, TableHead, TableBody, TableRow, TableCell, Icon, Loader, MessageBox, Tabs, Tab } from '@adminjs/design-system';
import { useCurrentAdmin } from 'adminjs';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  location: string;
  company: string;
  status: string;
}

interface ReportData {
  visitors?: any[];
  deliveries?: any[];
}

const ReportsPanel: React.FC = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [activeTab, setActiveTab] = useState<'visitors' | 'deliveries'>('visitors');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const role = (currentAdmin as any)?.role || 'ADMIN';
  const hostCompany = (currentAdmin as any)?.hostCompany || '';
  const isHost = role === 'HOST';

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    location: '',
    company: isHost ? hostCompany : '', // Auto-set company for HOST
    status: '',
  });
  const [reportData, setReportData] = useState<ReportData>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // All roles can access reports (ADMIN, HOST, RECEPTION)
  // HOST sees only their company, RECEPTION sees all

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

      const endpoint = activeTab === 'visitors' 
        ? '/admin/api/reports/visitors' 
        : '/admin/api/reports/deliveries';

      const res = await fetch(`${endpoint}?${params}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setReportData((prev) => ({ ...prev, [activeTab]: data }));
      } else {
        setMessage({ type: 'error', text: 'Failed to generate report' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'excel') => {
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

      const endpoint = activeTab === 'visitors'
        ? '/admin/api/reports/visitors/export'
        : '/admin/api/reports/deliveries/export';

      const res = await fetch(`${endpoint}?${params}`, {
        credentials: 'include',
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
        setMessage({ type: 'success', text: `Report exported as ${format.toUpperCase()}` });
      } else {
        setMessage({ type: 'error', text: 'Failed to export report' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const visitorStatuses = ['CHECKED_IN', 'CHECKED_OUT', 'PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
  const deliveryStatuses = ['RECEIVED', 'PICKED_UP'];
  const locations = ['BARWA_TOWERS', 'MARINA_50', 'ELEMENT_MARIOTT'];

  return (
    <Box variant="grey" p="xxl">
      <H2 mb="xxl">Reports</H2>

      {message && (
        <Box mb="xl">
          <MessageBox
            message={message.text}
            variant={message.type}
            onCloseClick={() => setMessage(null)}
          />
        </Box>
      )}

      {/* Tabs */}
      <Box mb="xl">
        <Tabs>
          <Tab
            id="visitors"
            label="Visitors Report"
            isSelected={activeTab === 'visitors'}
            onClick={() => setActiveTab('visitors')}
          />
          <Tab
            id="deliveries"
            label="Deliveries Report"
            isSelected={activeTab === 'deliveries'}
            onClick={() => setActiveTab('deliveries')}
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box bg="white" p="xl" mb="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H3 mb="lg">Filters</H3>
        <Box flex flexDirection="row" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <Box style={{ minWidth: '150px' }}>
            <Label>Date From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </Box>
          <Box style={{ minWidth: '150px' }}>
            <Label>Date To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </Box>
          <Box style={{ minWidth: '150px' }}>
            <Label>Location</Label>
            <Select
              value={filters.location}
              onChange={(selected) => handleFilterChange('location', (selected as any)?.value || '')}
              options={[
                { value: '', label: 'All Locations' },
                ...locations.map((l) => ({ value: l, label: l.replace('_', ' ') })),
              ]}
            />
          </Box>
          <Box style={{ minWidth: '150px' }}>
            <Label>Company {isHost && '(Your company)'}</Label>
            <Input
              type="text"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder={isHost ? hostCompany : "Filter by company"}
              disabled={isHost}
              style={isHost ? { backgroundColor: '#f3f4f6' } : {}}
            />
          </Box>
          <Box style={{ minWidth: '150px' }}>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(selected) => handleFilterChange('status', (selected as any)?.value || '')}
              options={[
                { value: '', label: 'All Statuses' },
                ...(activeTab === 'visitors' ? visitorStatuses : deliveryStatuses).map((s) => ({
                  value: s,
                  label: s.replace('_', ' '),
                })),
              ]}
            />
          </Box>
        </Box>
        <Box mt="lg" flex style={{ gap: '12px' }}>
          <Button variant="primary" onClick={generateReport} disabled={loading}>
            {loading ? <Loader /> : 'Generate Report'}
          </Button>
        </Box>
      </Box>

      {/* Export Buttons */}
      <Box mb="xl" flex style={{ gap: '12px' }}>
        <Button
          variant="success"
          onClick={() => exportReport('csv')}
          disabled={exporting || !reportData[activeTab]?.length}
        >
          <Icon icon="Download" mr="sm" />
          Export CSV
        </Button>
        <Button
          variant="info"
          onClick={() => exportReport('excel')}
          disabled={exporting || !reportData[activeTab]?.length}
        >
          <Icon icon="Download" mr="sm" />
          Export Excel
        </Button>
      </Box>

      {/* Results Table */}
      <Box bg="white" p="xl" style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H3 mb="lg">Results ({reportData[activeTab]?.length || 0} records)</H3>
        
        {loading ? (
          <Box flex justifyContent="center" p="xxl">
            <Loader />
          </Box>
        ) : activeTab === 'visitors' && reportData.visitors?.length ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitor</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.visitors.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell>{v.visitorName}</TableCell>
                  <TableCell>{v.visitorCompany}</TableCell>
                  <TableCell>{v.host?.name || '-'}</TableCell>
                  <TableCell>{v.purpose}</TableCell>
                  <TableCell>{v.status}</TableCell>
                  <TableCell>{v.checkInAt ? new Date(v.checkInAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{v.checkOutAt ? new Date(v.checkOutAt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : activeTab === 'deliveries' && reportData.deliveries?.length ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Courier</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Received</TableCell>
                <TableCell>Picked Up</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.deliveries.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell>{d.courier}</TableCell>
                  <TableCell>{d.recipient}</TableCell>
                  <TableCell>{d.host?.name || '-'}</TableCell>
                  <TableCell>{d.location}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>{d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Text color="grey60">No data available. Click "Generate Report" to load data.</Text>
        )}
      </Box>
    </Box>
  );
};

export default ReportsPanel;
