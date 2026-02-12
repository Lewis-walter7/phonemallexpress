import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TradeInRequest from '@/models/TradeInRequest';

// GET: Fetch all trade-in requests
export async function GET() {
    try {
        await dbConnect();
        const requests = await TradeInRequest.find({}).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

// PUT: Update request status
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, status } = body;

        const request = await TradeInRequest.findByIdAndUpdate(_id, { status }, { new: true });
        return NextResponse.json(request);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
