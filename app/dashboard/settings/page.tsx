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
import { Button, Input, Alert, Loader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { user, fetchUser } = useAuth();
    const [activeTab, setActiveTab] = useState('shop');
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

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
        try {
            // In a real app, this would call an API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // In a real app, this would call an API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSaveSuccess(true);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error changing password:', error);
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
                        Settings saved successfully!
                    </Alert>
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
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={shopData.email}
                                            onChange={(e) => setShopData({ ...shopData, email: e.target.value })}
                                        />
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
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        helperText="Email cannot be changed"
                                    />
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
        </div>
    );
}
