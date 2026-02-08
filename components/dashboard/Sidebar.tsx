'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Store,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/billing', label: 'Billing', icon: ShoppingCart },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
    { href: '/dashboard/staff', label: 'Staff', icon: Users },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`sidebar ${isOpen ? 'open' : ''}`}
            >
                <div className="sidebar-header">
                    <div className="sidebar-logo">

                        <img src="/favicon.ico" alt="ShopLedger Logo" style={{ height: '40px', width: 'auto' }} />
                        <span>ShopLedger</span>
                    </div>
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Shop Info */}
                <div style={{ padding: '1rem 1.5rem' }}>
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                        }}
                    >
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>
                            {user?.shopName || 'My Shop'}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem' }}>
                            {user?.name}
                        </p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        // Role-based access control for sidebar items
                        if (user?.role === 'staff') {
                            const role = user.staffRole;

                            // Specific restrictions
                            if (item.href === '/dashboard/staff' || item.href === '/dashboard/settings') {
                                if (role !== 'manager') return null;
                            }

                            if (item.href === '/dashboard/analytics') {
                                if (role !== 'manager' && role !== 'cashier') return null;
                            }

                            if (item.href === '/dashboard/products') {
                                if (role !== 'manager' && role !== 'cashier' && role !== 'inventory') return null;
                            }

                            if (item.href === '/dashboard/billing' || item.href === '/dashboard/invoices') {
                                if (role !== 'manager' && role !== 'cashier') return null;
                            }

                            if (item.href === '/dashboard' && role === 'viewer') {
                                return null;
                            }
                        }

                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= 1024) onClose();
                                }}
                            >
                                <Icon className="icon" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ marginTop: 'auto', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        className="nav-item"
                        style={{ width: '100%', border: 'none', background: 'none' }}
                    >
                        <LogOut className="icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
