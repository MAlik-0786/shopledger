import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, DashboardStats, RevenueData, TopProduct, CategorySales } from '@/types';

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
        const merchantObjectId = new Types.ObjectId(merchantId);

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'dashboard';
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfPeriod = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        if (type === 'dashboard') {
            // Dashboard stats
            const [
                totalRevenue,
                todaySales,
                totalProducts,
                lowStockCount,
                totalInvoices,
                todayInvoices,
            ] = await Promise.all([
                // Financials
                Invoice.aggregate([
                    { $match: { merchantId: { $eq: merchantObjectId } } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$grandTotal' },
                            totalTax: { $sum: '$taxAmount' },
                            totalSubtotal: { $sum: '$subtotal' }
                        }
                    },
                ]),
                // Today's sales
                Invoice.aggregate([
                    {
                        $match: {
                            merchantId: { $eq: merchantObjectId },
                            createdAt: { $gte: startOfToday },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$grandTotal' } } },
                ]),
                // Total products
                Product.countDocuments({ merchantId, isActive: true }),
                // Low stock products
                Product.countDocuments({
                    merchantId,
                    isActive: true,
                    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
                }),
                // Total invoices
                Invoice.countDocuments({ merchantId }),
                // Today's invoices
                Invoice.countDocuments({
                    merchantId,
                    createdAt: { $gte: startOfToday },
                }),
            ]);

            const stats: DashboardStats = {
                totalRevenue: totalRevenue[0]?.totalRevenue || 0,
                totalTax: totalRevenue[0]?.totalTax || 0,
                totalRevenueWithoutTax: totalRevenue[0]?.totalSubtotal || 0,
                todaySales: todaySales[0]?.total || 0,
                totalProducts,
                lowStockCount,
                totalInvoices,
                todayInvoices,
            };

            return NextResponse.json<ApiResponse<DashboardStats>>(
                { success: true, data: stats }
            );
        }

        if (type === 'revenue') {
            // Revenue over time
            const revenueData = await Invoice.aggregate([
                {
                    $match: {
                        merchantId: { $eq: merchantObjectId },
                        createdAt: { $gte: startOfPeriod },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        revenue: { $sum: '$grandTotal' },
                        subtotal: { $sum: '$subtotal' }, // Assuming subtotal field exists
                        tax: { $sum: '$taxAmount' },     // Assuming taxAmount field exists
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            const formattedData: RevenueData[] = revenueData.map((item) => ({
                date: item._id,
                revenue: item.revenue,
                subtotal: item.subtotal,
                tax: item.tax,
                orders: item.orders,
            }));

            return NextResponse.json<ApiResponse<RevenueData[]>>(
                { success: true, data: formattedData }
            );
        }

        if (type === 'topProducts') {
            // Top selling products
            const topProducts = await Invoice.aggregate([
                {
                    $match: {
                        merchantId: { $eq: merchantObjectId },
                        createdAt: { $gte: startOfPeriod },
                    },
                },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.productId',
                        name: { $first: '$items.productName' },
                        totalSold: { $sum: '$items.quantity' },
                        revenue: { $sum: '$items.totalPrice' },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 },
            ]);

            const formattedProducts: TopProduct[] = topProducts.map((item) => ({
                productId: item._id.toString(),
                name: item.name,
                totalSold: item.totalSold,
                revenue: item.revenue,
            }));

            return NextResponse.json<ApiResponse<TopProduct[]>>(
                { success: true, data: formattedProducts }
            );
        }

        if (type === 'categorySales') {
            // Sales by category
            const categorySales = await Invoice.aggregate([
                {
                    $match: {
                        merchantId: { $eq: merchantObjectId },
                        createdAt: { $gte: startOfPeriod },
                    },
                },
                { $unwind: '$items' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'product.categoryId',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $group: {
                        _id: { $arrayElemAt: ['$category.name', 0] },
                        sales: { $sum: '$items.quantity' },
                        revenue: { $sum: '$items.totalPrice' },
                    },
                },
                { $sort: { revenue: -1 } },
            ]);

            const formattedCategorySales: CategorySales[] = categorySales.map((item) => ({
                category: item._id || 'Uncategorized',
                sales: item.sales,
                revenue: item.revenue,
            }));

            return NextResponse.json<ApiResponse<CategorySales[]>>(
                { success: true, data: formattedCategorySales }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Invalid analytics type' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
