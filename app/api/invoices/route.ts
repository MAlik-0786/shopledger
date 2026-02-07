import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/utils';
import { ApiResponse, InvoiceData, InvoiceProfile, InvoiceItemProfile } from '@/types';

// GET all invoices
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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const paymentStatus = searchParams.get('paymentStatus');

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { merchantId };

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .populate('staffId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Invoice.countDocuments(query),
        ]);

        const invoiceProfiles: InvoiceProfile[] = invoices.map((invoice) => ({
            id: invoice._id.toString(),
            merchantId: invoice.merchantId.toString(),
            staffId: invoice.staffId?._id?.toString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            staffName: (invoice.staffId as any)?.name,
            invoiceNumber: invoice.invoiceNumber,
            items: invoice.items.map((item) => ({
                productId: item.productId.toString(),
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            })),
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            discountType: invoice.discountType,
            discountValue: invoice.discountValue,
            discountAmount: invoice.discountAmount,
            grandTotal: invoice.grandTotal,
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            paymentMethod: invoice.paymentMethod,
            paymentStatus: invoice.paymentStatus,
            notes: invoice.notes,
            createdAt: invoice.createdAt.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: invoiceProfiles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create invoice (billing)
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

        const body: InvoiceData = await request.json();
        const merchantId = user.role === 'merchant' ? user.id : user.merchantId;
        const staffId = user.role === 'staff' ? user.id : undefined;

        // Validate items
        if (!body.items || body.items.length === 0) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'At least one item is required' },
                { status: 400 }
            );
        }

        // Fetch products and validate stock
        const productIds = body.items.map((item) => item.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            merchantId,
            isActive: true,
        });

        if (products.length !== productIds.length) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'One or more products not found' },
                { status: 404 }
            );
        }

        // Create product map for quick lookup
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        // Validate stock and build invoice items
        const invoiceItems: InvoiceItemProfile[] = [];
        let subtotal = 0;

        for (const item of body.items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: `Product not found: ${item.productId}` },
                    { status: 404 }
                );
            }

            if (product.stock < item.quantity) {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                    },
                    { status: 400 }
                );
            }

            const totalPrice = product.price * item.quantity;
            subtotal += totalPrice;

            invoiceItems.push({
                productId: product._id.toString(),
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPrice: product.price,
                totalPrice,
            });
        }

        // Calculate tax and discount
        const taxRate = body.taxRate ?? 18;
        const discountType = body.discountType || 'fixed';
        const discountValue = body.discountValue || 0;

        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = (subtotal * discountValue) / 100;
        } else {
            discountAmount = discountValue;
        }

        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * taxRate) / 100;
        const grandTotal = afterDiscount + taxAmount;

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber();

        // Create invoice
        const invoice = await Invoice.create({
            merchantId,
            staffId,
            invoiceNumber,
            items: invoiceItems,
            subtotal,
            taxRate,
            taxAmount,
            discountType,
            discountValue,
            discountAmount,
            grandTotal,
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            paymentMethod: body.paymentMethod || 'cash',
            paymentStatus: body.paymentStatus || 'paid',
            notes: body.notes,
        });

        // Reduce stock for each product
        const stockUpdates = body.items.map((item) =>
            Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity },
            })
        );
        await Promise.all(stockUpdates);

        const invoiceProfile: InvoiceProfile = {
            id: invoice._id.toString(),
            merchantId: invoice.merchantId.toString(),
            staffId: invoice.staffId?.toString(),
            invoiceNumber: invoice.invoiceNumber,
            items: invoiceItems,
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            discountType: invoice.discountType,
            discountValue: invoice.discountValue,
            discountAmount: invoice.discountAmount,
            grandTotal: invoice.grandTotal,
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            paymentMethod: invoice.paymentMethod,
            paymentStatus: invoice.paymentStatus,
            notes: invoice.notes,
            createdAt: invoice.createdAt.toISOString(),
        };

        return NextResponse.json<ApiResponse<InvoiceProfile>>(
            { success: true, data: invoiceProfile, message: 'Invoice created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create invoice error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
