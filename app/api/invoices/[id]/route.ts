import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, InvoiceProfile } from '@/types';

type ObjectIdLike = { toString(): string };

type LeanInvoiceItem = {
    productId: ObjectIdLike;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice: number;
};

type LeanStaff = {
    _id: ObjectIdLike;
    name: string;
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

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params; // ✅ REQUIRED in Next 15

        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const merchantId =
            user.role === 'merchant' ? user.id : user.merchantId;

        const invoice = (await Invoice.findOne({ _id: id, merchantId })
            .populate('staffId', 'name')
            .lean()) as LeanInvoice | null;

        if (!invoice) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        const invoiceProfile: InvoiceProfile = {
            id: invoice._id.toString(),
            merchantId: invoice.merchantId.toString(),
            invoiceNumber: invoice.invoiceNumber,

            staffId: invoice.staffId?._id.toString(),
            staffName: invoice.staffId?.name,

            items: invoice.items.map(item => ({
                productId: item.productId.toString(),
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice,
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
        };

        return NextResponse.json<ApiResponse<InvoiceProfile>>({
            success: true,
            data: invoiceProfile,
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
