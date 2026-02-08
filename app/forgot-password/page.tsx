'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button, Input, Alert, Loader } from '@/components/ui';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage(data.message || 'OTP sent to your email.');
                setStep(2);
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!otp || !newPassword) {
            setError('Please enter both OTP and new password');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Password reset successful!');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9375rem' }}>
                        {step === 1
                            ? 'Enter your email to receive a reset OTP'
                            : 'Enter the 6-digit code and choose a new password'}
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    {error && <div style={{ marginBottom: '1.5rem' }}><Alert variant="error">{error}</Alert></div>}
                    {message && <div style={{ marginBottom: '1.5rem' }}><Alert variant="success">{message}</Alert></div>}

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }}
                                    />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ paddingLeft: '3rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                            >
                                Send Reset OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="form-label">Verification Code (OTP)</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        style={{ paddingLeft: '3rem', letterSpacing: '4px', fontWeight: 'bold' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--color-gray-200)',
                    }}>
                        <Link href="/login" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9375rem',
                            textDecoration: 'none'
                        }}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
