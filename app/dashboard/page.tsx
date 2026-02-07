'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    AlertTriangle,
    FileText,
    ArrowUpRight,
} from 'lucide-react';
import { StatCard, Badge, Loader } from '@/components/ui';
import { RevenueChart, TopProductsChart, CategoryDistribution } from '@/components/charts';
import { DashboardStats, RevenueData, TopProduct, CategorySales, ProductProfile } from '@/types';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<ProductProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, revenueRes, topProductsRes, categoryRes, lowStockRes] = await Promise.all([
                fetch('/api/analytics?type=dashboard'),
                fetch('/api/analytics?type=revenue&days=30'),
                fetch('/api/analytics?type=topProducts&days=30'),
                fetch('/api/analytics?type=categorySales&days=30'),
                fetch('/api/products?lowStock=true&limit=5'),
            ]);

            const statsData = await statsRes.json();
            const revenueResult = await revenueRes.json();
            const topProductsData = await topProductsRes.json();
            const categoryData = await categoryRes.json();
            const lowStockData = await lowStockRes.json();

            if (statsData.success) setStats(statsData.data);
            if (revenueResult.success) setRevenueData(revenueResult.data);
            if (topProductsData.success) setTopProducts(topProductsData.data);
            if (categoryData.success) setCategorySales(categoryData.data);
            if (lowStockData.success) setLowStockProducts(lowStockData.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
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
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <StatCard
                    title="Total Revenue (w/ GST)"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={TrendingUp}
                    color="primary"
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard
                    title="Net Revenue (w/o GST)"
                    value={formatCurrency(stats?.totalRevenueWithoutTax || 0)}
                    icon={TrendingUp}
                    color="info"
                />
                <StatCard
                    title="Total GST"
                    value={formatCurrency(stats?.totalTax || 0)}
                    icon={FileText}
                    color="warning"
                />
                <StatCard
                    title="Today's Sales"
                    value={formatCurrency(stats?.todaySales || 0)}
                    icon={ShoppingCart}
                    color="success"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    color="info"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats?.lowStockCount || 0}
                    icon={AlertTriangle}
                    color={stats?.lowStockCount && stats.lowStockCount > 0 ? 'warning' : 'success'}
                />
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <RevenueChart data={revenueData} />
                <TopProductsChart data={topProducts} />
            </div>

            {/* Lower Section */}
            <div className="grid-2">
                <CategoryDistribution data={categorySales} />

                {/* Low Stock Alert */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} color="#f59e0b" />
                            Low Stock Alerts
                        </h3>
                        <a href="/dashboard/products?lowStock=true" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            View All <ArrowUpRight size={16} />
                        </a>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {lowStockProducts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <Package size={40} color="var(--text-muted)" />
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                                    All products are well stocked!
                                </p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                        SKU: {product.sku}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600 }}>
                                                    {product.stock} {product.unit}
                                                </span>
                                            </td>
                                            <td>
                                                <Badge variant={product.stock === 0 ? 'error' : 'warning'}>
                                                    {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} color="var(--color-primary-500)" />
                        Quick Stats
                    </h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Total Invoices
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.totalInvoices || 0}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Today&apos;s Invoices
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.todayInvoices || 0}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Avg. Order Value
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.totalInvoices && stats.totalInvoices > 0
                                    ? formatCurrency((stats.totalRevenue || 0) / stats.totalInvoices)
                                    : '₹0'}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Products Categories
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {categorySales.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
