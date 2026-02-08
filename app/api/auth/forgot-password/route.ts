import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { sendOTPEmail } from '@/lib/mail';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Search in both Merchant and Staff
        let user: any = await Merchant.findOne({ email: normalizedEmail });
        let userModel = Merchant;

        if (!user) {
            user = await Staff.findOne({ email: normalizedEmail });
            userModel = Staff;
        }

        if (!user) {
            // For security, don't reveal if email exists
            return NextResponse.json<ApiResponse>(
                { success: true, message: 'If an account exists with this email, you will receive an OTP shortly.' }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);

        // Update using findOneAndUpdate to bypass validation and schema filtering
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: user._id },
            { otp, otpExpires },
            { new: true, strict: false }
        );

        if (!updatedUser) {
            console.log('Error: Failed to save OTP to database');
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Failed to generate OTP. Please try again.' },
                { status: 500 }
            );
        }

        console.log(`OTP saved successfully to ${userModel.modelName}`);

        const emailSent = await sendOTPEmail(user.email, otp);

        if (!emailSent) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Failed to send email. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'OTP sent to your email.' }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
