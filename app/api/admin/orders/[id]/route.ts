import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { validateAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const order = await Order.findById(id).lean();

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Fetch Order Details Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch order details' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;
        const admin = token ? await validateAdminSession(token) : null;

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, paymentStatus } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Update Order Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}
