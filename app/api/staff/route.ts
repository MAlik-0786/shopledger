import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Staff from '@/models/Staff';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, StaffProfile, StaffData } from '@/types';

// GET all staff members
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only merchants can view staff
        if (user.role !== 'merchant') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }

        await dbConnect();

        const staff = await Staff.find({ merchantId: user.id, isActive: true })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        const staffProfiles: StaffProfile[] = staff.map((s) => ({
            id: s._id.toString(),
            merchantId: s.merchantId.toString(),
            name: s.name,
            email: s.email,
            phone: s.phone,
            role: s.role,
            isActive: s.isActive,
            lastLogin: s.lastLogin?.toISOString(),
            createdAt: s.createdAt.toISOString(),
        }));

        return NextResponse.json<ApiResponse<StaffProfile[]>>(
            { success: true, data: staffProfiles }
        );
    } catch (error) {
        console.error('Get staff error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create staff member
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.role !== 'merchant') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Permission denied' },
                { status: 403 }
            );
        }

        await dbConnect();

        const body: StaffData = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.password || !body.phone) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Name, email, password, and phone are required' },
                { status: 400 }
            );
        }

        // Check for existing staff
        const existing = await Staff.findOne({
            merchantId: user.id,
            email: body.email.toLowerCase(),
        });

        if (existing) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Staff member with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        const staff = await Staff.create({
            merchantId: user.id,
            name: body.name,
            email: body.email.toLowerCase(),
            password: hashedPassword,
            phone: body.phone,
            role: body.role || 'cashier',
        });

        const staffProfile: StaffProfile = {
            id: staff._id.toString(),
            merchantId: staff.merchantId.toString(),
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            isActive: staff.isActive,
            createdAt: staff.createdAt.toISOString(),
        };

        return NextResponse.json<ApiResponse<StaffProfile>>(
            { success: true, data: staffProfile, message: 'Staff member created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create staff error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
