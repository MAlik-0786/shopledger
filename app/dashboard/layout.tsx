'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Loader } from '@/components/ui';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);



    if (loading) {
        return <Loader fullScreen />;
    }

    if (!user) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="page-container" style={{ minHeight: 'calc(100vh - 140px)' }}>
                    {children}
                </main>

                <footer style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid var(--color-gray-200)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div>
                        © 2026 ShopLedger • Built by <strong>Ashiph Ali</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <a href="mailto:malikasiph786@gmail.com" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                            malikasiph786@gmail.com
                        </a>
                        <a href="https://www.ashiphali.in" target="_blank" rel="noopener noreferrer" style={{
                            color: 'var(--color-primary-600)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                        }}>
                            Portfolio Website
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
