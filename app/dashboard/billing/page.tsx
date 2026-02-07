'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Search,
    QrCode,
    User,
    Phone,
    CreditCard,
    Banknote,
    Smartphone,
    Receipt,
    X,
    CheckCircle,
} from 'lucide-react';
import { Button, Input, Modal, Badge, Alert } from '@/components/ui';
import { ProductProfile, InvoiceData, InvoiceProfile } from '@/types';

interface CartItem extends ProductProfile {
    quantity: number;
}

export default function BillingPage() {
    const [products, setProducts] = useState<ProductProfile[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<ProductProfile[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);

    // Bill details
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'credit'>('cash');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
    const [discountValue, setDiscountValue] = useState(0);
    const [isGstEnabled, setIsGstEnabled] = useState(false);
    const [taxRate, setTaxRate] = useState(18);
    const [notes, setNotes] = useState('');

    // Checkout modal
    const [showCheckout, setShowCheckout] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [successInvoice, setSuccessInvoice] = useState<InvoiceProfile | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (search.length >= 2) {
            const filtered = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.sku.toLowerCase().includes(search.toLowerCase())
            );
            setSearchResults(filtered.slice(0, 8));
        } else {
            setSearchResults([]);
        }
    }, [search, products]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=1000');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const addToCart = (product: ProductProfile) => {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                alert('Cannot add more than available stock');
                return;
            }
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            if (product.stock < 1) {
                alert('Product is out of stock');
                return;
            }
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setSearch('');
        setSearchResults([]);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta;
                        if (newQty < 1) return item;
                        if (newQty > item.stock) {
                            alert('Cannot exceed available stock');
                            return item;
                        }
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const startScanner = async () => {
        setShowScanner(true);
        setScanning(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            alert('Could not access camera. Please check permissions.');
            stopScanner();
        }
    };

    const stopScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setShowScanner(false);
        setScanning(false);
    };

    const handleManualScan = async (qrData: string) => {
        try {
            const res = await fetch('/api/products/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrData }),
            });
            const data = await res.json();
            if (data.success) {
                addToCart(data.data);
                stopScanner();
            } else {
                alert(data.error || 'Product not found');
            }
        } catch (error) {
            console.error('Scan error:', error);
        }
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountType === 'percentage'
        ? (subtotal * discountValue) / 100
        : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = isGstEnabled ? (afterDiscount * taxRate) / 100 : 0;
    const grandTotal = afterDiscount + taxAmount;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setProcessing(true);

        const invoiceData: InvoiceData = {
            items: cart.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
            })),
            taxRate: isGstEnabled ? taxRate : 0,
            discountType,
            discountValue,
            customerName: customerName || undefined,
            customerPhone: customerPhone || undefined,
            paymentMethod,
            paymentStatus: 'paid',
            notes: notes || undefined,
        };

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });

            const data = await res.json();
            if (data.success) {
                setSuccessInvoice(data.data);
                // Reset cart and form
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setDiscountValue(0);
                setNotes('');
                setShowCheckout(false);
            } else {
                alert(data.error || 'Failed to create invoice');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Billing</h1>
                <p className="page-subtitle">Create new invoice and process sales</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
                {/* Left: Product Search & Cart */}
                <div>
                    {/* Search Bar */}
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', overflow: 'visible' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search products by name or SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '3rem', fontSize: '1rem' }}
                                />

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        border: '1px solid var(--color-gray-200)',
                                        borderRadius: '0.75rem',
                                        boxShadow: 'var(--shadow-lg)',
                                        marginTop: '0.5rem',
                                        zIndex: 50,
                                        maxHeight: '320px',
                                        overflowY: 'auto',
                                    }}>
                                        {searchResults.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => addToCart(product)}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    borderBottom: '1px solid var(--color-gray-100)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gray-50)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                        SKU: {product.sku} • Stock: {product.stock}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
                                                        {formatCurrency(product.price)}
                                                    </div>
                                                    <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                                                        {product.stock > 0 ? 'In Stock' : 'Out'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="secondary"
                                leftIcon={<QrCode size={20} />}
                                onClick={startScanner}
                            >
                                Scan QR
                            </Button>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShoppingCart size={20} />
                                Cart Items
                                <Badge variant="primary">{cart.length}</Badge>
                            </h3>
                            {cart.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div style={{ minHeight: '300px' }}>
                            {cart.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                    <ShoppingCart size={48} color="var(--text-muted)" />
                                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                                        Cart is empty. Search or scan products to add.
                                    </p>
                                </div>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {item.sku}
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(item.price)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span style={{ fontWeight: 600, minWidth: '2rem', textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            disabled={item.quantity >= item.stock}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>
                                                    {formatCurrency(item.price * item.quantity)}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{ color: 'var(--color-error)' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Bill Summary */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '90px' }}>
                        <div className="card-header">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Bill Summary</h3>
                        </div>
                        <div className="card-body">
                            {/* Customer Details */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Customer Details (Optional)
                                </h4>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Name"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem', padding: '0.625rem 0.625rem 0.625rem 2.5rem' }}
                                        />
                                    </div>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="Phone"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem', padding: '0.625rem 0.625rem 0.625rem 2.5rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Payment Method
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { value: 'cash', label: 'Cash', icon: Banknote },
                                        { value: 'card', label: 'Card', icon: CreditCard },
                                        { value: 'upi', label: 'UPI', icon: Smartphone },
                                        { value: 'credit', label: 'Credit', icon: Receipt },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setPaymentMethod(value as typeof paymentMethod)}
                                            style={{
                                                padding: '0.75rem 0.5rem',
                                                border: paymentMethod === value ? '2px solid var(--color-primary-500)' : '1px solid var(--color-gray-200)',
                                                borderRadius: '0.5rem',
                                                background: paymentMethod === value ? 'var(--color-primary-50)' : 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <Icon size={18} color={paymentMethod === value ? 'var(--color-primary-600)' : 'var(--text-muted)'} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: paymentMethod === value ? 'var(--color-primary-600)' : 'var(--text-secondary)' }}>
                                                {label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Discount */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Discount
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        className="form-select"
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                                        style={{ width: '100px', fontSize: '0.875rem', padding: '0.625rem' }}
                                    >
                                        <option value="fixed">₹</option>
                                        <option value="percentage">%</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                        min={0}
                                        style={{ fontSize: '0.875rem', padding: '0.625rem' }}
                                    />
                                </div>
                            </div>

                            {/* GST Options */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    GST Options
                                </h4>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                        <input
                                            type="radio"
                                            name="gstOption"
                                            checked={!isGstEnabled}
                                            onChange={() => setIsGstEnabled(false)}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>No GST</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="gstOption"
                                            checked={isGstEnabled}
                                            onChange={() => setIsGstEnabled(true)}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>Add GST</span>
                                    </label>
                                </div>

                                {isGstEnabled && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rate:</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            min={0}
                                            style={{ fontSize: '0.875rem', padding: '0.625rem', width: '80px' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>%</span>
                                    </div>
                                )}
                            </div>

                            {/* Summary Calculations */}
                            <div style={{
                                borderTop: '1px solid var(--color-gray-200)',
                                paddingTop: '1rem',
                                marginBottom: '1rem',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                                        <span>Discount</span>
                                        <span>- {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                {isGstEnabled && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Tax ({taxRate}%)</span>
                                        <span style={{ fontWeight: 500 }}>{formatCurrency(taxAmount)}</span>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '0.75rem',
                                    borderTop: '2px solid var(--color-gray-200)',
                                    marginTop: '0.75rem',
                                }}>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Grand Total</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="success"
                                onClick={() => setShowCheckout(true)}
                                disabled={cart.length === 0}
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                            >
                                Complete Sale
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            <Modal
                isOpen={showScanner}
                onClose={stopScanner}
                title="Scan QR Code"
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '100%',
                        height: '300px',
                        background: '#000',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                    }}>
                        <video
                            ref={videoRef}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            playsInline
                            muted
                        />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Point your camera at a product QR code
                    </p>

                    {/* Manual entry for demo */}
                    <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Or enter QR data manually:
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder='{"sku":"PRD-XXX", "merchantId":"..."}'
                                id="manualQR"
                                style={{ fontSize: '0.875rem' }}
                            />
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const input = document.getElementById('manualQR') as HTMLInputElement;
                                    if (input.value) handleManualScan(input.value);
                                }}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Checkout Confirmation Modal */}
            <Modal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                title="Confirm Payment"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCheckout(false)}>Cancel</Button>
                        <Button variant="success" onClick={handleCheckout} isLoading={processing}>
                            Confirm & Print
                        </Button>
                    </>
                }
            >
                <div>
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span>Items</span>
                            <span style={{ fontWeight: 600 }}>{cart.length} products</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span>Payment</span>
                            <Badge variant="primary">{paymentMethod.toUpperCase()}</Badge>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px solid var(--color-gray-300)' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--color-primary-600)' }}>{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>

                    {customerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <User size={16} />
                            <span>{customerName}</span>
                            {customerPhone && <span>• {customerPhone}</span>}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={!!successInvoice}
                onClose={() => setSuccessInvoice(null)}
                title="Payment Successful"
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--color-success)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <CheckCircle size={40} color="white" />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Payment Received!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Invoice #{successInvoice?.invoiceNumber}
                    </p>

                    <div style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>
                            {formatCurrency(successInvoice?.grandTotal || 0)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {successInvoice?.paymentMethod.toUpperCase()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button variant="secondary" onClick={() => setSuccessInvoice(null)} style={{ flex: 1 }}>
                            New Sale
                        </Button>
                        <Button
                            variant="primary"
                            leftIcon={<Receipt size={18} />}
                            onClick={() => {
                                // Print functionality would go here
                                alert('Print functionality would open print dialog');
                            }}
                            style={{ flex: 1 }}
                        >
                            Print Receipt
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
