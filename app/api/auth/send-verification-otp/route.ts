import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { sendOTPEmail } from '@/lib/mail';
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

        await dbConnect();

        const model = userPayload.role === 'merchant' ? Merchant : Staff;
        const user = await model.findById(userPayload.id);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email already verified' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update using findOneAndUpdate to bypass validation
        await model.findOneAndUpdate(
            { _id: user._id },
            { otp, otpExpires },
            { new: true, strict: false }
        );

        const emailSent = await sendOTPEmail(user.email, otp);

        if (!emailSent) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Verification OTP sent to your email.' }
        );

    } catch (error) {
        console.error('Send verification OTP error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
