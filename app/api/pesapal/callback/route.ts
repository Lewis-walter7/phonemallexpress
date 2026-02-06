import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/pesapal';
import connectToDB from '@/lib/db';
import Order from '@/models/Order';

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

        // 0. Connect to DB
        await connectToDB();

        // 1. Get Transaction Status from PesaPal
        const token = await pesapal.getAccessToken();
        const statusResponse = await pesapal.getTransactionStatus(token, orderTrackingId);

        console.log('Payment Status Response:', statusResponse);
        const paymentStatus = statusResponse?.payment_status_description;

        // 2. Find and Update Order
        // orderMerchantReference refers to our MongoDB _id
        const order = await Order.findById(orderMerchantReference);

        if (order) {
            // Map PesaPal status to our status
            if (paymentStatus === 'COMPLETED' || paymentStatus === 'Completed') {
                order.paymentStatus = 'Completed';
                order.status = 'Processing';
            } else if (paymentStatus === 'FAILED' || paymentStatus === 'Failed') {
                order.paymentStatus = 'Failed';
                order.status = 'Cancelled';
            }
            await order.save();
        }

        // Check if this is a manual verification request from Admin
        const isVerification = searchParams.get('mode') === 'verify';

        if (isVerification) {
            return NextResponse.json({
                success: true,
                paymentStatus: order?.paymentStatus || paymentStatus,
                status: order?.status,
                rawResponse: statusResponse // Debugging info
            });
        }

        return NextResponse.redirect(new URL(`/order-confirmation?status=${paymentStatus || 'Pending'}&ref=${orderMerchantReference}&tracking=${orderTrackingId}`, req.url));

    } catch (error) {
        console.error('PesaPal Callback Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
    }
}
