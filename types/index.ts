// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    total?: number;
    page?: number;
    limit?: number;
}

// Auth Types
export interface TokenPayload {
    id: string;
    email: string;
    role: 'merchant' | 'staff';
    merchantId?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'merchant' | 'staff';
    shopName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    businessType?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'merchant' | 'staff';
    staffRole?: 'manager' | 'cashier' | 'inventory' | 'viewer';
    merchantId: string;
    shopName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    businessType?: string;
    isEmailVerified?: boolean;
}

export interface MerchantProfile {
    id: string;
    shopName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    businessType: string;
    gstNumber?: string;
    logo?: string;
    isActive: boolean;
    createdAt: string;
}

export interface MerchantRegisterData {
    shopName: string;
    ownerName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    businessType: string;
    gstNumber?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: UserProfile;
    token: string;
}

// Product Types
export interface ProductProfile {
    id: string;
    merchantId?: string;
    name: string;
    description?: string;
    sku: string;
    price: number;
    costPrice?: number;
    stock: number;
    lowStockThreshold: number;
    unit: string;
    categoryId?: string;
    categoryName?: string;
    qrCode: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductData {
    name: string;
    description?: string;
    categoryId?: string;
    price: number;
    costPrice?: number;
    stock: number;
    lowStockThreshold: number;
    unit: string;
    image?: string;
}

// Category Types
export interface CategoryProfile {
    id: string;
    merchantId?: string;
    name: string;
    description?: string;
    color?: string;
    productCount: number;
    isActive: boolean;
    createdAt: string;
}

export interface CategoryData {
    name: string;
    description?: string;
    color?: string;
}

// Staff Types
export interface StaffProfile {
    id: string;
    merchantId?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface StaffData {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'manager' | 'cashier' | 'inventory' | 'viewer';
    isActive?: boolean;
}

// Invoice Types
export interface InvoiceItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice: number;
}

export interface InvoiceItemProfile {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice: number;
}

export interface InvoiceProfile {
    id: string;
    merchantId?: string;
    invoiceNumber: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    grandTotal: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
    paymentStatus: 'paid' | 'pending' | 'partial';
    staffId?: string;
    staffName?: string;
    notes?: string;
    createdAt: string;
}

export interface InvoiceData {
    items: {
        productId: string;
        quantity: number;
    }[];
    taxRate: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
    paymentStatus: 'paid' | 'pending' | 'partial';
    notes?: string;
}

// Analytics Types
export interface DashboardStats {
    totalProducts: number;
    totalCategories: number;
    totalInvoices: number;
    todayInvoices: number;
    totalRevenue: number;
    todaySales: number;
    totalProfit: number;
    todayProfit: number;
    lowStockCount: number;
    totalTax: number;
    totalRevenueWithoutTax: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    subtotal: number;
    tax: number;
    orders: number;
    cost?: number;
}

export interface TopProduct {
    productId: string;
    name: string;
    totalSold: number;
    revenue: number;
}

export interface CategorySales {
    category: string;
    sales: number;
    revenue: number;
}
