import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
    merchantId: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'manager' | 'cashier' | 'inventory' | 'viewer';
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: [true, 'Merchant ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Staff name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['manager', 'cashier', 'inventory', 'viewer'],
                message: '{VALUE} is not a valid role',
            },
            default: 'cashier',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index for email within a merchant
StaffSchema.index({ merchantId: 1, email: 1 }, { unique: true });
StaffSchema.index({ merchantId: 1 });

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
