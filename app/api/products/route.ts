import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import { generateSKU, generateQRCode } from '@/lib/utils';
import { ApiResponse, ProductProfile, ProductData } from '@/types';

// GET all products for a merchant
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
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category') || '';
        const lowStock = searchParams.get('lowStock') === 'true';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { merchantId, isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (lowStock) {
            query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('categoryId', 'name color')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        const productProfiles: ProductProfile[] = products.map((product) => ({
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
        }));

        return NextResponse.json({
            success: true,
            data: productProfiles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check permission (merchant, manager, cashier, inventory can create products)
        if (user.role === 'staff' && !['manager', 'cashier', 'inventory'].includes(user.staffRole || '')) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }


        await dbConnect();

        const body: ProductData = await request.json();
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        // Validate required fields
        if (!body.name || body.price === undefined || body.stock === undefined) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Name, price, and stock are required' },
                { status: 400 }
            );
        }

        // Validate category exists if provided
        if (body.categoryId) {
            const category = await Category.findOne({ _id: body.categoryId, merchantId });
            if (!category) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Category not found' },
                    { status: 404 }
                );
            }
        }

        // Generate SKU
        const sku = generateSKU();

        // Generate QR code with product info
        const qrData = JSON.stringify({
            sku,
            merchantId,
            type: 'product',
        });
        const qrCode = await generateQRCode(qrData);

        // Create product
        const product = await Product.create({
            merchantId,
            categoryId: body.categoryId || null,
            name: body.name,
            description: body.description,
            sku,
            price: body.price,
            costPrice: body.costPrice,
            stock: body.stock,
            lowStockThreshold: body.lowStockThreshold || 10,
            unit: body.unit || 'pcs',
            qrCode,
            image: body.image,
        });

        // Fetch category name if exists
        let categoryName;
        if (product.categoryId) {
            const category = await Category.findById(product.categoryId);
            categoryName = category?.name;
        }

        const productProfile: ProductProfile = {
            id: product._id.toString(),
            merchantId: product.merchantId.toString(),
            categoryId: product.categoryId?.toString(),
            categoryName,
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
            { success: true, data: productProfile, message: 'Product created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create product error:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
