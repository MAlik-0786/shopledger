import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
    merchantId: Types.ObjectId;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: [true, 'Merchant ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        color: {
            type: String,
            default: '#6366f1',
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

// Compound unique index for category name within a merchant
CategorySchema.index({ merchantId: 1, name: 1 }, { unique: true });
CategorySchema.index({ merchantId: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
