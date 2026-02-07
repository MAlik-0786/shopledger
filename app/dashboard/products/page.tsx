'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    QrCode,
    Filter,
    X,
    Download,
    Barcode as BarcodeIcon,
} from 'lucide-react';
import { Button, Input, Modal, Badge, EmptyState, Loader } from '@/components/ui';
import { ProductProfile, CategoryProfile, ProductData } from '@/types';
import Barcode from 'react-barcode';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductProfile[]>([]);
    const [categories, setCategories] = useState<CategoryProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductProfile | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<ProductData>({
        name: '',
        description: '',
        categoryId: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        lowStockThreshold: 10,
        unit: 'pcs',
    });

    // Category Modal state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [categoryLoading, setCategoryLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedCategory) params.append('category', selectedCategory);
            if (showLowStock) params.append('lowStock', 'true');

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [search, selectedCategory, showLowStock]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryLoading(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory),
            });
            const data = await res.json();
            if (data.success) {
                setCategories([...categories, data.data]);
                setFormData(prev => ({ ...prev, categoryId: data.data.id }));
                setIsCategoryModalOpen(false);
                setNewCategory({ name: '', description: '' });
            } else {
                alert(data.error || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        } finally {
            setCategoryLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter changes effect
    useEffect(() => {
        const debounce = setTimeout(() => {
            setLoading(true);
            fetchProducts().finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedCategory, showLowStock]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' || name === 'costPrice' || name === 'stock' || name === 'lowStockThreshold'
                ? parseFloat(value) || 0
                : value,
        }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setProducts((prev) => [data.data, ...prev]);
                setIsAddModalOpen(false);
                resetForm();
            } else {
                alert(data.error || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setFormLoading(true);

        try {
            const res = await fetch(`/api/products/${selectedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === selectedProduct.id ? data.data : p))
                );
                setIsEditModalOpen(false);
                resetForm();
            } else {
                alert(data.error || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const openEditModal = (product: ProductProfile) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            categoryId: product.categoryId || '',
            price: product.price,
            costPrice: product.costPrice || 0,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            unit: product.unit,
        });
        setIsEditModalOpen(true);
    };

    const openBarcodeModal = (product: ProductProfile) => {
        setSelectedProduct(product);
        setIsBarcodeModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            categoryId: '',
            price: 0,
            costPrice: 0,
            stock: 0,
            lowStockThreshold: 10,
            unit: 'pcs',
        });
        setSelectedProduct(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const downloadBarcode = () => {
        if (!selectedProduct) return;
        const svg = document.querySelector('.barcode-container svg');
        if (!svg) return;

        const xml = new XMLSerializer().serializeToString(svg);
        const svg64 = btoa(xml);
        const b64Start = 'data:image/svg+xml;base64,';
        const image64 = b64Start + svg64;

        const link = document.createElement('a');
        link.href = image64;
        link.download = `${selectedProduct.sku}-barcode.svg`;
        link.click();
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Manage your product inventory</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    Add Product
                </Button>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                        />
                    </div>

                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ width: 'auto', minWidth: '160px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <Button
                        variant={showLowStock ? 'primary' : 'secondary'}
                        size="sm"
                        leftIcon={<Filter size={16} />}
                        onClick={() => setShowLowStock(!showLowStock)}
                    >
                        Low Stock
                    </Button>

                    {(search || selectedCategory || showLowStock) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X size={16} />}
                            onClick={() => {
                                setSearch('');
                                setSelectedCategory('');
                                setShowLowStock(false);
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Products Table */}
            {products.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={Package}
                        title="No products found"
                        description="Get started by adding your first product or adjust your filters."
                        action={
                            <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
                                Add Product
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'var(--color-primary-100)',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Package size={20} color="var(--color-primary-600)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                {product.description && (
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {product.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8125rem' }}>
                                            {product.sku}
                                        </code>
                                    </td>
                                    <td>
                                        {product.categoryName ? (
                                            <Badge variant="primary">{product.categoryName}</Badge>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                                    <td>
                                        <span style={{ fontWeight: 500 }}>
                                            {product.stock} {product.unit}
                                        </span>
                                    </td>
                                    <td>
                                        {product.stock === 0 ? (
                                            <Badge variant="error">Out of Stock</Badge>
                                        ) : product.stock <= product.lowStockThreshold ? (
                                            <Badge variant="warning">Low Stock</Badge>
                                        ) : (
                                            <Badge variant="success">In Stock</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => openBarcodeModal(product)}
                                                title="View Barcode"
                                            >
                                                <BarcodeIcon size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => openEditModal(product)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                title="Delete"
                                                style={{ color: 'var(--color-error)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Product Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Product"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddProduct} isLoading={formLoading}>Add Product</Button>
                    </>
                }
            >
                <form onSubmit={handleAddProduct}>
                    <Input
                        label="Product Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter product name"
                        required
                    />

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            rows={3}
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="Enter product description"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    name="categoryId"
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    title="Add New Category"
                                    style={{ padding: '0.75rem' }}
                                >
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select
                                name="unit"
                                className="form-select"
                                value={formData.unit}
                                onChange={handleFormChange}
                            >
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="box">Box</option>
                                <option value="pack">Pack</option>
                                <option value="dozen">Dozen</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Selling Price *"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            step="0.01"
                            required
                        />
                        <Input
                            label="Cost Price"
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            step="0.01"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Stock Quantity *"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            required
                        />
                        <Input
                            label="Low Stock Alert"
                            name="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={handleFormChange}
                            placeholder="10"
                            min={0}
                            helperText="Alert when stock is below this"
                        />
                    </div>
                </form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Product"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleEditProduct} isLoading={formLoading}>Save Changes</Button>
                    </>
                }
            >
                <form onSubmit={handleEditProduct}>
                    <Input
                        label="Product Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter product name"
                        required
                    />

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            rows={3}
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="Enter product description"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    name="categoryId"
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    title="Add New Category"
                                    style={{ padding: '0.75rem' }}
                                >
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select
                                name="unit"
                                className="form-select"
                                value={formData.unit}
                                onChange={handleFormChange}
                            >
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="box">Box</option>
                                <option value="pack">Pack</option>
                                <option value="dozen">Dozen</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Selling Price *"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            step="0.01"
                            required
                        />
                        <Input
                            label="Cost Price"
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            step="0.01"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Stock Quantity *"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleFormChange}
                            placeholder="0"
                            min={0}
                            required
                        />
                        <Input
                            label="Low Stock Alert"
                            name="lowStockThreshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={handleFormChange}
                            placeholder="10"
                            min={0}
                        />
                    </div>
                </form>
            </Modal>

            {/* Barcode Modal */}
            <Modal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                title="Product Barcode"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsBarcodeModalOpen(false)}>Close</Button>
                        <Button variant="primary" leftIcon={<Download size={18} />} onClick={downloadBarcode}>
                            Download SVG
                        </Button>
                    </>
                }
            >
                {selectedProduct && (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div className="barcode-container" style={{ margin: '0 auto', display: 'inline-block' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                {selectedProduct.name}
                            </div>
                            <Barcode value={selectedProduct.sku} width={2} height={80} fontSize={16} />
                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginTop: '0.5rem' }}>
                                {formatCurrency(selectedProduct.price)}
                            </div>
                        </div>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Print this label for your product shelves
                        </p>
                    </div>
                )}
            </Modal>

            {/* Add Category Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Add New Category"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddCategory} isLoading={categoryLoading}>Add Category</Button>
                    </>
                }
            >
                <form onSubmit={handleAddCategory}>
                    <Input
                        label="Category Name *"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Enter category description"
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
