import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    merchantId: Types.ObjectId;
    categoryId?: Types.ObjectId;
    name: string;
    description?: string;
    sku: string;
    price: number;
    costPrice?: number;
    stock: number;
    lowStockThreshold: number;
    unit: string;
    qrCode: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: [true, 'Merchant ID is required'],
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            uppercase: true,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        costPrice: {
            type: Number,
            min: [0, 'Cost price cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: [0, 'Threshold cannot be negative'],
        },
        unit: {
            type: String,
            default: 'pcs',
            enum: ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'dozen'],
        },
        qrCode: {
            type: String,
            required: [true, 'QR Code is required'],
        },
        image: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ProductSchema.index({ merchantId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ merchantId: 1, categoryId: 1 });
ProductSchema.index({ merchantId: 1, name: 'text' });
ProductSchema.index({ merchantId: 1, stock: 1 }); // For low stock queries

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
