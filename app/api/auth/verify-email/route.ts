import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const userPayload = getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { otp } = await request.json();
        if (!otp) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'OTP is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const model = userPayload.role === 'merchant' ? Merchant : Staff;

        // Use lean() to get plain data bypassing schema filtering
        const user: any = await model.findById(userPayload.id).lean();

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check OTP
        if (String(user.otp) !== String(otp)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Check Expiry
        if (user.otpExpires && user.otpExpires < new Date()) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Verification code has expired' },
                { status: 400 }
            );
        }

        // Mark as verified and clear OTP
        await model.findOneAndUpdate(
            { _id: user._id },
            {
                isEmailVerified: true,
                $unset: { otp: 1, otpExpires: 1 }
            },
            { new: true, strict: false }
        );

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Email verified successfully!' }
        );

    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
