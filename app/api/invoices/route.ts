import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/utils';
import {
    ApiResponse,
    InvoiceData,
    InvoiceProfile,
    InvoiceItemProfile,
} from '@/types';

/* ------------------------------------------------------------------ */
/* TYPES (Lean Mongo Shapes)                                           */
/* ------------------------------------------------------------------ */

type ObjectIdLike = { toString(): string };

type LeanInvoiceItem = {
    productId: ObjectIdLike;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    totalPrice: number;
};

type LeanStaff = {
    _id?: ObjectIdLike;
    name?: string;
};

type LeanInvoice = {
    _id: ObjectIdLike;
    merchantId: ObjectIdLike;
    staffId?: LeanStaff;
    invoiceNumber: string;
    items: LeanInvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    grandTotal: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
    paymentStatus: 'paid' | 'pending' | 'partial';
    notes?: string;
    createdAt: Date;
};

/* ------------------------------------------------------------------ */
/* GET – LIST INVOICES                                                 */
/* ------------------------------------------------------------------ */

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

        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 20);
        const search = searchParams.get('search') || '';
        const paymentStatus = searchParams.get('paymentStatus');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: Record<string, unknown> = { merchantId };

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
            ];
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) (query.createdAt as any).$gte = new Date(startDate);
            if (endDate) (query.createdAt as any).$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .populate('staffId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean<LeanInvoice[]>(),
            Invoice.countDocuments(query),
        ]);

        const invoiceProfiles: InvoiceProfile[] = invoices.map(
            (invoice: LeanInvoice) => ({
                id: invoice._id.toString(),
                merchantId: invoice.merchantId.toString(),
                staffId: invoice.staffId?._id?.toString(),
                staffName: invoice.staffId?.name,
                invoiceNumber: invoice.invoiceNumber,
                items: invoice.items.map((item: LeanInvoiceItem) => ({
                    productId: item.productId.toString(),
                    productName: item.productName,
                    sku: item.sku,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    costPrice: item.costPrice ?? 0,
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
            })
        );

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

/* ------------------------------------------------------------------ */
/* POST – CREATE INVOICE                                               */
/* ------------------------------------------------------------------ */

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

        if (!body.items?.length) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'At least one item is required' },
                { status: 400 }
            );
        }

        const productIds = body.items.map(i => i.productId);
        const products = await Product.find({
            _id: { $in: productIds },
            merchantId,
            isActive: true,
        });

        const productMap = new Map(
            products.map(p => [p._id.toString(), p])
        );

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
                    { success: false, error: `Insufficient stock for ${product.name}` },
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
                costPrice: product.costPrice ?? 0,
                totalPrice,
            });
        }

        const discountType = body.discountType ?? 'fixed';
        const discountValue = body.discountValue ?? 0;
        const taxRate = body.taxRate ?? 18;

        const discountAmount =
            discountType === 'percentage'
                ? (subtotal * discountValue) / 100
                : discountValue;

        const taxable = subtotal - discountAmount;
        const taxAmount = (taxable * taxRate) / 100;
        const grandTotal = taxable + taxAmount;

        const invoice = await Invoice.create({
            merchantId,
            staffId,
            invoiceNumber: generateInvoiceNumber(),
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
            paymentMethod: body.paymentMethod ?? 'cash',
            paymentStatus: body.paymentStatus ?? 'paid',
            notes: body.notes,
        });

        await Promise.all(
            body.items.map(i =>
                Product.findByIdAndUpdate(i.productId, {
                    $inc: { stock: -i.quantity },
                })
            )
        );

        return NextResponse.json<ApiResponse<InvoiceProfile>>(
            {
                success: true,
                message: 'Invoice created successfully',
                data: {
                    id: invoice._id.toString(),
                    merchantId: invoice.merchantId.toString(),
                    staffId: invoice.staffId?.toString(),
                    invoiceNumber: invoice.invoiceNumber,
                    items: invoiceItems,
                    subtotal,
                    taxRate,
                    taxAmount,
                    discountType,
                    discountValue,
                    discountAmount,
                    grandTotal,
                    customerName: invoice.customerName,
                    customerPhone: invoice.customerPhone,
                    paymentMethod: invoice.paymentMethod,
                    paymentStatus: invoice.paymentStatus,
                    notes: invoice.notes,
                    createdAt: invoice.createdAt.toISOString(),
                },
            },
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
