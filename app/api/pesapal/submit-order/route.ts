import { NextRequest, NextResponse } from 'next/server';
import { pesapal, PesaPalOrder } from '@/lib/pesapal';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, amount, currency, email, firstName, lastName, phone, description } = body;

        if (!orderId || !amount || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Authenticate with PesaPal
        const token = await pesapal.getAccessToken();

        // 2. Register IPN (Optional per intent, but good practice. We'll use the env callback URL)
        // If you only want to rely on the redirect callback, you can skip this or register it once globally.
        // For robustness, we register it here on the fly (PesaPal returns existing IPN ID if URL matches).
        const ipnId = await pesapal.registerIPN(token, process.env.PESAPAL_CALLBACK_URL || 'http://localhost:3000/api/pesapal/callback');

        // 3. Prepare Order Data
        const orderData: PesaPalOrder = {
            id: orderId, // This should be unique
            currency: currency || 'KES',
            amount: Number(amount),
            description: description || 'PhoneMall Express Order',
            callback_url: process.env.PESAPAL_CALLBACK_URL || 'http://localhost:3000/api/pesapal/callback',
            notification_id: ipnId,
            billing_address: {
                email_address: email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                country_code: 'KE', // Default to KE for now
            },
        };

        // 4. Submit Order
        const result = await pesapal.submitOrder(token, orderData);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('PesaPal Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
