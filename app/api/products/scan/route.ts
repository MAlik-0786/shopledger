import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, ProductProfile } from '@/types';

// POST - Scan QR code and get product
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { qrData } = await request.json();

        if (!qrData) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'QR data is required' },
                { status: 400 }
            );
        }

        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;

        // Parse QR data
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid QR code' },
                { status: 400 }
            );
        }

        // Find product by SKU
        const product = await Product.findOne({
            sku: parsedData.sku,
            merchantId,
            isActive: true,
        }).populate('categoryId', 'name color');

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
        console.error('Scan product error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
