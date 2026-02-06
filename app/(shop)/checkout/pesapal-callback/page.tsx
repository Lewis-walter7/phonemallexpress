"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PesaPalCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const orderMerchantReference = searchParams.get('OrderMerchantReference');

        // PesaPal sometimes sends status in the query params too
        // We will forward everything to the order-confirmation page

        if (orderTrackingId && orderMerchantReference) {
            // We are inside an iframe. We need to redirect the parent window.
            if (window.top && window.top !== window.self) {
                // Construct the target URL
                const targetUrl = `/order-confirmation?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${orderMerchantReference}`;
                window.top.location.href = targetUrl;
            } else {
                // Fallback if not in iframe (e.g. user opened link directly)
                router.push(`/order-confirmation?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${orderMerchantReference}`);
            }
        }
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-[400px] bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg">Processing payment...</p>
                <p className="text-sm text-gray-500">Please wait while we confirm your transaction.</p>
            </div>
        </div>
    );
}
