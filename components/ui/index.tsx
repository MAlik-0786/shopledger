'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const colorMap = {
    primary: {
        bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        icon: '#6366f1',
    },
    success: {
        bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        icon: '#10b981',
    },
    warning: {
        bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        icon: '#f59e0b',
    },
    error: {
        bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        icon: '#ef4444',
    },
    info: {
        bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        icon: '#3b82f6',
    },
};

export function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
    const colors = colorMap[color];

    return (
        <div className="stat-card">
            <div
                className="icon-wrapper"
                style={{ background: colors.bg }}
            >
                <Icon size={24} style={{ color: colors.icon }} />
            </div>
            <div className="value">{value}</div>
            <div className="label">{title}</div>
            {trend && (
                <div className={`trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                    <span>{trend.isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(trend.value)}%</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>vs last month</span>
                </div>
            )}
        </div>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

    return (
        <button
            className={`btn btn-${variant} ${sizeClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="loader" />
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <input
                className={`form-input ${error ? 'error' : ''} ${className}`}
                {...props}
            />
            {error && <p className="form-error">{error}</p>}
            {helperText && !error && (
                <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <select className={`form-select ${error ? 'error' : ''} ${className}`} {...props}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const maxWidth = size === 'sm' ? '24rem' : size === 'lg' ? '48rem' : '32rem';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        style={{ marginLeft: 'auto' }}
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}

interface BadgeProps {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    children: ReactNode;
}

export function Badge({ variant = 'primary', children }: BadgeProps) {
    return <span className={`badge badge-${variant}`}>{children}</span>;
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <Icon className="empty-state-icon" />
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {action}
        </div>
    );
}

interface AlertProps {
    variant?: 'success' | 'error' | 'warning' | 'info';
    children: ReactNode;
}

export function Alert({ variant = 'info', children }: AlertProps) {
    return (
        <div className={`alert alert-${variant}`}>
            {children}
        </div>
    );
}

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

export function Loader({ size = 'md', fullScreen = false }: LoaderProps) {
    const sizeMap = { sm: '1rem', md: '1.5rem', lg: '2.5rem' };

    const loader = (
        <div
            className="loader loader-dark"
            style={{ width: sizeMap[size], height: sizeMap[size] }}
        />
    );

    if (fullScreen) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'var(--bg-secondary)',
                }}
            >
                {loader}
            </div>
        );
    }

    return loader;
}
