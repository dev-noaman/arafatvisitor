import React, { useState } from 'react';
import {
  Box,
  H3,
  Text,
  Button,
  Icon,
  Loader,
  MessageBox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from '@adminjs/design-system';
import type { ActionProps } from 'adminjs';

type RejectedRowData = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: string;
};

type RejectedRow = {
  rowNumber: number;
  reason: string;
  data: RejectedRowData;
};

type ValidationResult = {
  totalRows: number;
  validRows: number;
  newHosts: number;
  existingHosts: number;
  usersToCreate: number;
  rejectedRows: RejectedRow[];
};

type Credential = {
  name: string;
  email: string;
  password: string;
  company: string;
};

type ImportSummary = {
  totalProcessed: number;
  inserted: number;
  skipped: number;
  rejected: number;
  rejectedRows: RejectedRow[];
  usersCreated: number;
  usersSkipped: number;
  createdCredentials: Credential[];
};

const BulkImportHosts: React.FC<ActionProps> = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'xlsx' | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editableRejected, setEditableRejected] = useState<RejectedRow[]>([]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      setMessage({ type: 'error', text: 'Please upload a CSV or Excel (.xlsx) file.' });
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
        // Read as base64 for XLSX
        const base64 = (reader.result as string).split(',')[1];
        setFileContent(base64);
        setFileType('xlsx');
        await validateFile(base64, 'xlsx');
      } else {
        // Read as text for CSV
        const text = reader.result as string;
        setFileContent(text);
        setFileType('csv');
        await validateFile(text, 'csv');
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read the file. Please try again.' });
    };

    if (isXLSX) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const validateFile = async (content: string, type: 'csv' | 'xlsx') => {
    setValidating(true);
    setValidation(null);

    try {
      const body = type === 'xlsx'
        ? { xlsxContent: content }
        : { csvContent: content };

      const res = await fetch('/admin/api/hosts/import?validate=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to validate CSV.' });
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
        rejectedRows,
      });

      setEditableRejected(rejectedRows);

      if (rejected > 0) {
        setMessage({
          type: 'error',
          text: `${rejected} row(s) have issues. Edit below and retry, or fix your file.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Ready to import: ${newHosts} new hosts, ${existingHosts} existing hosts, ${usersToCreate} users will be created.`,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while validating. Please try again.' });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!fileContent || !fileType) {
      setMessage({ type: 'error', text: 'Please select a CSV or Excel file first.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setSummary(null);

    try {
      const body = fileType === 'xlsx'
        ? { xlsxContent: fileContent }
        : { csvContent: fileContent };

      const res = await fetch('/admin/api/hosts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to import hosts.' });
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
        createdCredentials: Array.isArray(data.createdCredentials) ? data.createdCredentials : [],
      });

      setEditableRejected(rejectedRows);
      setValidation(null);

      if (data.inserted > 0) {
        setMessage({
          type: 'success',
          text: `Import completed! ${data.inserted} hosts imported, ${data.usersCreated} user accounts created.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Import completed. No new hosts were added (all existing or rejected).',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while importing. Please try again.' });
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
    const rows = editableRejected.map((r) => [
      r.data.id,
      r.data.name,
      r.data.company,
      r.data.email,
      r.data.phone,
      r.data.location,
      r.data.status,
    ].map((v) => `"${(v || '').replace(/"/g, '""')}"`).join(','));

    const retryCsvContent = [headers.join(','), ...rows].join('\n');

    try {
      const res = await fetch('/admin/api/hosts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ csvContent: retryCsvContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to import hosts.' });
        return;
      }

      const newRejectedRows = Array.isArray(data.rejectedRows) ? data.rejectedRows : [];

      // Update summary with new results
      setSummary((prev) => {
        if (!prev) {
          return {
            totalProcessed: data.totalProcessed ?? 0,
            inserted: data.inserted ?? 0,
            skipped: data.skipped ?? 0,
            rejected: data.rejected ?? 0,
            rejectedRows: newRejectedRows,
            usersCreated: data.usersCreated ?? 0,
            usersSkipped: data.usersSkipped ?? 0,
            createdCredentials: Array.isArray(data.createdCredentials) ? data.createdCredentials : [],
          };
        }
        return {
          ...prev,
          inserted: prev.inserted + (data.inserted ?? 0),
          rejected: newRejectedRows.length,
          rejectedRows: newRejectedRows,
          usersCreated: prev.usersCreated + (data.usersCreated ?? 0),
          createdCredentials: [
            ...prev.createdCredentials,
            ...(Array.isArray(data.createdCredentials) ? data.createdCredentials : []),
          ],
        };
      });

      setEditableRejected(newRejectedRows);

      if (data.inserted > 0) {
        setMessage({
          type: 'success',
          text: `Retry successful! ${data.inserted} more hosts imported, ${data.usersCreated} users created.${newRejectedRows.length > 0 ? ` ${newRejectedRows.length} still have issues.` : ''}`,
        });
      } else if (newRejectedRows.length > 0) {
        setMessage({
          type: 'error',
          text: `Still ${newRejectedRows.length} row(s) with issues. Please fix and retry.`,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while importing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const updateRejectedRow = (index: number, field: keyof RejectedRowData, value: string) => {
    setEditableRejected((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        data: { ...updated[index].data, [field]: value },
      };
      return updated;
    });
  };

  const exportCredentials = () => {
    if (!summary || !summary.createdCredentials.length) return;

    const headers = ['Name', 'Email', 'Password', 'Company'];
    const rows = summary.createdCredentials.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.password}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
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

  return (
    <Box p="xxl">
      <H3 mb="lg">Bulk Import Hosts</H3>

      <Text mb="md">
        Upload a CSV or Excel (.xlsx) file containing host records. Required columns:
        <br />
        <strong>ID, Name, Company, Email Address, Phone Number (optional), Location, Status</strong>
      </Text>

      {/* File input */}
      <Box
        mb="lg"
        p="lg"
        bg="grey20"
        flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{ borderRadius: '8px', border: '1px dashed #ccc' }}
      >
        <Icon icon="Upload" size={32} mb="md" />
        <Text mb="sm">
          {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose a CSV or Excel file to upload'}
        </Text>
        <input
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          style={{ marginTop: '8px' }}
        />
        {validating && (
          <Box mt="md" flex alignItems="center">
            <Loader />
            <Text ml="sm">Validating...</Text>
          </Box>
        )}
      </Box>

      {/* Message */}
      {message && (
        <Box mb="lg">
          <MessageBox
            message={message.text}
            variant={message.type}
            onCloseClick={() => setMessage(null)}
          />
        </Box>
      )}

      {/* Validation Success */}
      {validation && !hasValidationErrors && (
        <Box mb="lg" p="lg" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <Text mb="md" fontWeight="bold" style={{ color: '#16a34a' }}>
            ✓ {validation.validRows} rows validated successfully
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Box p="sm" style={{ backgroundColor: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>{validation.newHosts}</Text>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>New Hosts</Text>
            </Box>
            <Box p="sm" style={{ backgroundColor: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>{validation.existingHosts}</Text>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>Existing Hosts</Text>
            </Box>
            <Box p="sm" style={{ backgroundColor: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{validation.usersToCreate}</Text>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>Users to Create</Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Import button */}
      {!hasEditableRejected && (
        <Box mb="xl">
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!fileContent || loading || validating || hasValidationErrors}
          >
            {loading ? <Loader /> : (
              <>
                <Icon icon="PlayCircle" mr="sm" />
                Start Import
              </>
            )}
          </Button>
        </Box>
      )}

      {/* Editable Rejected Rows */}
      {hasEditableRejected && (
        <Box mb="lg" p="lg" style={{ backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <Box flex justifyContent="space-between" alignItems="center" mb="md">
            <Text fontWeight="bold" style={{ color: '#dc2626' }}>
              {editableRejected.length} Row(s) with Issues - Edit and Retry:
            </Text>
            <Button variant="primary" size="sm" onClick={handleRetryRejected} disabled={loading}>
              {loading ? <Loader /> : (
                <>
                  <Icon icon="RefreshCw" mr="sm" />
                  Retry Import ({editableRejected.length})
                </>
              )}
            </Button>
          </Box>
          <Box style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#fecaca' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Row</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Issue</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>ID</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Name</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Company</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Email</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Phone</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Location</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fca5a5' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {editableRejected.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fef2f2' }}>
                    <td style={{ padding: '6px', borderBottom: '1px solid #fecaca' }}>{row.rowNumber}</td>
                    <td style={{ padding: '6px', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: '11px' }}>{row.reason}</td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.id}
                        onChange={(e) => updateRejectedRow(idx, 'id', e.target.value)}
                        style={{ width: '60px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.name}
                        onChange={(e) => updateRejectedRow(idx, 'name', e.target.value)}
                        style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.company}
                        onChange={(e) => updateRejectedRow(idx, 'company', e.target.value)}
                        style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.email}
                        onChange={(e) => updateRejectedRow(idx, 'email', e.target.value)}
                        style={{ width: '140px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.phone}
                        onChange={(e) => updateRejectedRow(idx, 'phone', e.target.value)}
                        style={{ width: '100px', padding: '4px', border: row.reason.includes('phone') ? '2px solid #dc2626' : '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <input
                        type="text"
                        value={row.data.location}
                        onChange={(e) => updateRejectedRow(idx, 'location', e.target.value)}
                        style={{ width: '100px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #fecaca' }}>
                      <select
                        value={row.data.status}
                        onChange={(e) => updateRejectedRow(idx, 'status', e.target.value)}
                        style={{ padding: '4px', border: row.reason.toLowerCase().includes('status') ? '2px solid #dc2626' : '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                      >
                        {!row.data.status && <option value="">-- Select Status --</option>}
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}

      {/* Import Summary */}
      {summary && (
        <Box p="lg" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Text mb="md" fontWeight="bold">Import Summary</Text>
          <Box mb="md" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Box p="md" style={{ backgroundColor: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{summary.totalProcessed}</Text>
              <Text style={{ color: '#64748b' }}>Total Processed</Text>
            </Box>
            <Box p="md" style={{ backgroundColor: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{summary.inserted}</Text>
              <Text style={{ color: '#64748b' }}>Hosts Inserted</Text>
            </Box>
            <Box p="md" style={{ backgroundColor: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{summary.skipped}</Text>
              <Text style={{ color: '#64748b' }}>Skipped (existing)</Text>
            </Box>
          </Box>
          <Text mb="lg" style={{ color: '#64748b' }}>
            Users created: <strong>{summary.usersCreated}</strong> | Users skipped: <strong>{summary.usersSkipped}</strong>
          </Text>

          {/* Created Credentials */}
          {hasCredentials && (
            <Box mt="lg" p="lg" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <Box flex justifyContent="space-between" alignItems="center" mb="md">
                <Text fontWeight="bold" style={{ color: '#16a34a' }}>
                  {summary.createdCredentials.length} User Account(s) Created
                </Text>
                <Button variant="primary" size="sm" onClick={exportCredentials}>
                  <Icon icon="Download" mr="sm" />
                  Export Credentials CSV
                </Button>
              </Box>
              <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Password</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Company</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.createdCredentials.map((cred, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{cred.name}</TableCell>
                        <TableCell>{cred.email}</TableCell>
                        <TableCell>
                          <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                            {cred.password}
                          </code>
                        </TableCell>
                        <TableCell>{cred.company}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Text mt="md" style={{ color: '#dc2626', fontSize: '12px' }}>
                ⚠️ Save these credentials now! Passwords cannot be retrieved later.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BulkImportHosts;
