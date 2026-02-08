'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, AlertTriangle, PackageX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProductProfile } from '@/types';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<ProductProfile[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products?lowStock=true&limit=10');
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Fetch alerts error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onMenuClick}
                    style={{ display: 'flex' }}
                >
                    <Menu size={24} />
                </button>


            </div>

            <div className="header-actions">
                <div style={{ position: 'relative' }} ref={notificationRef}>
                    <button
                        className="btn btn-ghost btn-icon"
                        style={{ position: 'relative' }}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {alerts.length > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '18px',
                                    height: '18px',
                                    background: 'var(--color-error)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    border: '2px solid white'
                                }}
                            >
                                {alerts.length > 9 ? '9+' : alerts.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '320px',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: 'var(--shadow-xl)',
                            marginTop: '0.75rem',
                            zIndex: 100,
                            overflow: 'hidden',
                            border: '1px solid var(--color-gray-200)'
                        }}>
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--color-gray-100)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Stock Alerts</h3>
                                {loading && <div className="loader loader-dark" style={{ width: '12px', height: '12px' }} />}
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {alerts.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem' }}>No inventory alerts</p>
                                    </div>
                                ) : (
                                    alerts.map((alert) => {
                                        const isOutOfStock = alert.stock <= 0;
                                        return (
                                            <div
                                                key={alert.id}
                                                style={{
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    borderBottom: '1px solid var(--color-gray-50)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                }}
                                                className="notification-item"
                                            >
                                                <div style={{
                                                    width: '2.5rem',
                                                    height: '2.5rem',
                                                    borderRadius: '0.5rem',
                                                    background: isOutOfStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {isOutOfStock ? (
                                                        <PackageX size={18} color="#ef4444" />
                                                    ) : (
                                                        <AlertTriangle size={18} color="#f59e0b" />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {alert.name}
                                                        </p>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: 700,
                                                            color: isOutOfStock ? '#ef4444' : '#f59e0b',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            SKU: {alert.sku}
                                                        </p>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                            Stock: <span style={{ color: isOutOfStock ? '#ef4444' : 'inherit' }}>{alert.stock} {alert.unit}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {alerts.length > 0 && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-gray-50)',
                                    textAlign: 'center',
                                    borderTop: '1px solid var(--color-gray-100)'
                                }}>
                                    <button
                                        onClick={() => {
                                            setShowNotifications(false);
                                            window.location.href = '/dashboard/products?lowStock=true';
                                        }}
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--color-primary-600)',
                                            fontWeight: 600,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View all products
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="user-menu">
                    <div className="user-avatar">
                        {user?.name ? getInitials(user.name) : 'U'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {user?.name || 'User'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {user?.role === 'merchant' ? 'Owner' : 'Staff'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
