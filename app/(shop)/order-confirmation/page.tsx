"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

const OrderConfirmationContent = () => {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const ref = searchParams.get('ref');

    const isSuccess = status === 'Completed' || status === 'COMPLETED';
    const isPending = status === 'Pending' || status === 'PENDING';

    return (
        <div className="container section-py" style={{ textAlign: 'center', padding: '100px 20px' }}>
            {isSuccess ? (
                <div className="success-message">
                    <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 20px' }} />
                    <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
                    <p className="mb-8 text-muted-foreground">
                        Thank you for your purchase. Your order reference is <strong>{ref}</strong>.
                        We will contact you shortly to confirm delivery details.
                    </p>
                    <Link href="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : isPending ? (
                <div className="pending-message">
                    <CheckCircle size={64} color="#f59e0b" style={{ margin: '0 auto 20px' }} />
                    <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
                    <p className="mb-8 text-muted-foreground">
                        Your payment is being processed (Status: {status}).
                        We will notify you once confirmed. Reference: <strong>{ref}</strong>.
                    </p>
                    <Link href="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="error-message">
                    <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                    <h1 className="text-2xl font-bold mb-4">Payment Failed or Cancelled</h1>
                    <p className="mb-8 text-muted-foreground">
                        The payment status is: <strong>{status || 'Unknown'}</strong>.
                        Please try again or contact support if the issue persists.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/checkout" className="btn btn-outline">
                            Try Again
                        </Link>
                        <Link href="/contact" className="btn btn-link">
                            Contact Support
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
