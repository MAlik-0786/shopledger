import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, ProductProfile, ProductData } from '@/types';

// GET single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        const product = await Product.findOne({ _id: id, merchantId })
            .populate('categoryId', 'name color')
            .lean();

        if (!product) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        const productProfile: ProductProfile = {
            id: product._id.toString(),
            merchantId: product.merchantId.toString(),
            categoryId: product.categoryId?._id?.toString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categoryName: (product.categoryId as any)?.name,
            name: product.name,
            description: product.description,
            sku: product.sku,
            price: product.price,
            costPrice: product.costPrice,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            unit: product.unit,
            qrCode: product.qrCode,
            image: product.image,
            isActive: product.isActive,
            createdAt: product.createdAt.toISOString(),
        };

        return NextResponse.json<ApiResponse<ProductProfile>>(
            { success: true, data: productProfile }
        );
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.role === 'staff') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;
        const body: Partial<ProductData> = await request.json();

        // Find existing product
        const existingProduct = await Product.findOne({ _id: id, merchantId });
        if (!existingProduct) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate category if provided
        if (body.categoryId) {
            const category = await Category.findOne({ _id: body.categoryId, merchantId });
            if (!category) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Category not found' },
                    { status: 404 }
                );
            }
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: body.name ?? existingProduct.name,
                description: body.description,
                categoryId: body.categoryId ?? existingProduct.categoryId,
                price: body.price ?? existingProduct.price,
                costPrice: body.costPrice,
                stock: body.stock ?? existingProduct.stock,
                lowStockThreshold: body.lowStockThreshold ?? existingProduct.lowStockThreshold,
                unit: body.unit ?? existingProduct.unit,
                image: body.image ?? existingProduct.image,
            },
            { new: true }
        ).populate('categoryId', 'name color');

        if (!updatedProduct) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Failed to update product' },
                { status: 500 }
            );
        }

        const productProfile: ProductProfile = {
            id: updatedProduct._id.toString(),
            merchantId: updatedProduct.merchantId.toString(),
            categoryId: updatedProduct.categoryId?._id?.toString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categoryName: (updatedProduct.categoryId as any)?.name,
            name: updatedProduct.name,
            description: updatedProduct.description,
            sku: updatedProduct.sku,
            price: updatedProduct.price,
            costPrice: updatedProduct.costPrice,
            stock: updatedProduct.stock,
            lowStockThreshold: updatedProduct.lowStockThreshold,
            unit: updatedProduct.unit,
            qrCode: updatedProduct.qrCode,
            image: updatedProduct.image,
            isActive: updatedProduct.isActive,
            createdAt: updatedProduct.createdAt.toISOString(),
        };

        return NextResponse.json<ApiResponse<ProductProfile>>(
            { success: true, data: productProfile, message: 'Product updated successfully' }
        );
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.role === 'staff') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        const product = await Product.findOneAndUpdate(
            { _id: id, merchantId },
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Product deleted successfully' }
        );
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
