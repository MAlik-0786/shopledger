import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, CategoryProfile, CategoryData } from '@/types';

// PUT - Update category
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

        if (user.role === 'staff' && !['manager', 'cashier', 'inventory'].includes(user.staffRole || '')) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }


        await dbConnect();

        const { id } = await params;
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;
        const body: Partial<CategoryData> = await request.json();

        const category = await Category.findOneAndUpdate(
            { _id: id, merchantId },
            {
                name: body.name,
                description: body.description,
                color: body.color,
            },
            { new: true }
        );

        if (!category) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        const categoryProfile: CategoryProfile = {
            id: category._id.toString(),
            merchantId: category.merchantId.toString(),
            name: category.name,
            description: category.description,
            color: category.color,
            isActive: category.isActive,
            createdAt: category.createdAt.toISOString(),
            productCount: category.productCount ?? 0,
        };

        return NextResponse.json<ApiResponse<CategoryProfile>>(
            { success: true, data: categoryProfile, message: 'Category updated successfully' }
        );
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete category
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

        if (user.role === 'staff' && !['manager', 'cashier', 'inventory'].includes(user.staffRole || '')) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }


        await dbConnect();

        const { id } = await params;
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        const category = await Category.findOneAndUpdate(
            { _id: id, merchantId },
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Category deleted successfully' }
        );
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
