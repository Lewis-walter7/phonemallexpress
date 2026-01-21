'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CustomImageUploader from '@/components/admin/CustomImageUploader';

interface FeatureObj {
    key: string;
    value: string;
}

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Phones',
        description: '',
        stock: '',
        image: ''
    });

    const [features, setFeatures] = useState<FeatureObj[]>([{ key: '', value: '' }]);
    const [specifications, setSpecifications] = useState<FeatureObj[]>([{ key: '', value: '' }]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddColor = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (colorInput.trim() && !colors.includes(colorInput.trim())) {
                setColors([...colors, colorInput.trim()]);
                setColorInput('');
            }
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const featuresObject: Record<string, string> = {};
            features.forEach(f => {
                if (f.key.trim()) featuresObject[f.key.trim()] = f.value.trim();
            });

            const specsObject: Record<string, string> = {};
            specifications.forEach(s => {
                if (s.key.trim()) specsObject[s.key.trim()] = s.value.trim();
            });

            const payload = {
                ...formData,
                imageUrl: formData.image,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                colors,
                status: 'published'
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Failed to publish product');
            }
        } catch (error) {
            console.error(error);
            alert('Error publishing product');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        background: '#111',
        border: '1px solid #333',
        borderRadius: '6px',
        color: 'white',
        marginTop: '0.5rem',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginTop: '1.5rem',
        color: '#ccc',
        fontSize: '0.9rem'
    };

    return (
        <div style={{ color: 'white', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Add New Product</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '1rem', color: isFeatured ? 'var(--accent)' : '#888', fontWeight: '600' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                        />
                        Featured Product
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ ...labelStyle, marginTop: 0 }}>Product Name</label>
                    <input name="name" required placeholder="e.g. iPhone 15 Pro" style={inputStyle} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Price (KES)</label>
                        <input name="price" type="number" required placeholder="150000" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Stock Quantity</label>
                        <input name="stock" type="number" required placeholder="10" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                <label style={labelStyle}>Category</label>
                <select name="category" style={inputStyle} onChange={handleChange}>
                    <option value="Phones">Phones</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                </select>

                <label style={labelStyle}>Description</label>
                <textarea name="description" rows={4} style={inputStyle} onChange={handleChange} />

                <label style={labelStyle}>Colors</label>
                <div style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    {colors.map(c => (
                        <span key={c} style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {c}
                            <button type="button" onClick={() => handleRemoveColor(c)} style={{ border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </span>
                    ))}
                    <input
                        placeholder="Type color & Enter..."
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={handleAddColor}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', minWidth: '120px' }}
                    />
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <label style={{ ...labelStyle, marginTop: 0 }}>Product Image</label>
                    <div style={{ marginTop: '0.75rem' }}>
                        <CustomImageUploader
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ flex: '1 1 150px', padding: '12px 24px', background: 'transparent', border: '1px solid #333', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ flex: '1 1 150px', padding: '12px 24px', background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 12px hsla(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.3)' }}
                    >
                        {loading ? 'Publishing...' : 'Publish Product'}
                    </button>
                </div>

            </form>
        </div>
    );
}
