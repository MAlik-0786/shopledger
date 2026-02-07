'use client';

import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
    data: { date: string; revenue: number; orders: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | number | Date) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Revenue Overview</h3>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
                {data.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                                labelFormatter={(label) => formatDate(label as string)}
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

interface TopProductsChartProps {
    data: { name: string; totalSold: number; revenue: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e'];

    return (
        <div className="card">
            <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Top Selling Products</h3>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
                {data.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={120}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip
                                formatter={(value) => [value, 'Units Sold']}
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Bar dataKey="totalSold" radius={[0, 4, 4, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

interface CategoryDistributionProps {
    data: { category: string; sales: number; revenue: number }[];
}

export function CategoryDistribution({ data }: CategoryDistributionProps) {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Sales by Category</h3>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
                {data.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="revenue"
                                nameKey="category"
                                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                labelLine={false}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

interface SalesComparisonProps {
    data: { date: string; sales: number; expenses: number }[];
}

export function SalesComparisonChart({ data }: SalesComparisonProps) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Sales vs Orders</h3>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#6366f1' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10b981' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
