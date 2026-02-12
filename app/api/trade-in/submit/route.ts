import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TradeInRequest from '@/models/TradeInRequest';

// POST: Submit a new trade-in request
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate required fields (basic check, model handles more)
        if (!body.device || !body.customerName || !body.customerPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const request = await TradeInRequest.create(body);
        return NextResponse.json(request, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to submit request' }, { status: 500 });
    }
}
