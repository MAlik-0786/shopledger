import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Current and new passwords are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
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

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid current password' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await model.findByIdAndUpdate(userPayload.id, {
            password: hashedPassword
        });

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Password updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
