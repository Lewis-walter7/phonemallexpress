'use client';

import { useState, useEffect } from 'react';
import styles from './requests.module.css';
import toast from 'react-hot-toast';

interface TradeInRequest {
    _id: string;
    device: string;
    brand: string;
    storage: string;
    condition: string;
    estimatedValue: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    status: 'Pending' | 'Reviewed' | 'Completed' | 'Cancelled';
    createdAt: string;
}

export default function TradeInRequestsPage() {
    const [requests, setRequests] = useState<TradeInRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/trade-in/requests');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/trade-in/requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, status: newStatus })
            });

            if (!res.ok) throw new Error('Update failed');

            setRequests(requests.map(r => r._id === id ? { ...r, status: newStatus as any } : r));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#ff9800';
            case 'Reviewed': return '#2196f3';
            case 'Completed': return '#4caf50';
            case 'Cancelled': return '#f44336';
            default: return '#ccc';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Trade-In Requests</h1>
                <div className={styles.actions}>
                    <button onClick={fetchRequests} className={styles.refreshBtn}>↻ Refresh</button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Customer</th>
                                <th className={styles.th}>Device</th>
                                <th className={styles.th}>Condition</th>
                                <th className={styles.th}>Est. Value</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id} className={styles.tr}>
                                    <td className={styles.td}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.td}>
                                        <div style={{ fontWeight: 'bold' }}>{req.customerName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{req.customerPhone}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div>{req.device}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{req.storage}</div>
                                    </td>
                                    <td className={styles.td}>{req.condition}</td>
                                    <td className={styles.td}>KES {req.estimatedValue?.toLocaleString()}</td>
                                    <td className={styles.td}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: `${getStatusColor(req.status)}22`,
                                            color: getStatusColor(req.status),
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <select
                                            className={styles.select}
                                            value={req.status}
                                            onChange={(e) => updateStatus(req._id, e.target.value)}
                                            style={{ padding: '6px', fontSize: '0.9rem' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Reviewed">Reviewed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
