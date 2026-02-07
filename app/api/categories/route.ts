import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, CategoryProfile, CategoryData } from '@/types';

// GET all categories
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        const categories = await Category.find({ merchantId, isActive: true })
            .sort({ name: 1 })
            .lean();

        // Get product count for each category
        const categoryIds = categories.map((c) => c._id);
        const productCounts = await Product.aggregate([
            {
                $match: {
                    categoryId: { $in: categoryIds },
                    isActive: true,
                },
            },
            {
                $group: {
                    _id: '$categoryId',
                    count: { $sum: 1 },
                },
            },
        ]);

        const countMap = new Map(
            productCounts.map((pc) => [pc._id.toString(), pc.count])
        );

        const categoryProfiles: CategoryProfile[] = categories.map((category) => ({
            id: category._id.toString(),
            merchantId: category.merchantId.toString(),
            name: category.name,
            description: category.description,
            color: category.color || '#6366f1',
            isActive: category.isActive,
            productCount: countMap.get(category._id.toString()) || 0,
            createdAt: category.createdAt.toISOString(),
        }));

        return NextResponse.json<ApiResponse<CategoryProfile[]>>(
            { success: true, data: categoryProfiles }
        );
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create category
export async function POST(request: NextRequest) {
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

        const body: CategoryData = await request.json();
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        if (!body.name) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Check for duplicate
        const existing = await Category.findOne({
            merchantId,
            name: { $regex: new RegExp(`^${body.name}$`, 'i') },
        });

        if (existing) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Category already exists' },
                { status: 400 }
            );
        }

        const category = await Category.create({
            merchantId,
            name: body.name,
            description: body.description,
            color: body.color || '#6366f1',
        });

        const categoryProfile: CategoryProfile = {
            id: category._id.toString(),
            merchantId: category.merchantId.toString(),
            name: category.name,
            description: category.description,
            color: category.color,
            isActive: category.isActive,
            productCount: 0,
            createdAt: category.createdAt.toISOString(),
        };

        return NextResponse.json<ApiResponse<CategoryProfile>>(
            { success: true, data: categoryProfile, message: 'Category created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
