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

    // Initialize sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        // Optional: Listen for resize if we want dynamic behavior (users rarely resize window significantly but good for completeness)
        // window.addEventListener('resize', handleResize);
        // return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                <main className="page-container">
                    {children}
                </main>
            </div>
        </div>
    );
}
