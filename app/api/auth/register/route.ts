import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Merchant from '@/models/Merchant';
import { generateToken } from '@/lib/auth';
import { MerchantRegisterData, ApiResponse, MerchantProfile } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body: MerchantRegisterData = await request.json();

        // Validate required fields
        const requiredFields = ['shopName', 'ownerName', 'email', 'password', 'phone', 'address', 'city', 'state', 'pincode', 'businessType'];
        for (const field of requiredFields) {
            if (!body[field as keyof MerchantRegisterData]) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Check if merchant already exists
        const existingMerchant = await Merchant.findOne({ email: body.email.toLowerCase() });
        if (existingMerchant) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Create merchant
        const merchant = await Merchant.create({
            ...body,
            email: body.email.toLowerCase(),
            password: hashedPassword,
        });

        // Generate JWT token
        const token = generateToken({
            id: merchant._id.toString(),
            email: merchant.email,
            role: 'merchant',
        });

        const merchantProfile: MerchantProfile = {
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

        // Set token in cookie
        const response = NextResponse.json<ApiResponse<{ merchant: MerchantProfile; token: string }>>(
            {
                success: true,
                data: { merchant: merchantProfile, token },
                message: 'Registration successful',
            },
            { status: 201 }
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
        console.error('Registration error:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
