import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, otp, password } = await request.json();

        if (!email || !otp || !password) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email, OTP and new password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        console.log('--- RESET ATTEMPT ---');
        console.log('Input:', { email: normalizedEmail, otp });

        // Search in Merchant using lean() to bypass schema validation of the model class
        let user: any = await Merchant.findOne({ email: normalizedEmail }).lean();
        let modelName = 'Merchant';

        if (!user) {
            user = await Staff.findOne({ email: normalizedEmail }).lean();
            modelName = 'Staff';
        }

        if (!user) {
            console.log('Error: User not found in DB');
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }


        // Check OTP (ensure both are strings for comparison)
        if (String(user.otp) !== String(otp)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Check Expiry
        if (user.otpExpires && user.otpExpires < new Date()) {
            console.log('Error: OTP expired');
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        console.log('OTP verified successfully');

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear OTP
        const targetModel = modelName === 'Merchant' ? Merchant : Staff;
        const updated = await targetModel.findOneAndUpdate(
            { _id: user._id },
            {
                password: hashedPassword,
                $unset: { otp: 1, otpExpires: 1 }
            },
            { new: true }
        );

        if (!updated) {
            console.log('Error: Failed to update password in database');
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Failed to update password. Please try again.' },
                { status: 500 }
            );
        }

        console.log('Password updated successfully');

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Password reset successful. You can now login.' }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
