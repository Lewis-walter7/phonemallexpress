'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, MapPin, CreditCard, Package } from 'lucide-react';
import styles from './order-details.module.css';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    color?: string;
}

interface OrderDetails {
    _id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
    };
    items: OrderItem[];
    totalAmount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    mpesaDetails?: {
        transactionDate?: string;
        receiptNumber?: string;
        phoneNumber?: string;
    };
    pesapalDetails?: {
        orderTrackingId?: string;
    };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/admin/orders/${id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);
                    setStatus(data.order.status);
                    setPaymentStatus(data.order.paymentStatus);
                }
            } catch (error) {
                console.error("Failed to load order");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, paymentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrder(prev => prev ? { ...prev, status, paymentStatus } : null);
                alert('Order updated successfully');
            } else {
                alert('Failed to update order');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An error occurred while updating status');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Completed': return '#22c55e';
            case 'Processing': return '#3b82f6';
            case 'Shipped': return '#8b5cf6';
            case 'Delivered': return '#10b981';
            case 'Pending': return '#eab308';
            case 'Failed': return '#ef4444';
            case 'Cancelled': return '#ef4444';
            default: return '#888';
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Loading order details...</div>;
    if (!order) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>Order not found</div>;

    return (
        <div className={styles.container}>
            <Link href="/admin/orders" className={styles.backLink}>
                <ArrowLeft size={16} />
                Back to Orders
            </Link>

            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Order #{order._id.slice(-6).toUpperCase()}</h1>
                    <span className={styles.date}>Placed on {new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className={styles.controls}>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={styles.statusSelect}
                        title="Order Status"
                    >
                        <option value="Pending">Order: Pending</option>
                        <option value="Processing">Order: Processing</option>
                        <option value="Shipped">Order: Shipped</option>
                        <option value="Delivered">Order: Delivered</option>
                        <option value="Cancelled">Order: Cancelled</option>
                        <option value="Failed">Order: Failed</option>
                    </select>

                    <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className={styles.statusSelect}
                        title="Payment Status"
                        style={{ border: `1px solid ${getStatusColor(paymentStatus)}` }}
                    >
                        <option value="Pending">Pay: Pending</option>
                        <option value="Completed">Pay: Completed</option>
                        <option value="Failed">Pay: Failed</option>
                    </select>

                    <button
                        className={styles.saveBtn}
                        onClick={handleStatusUpdate}
                        disabled={saving || (status === order.status && paymentStatus === order.paymentStatus)}
                    >
                        {saving ? 'Updating...' : 'Update'}
                    </button>
                    {order.paymentMethod === 'PesaPal' && order.paymentStatus === 'Pending' && (
                        <button
                            className={styles.saveBtn}
                            style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    const res = await fetch(`/api/pesapal/callback?OrderTrackingId=${order.pesapalDetails?.orderTrackingId || ''}&OrderMerchantReference=${order._id}&mode=verify`);
                                    const data = await res.json();

                                    if (data.success && data.paymentStatus && (data.paymentStatus === 'Completed' || data.paymentStatus === 'COMPLETED')) {
                                        setOrder(prev => prev ? { ...prev, paymentStatus: 'Completed', status: data.status || 'Processing' } : null);
                                        setPaymentStatus('Completed');
                                        if (data.status) setStatus(data.status);
                                        alert(`Payment Verified Successfully!`);
                                    } else {
                                        console.log('Verification Debug:', data);
                                        alert(`Verification returned: ${data.paymentStatus || 'Unknown'}\nTracking ID: ${order.pesapalDetails?.orderTrackingId || 'MISSING'}\nRaw PesaPal Status: ${data.rawResponse?.payment_status_description || 'N/A'}`);
                                    }
                                } catch (err) {
                                    alert('Error verifying payment.');
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        >
                            {saving ? 'Verifying...' : 'Verify Payment'}
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.mainContent}>
                    {/* Items */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <div className="flex items-center gap-2">
                                <Package size={20} />
                                Order Items
                            </div>
                            <span className="text-sm text-gray-400 font-normal">{order.items.length} items</span>
                        </h2>
                        <table className={styles.itemsTable}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div className={styles.itemMeta}>
                                                {item.variant && <span className={styles.variantTag}>{item.variant}</span>}
                                                {item.color && <span className={styles.variantTag} style={{ background: item.color === 'Black' ? '#333' : 'rgba(255,255,255,0.1)' }}>{item.color}</span>}
                                            </div>
                                        </td>
                                        <td>{item.price.toLocaleString()}</td>
                                        <td>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Customer Info */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <div className="flex items-center gap-2">
                                <User size={20} />
                                Customer Details
                            </div>
                        </h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Full Name</label>
                                <p>{order.customer.name}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email Address</label>
                                <p>{order.customer.email}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone Number</label>
                                <p>{order.customer.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    {/* Shipping Address */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />
                                Delivery
                            </div>
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className={styles.infoItem}>
                                <label>Address</label>
                                <p>{order.customer.address || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>City</label>
                                <p>{order.customer.city || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <div className="flex items-center gap-2">
                                <CreditCard size={20} />
                                Payment
                            </div>
                            <span
                                className={styles.badge}
                                style={{
                                    border: `1px solid ${getStatusColor(order.paymentStatus)}`,
                                    color: getStatusColor(order.paymentStatus),
                                    background: `${getStatusColor(order.paymentStatus)}10`
                                }}
                            >
                                {order.paymentStatus}
                            </span>
                        </h2>
                        <div className={styles.paymentRow}>
                            <span style={{ color: '#888' }}>Method</span>
                            <span style={{ fontWeight: 600, color: order.paymentMethod === 'PesaPal' ? '#3b82f6' : 'white' }}>{order.paymentMethod}</span>
                        </div>
                        {order.pesapalDetails?.orderTrackingId && (
                            <div className={styles.paymentRow}>
                                <span style={{ color: '#888' }}>Tracking ID</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.pesapalDetails.orderTrackingId}</span>
                            </div>
                        )}
                        {order.mpesaDetails && (
                            <div className={styles.paymentRow}>
                                <span style={{ color: '#888' }}>Reference</span>
                                <span style={{ fontFamily: 'monospace' }}>{order.mpesaDetails.receiptNumber || order.mpesaDetails.phoneNumber || 'N/A'}</span>
                            </div>
                        )}
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Total Paid</span>
                            <span className={styles.totalAmount}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#888', marginRight: '4px' }}>{order.currency}</span>
                                {order.totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
