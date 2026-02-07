'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Search,
    Eye,
    Calendar,
    Download,
    Filter,
    X,
} from 'lucide-react';
import { Button, Modal, Badge, EmptyState, Loader } from '@/components/ui';
import { InvoiceProfile } from '@/types';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceProfile | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const fetchInvoices = useCallback(async () => {
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.append('search', search);
            if (selectedStatus) params.append('paymentStatus', selectedStatus);
            if (dateFilter) {
                const today = new Date();
                if (dateFilter === 'today') {
                    params.append('startDate', today.toISOString().split('T')[0]);
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    params.append('startDate', weekAgo.toISOString().split('T')[0]);
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    params.append('startDate', monthAgo.toISOString().split('T')[0]);
                }
            }

            const res = await fetch(`/api/invoices?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, selectedStatus, dateFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        if (!loading) {
            const debounce = setTimeout(fetchInvoices, 300);
            return () => clearTimeout(debounce);
        }
    }, [search, selectedStatus, dateFilter, loading, fetchInvoices]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="success">Paid</Badge>;
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            case 'partial':
                return <Badge variant="info">Partial</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const printInvoice = (invoice: InvoiceProfile) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
            @media print { body { print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>${invoice.invoiceNumber}</p>
          </div>
          <div class="invoice-info">
            <div>
              <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
              <p><strong>Payment:</strong> ${invoice.paymentMethod.toUpperCase()}</p>
            </div>
            ${invoice.customerName ? `<div><p><strong>Customer:</strong> ${invoice.customerName}</p>${invoice.customerPhone ? `<p><strong>Phone:</strong> ${invoice.customerPhone}</p>` : ''}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.sku}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.totalPrice)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ${formatCurrency(invoice.subtotal)}</p>
            ${invoice.discountAmount > 0 ? `<p>Discount: -${formatCurrency(invoice.discountAmount)}</p>` : ''}
            <p>Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}</p>
            <p style="font-size: 24px;">Grand Total: ${formatCurrency(invoice.grandTotal)}</p>
          </div>
        </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Invoices</h1>
                <p className="page-subtitle">View and manage your sales history</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by invoice number or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                        />
                    </div>

                    <select
                        className="form-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ width: 'auto', minWidth: '140px' }}
                    >
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                    </select>

                    <select
                        className="form-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: '140px' }}
                    >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    {(search || selectedStatus || dateFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X size={16} />}
                            onClick={() => {
                                setSearch('');
                                setSelectedStatus('');
                                setDateFilter('');
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Invoices Table */}
            {invoices.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={FileText}
                        title="No invoices found"
                        description="Your sales invoices will appear here once you start billing."
                    />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>
                                        <code style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                                            {invoice.invoiceNumber}
                                        </code>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} color="var(--text-muted)" />
                                            {formatDate(invoice.createdAt)}
                                        </div>
                                    </td>
                                    <td>
                                        {invoice.customerName || <span style={{ color: 'var(--text-muted)' }}>Walk-in</span>}
                                    </td>
                                    <td>{invoice.items.length} items</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(invoice.grandTotal)}</td>
                                    <td>
                                        <Badge variant="info">{invoice.paymentMethod.toUpperCase()}</Badge>
                                    </td>
                                    <td>{getStatusBadge(invoice.paymentStatus)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => setSelectedInvoice(invoice)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => printInvoice(invoice)}
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Invoice Modal */}
            <Modal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                title={`Invoice ${selectedInvoice?.invoiceNumber}`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>Close</Button>
                        <Button variant="primary" leftIcon={<Download size={18} />} onClick={() => selectedInvoice && printInvoice(selectedInvoice)}>
                            Print
                        </Button>
                    </>
                }
            >
                {selectedInvoice && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date</p>
                                <p style={{ fontWeight: 500 }}>{formatDate(selectedInvoice.createdAt)}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Payment Method</p>
                                <p style={{ fontWeight: 500 }}>{selectedInvoice.paymentMethod.toUpperCase()}</p>
                            </div>
                            {selectedInvoice.customerName && (
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customer</p>
                                    <p style={{ fontWeight: 500 }}>{selectedInvoice.customerName}</p>
                                </div>
                            )}
                            {selectedInvoice.staffName && (
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Staff</p>
                                    <p style={{ fontWeight: 500 }}>{selectedInvoice.staffName}</p>
                                </div>
                            )}
                        </div>

                        <table className="table" style={{ marginBottom: '1.5rem' }}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{item.productName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sku}</div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td style={{ fontWeight: 500 }}>{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                            </div>
                            {selectedInvoice.discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                                    <span>Discount ({selectedInvoice.discountType === 'percentage' ? `${selectedInvoice.discountValue}%` : 'Fixed'})</span>
                                    <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Tax ({selectedInvoice.taxRate}%)</span>
                                <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-gray-300)', fontWeight: 700, fontSize: '1.125rem' }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--color-primary-600)' }}>{formatCurrency(selectedInvoice.grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
