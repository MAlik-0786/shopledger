import mongoose, { Schema, Document } from 'mongoose';

export interface IMerchant extends Document {
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
    logo?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>(
    {
        shopName: {
            type: String,
            required: [true, 'Shop name is required'],
            trim: true,
            maxlength: [100, 'Shop name cannot exceed 100 characters'],
        },
        ownerName: {
            type: String,
            required: [true, 'Owner name is required'],
            trim: true,
            maxlength: [50, 'Owner name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
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
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'],
        },
        businessType: {
            type: String,
            required: [true, 'Business type is required'],
            enum: ['retail', 'wholesale', 'restaurant', 'grocery', 'electronics', 'clothing', 'other'],
        },
        gstNumber: {
            type: String,
            trim: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number'],
        },
        logo: {
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

// Index for faster queries
MerchantSchema.index({ email: 1 });
MerchantSchema.index({ shopName: 'text' });

export default mongoose.models.Merchant || mongoose.model<IMerchant>('Merchant', MerchantSchema);
