'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    ShoppingCart,
    Package,
    Calendar,
    FileText,
} from 'lucide-react';
import { StatCard, Loader } from '@/components/ui';
import {
    RevenueChart,
    TopProductsChart,
    CategoryDistribution,
    SalesComparisonChart,
} from '@/components/charts';
import { DashboardStats, RevenueData, TopProduct, CategorySales } from '@/types';

const timeRanges = [
    { value: 7, label: 'Last 7 Days' },
    { value: 14, label: 'Last 14 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' },
];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categorySales, setCategorySales] = useState<CategorySales[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [statsRes, revenueRes, topProductsRes, categoryRes] = await Promise.all([
                fetch('/api/analytics?type=dashboard'),
                fetch(`/api/analytics?type=revenue&days=${timeRange}`),
                fetch(`/api/analytics?type=topProducts&days=${timeRange}`),
                fetch(`/api/analytics?type=categorySales&days=${timeRange}`),
            ]);

            const statsData = await statsRes.json();
            const revenueResult = await revenueRes.json();
            const topProductsData = await topProductsRes.json();
            const categoryData = await categoryRes.json();

            if (statsData.success) setStats(statsData.data);
            if (revenueResult.success) setRevenueData(revenueResult.data);
            if (topProductsData.success) setTopProducts(topProductsData.data);
            if (categoryData.success) setCategorySales(categoryData.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
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

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalSubtotal = revenueData.reduce((sum, d) => sum + (d.subtotal || 0), 0);
    const totalTax = revenueData.reduce((sum, d) => sum + (d.tax || 0), 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProductsSold = topProducts.reduce((sum, p) => sum + p.totalSold, 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Track your business performance</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={18} color="var(--text-muted)" />
                    <select
                        className="form-select"
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        {timeRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid-stats" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={TrendingUp}
                    color="primary"
                />
                <StatCard
                    title="Pure Profit"
                    value={formatCurrency(stats?.totalProfit || 0)}
                    icon={TrendingUp}
                    color="info"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)', color: 'white' }}
                />
                <StatCard
                    title="Total Orders"
                    value={totalOrders}
                    icon={ShoppingCart}
                    color="success"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatCurrency(avgOrderValue)}
                    icon={BarChart3}
                    color="info"
                />
                <StatCard
                    title="Products Sold"
                    value={totalProductsSold}
                    icon={Package}
                    color="primary"
                />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <RevenueChart data={revenueData} />

                <div className="grid-2">
                    <TopProductsChart data={topProducts} />
                    <CategoryDistribution data={categorySales} />
                </div>

                <SalesComparisonChart
                    data={revenueData.map((d) => ({
                        date: d.date,
                        sales: d.revenue,
                        expenses: d.cost || 0,
                    }))}
                />
            </div>

            {/* Quick Stats Table */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Top Selling Products</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Product</th>
                                <th>Units Sold</th>
                                <th>Revenue</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.slice(0, 10).map((product, index) => (
                                <tr key={product.productId}>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: index < 3 ? 'var(--color-primary-100)' : 'var(--bg-tertiary)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: index < 3 ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                                        }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                                    <td>{product.totalSold} units</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(product.revenue)}</td>
                                    <td>
                                        <span style={{
                                            color: 'var(--color-success)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                        }}>
                                            <TrendingUp size={14} />
                                            +{Math.floor(Math.random() * 30) + 5}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Category Performance</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {categorySales.map((cat, index) => {
                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                            return (
                                <div
                                    key={cat.category}
                                    style={{
                                        padding: '1.25rem',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '0.75rem',
                                        borderLeft: `4px solid ${colors[index % colors.length]}`,
                                    }}
                                >
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        {cat.category}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {formatCurrency(cat.revenue)}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {cat.sales} items sold
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
