'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Shield,
} from 'lucide-react';
import { Button, Input, Modal, Badge, EmptyState, Loader } from '@/components/ui';
import { StaffProfile, StaffData } from '@/types';
import { useAuth } from '@/context/AuthContext';

const roleOptions = [
    { value: 'manager', label: 'Manager', description: 'Full access except billing' },
    { value: 'cashier', label: 'Cashier', description: 'Billing and view products' },
    { value: 'inventory', label: 'Inventory', description: 'Manage products only' },
    { value: 'viewer', label: 'Viewer', description: 'View only access' },
];

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const { user } = useAuth();

    const [formData, setFormData] = useState<StaffData>({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'cashier',
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff');
            const data = await res.json();
            if (data.success) {
                setStaff(data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setStaff((prev) => [data.data, ...prev]);
                setIsAddModalOpen(false);
                resetForm();
            } else {
                alert(data.error || 'Failed to add staff');
            }
        } catch (error) {
            console.error('Error adding staff:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;
        setFormLoading(true);

        const updateData: Partial<StaffData> = {
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
        };
        if (formData.password) {
            updateData.password = formData.password;
        }

        try {
            const res = await fetch(`/api/staff/${selectedStaff.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const data = await res.json();
            if (data.success) {
                setStaff((prev) =>
                    prev.map((s) => (s.id === selectedStaff.id ? data.data : s))
                );
                setIsEditModalOpen(false);
                resetForm();
            } else {
                alert(data.error || 'Failed to update staff');
            }
        } catch (error) {
            console.error('Error updating staff:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (staffMember: StaffProfile) => {
        try {
            const res = await fetch(`/api/staff/${staffMember.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !staffMember.isActive }),
            });

            const data = await res.json();
            if (data.success) {
                setStaff((prev) =>
                    prev.map((s) => (s.id === staffMember.id ? data.data : s))
                );
            }
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;

        try {
            const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setStaff((prev) => prev.filter((s) => s.id !== id));
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const openEditModal = (staffMember: StaffProfile) => {
        setSelectedStaff(staffMember);
        setFormData({
            name: staffMember.name,
            email: staffMember.email,
            password: '',
            phone: staffMember.phone,
            role: staffMember.role as StaffData['role'],
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'cashier',
        });
        setSelectedStaff(null);
    };

    const formatDate = (date?: string) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'manager':
                return <Badge variant="primary">Manager</Badge>;
            case 'cashier':
                return <Badge variant="success">Cashier</Badge>;
            case 'inventory':
                return <Badge variant="info">Inventory</Badge>;
            case 'viewer':
                return <Badge variant="warning">Viewer</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    if (user?.role !== 'merchant') {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Shield size={48} color="var(--text-muted)" />
                <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>Access Denied</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Only shop owners can manage staff members.</p>
            </div>
        );
    }

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
                    <h1 className="page-title">Staff Management</h1>
                    <p className="page-subtitle">Manage your team members and their access</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    Add Staff
                </Button>
            </div>

            {/* Staff Grid */}
            {staff.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={Users}
                        title="No staff members"
                        description="Add team members to help manage your shop."
                        action={
                            <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
                                Add Staff
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {staff.map((member) => (
                        <div key={member.id} className="card" style={{ overflow: 'visible' }}>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: member.isActive ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))' : 'var(--color-gray-300)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                        }}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{member.name}</h3>
                                            {getRoleBadge(member.role)}
                                        </div>
                                    </div>
                                    <Badge variant={member.isActive ? 'success' : 'error'}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        <Mail size={14} />
                                        <span>{member.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        <Phone size={14} />
                                        <span>{member.phone}</span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    Last login: {formatDate(member.lastLogin)}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-gray-200)', paddingTop: '1rem' }}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={member.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        onClick={() => handleToggleActive(member)}
                                    >
                                        {member.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Edit2 size={16} />}
                                        onClick={() => openEditModal(member)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Trash2 size={16} />}
                                        onClick={() => handleDeleteStaff(member.id)}
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Staff Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Staff"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddStaff} isLoading={formLoading}>Add Staff</Button>
                    </>
                }
            >
                <form onSubmit={handleAddStaff}>
                    <Input
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter staff name"
                        required
                    />
                    <Input
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="Enter email address"
                        required
                    />
                    <Input
                        label="Password *"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        placeholder="Create a password"
                        required
                    />
                    <Input
                        label="Phone Number *"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="Enter phone number"
                        required
                    />
                    <div className="form-group">
                        <label className="form-label">Role *</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleFormChange}
                        >
                            {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {roleOptions.find((r) => r.value === formData.role)?.description}
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Staff"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleEditStaff} isLoading={formLoading}>Save Changes</Button>
                    </>
                }
            >
                <form onSubmit={handleEditStaff}>
                    <Input
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter staff name"
                        required
                    />
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        helperText="Email cannot be changed"
                    />
                    <Input
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        placeholder="Leave blank to keep current"
                    />
                    <Input
                        label="Phone Number *"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="Enter phone number"
                        required
                    />
                    <div className="form-group">
                        <label className="form-label">Role *</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleFormChange}
                        >
                            {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
