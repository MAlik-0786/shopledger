'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Phone, MapPin, Building, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Alert, Loader } from '@/components/ui';
import { MerchantRegisterData } from '@/types';

const businessTypes = [
    { value: 'retail', label: 'Retail Store' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Apparel' },
    { value: 'other', label: 'Other' },
];

const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<MerchantRegisterData>({
        shopName: '',
        ownerName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        businessType: '',
        gstNumber: '',
    });

    const { register, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateStep1 = () => {
        if (!formData.shopName.trim()) {
            setError('Shop name is required');
            return false;
        }
        if (!formData.ownerName.trim()) {
            setError('Owner name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            setError('Please enter a valid email');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }
        if (!formData.address.trim()) {
            setError('Address is required');
            return false;
        }
        if (!formData.city.trim()) {
            setError('City is required');
            return false;
        }
        if (!formData.state) {
            setError('State is required');
            return false;
        }
        if (!formData.pincode.trim()) {
            setError('Pincode is required');
            return false;
        }
        if (!/^\d{6}$/.test(formData.pincode)) {
            setError('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.businessType) {
            setError('Please select a business type');
            return false;
        }
        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
            setError('Please enter a valid GST number');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateStep3()) return;

        setIsLoading(true);
        const result = await register(formData);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Registration failed');
        }
        setIsLoading(false);
    };

    if (loading) {
        return <Loader fullScreen />;
    }

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
                maxWidth: '520px',
                background: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                    }}>
                        <Store size={28} color="white" />
                        <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>ShopLedger</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Create Your Account
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                        Step {step} of 3: {step === 1 ? 'Account Details' : step === 2 ? 'Business Address' : 'Business Info'}
                    </p>

                    {/* Progress Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1.25rem',
                        justifyContent: 'center',
                    }}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    width: '4rem',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: s <= step ? 'white' : 'rgba(255, 255, 255, 0.3)',
                                    transition: 'background 0.3s',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Alert variant="error">{error}</Alert>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Account Details */}
                        {step === 1 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Shop Name *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            name="shopName"
                                            className="form-input"
                                            placeholder="Enter your shop name"
                                            value={formData.shopName}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Owner Name *</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            name="ownerName"
                                            className="form-input"
                                            placeholder="Enter your full name"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-input"
                                            placeholder="Create a password (min 6 characters)"
                                            value={formData.password}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2: Business Address */}
                        {step === 2 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-input"
                                            placeholder="Enter 10-digit phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem' }}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Address *</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={20} style={{ position: 'absolute', left: '1rem', top: '0.875rem', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-input"
                                            placeholder="Enter your shop address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            style={{ paddingLeft: '3rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-input"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className="form-input"
                                            placeholder="6-digit pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <select
                                        name="state"
                                        className="form-select"
                                        value={formData.state}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Step 3: Business Info */}
                        {step === 3 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Business Type *</label>
                                    <select
                                        name="businessType"
                                        className="form-select"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Business Type</option>
                                        {businessTypes.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">GST Number (Optional)</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        className="form-input"
                                        placeholder="e.g., 22AAAAA0000A1Z5"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        You can add this later from settings
                                    </p>
                                </div>

                                <div style={{
                                    background: 'var(--color-primary-50)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-700)' }}>
                                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep(step - 1)}
                                    leftIcon={<ArrowLeft size={18} />}
                                    style={{ flex: 1 }}
                                >
                                    Back
                                </Button>
                            )}

                            {step < 3 ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleNext}
                                    rightIcon={<ArrowRight size={18} />}
                                    style={{ flex: 1 }}
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                    style={{ flex: 1 }}
                                >
                                    Create Account
                                </Button>
                            )}
                        </div>
                    </form>

                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--color-gray-200)',
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
