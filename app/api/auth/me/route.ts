import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, AuthUser } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getUserFromRequest(request);

        if (!tokenPayload) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        let user: AuthUser;

        if (tokenPayload.role === 'merchant') {
            const merchant = await Merchant.findById(tokenPayload.id).select('-password');
            if (!merchant || !merchant.isActive) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'User not found or inactive' },
                    { status: 404 }
                );
            }

            user = {
                id: merchant._id.toString(),
                email: merchant.email,
                role: 'merchant',
                merchantId: merchant._id.toString(),
                name: merchant.ownerName,
                shopName: merchant.shopName,
            };
        } else {
            const staff = await Staff.findById(tokenPayload.id).select('-password').populate('merchantId', 'shopName');
            if (!staff || !staff.isActive) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'User not found or inactive' },
                    { status: 404 }
                );
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const merchantData = staff.merchantId as any;
            user = {
                id: staff._id.toString(),
                email: staff.email,
                role: 'staff',
                merchantId: merchantData._id.toString(),
                name: staff.name,
                shopName: merchantData.shopName,
            };
        }

        return NextResponse.json<ApiResponse<AuthUser>>(
            { success: true, data: user },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
