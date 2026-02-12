'use client';

import { useState, useEffect } from 'react';
import styles from './devices.module.css';
import toast from 'react-hot-toast';

interface TradeInDevice {
    _id: string;
    name: string;
    brand: 'Apple' | 'Samsung';
    category: string;
    image: string;
    maxCredit: number;
    storageOptions: string[];
    subCategory?: string;
}

export default function TradeInDevicesPage() {
    const [devices, setDevices] = useState<TradeInDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<TradeInDevice | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: 'Apple',
        category: 'Smartphone',
        subCategory: '',
        image: '',
        maxCredit: 0,
        storageOptions: '' // Comma separated for input
    });

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/trade-in/devices');
            const data = await res.json();
            if (Array.isArray(data)) {
                setDevices(data);
            }
        } catch (error) {
            console.error('Failed to fetch devices', error);
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            storageOptions: formData.storageOptions.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            let res;
            if (editingDevice) {
                res = await fetch('/api/trade-in/devices', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, _id: editingDevice._id })
                });
            } else {
                res = await fetch('/api/trade-in/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error('Operation failed');

            toast.success(editingDevice ? 'Device updated' : 'Device added');
            setIsModalOpen(false);
            setEditingDevice(null);
            resetForm();
            fetchDevices();
        } catch (error) {
            toast.error('Failed to save device');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this device?')) return;

        try {
            const res = await fetch(`/api/trade-in/devices?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setDevices(devices.filter(d => d._id !== id));
            toast.success('Device deleted');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const openEditModal = (device: TradeInDevice) => {
        setEditingDevice(device);
        setFormData({
            name: device.name,
            brand: device.brand,
            category: device.category,
            subCategory: device.subCategory || '',
            image: device.image,
            maxCredit: device.maxCredit,
            storageOptions: device.storageOptions?.join(', ') || ''
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingDevice(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            brand: 'Apple',
            category: 'Smartphone',
            subCategory: '',
            image: '',
            maxCredit: 0,
            storageOptions: ''
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Trade-In Devices</h1>
                <div className={styles.actions}>
                    <button onClick={fetchDevices} className={styles.refreshBtn}>↻ Refresh</button>
                    <button onClick={openAddModal} className={styles.addBtn}>+ Add Device</button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Brand</th>
                                <th className={styles.th}>Category</th>
                                <th className={styles.th}>Max Credit</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(device => (
                                <tr key={device._id} className={styles.tr}>
                                    <td className={styles.td}>{device.name}</td>
                                    <td className={styles.td}>{device.brand}</td>
                                    <td className={styles.td}>{device.category}</td>
                                    <td className={styles.td}>KES {device.maxCredit?.toLocaleString()}</td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => openEditModal(device)} className={styles.editBtn}>✏️ Edit</button>
                                            <button onClick={() => handleDelete(device._id)} className={styles.dangerBtn}>🗑️ Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {devices.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No trade-in devices found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalHeader}>{editingDevice ? 'Edit Device' : 'Add New Device'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Device Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Brand</label>
                                <select
                                    className={styles.select}
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value as any })}
                                >
                                    <option value="Apple">Apple</option>
                                    <option value="Samsung">Samsung</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    className={styles.select}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="Smartphone">Smartphone</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Watch">Watch</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Sub Category</label>
                                <select
                                    className={styles.select}
                                    value={formData.subCategory}
                                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                >
                                    <option value="">-- None --</option>
                                    {/* Samsung */}
                                    <option value="S Series">S Series</option>
                                    <option value="Z Series">Z Series</option>
                                    <option value="Note Series">Note Series</option>
                                    <option value="A Series">A Series</option>
                                    <option value="Tab S">Tab S</option>
                                    <option value="Tab A">Tab A</option>
                                    {/* Apple */}
                                    <option value="iPhone">iPhone</option>
                                    <option value="iPad Pro">iPad Pro</option>
                                    <option value="iPad Air">iPad Air</option>
                                    <option value="iPad">iPad</option>
                                    <option value="iPad Mini">iPad Mini</option>
                                    <option value="MacBook Pro">MacBook Pro</option>
                                    <option value="MacBook Air">MacBook Air</option>
                                    <option value="Watch Series">Watch Series</option>
                                    <option value="Watch Ultra">Watch Ultra</option>
                                    <option value="Watch SE">Watch SE</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Max Credit (KES)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.maxCredit}
                                    onChange={e => setFormData({ ...formData, maxCredit: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Image URL</label>
                                <input
                                    type="url"
                                    className={styles.input}
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Storage Options (comma separated)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.storageOptions}
                                    onChange={e => setFormData({ ...formData, storageOptions: e.target.value })}
                                    placeholder="64GB, 128GB, 256GB"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save</button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}
