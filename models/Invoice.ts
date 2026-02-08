import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoiceItem {
    productId: Types.ObjectId;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice: number;
}

export interface IInvoice extends Document {
    merchantId: Types.ObjectId;
    staffId?: Types.ObjectId;
    invoiceNumber: string;
    items: IInvoiceItem[];
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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price cannot be negative'],
        },
        costPrice: {
            type: Number,
            required: true,
            min: [0, 'Cost price cannot be negative'],
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Total price cannot be negative'],
        },
    },
    { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: [true, 'Merchant ID is required'],
        },
        staffId: {
            type: Schema.Types.ObjectId,
            ref: 'Staff',
        },
        invoiceNumber: {
            type: String,
            required: [true, 'Invoice number is required'],
            unique: true,
        },
        items: {
            type: [InvoiceItemSchema],
            required: [true, 'At least one item is required'],
            validate: {
                validator: function (items: IInvoiceItem[]) {
                    return items.length > 0;
                },
                message: 'Invoice must have at least one item',
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative'],
        },
        taxRate: {
            type: Number,
            default: 18,
            min: [0, 'Tax rate cannot be negative'],
            max: [100, 'Tax rate cannot exceed 100%'],
        },
        taxAmount: {
            type: Number,
            required: true,
            min: [0, 'Tax amount cannot be negative'],
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'fixed',
        },
        discountValue: {
            type: Number,
            default: 0,
            min: [0, 'Discount value cannot be negative'],
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: [0, 'Discount amount cannot be negative'],
        },
        grandTotal: {
            type: Number,
            required: true,
            min: [0, 'Grand total cannot be negative'],
        },
        customerName: {
            type: String,
            trim: true,
            maxlength: [50, 'Customer name cannot exceed 50 characters'],
        },
        customerPhone: {
            type: String,
            trim: true,
        },
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required'],
            enum: {
                values: ['cash', 'card', 'upi', 'credit'],
                message: '{VALUE} is not a valid payment method',
            },
            default: 'cash',
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'partial'],
            default: 'paid',
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [200, 'Notes cannot exceed 200 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
InvoiceSchema.index({ merchantId: 1, createdAt: -1 });
InvoiceSchema.index({ merchantId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ merchantId: 1, paymentStatus: 1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
