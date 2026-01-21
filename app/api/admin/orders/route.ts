import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
