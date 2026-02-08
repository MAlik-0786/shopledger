import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function PATCH(request: NextRequest) {
    try {
        const userPayload = getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        await dbConnect();

        if (userPayload.role === 'merchant') {
            const updatedMerchant = await Merchant.findByIdAndUpdate(
                userPayload.id,
                { $set: body },
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedMerchant) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Merchant not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json<ApiResponse>(
                { success: true, message: 'Shop details updated successfully' }
            );
        } else {
            // Staff can only update limited profile info
            const { name, phone } = body;
            const updatedStaff = await Staff.findByIdAndUpdate(
                userPayload.id,
                { $set: { name, phone } },
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedStaff) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Staff not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json<ApiResponse>(
                { success: true, message: 'Profile updated successfully' }
            );
        }
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
