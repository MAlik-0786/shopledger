import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, InvoiceProfile } from '@/types';

// GET single invoice
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

        const invoice = await Invoice.findOne({ _id: id, merchantId })
            .populate('staffId', 'name')
            .lean();

        if (!invoice) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        const invoiceProfile: InvoiceProfile = {
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
        };

        return NextResponse.json<ApiResponse<InvoiceProfile>>(
            { success: true, data: invoiceProfile }
        );
    } catch (error) {
        console.error('Get invoice error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
