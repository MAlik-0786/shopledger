import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import Staff from '@/models/Staff';
import { generateToken } from '@/lib/auth';
import { ApiResponse, MerchantProfile, StaffProfile } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // First try to find merchant
        let user = await Merchant.findOne({ email: email.toLowerCase() });
        let role: 'merchant' | 'staff' = 'merchant';
        let merchantId: string | undefined;

        // If not merchant, try to find staff
        if (!user) {
            user = await Staff.findOne({ email: email.toLowerCase() });
            if (user) {
                role = 'staff';
                merchantId = user.merchantId.toString();
            }
        }

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Account is deactivated. Please contact support.' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login for staff
        if (role === 'staff') {
            await Staff.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        }

        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            role,
            merchantId: role === 'merchant' ? user._id.toString() : merchantId,
        });

        let userData: MerchantProfile | StaffProfile;

        if (role === 'merchant') {
            const merchant = user;
            userData = {
                id: merchant._id.toString(),
                shopName: merchant.shopName,
                ownerName: merchant.ownerName,
                email: merchant.email,
                phone: merchant.phone,
                address: merchant.address,
                city: merchant.city,
                state: merchant.state,
                pincode: merchant.pincode,
                businessType: merchant.businessType,
                gstNumber: merchant.gstNumber,
                logo: merchant.logo,
                isActive: merchant.isActive,
                createdAt: merchant.createdAt.toISOString(),
            };
        } else {
            const staff = user;
            userData = {
                id: staff._id.toString(),
                merchantId: staff.merchantId.toString(),
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                isActive: staff.isActive,
                lastLogin: staff.lastLogin?.toISOString(),
                createdAt: staff.createdAt.toISOString(),
            };
        }

        const response = NextResponse.json<ApiResponse<{ user: MerchantProfile | StaffProfile; token: string; role: string }>>(
            {
                success: true,
                data: { user: userData, token, role },
                message: 'Login successful',
            },
            { status: 200 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
