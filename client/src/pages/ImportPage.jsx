import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trash2,
  Check,
  X,
  RefreshCw,
  Sliders,
} from 'lucide-react';

const expenseCategories = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Allowance', 'Gift', 'Other'];
const paymentMethods = ['UPI', 'Card', 'Bank Transfer', 'Cash', 'Other'];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

// Keyword categorization helper
const suggestCategory = (desc = '', type = 'expense') => {
  const d = desc.toLowerCase();
  if (type === 'income') {
    if (d.includes('salary') || d.includes('payroll')) return 'Salary';
    if (d.includes('freelance') || d.includes('contract')) return 'Freelance';
    if (d.includes('dividend') || d.includes('interest') || d.includes('mutual')) return 'Investment';
    return 'Salary';
  }

  if (
    d.includes('swiggy') ||
    d.includes('zomato') ||
    d.includes('grocer') ||
    d.includes('supermarket') ||
    d.includes('restaurant') ||
    d.includes('cafe') ||
    d.includes('mcdonald') ||
    d.includes('starbucks') ||
    d.includes('food') ||
    d.includes('zepto') ||
    d.includes('blinkit') ||
    d.includes('instamart')
  ) {
    return 'Food';
  }
  if (
    d.includes('uber') ||
    d.includes('ola') ||
    d.includes('rapido') ||
    d.includes('metro') ||
    d.includes('fuel') ||
    d.includes('petrol') ||
    d.includes('diesel') ||
    d.includes('toll') ||
    d.includes('cab') ||
    d.includes('rail') ||
    d.includes('irctc')
  ) {
    return 'Transport';
  }
  if (
    d.includes('electricity') ||
    d.includes('wifi') ||
    d.includes('broadband') ||
    d.includes('bescom') ||
    d.includes('water') ||
    d.includes('gas') ||
    d.includes('airtel') ||
    d.includes('jio') ||
    d.includes('bill') ||
    d.includes('recharge')
  ) {
    return 'Bills';
  }
  if (
    d.includes('amazon') ||
    d.includes('flipkart') ||
    d.includes('myntra') ||
    d.includes('zara') ||
    d.includes('retail') ||
    d.includes('clothing') ||
    d.includes('shop') ||
    d.includes('electronics')
  ) {
    return 'Shopping';
  }
  if (
    d.includes('netflix') ||
    d.includes('spotify') ||
    d.includes('movie') ||
    d.includes('cinema') ||
    d.includes('pvr') ||
    d.includes('inox') ||
    d.includes('game') ||
    d.includes('concert')
  ) {
    return 'Entertainment';
  }
  if (
    d.includes('pharmacy') ||
    d.includes('apollo') ||
    d.includes('hospital') ||
    d.includes('clinic') ||
    d.includes('medical') ||
    d.includes('doctor') ||
    d.includes('dental')
  ) {
    return 'Healthcare';
  }
  if (
    d.includes('course') ||
    d.includes('udemy') ||
    d.includes('coursera') ||
    d.includes('tuition') ||
    d.includes('book') ||
    d.includes('school') ||
    d.includes('college')
  ) {
    return 'Education';
  }
  return 'Other';
};

// Payment method helper
const detectPaymentMethod = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('upi') || d.includes('gpay') || d.includes('phonepe') || d.includes('paytm')) return 'UPI';
  if (d.includes('card') || d.includes('pos') || d.includes('visa') || d.includes('mastercard')) return 'Card';
  if (d.includes('neft') || d.includes('rtgs') || d.includes('imps') || d.includes('transfer')) return 'Bank Transfer';
  if (d.includes('atm') || d.includes('cash')) return 'Cash';
  return 'UPI';
};

// CSV text parser handling quotes and delimiters
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let startVal = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        let val = line.substring(startVal, i).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        result.push(val.trim());
        startVal = i + 1;
      }
    }
    let lastVal = line.substring(startVal).trim();
    if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
      lastVal = lastVal.substring(1, lastVal.length - 1).replace(/""/g, '"');
    }
    result.push(lastVal.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter((r) => r.length === headers.length || r.some((c) => c !== ''));
  return { headers, rows };
};

const SAMPLE_CSV = `Date,Description,Amount,Type,Payment Method
2026-10-02,Swiggy Gourmet Order,840,Debit,UPI
2026-10-03,Metro Smart Card Recharge,500,Debit,UPI
2026-10-04,Airtel Broadband Fiber,1099,Debit,Card
2026-10-05,Amazon Essentials Shopping,2450,Debit,Card
2026-10-06,Monthly Salary Credit,65000,Credit,Bank Transfer
2026-10-07,Apollo Pharmacy Medicines,620,Debit,UPI
2026-10-08,PVR Cinema Movie Tickets,750,Debit,UPI
2026-10-09,Uber Cab Ride to Office,320,Debit,UPI`;

const ImportPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [existingTransactions, setExistingTransactions] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  // Column Mappings
  const [mapping, setMapping] = useState({
    date: '',
    description: '',
    amount: '',
    type: '',
    paymentMethod: '',
  });
  const [showMappingPanel, setShowMappingPanel] = useState(false);

  // Parsed Records State
  const [previewRows, setPreviewRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load existing transactions for duplicate detection
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await api.get('/transactions', { params: { limit: 500 } });
        if (res.data.success) {
          setExistingTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.warn('[Import] Could not fetch existing transactions:', err.message);
      }
    };
    fetchExisting();
  }, []);

  // Automatic column guessing based on standard naming
  const autoDetectColumns = (headers) => {
    const map = { date: '', description: '', amount: '', type: '', paymentMethod: '' };

    headers.forEach((h) => {
      const col = h.toLowerCase().trim();
      if (!map.date && (col.includes('date') || col.includes('time') || col === 'txn_date')) {
        map.date = h;
      } else if (
        !map.description &&
        (col.includes('desc') ||
          col.includes('narr') ||
          col.includes('particular') ||
          col.includes('remark') ||
          col.includes('detail') ||
          col.includes('memo'))
      ) {
        map.description = h;
      } else if (
        !map.amount &&
        (col.includes('amount') || col.includes('amt') || col.includes('inr') || col.includes('balance') || col === 'value')
      ) {
        map.amount = h;
      } else if (
        !map.type &&
        (col.includes('type') || col.includes('dr/cr') || col.includes('cr/dr') || col.includes('debit') || col.includes('credit'))
      ) {
        map.type = h;
      } else if (
        !map.paymentMethod &&
        (col.includes('mode') || col.includes('method') || col.includes('channel'))
      ) {
        map.paymentMethod = h;
      }
    });

    // Fallbacks
    if (!map.date && headers.length > 0) map.date = headers[0];
    if (!map.description && headers.length > 1) map.description = headers[1];
    if (!map.amount && headers.length > 2) map.amount = headers[2];

    return map;
  };

  // Convert raw rows to preview items using mapping
  const buildPreviewRows = (headers, rows, currentMapping) => {
    const dateIdx = headers.indexOf(currentMapping.date);
    const descIdx = headers.indexOf(currentMapping.description);
    const amtIdx = headers.indexOf(currentMapping.amount);
    const typeIdx = headers.indexOf(currentMapping.type);
    const methodIdx = headers.indexOf(currentMapping.paymentMethod);

    return rows.map((r, index) => {
      let rawDate = dateIdx !== -1 ? r[dateIdx] : '';
      let desc = descIdx !== -1 ? r[descIdx] : `Transaction ${index + 1}`;
      let rawAmt = amtIdx !== -1 ? r[amtIdx] : '0';
      let rawType = typeIdx !== -1 ? r[typeIdx] : '';
      let rawMethod = methodIdx !== -1 ? r[methodIdx] : '';

      // Clean amount: remove currency symbols and commas
      let cleanAmt = parseFloat(String(rawAmt).replace(/[₹$,]/g, '').trim()) || 0;

      // Determine income vs expense
      let type = 'expense';
      const typeStr = String(rawType).toLowerCase();
      if (
        typeStr.includes('credit') ||
        typeStr.includes('cr') ||
        typeStr.includes('income') ||
        typeStr.includes('deposit') ||
        cleanAmt < 0
      ) {
        type = 'income';
        cleanAmt = Math.abs(cleanAmt);
      } else if (typeStr.includes('debit') || typeStr.includes('dr') || typeStr.includes('expense')) {
        type = 'expense';
        cleanAmt = Math.abs(cleanAmt);
      }

      // Format date to YYYY-MM-DD
      let formattedDate = new Date().toISOString().split('T')[0];
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          formattedDate = parsed.toISOString().split('T')[0];
        }
      }

      const category = suggestCategory(desc, type);
      const paymentMethod = rawMethod ? rawMethod.trim() : detectPaymentMethod(desc);

      // Check for duplicate against existing user transactions
      const isDuplicate = existingTransactions.some((ext) => {
        const extDate = new Date(ext.date).toISOString().split('T')[0];
        const sameAmount = Math.abs(ext.amount - cleanAmt) < 0.01;
        const sameDate = extDate === formattedDate;
        const extDesc = (ext.description || '').toLowerCase();
        const curDesc = desc.toLowerCase();
        const descMatch = extDesc.includes(curDesc) || curDesc.includes(extDesc);
        return sameAmount && sameDate && descMatch;
      });

      return {
        id: `row-${index}-${Date.now()}`,
        included: !isDuplicate && cleanAmt > 0,
        date: formattedDate,
        description: desc || 'Untitled Transaction',
        amount: cleanAmt,
        type,
        category,
        paymentMethod,
        isDuplicate,
      };
    });
  };

  const processCSVText = (text, name) => {
    setLoading(true);
    setImportResult(null);
    try {
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        toast.error('Could not find any readable transaction rows in the CSV file.');
        setLoading(false);
        return;
      }

      setFileName(name);
      setCsvHeaders(headers);
      setRawRows(rows);

      const detected = autoDetectColumns(headers);
      setMapping(detected);

      const preview = buildPreviewRows(headers, rows, detected);
      setPreviewRows(preview);
      toast.success(`Parsed ${preview.length} transactions from ${name}`);
    } catch (err) {
      console.error('[CSV Parse Error]', err);
      toast.error('Failed to parse the CSV file. Please verify its format.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv bank or statement file.');
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVText(event.target.result, selected.name);
    };
    reader.readAsText(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        processCSVText(event.target.result, droppedFile.name);
      };
      reader.readAsText(droppedFile);
    } else {
      toast.error('Please drop a valid .csv file.');
    }
  };

  const handleLoadSample = () => {
    setFile(null);
    processCSVText(SAMPLE_CSV, 'sample_bank_statement.csv');
  };

  // Re-run row builder when user changes column mapping
  const handleMappingChange = (key, value) => {
    const updated = { ...mapping, [key]: value };
    setMapping(updated);
    if (rawRows.length > 0) {
      const rebuilt = buildPreviewRows(csvHeaders, rawRows, updated);
      setPreviewRows(rebuilt);
    }
  };

  // Row update handlers
  const handleToggleRow = (id) => {
    setPreviewRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, included: !r.included } : r))
    );
  };

  const handleSelectAll = (select) => {
    setPreviewRows((prev) => prev.map((r) => ({ ...r, included: select })));
  };

  const handleRowFieldChange = (id, field, value) => {
    setPreviewRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteRow = (id) => {
    setPreviewRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Import Action
  const handleExecuteImport = async () => {
    const toImport = previewRows.filter((r) => r.included && r.amount > 0);
    if (toImport.length === 0) {
      toast.error('Please select at least one transaction to import.');
      return;
    }

    setImporting(true);
    try {
      const payload = {
        transactions: toImport.map((r) => ({
          date: r.date,
          description: r.description,
          amount: Number(r.amount),
          type: r.type,
          category: r.category,
          paymentMethod: r.paymentMethod,
        })),
      };

      const res = await api.post('/transactions/import', payload);
      if (res.data.success) {
        const skipped = previewRows.length - toImport.length;
        setImportResult({
          importedCount: toImport.length,
          skippedCount: skipped,
          totalAmount: toImport.reduce((acc, t) => acc + t.amount, 0),
        });
        toast.success(`Successfully imported ${toImport.length} transactions!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete transaction import.');
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = previewRows.filter((r) => r.included).length;
  const duplicateCount = previewRows.filter((r) => r.isDuplicate).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.35) 0%, rgba(12, 28, 24, 0.85) 100%)',
          border: '1px solid var(--border-highlight)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--accent-primary)',
              color: '#06241e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <FileSpreadsheet size={24} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="heading-md">Import Statement</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Upload your bank or payment statement in CSV format to quickly add transactions
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleLoadSample}
            className="btn btn-secondary btn-sm"
            style={{ border: '1px solid var(--border-highlight)' }}
          >
            <Sparkles size={14} />
            <span>Try Sample Statement</span>
          </button>
        </div>
      </div>

      {/* Success Notification Result View */}
      {importResult && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #10b981',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Import Completed Successfully
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {importResult.importedCount} transaction{importResult.importedCount !== 1 ? 's' : ''} added to your records
                {importResult.skippedCount > 0 ? `, ${importResult.skippedCount} skipped.` : '.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setPreviewRows([]);
                setImportResult(null);
                setFileName('');
              }}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={14} /> Import Another File
            </button>
            <Link to="/transactions" className="btn btn-primary btn-sm">
              View Transactions <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Upload Box (Visible when no preview rows yet or to replace) */}
      {previewRows.length === 0 && !importResult && (
        <div
          className="card"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed rgba(63, 191, 159, 0.35)',
            background: isDragging ? 'rgba(63, 191, 159, 0.1)' : 'rgba(10, 24, 21, 0.65)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(63, 191, 159, 0.15)',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <UploadCloud size={32} />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Drop your statement CSV here, or browse
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            Works with standard exports from major banks and payment apps. You can review, edit categories, and exclude duplicates before saving.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select .CSV File
          </button>
        </div>
      )}

      {/* Preview & Edit Table Section */}
      {previewRows.length > 0 && (
        <div className="card">
          {/* File Meta Header & Column Mapping Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                  {fileName || 'Uploaded Statement'}
                </span>
                <span className="badge badge-info">{previewRows.length} Total Rows</span>
                {duplicateCount > 0 && (
                  <span className="badge badge-warning" style={{ color: '#fbbf24' }}>
                    <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {duplicateCount} Duplicate Alert{duplicateCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {selectedCount} of {previewRows.length} transactions selected for import
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowMappingPanel((prev) => !prev)}
                className="btn btn-secondary btn-sm"
              >
                <Sliders size={14} />
                <span>{showMappingPanel ? 'Hide Column Mapping' : 'Adjust Columns'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewRows([]);
                  setFileName('');
                }}
                className="btn btn-secondary btn-sm"
              >
                <Trash2 size={14} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={selectedCount === 0 || importing}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem 1rem' }}
              >
                <Check size={16} />
                <span>
                  {importing ? 'Importing...' : `Import ${selectedCount} Transactions`}
                </span>
              </button>
            </div>
          </div>

          {/* Optional Column Mapping Panel */}
          {showMappingPanel && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                Match Statement Columns:
              </div>
              <div className="grid-3" style={{ gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Date Column</label>
                  <select
                    className="form-input form-select"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    value={mapping.date}
                    onChange={(e) => handleMappingChange('date', e.target.value)}
                  >
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Description Column</label>
                  <select
                    className="form-input form-select"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    value={mapping.description}
                    onChange={(e) => handleMappingChange('description', e.target.value)}
                  >
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount Column</label>
                  <select
                    className="form-input form-select"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    value={mapping.amount}
                    onChange={(e) => handleMappingChange('amount', e.target.value)}
                  >
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Batch Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                Deselect All
              </button>
            </div>

            <div style={{ color: 'var(--text-secondary)' }}>
              Total to Import:{' '}
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatCurrency(
                  previewRows
                    .filter((r) => r.included)
                    .reduce((acc, r) => acc + (r.amount || 0), 0)
                )}
              </span>
            </div>
          </div>

          {/* Editable Table */}
          <div className="table-container" style={{ maxHeight: '540px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>Import</th>
                  <th style={{ minWidth: '120px' }}>Date</th>
                  <th style={{ minWidth: '220px' }}>Description</th>
                  <th style={{ minWidth: '130px' }}>Type</th>
                  <th style={{ minWidth: '150px' }}>Category</th>
                  <th style={{ minWidth: '130px' }}>Payment Method</th>
                  <th style={{ minWidth: '120px', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      background: row.isDuplicate
                        ? 'rgba(230, 167, 60, 0.05)'
                        : row.included
                        ? 'rgba(63, 191, 159, 0.03)'
                        : 'transparent',
                      opacity: row.included ? 1 : 0.6,
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.included}
                        onChange={() => handleToggleRow(row.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                      />
                    </td>

                    {/* Date */}
                    <td>
                      <input
                        type="date"
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={row.date}
                        onChange={(e) => handleRowFieldChange(row.id, 'date', e.target.value)}
                      />
                    </td>

                    {/* Description & Duplicate Badge */}
                    <td>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem', width: '100%' }}
                          value={row.description}
                          onChange={(e) => handleRowFieldChange(row.id, 'description', e.target.value)}
                        />
                        {row.isDuplicate && (
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: '#fbbf24',
                              marginTop: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <AlertTriangle size={11} /> Possible duplicate with an existing record
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={row.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          handleRowFieldChange(row.id, 'type', newType);
                          handleRowFieldChange(row.id, 'category', suggestCategory(row.description, newType));
                        }}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </td>

                    {/* Category */}
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={row.category}
                        onChange={(e) => handleRowFieldChange(row.id, 'category', e.target.value)}
                      >
                        {(row.type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Method */}
                    <td>
                      <select
                        className="form-input form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        value={row.paymentMethod}
                        onChange={(e) => handleRowFieldChange(row.id, 'paymentMethod', e.target.value)}
                      >
                        {paymentMethods.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>

                    {/* Amount */}
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="form-input"
                        style={{
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.825rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: row.type === 'income' ? '#34d399' : '#fb7185',
                          width: '100px',
                        }}
                        value={row.amount}
                        onChange={(e) => handleRowFieldChange(row.id, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </td>

                    {/* Remove Row */}
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="btn-icon"
                        title="Remove row"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
