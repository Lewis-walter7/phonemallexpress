import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TradeInDevice from '@/models/TradeInDevice';

// GET: Fetch all trade-in devices
export async function GET() {
    try {
        await dbConnect();
        const devices = await TradeInDevice.find({}).sort({ brand: 1, name: 1 });
        return NextResponse.json(devices);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
    }
}

// POST: Create a new trade-in device
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        const device = await TradeInDevice.create(body);
        return NextResponse.json(device, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create device' }, { status: 500 });
    }
}

// PUT: Update a device
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
        }

        const device = await TradeInDevice.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json(device);
    } catch (error: any) {
        console.error("Update Error", error);
        return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
    }
}

// DELETE: Remove a device
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await dbConnect();
        await TradeInDevice.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Device deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 });
    }
}
