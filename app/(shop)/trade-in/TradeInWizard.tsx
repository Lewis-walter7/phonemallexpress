'use client';

import { useState } from 'react';
import styles from './trade-in.module.css';
import toast from 'react-hot-toast';
import { Search, Smartphone, Tablet, Watch, Laptop, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeInDevice {
    _id: string;
    name: string;
    brand: string;
    category: string;
    maxCredit: number;
    image: string;
    storageOptions?: string[];
}

export default function TradeInWizard({ devices }: { devices: TradeInDevice[] }) {
    const [selectedBrand, setSelectedBrand] = useState<'Apple' | 'Samsung'>('Apple');
    const [activeCategory, setActiveCategory] = useState('Smartphone');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<TradeInDevice | null>(null);
    const [formStep, setFormStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        storage: '',
        condition: 'Good',
        customerName: '',
        customerEmail: '',
        customerPhone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Categories definition
    const categories = [
        { id: 'Smartphone', label: selectedBrand === 'Apple' ? 'iPhone' : 'Phones', icon: Smartphone },
        { id: 'Tablet', label: selectedBrand === 'Apple' ? 'iPad' : 'Tablets', icon: Tablet },
        { id: 'Laptop', label: selectedBrand === 'Apple' ? 'Mac' : 'Laptops', icon: Laptop },
        { id: 'Watch', label: selectedBrand === 'Apple' ? 'Apple Watch' : 'Watches', icon: Watch },
    ];

    // Filter devices based on brand, category, and search
    const filteredDevices = devices.filter(device => {
        const matchesBrand = device.brand === selectedBrand;
        const matchesCategory = device.category === activeCategory;
        const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesBrand && matchesCategory && matchesSearch;
    }).sort((a, b) => b.maxCredit - a.maxCredit);

    // Reset category when switching brands
    const handleBrandChange = (brand: 'Apple' | 'Samsung') => {
        setSelectedBrand(brand);
        setActiveCategory('Smartphone'); // Default to phones
        setSelectedDevice(null);
    };

    const handleSelectDevice = (device: TradeInDevice) => {
        setSelectedDevice(device);
        setFormData({
            ...formData,
            storage: device.storageOptions?.[0] || 'N/A',
            condition: 'Good'
        });
        setFormStep(1);
        setTimeout(() => {
            const formElement = document.getElementById('trade-in-form');
            formElement?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const calculateEstimate = () => {
        if (!selectedDevice) return 0;
        let base = selectedDevice.maxCredit;

        switch (formData.condition) {
            case 'Excellent': break;
            case 'Good': base *= 0.85; break;
            case 'Fair': base *= 0.65; break;
            case 'Broken': base *= 0.3; break;
        }

        return Math.round(base / 1000) * 1000;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/trade-in/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device: selectedDevice?.name,
                    brand: selectedDevice?.brand,
                    storage: formData.storage,
                    condition: formData.condition,
                    estimatedValue: calculateEstimate(),
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone
                })
            });

            if (!res.ok) throw new Error('Submission failed');

            setFormStep(3);
            toast.success('Request submitted!');
        } catch (error) {
            toast.error('Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* Top Brand Toggle */}
            <div className={styles.brandToggleContainer}>
                <button
                    className={`${styles.brandToggle} ${selectedBrand === 'Apple' ? styles.brandToggleActive : ''}`}
                    onClick={() => handleBrandChange('Apple')}
                >
                    <span style={{ fontSize: '1.2rem' }}></span> Apple
                </button>
                <button
                    className={`${styles.brandToggle} ${selectedBrand === 'Samsung' ? styles.brandToggleActive : ''}`}
                    onClick={() => handleBrandChange('Samsung')}
                >
                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>S</span> Samsung
                </button>
            </div>

            {/* Category Tabs */}
            <div className={styles.tabsContainer}>
                {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setSelectedDevice(null);
                            }}
                        >
                            <Icon size={18} />
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Search & List */}
            <div className={styles.contentArea}>
                <div className={styles.searchBar}>
                    <Search size={20} color="#888" />
                    <input
                        type="text"
                        placeholder={`Search ${categories.find(c => c.id === activeCategory)?.label || 'devices'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <p style={{ textAlign: 'center', color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Select your exact model from the list below to begin.
                </p>

                <div className={styles.deviceTable}>
                    <div className={styles.tableHeader}>
                        <span>Your Device</span>
                        <span style={{ textAlign: 'right' }}>Estimated Value</span>
                    </div>

                    {filteredDevices.length > 0 ? (
                        filteredDevices.map(device => (
                            <div
                                key={device._id}
                                className={`${styles.deviceRow} ${selectedDevice?._id === device._id ? styles.deviceRowSelected : ''}`}
                                onClick={() => handleSelectDevice(device)}
                            >
                                <span className={styles.deviceName}>{device.name}</span>
                                <span className={styles.deviceValue}>Up to KES {device.maxCredit.toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            No devices found in this category.
                        </div>
                    )}
                </div>
            </div>

            {/* Trade-In Form Modal/Section */}
            {selectedDevice && (
                <div id="trade-in-form" className={styles.formSection}>
                    {formStep < 3 && (
                        <div className={styles.formHeader}>
                            <h3>Trading in: <span style={{ color: 'var(--accent)' }}>{selectedDevice.name}</span></h3>
                            <button onClick={() => setSelectedDevice(null)} className={styles.closeBtn}>Cancel</button>
                        </div>
                    )}

                    {formStep === 1 && (
                        <form onSubmit={(e) => { e.preventDefault(); setFormStep(2); }}>
                            <div className={styles.progressBarContainer}>
                                <div className={styles.stepLabel}>Step 1 of 3</div>
                                <div className={styles.progressBarBackground}>
                                    <div className={styles.progressBarFill} style={{ width: '33%' }}></div>
                                </div>
                            </div>

                            <div className={styles.stepContent}>
                                <h4 className={styles.stepTitle}>Fill in the form below</h4>
                                <p style={{ color: '#888', marginBottom: '1.5rem', display: 'none' }}>We'll contact you to arrange pickup or drop-off.</p>

                                <div className={styles.inputGroup}>
                                    <div>
                                        <label className={styles.inputLabel}>Your Name<span className={styles.inputRequired}>*</span></label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    className={styles.input}
                                                    style={{ width: '100%' }}
                                                    required
                                                    value={formData.customerName.split(' ')[0] || ''}
                                                    onChange={e => {
                                                        const parts = formData.customerName.split(' ');
                                                        const lastName = parts.slice(1).join(' ');
                                                        setFormData({ ...formData, customerName: `${e.target.value} ${lastName}`.trim() });
                                                    }}
                                                />
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>First</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    className={styles.input}
                                                    style={{ width: '100%' }}
                                                    required
                                                    value={formData.customerName.split(' ').slice(1).join(' ') || ''}
                                                    onChange={e => {
                                                        const firstName = formData.customerName.split(' ')[0] || '';
                                                        setFormData({ ...formData, customerName: `${firstName} ${e.target.value}`.trim() });
                                                    }}
                                                />
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>Last</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className={styles.inputLabel}>Your Number<span className={styles.inputRequired}>*</span></label>
                                            <input
                                                className={styles.input}
                                                required
                                                style={{ width: '100%' }}
                                                value={formData.customerPhone}
                                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={styles.inputLabel}>Your Email<span className={styles.inputRequired}>*</span></label>
                                            <input
                                                className={styles.input}
                                                type="email"
                                                required
                                                style={{ width: '100%' }}
                                                value={formData.customerEmail}
                                                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button type="submit" className={styles.primaryBtn}>Next</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {formStep === 2 && (
                        <div>
                            <div className={styles.progressBarContainer}>
                                <div className={styles.stepLabel}>Step 2 of 3</div>
                                <div className={styles.progressBarBackground}>
                                    <div className={styles.progressBarFill} style={{ width: '66%' }}></div>
                                </div>
                            </div>

                            <div className={styles.stepContent}>
                                <h4 className={styles.stepTitle}>Device Details</h4>

                                {/* Storage Selection (if applicable) */}
                                {selectedDevice.storageOptions && selectedDevice.storageOptions.length > 0 && (
                                    <div className={styles.fieldGroup}>
                                        <label>Storage Capacity</label>
                                        <div className={styles.optionsGrid}>
                                            {selectedDevice.storageOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    className={`${styles.optionBtn} ${formData.storage === opt ? styles.optionBtnActive : ''}`}
                                                    onClick={() => setFormData({ ...formData, storage: opt })}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.fieldGroup}>
                                    <label>Condition</label>
                                    <div className={styles.conditionList}>
                                        {[
                                            { val: 'Excellent', desc: 'Flawless, like new.' },
                                            { val: 'Good', desc: 'Minor scratches, fully functional.' },
                                            { val: 'Fair', desc: 'Visible wear, dents, or cracks.' },
                                            { val: 'Broken', desc: 'Does not turn on or major damage.' }
                                        ].map(c => (
                                            <button
                                                key={c.val}
                                                className={`${styles.conditionBtn} ${formData.condition === c.val ? styles.conditionBtnActive : ''}`}
                                                onClick={() => setFormData({ ...formData, condition: c.val })}
                                            >
                                                <span style={{ fontWeight: 600 }}>{c.val}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{c.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.estimatePreview}>
                                    <span>Estimated Value:</span>
                                    <span className={styles.bigPrice}>~ KES {calculateEstimate().toLocaleString()}</span>
                                </div>

                                <div className={styles.actions}>
                                    <button onClick={() => setFormStep(1)} className={styles.secondaryBtn}>Back</button>
                                    <button onClick={(e) => handleSubmit(e as any)} disabled={isSubmitting} className={styles.primaryBtn}>
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {formStep === 3 && (
                        <div className={styles.successContent}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                            <h3>Request Received!</h3>
                            <p>We'll be in touch with <b>{formData.customerName}</b> shortly regarding the <b>{selectedDevice.name}</b>.</p>
                            <button onClick={() => { setSelectedDevice(null); setFormStep(1); }} className={styles.secondaryBtn}>
                                Trade Another Device
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
