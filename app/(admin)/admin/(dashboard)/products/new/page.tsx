'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MultiImageUploader from '@/components/admin/MultiImageUploader';

interface FeatureObj {
    key: string;
    value: string;
}

const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
    'Audio': ['Earbuds', 'Headphones', 'Speakers', 'Microphones', 'Soundbars', 'Home Theater', 'Accessories'],
    'Laptops': ['Gaming', 'Business', 'Ultrabooks', 'MacBook', 'Chromebook', '2-in-1', 'Accessories'],
    'Phones': ['Smartphones', 'Feature Phones', 'Foldable', 'Rugged'],
    'Tablets': ['iPad', 'Android Tablets', 'Graphics Tablets', 'Accessories'],
    'Gaming': ['Consoles', 'Controllers', 'Video Games', 'Accessories', 'VR'],
    'Cameras': ['DSLR', 'Mirrorless', 'Action Cameras', 'Drones', 'Security Cameras', 'Lenses'],
    'TVs': ['Smart TVs', 'Android TVs', 'QLED', 'OLED', '4K', '8K', 'Projectors'],
    'Computing': ['Desktops', 'Monitors', 'Printers', 'Scanners', 'Components', 'Software'],
    'Networking': ['Routers', 'Switches', 'Access Points', 'Cables'],
    'Storage': ['External Hard Drives', 'SSD', 'Flash Drives', 'Memory Cards'],
    'Accessories': ['Cases', 'Screen Protectors', 'Chargers', 'Cables', 'Power Banks', 'Mounts'],
    'Smartwatches': ['Apple Watch', 'Samsung Watch', 'Fitness Bands', 'Garmin', 'Kids Watches'],
    'Wearables': ['Smartwatches', 'Smart Rings', 'Fitness Bands']
};

const PHONE_VARIANTS = [
    "4/64GB", "4/128GB",
    "6/128GB",
    "8/128GB", "8/256GB",
    "12/256GB", "12/512GB",
    "16/512GB", "16/1TB", "16/2TB"
];

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        salePrice: '',
        minPrice: '',
        maxPrice: '',
        category: 'Phones',
        subcategory: '',
        description: '',
        stock: '',
        image: '',
        images: [] as string[]
    });

    // Features State
    const [features, setFeatures] = useState<FeatureObj[]>([
        { key: '', value: '' } // Start with one empty row
    ]);

    // Specifications State (New)
    const [specifications, setSpecifications] = useState<FeatureObj[]>([
        { key: '', value: '' }
    ]);

    // Advanced Fields State
    const [isFeatured, setIsFeatured] = useState(false);
    const [isOnSpecialOffer, setIsOnSpecialOffer] = useState(false);
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ name: string; price: string; stock: string }[]>([]);

    // Auto-Save Logic
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timer = setTimeout(() => {
            saveDraft();
        }, 5000); // 5 seconds debounce

        return () => clearTimeout(timer);
    }, [formData, features, specifications, isFeatured, isOnSpecialOffer, colors, variants]);

    const saveDraft = async () => {
        // Don't save if empty name
        if (!formData.name) return;

        setSavingDraft(true);
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
                brand: formData.brand.trim() || null,
                subcategory: formData.subcategory.trim() || null,
                imageUrl: formData.images[0] || formData.image,
                images: formData.images,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                isOnSpecialOffer,
                colors,
                variants: hasVariants ? variants.map(v => ({
                    name: v.name,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })) : [],
                status: 'draft',
                price: Number(formData.price) || 0,
                salePrice: Number(formData.salePrice) || null,
                minPrice: Number(formData.minPrice) || 0,
                maxPrice: Number(formData.maxPrice) || 0
            };

            let res;
            if (draftId) {
                res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, _id: draftId }),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();
            if (data.success) {
                setDraftId(data.data._id);
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            setSavingDraft(false);
        }
    };

    // ------------------------------------------------------------------
    // PARSER 1: Key Features
    // ------------------------------------------------------------------
    const parseKeyFeatures = (text: string) => {
        if (!text.trim()) return [];

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const newRows: FeatureObj[] = [];

        lines.forEach(line => {
            const cleanLine = line.replace(/^[\s\-\•\*]+/, '').trim();
            if (!cleanLine) return;

            let key = 'Feature';
            let value = cleanLine;

            const colonIndex = cleanLine.indexOf(':');
            if (colonIndex !== -1 && colonIndex < 20) {
                key = cleanLine.substring(0, colonIndex).trim();
                value = cleanLine.substring(colonIndex + 1).trim();
            } else {
                const lower = cleanLine.toLowerCase();
                if (lower.includes('display') || lower.includes('screen')) key = 'Display';
                else if (lower.includes('battery')) key = 'Battery';
                else if (lower.includes('camera')) key = 'Camera';
                else if (lower.includes('ram') || lower.includes('storage')) key = 'Memory';
                else if (lower.includes('processor') || lower.includes('cpu')) key = 'Processor';
                else if (lower.includes('android') || lower.includes('ios')) key = 'OS';
                else if (lower.includes('sim')) key = 'SIM';
                else if (lower.includes('network')) key = 'Network';
            }

            newRows.push({ key, value });
        });

        return newRows;
    };

    // ------------------------------------------------------------------
    // PARSER 2: Technical Specs
    // ------------------------------------------------------------------
    const parseTechnicalSpecs = (text: string) => {
        if (!text.trim()) return [];

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const newRows: FeatureObj[] = [];

        const KNOWN_KEYS = [
            'Model Name', 'Network Technology', 'Launch', 'Body', 'Display', 'Platform', 'Memory',
            'Main Camera', 'Selfie Camera', 'Sound', 'Comms', 'Features', 'Battery', 'Misc',
            'Dimensions', 'Weight', 'Build', 'SIM', 'Type', 'Size', 'Resolution', 'OS', 'Chipset', 'CPU', 'GPU',
            'Card slot', 'Internal', 'Single', 'Dual', 'Triple', 'Quad', 'Sensors', 'Charging', 'Colors', 'Price'
        ];

        let pendingKey = '';
        let pendingValue = '';

        const flushPending = () => {
            if (pendingKey) {
                newRows.push({ key: pendingKey, value: pendingValue.trim() });
                pendingKey = '';
                pendingValue = '';
            }
        };

        lines.forEach(line => {
            const cleanLine = line.replace(/^[\s\-\•\*]+/, '').trim();

            const matchedKey = KNOWN_KEYS.sort((a, b) => b.length - a.length)
                .find(k => cleanLine.toLowerCase().startsWith(k.toLowerCase()));

            if (matchedKey) {
                flushPending();
                pendingKey = matchedKey;
                let remainder = cleanLine.substring(matchedKey.length).trim();
                // Remove leading colon if present
                if (remainder.startsWith(':') || remainder.startsWith('-')) remainder = remainder.substring(1).trim();
                pendingValue = remainder;
            } else {
                const colonIndex = cleanLine.indexOf(':');
                if (colonIndex !== -1 && colonIndex < 40) {
                    flushPending();
                    pendingKey = cleanLine.substring(0, colonIndex).trim();
                    pendingValue = cleanLine.substring(colonIndex + 1).trim();
                } else {
                    if (pendingKey) {
                        pendingValue = pendingValue ? pendingValue + '\n' + cleanLine : cleanLine;
                    } else {
                        pendingKey = 'General';
                        pendingValue = cleanLine;
                    }
                }
            }
        });

        flushPending();
        return newRows;
    };

    // Features Smart Paste
    const [pasteModeFeatures, setPasteModeFeatures] = useState(false);
    const [rawTextFeatures, setRawTextFeatures] = useState('');

    const handleParseFeatures = () => {
        const rows = parseKeyFeatures(rawTextFeatures);
        if (rows.length > 0) {
            setFeatures(rows);
            setPasteModeFeatures(false);
            setRawTextFeatures('');
        }
    };

    // Specs Smart Paste
    const [pasteModeSpecs, setPasteModeSpecs] = useState(false);
    const [rawTextSpecs, setRawTextSpecs] = useState('');

    const handleParseSpecs = () => {
        const rows = parseTechnicalSpecs(rawTextSpecs);
        if (rows.length > 0) {
            setSpecifications(rows);
            setPasteModeSpecs(false);
            setRawTextSpecs('');
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Generic list handler
    const handleListChange = (
        list: FeatureObj[],
        setList: (l: FeatureObj[]) => void,
        index: number,
        field: 'key' | 'value',
        value: string
    ) => {
        const newList = [...list];
        newList[index][field] = value;
        setList(newList);
    };

    const addListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void) => {
        setList([...list, { key: '', value: '' }]);
    };

    const insertListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void, index: number) => {
        const newList = [...list];
        newList.splice(index + 1, 0, { key: '', value: '' });
        setList(newList);
    };

    const removeListRow = (list: FeatureObj[], setList: (l: FeatureObj[]) => void, index: number) => {
        setList(list.filter((_, i) => i !== index));
    };

    // Color Helpers
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

    // Variant Helpers
    const handleAddVariant = () => {
        setVariants([...variants, { name: '', price: '', stock: '' }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: 'name' | 'price' | 'stock', value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
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

            // Calculate Discount
            let discountPercentage = 0;
            const regularPrice = Number(formData.price) || 0;
            const salePriceVal = Number(formData.salePrice) || 0;

            if (isOnSpecialOffer && regularPrice > 0 && salePriceVal > 0 && salePriceVal < regularPrice) {
                discountPercentage = Math.round(((regularPrice - salePriceVal) / regularPrice) * 100);
            }

            const payload = {
                ...formData,
                brand: formData.brand.trim() || null,
                subcategory: formData.subcategory.trim() || null,
                imageUrl: formData.images[0] || formData.image,
                images: formData.images,
                features: featuresObject,
                specifications: specsObject,
                isFeatured,
                isOnSpecialOffer,
                colors,
                discountPercentage,
                variants: hasVariants ? variants.map(v => ({
                    name: v.name,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })) : [],
                status: 'published',
                price: regularPrice,
                salePrice: salePriceVal || null,
                minPrice: Number(formData.minPrice) || 0,
                maxPrice: Number(formData.maxPrice) || 0
            };

            let res;
            if (draftId) {
                res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, _id: draftId }),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

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

    const renderKeyValueSection = (
        title: string,
        list: FeatureObj[],
        setList: (l: FeatureObj[]) => void,
        pasteMode: boolean,
        setPasteMode: (b: boolean) => void,
        rawText: string,
        setRawText: (s: string) => void,
        handleParse: () => void,
        placeholder: string,
        parser: (text: string) => FeatureObj[]
    ) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
            // Split row on Ctrl+Enter or Ctrl+N if needed
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                insertListRow(list, setList, index);
            }
        };

        return (
            <div style={{ marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ ...labelStyle, marginTop: 0, marginBottom: 0, color: '#ff6b00', fontWeight: 'bold' }}>{title}</label>
                    <button
                        type="button"
                        onClick={() => setPasteMode(!pasteMode)}
                        style={{ fontSize: '0.85rem', color: '#ff6b00', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {pasteMode ? 'Back to Manual' : '✨ Smart Paste'}
                    </button>
                </div>

                {pasteMode ? (
                    <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #333' }}>
                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                            Paste specs block here. Format: <b>"Key: Value"</b>
                        </p>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            rows={8}
                            placeholder={placeholder}
                            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleParse}
                                style={{ padding: '8px 16px', background: '#ccc', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Auto-Fill
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {list.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        placeholder="Key"
                                        value={item.key}
                                        onChange={(e) => handleListChange(list, setList, index, 'key', e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                                    />
                                    <textarea
                                        placeholder="Value"
                                        value={item.value}
                                        onChange={(e) => handleListChange(list, setList, index, 'value', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 2, minHeight: '38px', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeListRow(list, setList, index)}
                                        style={{ background: '#333', border: 'none', color: '#ff4444', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => addListRow(list, setList)}
                            style={{ marginTop: '1rem', background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            + Add Row
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-display)' }}>Add New Product</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: isFeatured ? 'var(--accent)' : '#888' }}>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => {
                                setIsFeatured(e.target.checked);
                                if (e.target.checked) setIsOnSpecialOffer(false);
                            }}
                            style={{ accentColor: 'var(--accent)' }}
                        />
                        Featured Product
                    </label>
                    <div style={{ fontSize: '0.85rem', color: '#888', borderLeft: '1px solid #333', paddingLeft: '1rem' }}>
                        {savingDraft ? (
                            <span style={{ color: 'var(--accent)' }}>Saving Draft...</span>
                        ) : lastSaved ? (
                            <span>Saved {lastSaved.toLocaleTimeString()}</span>
                        ) : (
                            <span>Unsaved</span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '12px', border: '1px solid #222' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Product Name</label>
                        <input name="name" required placeholder="e.g. iPhone 15 Pro" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={labelStyle}>Brand</label>
                        <input name="brand" placeholder="e.g. Apple" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Price (KES)</label>
                        <input name="price" type="number" required placeholder="150000" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={labelStyle}>Stock Quantity</label>
                        <input name="stock" type="number" required placeholder="10" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                {/* Discounted Price Section */}
                {/* Discounted Price Section */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: isOnSpecialOffer ? '#ff4444' : '#888' }}>
                            <input
                                type="checkbox"
                                checked={isOnSpecialOffer}
                                onChange={(e) => {
                                    setIsOnSpecialOffer(e.target.checked);
                                    if (e.target.checked) setIsFeatured(false);
                                }}
                                style={{ accentColor: '#ff4444' }}
                            />
                            Flash Sale / Special Offer
                        </label>
                    </div>
                    {isOnSpecialOffer && (
                        <div style={{ flex: 1 }}>
                            <label style={{ ...labelStyle, marginTop: 0 }}>Discounted Price (Sale Price)</label>
                            <input name="salePrice" type="number" placeholder="Lower than original price" style={inputStyle} onChange={handleChange} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Min Price (Optional - for range)</label>
                        <input name="minPrice" type="number" placeholder="15000" style={inputStyle} onChange={handleChange} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Max Price (Optional - for range)</label>
                        <input name="maxPrice" type="number" placeholder="21000" style={inputStyle} onChange={handleChange} />
                    </div>
                </div>

                <label style={labelStyle}>Category</label>
                <select name="category" style={inputStyle} value={formData.category} onChange={handleChange}>
                    <option value="Phones">Phones</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Accessories">Accessories</option>
                    <option value="TVs">TVs</option>
                    <option value="Computing">Computing</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Networking">Networking</option>
                    <option value="Storage">Storage</option>
                    <option value="Other">Other</option>
                </select>

                <label style={labelStyle}>Subcategory</label>
                {CATEGORY_SUBCATEGORIES[formData.category] ? (
                    <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">Select Subcategory</option>
                        {CATEGORY_SUBCATEGORIES[formData.category].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                ) : (
                    <input
                        name="subcategory"
                        value={formData.subcategory}
                        placeholder="e.g. Specific Type"
                        style={inputStyle}
                        onChange={handleChange}
                    />
                )}

                <label style={labelStyle}>Description</label>
                <textarea name="description" rows={4} style={inputStyle} onChange={handleChange} />

                {/* Colors Section */}
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

                {/* Variants Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Product Variants</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: hasVariants ? 'var(--accent)' : '#888' }}>
                            <input
                                type="checkbox"
                                checked={hasVariants}
                                onChange={(e) => setHasVariants(e.target.checked)}
                            />
                            Enable Variants
                        </label>
                    </div>

                    {hasVariants && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {variants.map((v, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        placeholder="Name (e.g. 256GB)"
                                        value={v.name}
                                        onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                                        list={formData.category === 'Phones' ? "phone-variants" : undefined}
                                        style={{ ...inputStyle, marginTop: 0 }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={v.price}
                                        onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0 }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={v.stock}
                                        onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(i)}
                                        style={{ background: '#333', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                style={{ background: 'transparent', border: '1px dashed #444', color: '#aaa', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                + Add Variant
                            </button>
                        </div>
                    )}
                </div>

                {/* Key Features Section */}
                {renderKeyValueSection(
                    'Key Features',
                    features,
                    setFeatures,
                    pasteModeFeatures,
                    setPasteModeFeatures,
                    rawTextFeatures,
                    setRawTextFeatures,
                    handleParseFeatures,
                    'Resolution: 4K\nBattery: 5000mAh',
                    parseKeyFeatures
                )}

                {/* Specifications Section */}
                {renderKeyValueSection(
                    'Technical Specifications',
                    specifications,
                    setSpecifications,
                    pasteModeSpecs,
                    setPasteModeSpecs,
                    rawTextSpecs,
                    setRawTextSpecs,
                    handleParseSpecs,
                    'Display Type: AMOLED\nDimensions: 159.2 x 75 x 12.9 mm',
                    parseTechnicalSpecs
                )}

                <label style={labelStyle}>Product Images</label>

                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <MultiImageUploader
                        value={formData.images}
                        onChange={(urls) => setFormData({ ...formData, images: urls })}
                    />
                </div>

                <details style={{ marginTop: '1rem' }}>
                    <summary style={{ fontSize: '0.8rem', color: '#666', cursor: 'pointer' }}>Or use external URL (Main Image)</summary>
                    <input name="image" placeholder="https://..." value={formData.image} style={inputStyle} onChange={handleChange} />
                </details>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'Publishing...' : 'Publish Product'}
                    </button>
                </div>

                <datalist id="phone-variants">
                    {PHONE_VARIANTS.map(variant => (
                        <option key={variant} value={variant} />
                    ))}
                </datalist>

            </form>
        </div >
    );
}
