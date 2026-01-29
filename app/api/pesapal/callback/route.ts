import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/pesapal';

// PesaPal calls this endpoint with: ?OrderTrackingId=...&OrderMerchantReference=...
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const orderMerchantReference = searchParams.get('OrderMerchantReference');

        if (!orderTrackingId) {
            return NextResponse.json({ error: 'Missing OrderTrackingId' }, { status: 400 });
        }

        console.log(`PesaPal IPN/Callback received for Ref: ${orderMerchantReference}, TrackingId: ${orderTrackingId}`);

        // Ideally, you verify the status here and update your database
        const token = await pesapal.getAccessToken();
        const status = await pesapal.getTransactionStatus(token, orderTrackingId);

        console.log('Payment Status:', status);

        // Redirect user to success/failed page on frontend
        // Determine redirect destination based on status
        // status example: { payment_status_description: 'Completed', ... }

        // Return a response to PesaPal (IPN expects 200)
        // If this is a browser redirect (callback_url), we should redirect using NextResponse.redirect()
        // If this is IPN (server-to-server), we return JSON/Text.

        // Since we used the same URL for both IPN and Callback in the config, we need to handle both.
        // PesaPal usually does GET for callback (browser redirect) and GET/POST for IPN using notification_id.
        // Wait, standard PesaPal v3 flow redirects browser to callback_url. IPN is separate.

        // Let's assume this is the User Redirect path for now.

        return NextResponse.redirect(new URL(`/order-confirmation?status=${status?.payment_status_description || 'Pending'}&ref=${orderMerchantReference}`, req.url));

    } catch (error) {
        console.error('PesaPal Callback Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
    }
}
