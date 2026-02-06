import { NextRequest, NextResponse } from 'next/server';
import { pesapal, PesaPalOrder } from '@/lib/pesapal';
import connectToDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, amount, currency, email, firstName, lastName, phone, address, city, items, description } = body;

        if (!orderId || !amount || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
        }

        // 0. Connect to DB
        await connectToDB();

        // 1. Authenticate with PesaPal
        const token = await pesapal.getAccessToken();

        // 2. Register IPN (Optional per intent, but good practice. We'll use the env callback URL)
        const ipnId = await pesapal.registerIPN(token, process.env.PESAPAL_CALLBACK_URL || 'http://localhost:3000/api/pesapal/callback');

        // 3. Create Order in Database first to get a permanent ID (or use generated ID)
        const newOrder = new Order({
            customer: {
                name: `${firstName} ${lastName}`,
                email,
                phone,
                address: address || 'N/A',
                city: city || 'N/A',
            },
            items: items.map((item: any) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                variant: item.variant,
                color: item.color
            })),
            totalAmount: Number(amount),
            currency: currency || 'KES',
            status: 'Pending',
            paymentMethod: 'PesaPal',
            paymentStatus: 'Pending',
            // No mpesaDetails needed for PesaPal, we track via _id
        });

        await newOrder.save();

        // 3b. Prepare PesaPal Order Data using the DB ID
        const orderData: PesaPalOrder = {
            id: newOrder._id.toString(), // CRITICAL: Use MongoDB ID so findById works in callback
            currency: currency || 'KES',
            amount: Number(amount),
            description: description || 'PhoneMall Express Order',
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`, // Route through API to handle DB update & redirect
            notification_id: ipnId,
            billing_address: {
                email_address: email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                country_code: 'KE',
            },
        };

        // Order saved above.

        // 4. Submit Order
        const result = await pesapal.submitOrder(token, orderData);

        // Update order with PesaPal Tracking ID?
        // result usually contains { order_tracking_id, ... }
        if (result.order_tracking_id) {
            newOrder.pesapalDetails = { orderTrackingId: result.order_tracking_id };
            await newOrder.save();
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('PesaPal Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
