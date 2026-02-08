'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Store,
    User,
    Lock,
    Percent,
    Bell,
    Save,
    CheckCircle,
} from 'lucide-react';
import { Button, Input, Alert, Loader, Badge, Modal } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { user, fetchUser, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('shop');
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    // Verification states
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verificationStep, setVerificationStep] = useState(1); // 1: Send, 2: Verify

    // Form states
    const [shopData, setShopData] = useState({
        shopName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        gstNumber: '',
        businessType: '',
    });

    const [profileData, setProfileData] = useState({
        ownerName: '',
        email: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [taxSettings, setTaxSettings] = useState({
        defaultTaxRate: 18,
        lowStockThreshold: 10,
        invoicePrefix: 'INV',
    });

    useEffect(() => {
        if (user) {
            setShopData({
                shopName: user.shopName || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                phone: user.phone || '',
                email: user.email || '',
                gstNumber: user.gstNumber || '',
                businessType: user.businessType || '',
            });
            setProfileData({
                ownerName: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleSaveShop = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activeTab === 'shop' ? shopData : profileData),
            });

            const data = await res.json();
            if (data.success) {
                setSaveSuccess(true);
                await fetchUser();
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(data.error || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendVerification = async () => {
        setVerifying(true);
        setError('');
        try {
            const res = await fetch('/api/auth/send-verification-otp', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                setVerificationStep(2);
            } else {
                setError(data.error || 'Failed to send verification code');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setVerifying(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!otp || otp.length < 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setVerifying(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            });
            const data = await res.json();
            if (data.success) {
                setIsVerifyModalOpen(false);
                setOtp('');
                setVerificationStep(1);
                await fetchUser();
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setVerifying(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword) {
            setError('Current password is required');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSaveSuccess(true);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'shop', label: 'Shop Details', icon: Store },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'billing', label: 'Billing Settings', icon: Percent },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your shop and account settings</p>
            </div>

            {saveSuccess && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Alert variant="success">
                        <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                        Changes saved successfully!
                    </Alert>
                </div>
            )}

            {error && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Alert variant="error">{error}</Alert>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem' }}>
                {/* Tabs */}
                <div className="card" style={{ padding: '0.5rem' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.875rem 1rem',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--color-primary-50)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9375rem',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card">
                    <div className="card-body">
                        {/* Shop Details Tab */}
                        {activeTab === 'shop' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    Shop Details
                                </h2>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <Input
                                        label="Shop Name"
                                        value={shopData.shopName}
                                        onChange={(e) => setShopData({ ...shopData, shopName: e.target.value })}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Input
                                            label="Phone"
                                            value={shopData.phone}
                                            onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                                        />
                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                                <label className="form-label" style={{ marginBottom: 0 }}>Email</label>
                                                {user?.isEmailVerified ? (
                                                    <Badge variant="success">Verified</Badge>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsVerifyModalOpen(true)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--color-primary-600)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            padding: 0
                                                        }}
                                                    >
                                                        Verify Now
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                className="form-input"
                                                type="email"
                                                value={shopData.email}
                                                disabled
                                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                                            />
                                        </div>
                                    </div>
                                    <Input
                                        label="Address"
                                        value={shopData.address}
                                        onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <Input
                                            label="City"
                                            value={shopData.city}
                                            onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                                        />
                                        <Input
                                            label="State"
                                            value={shopData.state}
                                            onChange={(e) => setShopData({ ...shopData, state: e.target.value })}
                                        />
                                        <Input
                                            label="Pincode"
                                            value={shopData.pincode}
                                            onChange={(e) => setShopData({ ...shopData, pincode: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Input
                                            label="GST Number"
                                            value={shopData.gstNumber}
                                            onChange={(e) => setShopData({ ...shopData, gstNumber: e.target.value })}
                                            placeholder="e.g., 22AAAAA0000A1Z5"
                                        />
                                        <div className="form-group">
                                            <label className="form-label">Business Type</label>
                                            <select
                                                className="form-select"
                                                value={shopData.businessType}
                                                onChange={(e) => setShopData({ ...shopData, businessType: e.target.value })}
                                            >
                                                <option value="retail">Retail Store</option>
                                                <option value="wholesale">Wholesale</option>
                                                <option value="restaurant">Restaurant</option>
                                                <option value="grocery">Grocery Store</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="clothing">Clothing & Apparel</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSaveShop} isLoading={loading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    Profile Settings
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                    }}>
                                        {profileData.ownerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{profileData.ownerName}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{user?.role === 'merchant' ? 'Shop Owner' : 'Staff'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                                    <Input
                                        label="Full Name"
                                        value={profileData.ownerName}
                                        onChange={(e) => setProfileData({ ...profileData, ownerName: e.target.value })}
                                    />
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                            <label className="form-label" style={{ marginBottom: 0 }}>Email</label>
                                            {user?.isEmailVerified ? (
                                                <Badge variant="success">Verified</Badge>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsVerifyModalOpen(true)}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--color-primary-600)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        padding: 0
                                                    }}
                                                >
                                                    Verify Now
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            className="form-input"
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                                        />
                                        <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem' }}>
                                    <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSaveShop} isLoading={loading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    Change Password
                                </h2>
                                <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        helperText="Must be at least 6 characters"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginTop: '2rem' }}>
                                    <Button variant="primary" leftIcon={<Lock size={18} />} onClick={handleChangePassword} isLoading={loading}>
                                        Update Password
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Billing Settings Tab */}
                        {activeTab === 'billing' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    Billing Settings
                                </h2>
                                <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                                    <Input
                                        label="Default Tax Rate (%)"
                                        type="number"
                                        value={taxSettings.defaultTaxRate}
                                        onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxRate: Number(e.target.value) })}
                                    />
                                    <Input
                                        label="Low Stock Alert Threshold"
                                        type="number"
                                        value={taxSettings.lowStockThreshold}
                                        onChange={(e) => setTaxSettings({ ...taxSettings, lowStockThreshold: Number(e.target.value) })}
                                        helperText="Products below this quantity will show as low stock"
                                    />
                                    <Input
                                        label="Invoice Number Prefix"
                                        value={taxSettings.invoicePrefix}
                                        onChange={(e) => setTaxSettings({ ...taxSettings, invoicePrefix: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginTop: '2rem' }}>
                                    <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSaveShop} isLoading={loading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    Notification Preferences
                                </h2>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {[
                                        { id: 'lowStock', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
                                        { id: 'dailySummary', label: 'Daily Sales Summary', description: 'Receive daily sales report via email' },
                                        { id: 'newOrder', label: 'New Order Notifications', description: 'Get notified for each new order' },
                                        { id: 'staffActivity', label: 'Staff Activity', description: 'Monitor staff login and actions' },
                                    ].map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '0.75rem',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.description}</div>
                                            </div>
                                            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                                                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                                                <span style={{
                                                    position: 'absolute',
                                                    cursor: 'pointer',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: 'var(--color-primary-500)',
                                                    borderRadius: '26px',
                                                    transition: '0.4s',
                                                }}>
                                                    <span style={{
                                                        position: 'absolute',
                                                        height: '20px',
                                                        width: '20px',
                                                        left: '3px',
                                                        bottom: '3px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '50%',
                                                        transition: '0.4s',
                                                        transform: 'translateX(22px)',
                                                    }} />
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '2rem' }}>
                                    <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSaveShop} isLoading={loading}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Verification Modal */}
            <Modal
                isOpen={isVerifyModalOpen}
                onClose={() => {
                    setIsVerifyModalOpen(false);
                    setError('');
                    setOtp('');
                    setVerificationStep(1);
                }}
                title="Verify Email Address"
                size="sm"
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    {verificationStep === 1 ? (
                        <>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'var(--color-primary-50)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                color: 'var(--color-primary-600)'
                            }}>
                                <Bell size={32} />
                            </div>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                We will send a 6-digit verification code to <strong>{user?.email}</strong>
                            </p>
                            <Button
                                variant="primary"
                                style={{ width: '100%' }}
                                onClick={handleSendVerification}
                                isLoading={verifying}
                            >
                                Send Code
                            </Button>
                        </>
                    ) : (
                        <>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                Enter the 6-digit code sent to your email
                            </p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <Input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Button
                                    variant="ghost"
                                    onClick={() => setVerificationStep(1)}
                                    disabled={verifying}
                                >
                                    Resend
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleVerifyEmail}
                                    isLoading={verifying}
                                >
                                    Verify
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}
