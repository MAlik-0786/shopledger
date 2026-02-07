'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className="btn btn-ghost btn-icon lg:hidden"
                    onClick={onMenuClick}
                    style={{ display: 'flex' }}
                >
                    <Menu size={24} />
                </button>

                <div className="header-search">
                    <Search className="search-icon" />
                    <input type="text" placeholder="Search products, invoices..." />
                </div>
            </div>

            <div className="header-actions">
                <button
                    className="btn btn-ghost btn-icon"
                    style={{ position: 'relative' }}
                >
                    <Bell size={20} />
                    <span
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-error)',
                            borderRadius: '50%',
                        }}
                    />
                </button>

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
