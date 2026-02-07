import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Staff from '@/models/Staff';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse, StaffProfile, StaffData } from '@/types';

// PUT - Update staff member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'merchant') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const body: Partial<StaffData> = await request.json();

        // Build update object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (body.name) updateData.name = body.name;
        if (body.phone) updateData.phone = body.phone;
        if (body.role) updateData.role = body.role;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 12);
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: id, merchantId: user.id },
            updateData,
            { new: true }
        ).select('-password');

        if (!staff) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Staff member not found' },
                { status: 404 }
            );
        }

        const staffProfile: StaffProfile = {
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

        return NextResponse.json<ApiResponse<StaffProfile>>(
            { success: true, data: staffProfile, message: 'Staff member updated successfully' }
        );
    } catch (error) {
        console.error('Update staff error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove staff member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'merchant') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;

        const staff = await Staff.findOneAndUpdate(
            { _id: id, merchantId: user.id },
            { isActive: false },
            { new: true }
        );

        if (!staff) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Staff member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Staff member removed successfully' }
        );
    } catch (error) {
        console.error('Delete staff error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
