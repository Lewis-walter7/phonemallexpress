"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartSectionProps {
    product: {
        _id: string;
        name: string;
        price: number;
        slug: string;
        category: string;
        image: string;
    };
    variants?: any[];
    storageVariants?: any[];
    warrantyVariants?: {
        name: string;
        price: number;
        salePrice?: number | null;
        stock: number;
        isDisabled: boolean;
    }[];
    simVariants?: {
        name: string;
        price: number;
        salePrice?: number | null;
        stock: number;
        isDisabled: boolean;
    }[];
    colors?: string[];
}

export default function AddToCartSection({ product, variants, storageVariants, warrantyVariants, simVariants, colors }: AddToCartSectionProps) {
    console.log('ATC Props:', {
        storage: storageVariants?.length,
        warranty: warrantyVariants?.length,
        sim: simVariants?.length
    });
    const [quantity, setQuantity] = useState(1);

    // Legacy support
    const [selectedVariant, setSelectedVariant] = useState<any>(variants && variants.length > 0 ? variants[0] : null);

    // Grouped selections
    const [selectedStorage, setSelectedStorage] = useState<any>(null);
    const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
    const [selectedSim, setSelectedSim] = useState<any>(null);

    const [selectedColor, setSelectedColor] = useState<string>("");
    const { addToCart } = useCart();

    // Initialize selections
    React.useEffect(() => {
        if (storageVariants && storageVariants.length > 0) {
            // Select first available storage
            const firstAvailable = storageVariants.find(v => !v.isDisabled && v.stock > 0);
            if (firstAvailable) setSelectedStorage(firstAvailable);
        }

        if (warrantyVariants && warrantyVariants.length > 0) {
            // Select first available warranty
            const firstAvailable = warrantyVariants.find(v => !v.isDisabled);
            if (firstAvailable) setSelectedWarranty(firstAvailable);
        }

        if (simVariants && simVariants.length > 0) {
            // Select first available SIM
            const firstAvailable = simVariants.find(v => !v.isDisabled);
            if (firstAvailable) setSelectedSim(firstAvailable);
        }

        if (colors && colors.length > 0) {
            setSelectedColor(colors[0]);
        }
    }, [storageVariants, warrantyVariants, simVariants, colors]);

    const calculateCurrentPrice = () => {
        let basePrice = product.price;
        let storagePrice = 0;
        let warrantyPrice = 0;
        let simAddon = 0;

        // 1. Storage Price (Base Price if variants exist)
        if (selectedStorage) {
            storagePrice = (selectedStorage.salePrice > 0 ? selectedStorage.salePrice : selectedStorage.price) || 0;
        } else if (selectedVariant) {
            // Legacy support
            storagePrice = (selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price) || 0;
        }

        // 2. Warranty Price (Add-on)
        if (selectedWarranty) {
            warrantyPrice = (selectedWarranty.salePrice > 0 ? selectedWarranty.salePrice : selectedWarranty.price) || 0;
        }

        // 3. SIM Add-on
        if (selectedSim) {
            simAddon = (selectedSim.salePrice > 0 ? selectedSim.salePrice : selectedSim.price) || 0;
        }

        // New Logic: Storage is base, warranty and SIM are add-ons
        // If storage is selected, use it as base. Otherwise fall back to product base price.
        let finalPrice = storagePrice > 0 ? storagePrice : basePrice;

        // Add warranty and SIM as add-ons on top
        finalPrice += warrantyPrice + simAddon;

        return finalPrice;
    };

    const currentPrice = calculateCurrentPrice();

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        const cartItem = {
            id: product._id,
            name: product.name,
            price: currentPrice,
            image: product.image,
            quantity: quantity,
            selectedStorage: selectedStorage ? selectedStorage.name : undefined,
            selectedWarranty: selectedWarranty ? selectedWarranty.name : undefined,
            selectedSim: selectedSim ? selectedSim.name : undefined,
            selectedColor: selectedColor || undefined,
            slug: product.slug,
            category: product.category,
            // Fallback for legacy
            variant: (!selectedStorage && selectedVariant) ? selectedVariant.name : undefined
        };
        addToCart(cartItem);
        // setIsCartOpen(true); // Not available in context
    };

    return (
        <div className="product-actions-wrapper">
            <div className="dynamic-price-display" style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255,107,0,0.1)',
                borderRadius: '12px',
                border: '1px solid var(--accent)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <span style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>Total Price</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>
                        KSh {currentPrice.toLocaleString()}
                    </span>
                    {product.price < currentPrice && (
                        <span style={{ fontSize: '16px', color: '#666', textDecoration: 'line-through' }}>
                            KSh {product.price.toLocaleString()}
                        </span>
                    )}
                </div>
                <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    *Price updates dynamically based on your selections below
                </p>
            </div>

            {/* Storage Variants */}
            {storageVariants && storageVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Storage</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {storageVariants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedStorage(v)}
                                className={`variant-btn ${selectedStorage === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedStorage === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedStorage === v ? 'var(--accent)' : 'transparent',
                                    color: selectedStorage === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} - KSh {(v.salePrice || v.price).toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Warranty Variants */}
            {warrantyVariants && warrantyVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Warranty</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {warrantyVariants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedWarranty(v)}
                                className={`variant-btn ${selectedWarranty === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedWarranty === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedWarranty === v ? 'var(--accent)' : 'transparent',
                                    color: selectedWarranty === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} {v.price > 0 ? `(+ KSh ${v.price.toLocaleString()})` : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* SIM Variants */}
            {simVariants && simVariants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>SIM Card Slots</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {simVariants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedSim(v)}
                                className={`variant-btn ${selectedSim === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedSim === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedSim === v ? 'var(--accent)' : 'transparent',
                                    color: selectedSim === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} {v.price > 0 ? `(+ KSh ${v.price.toLocaleString()})` : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Legacy Variants (Price changes based on selection) */}
            {variants && variants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Options</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {variants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedVariant(v)}
                                className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedVariant === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedVariant === v ? 'var(--accent)' : 'transparent',
                                    color: selectedVariant === v ? '#fff' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {v.name} - KSh {(v.salePrice || v.price).toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Colors */}
            {colors && colors.length > 0 && (
                <div className="colors-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--muted-foreground)' }}>Color</h4>
                    <div className="colors-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {colors.map((c, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedColor(c)}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedColor === c ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: selectedColor === c ? 'var(--secondary)' : 'transparent',
                                    color: selectedColor === c ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="atc-quantity-row">
                <div className="quantity-input-container">
                    <button
                        className="qty-btn"
                        aria-label="Decrease quantity"
                        onClick={() => handleQuantityChange('dec')}
                    >
                        <span style={{ fontSize: '20px', fontWeight: 700 }}>−</span>
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                        className="qty-btn"
                        aria-label="Increase quantity"
                        onClick={() => handleQuantityChange('inc')}
                    >
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>+</span>
                    </button>
                </div>
                <button
                    className="btn btn-primary buy-now-btn"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart size={18} />
                    Add to cart
                </button>
            </div>

            <button className="btn btn-outline" style={{ background: '#d97706', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Questions? Request a Call Back
            </button>
        </div>
    );
};


