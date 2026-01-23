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
    colors?: string[];
}

const AddToCartSection = ({ product, variants = [], colors = [] }: AddToCartSectionProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(variants && variants.length > 0 ? variants[0] : null);
    const [selectedColor, setSelectedColor] = useState<string>(colors && colors.length > 0 ? colors[0] : '');
    const { addToCart } = useCart();

    const currentPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price;

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        addToCart({
            id: product._id,
            name: product.name,
            price: currentPrice,
            quantity: quantity,
            image: product.image,
            slug: product.slug,
            category: product.category,
            variant: selectedVariant ? selectedVariant.name : undefined,
            color: selectedColor || undefined
        });
    };

    return (
        <div className="product-actions-wrapper">
            {/* Variants */}
            {variants && variants.length > 0 && (
                <div className="variants-section" style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#888' }}>Storage / Variant</h4>
                    <div className="variants-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {variants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedVariant(v)}
                                className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedVariant === v ? '1px solid var(--accent)' : '1px solid #333',
                                    borderRadius: '8px',
                                    background: selectedVariant === v ? 'var(--accent)' : 'transparent',
                                    color: selectedVariant === v ? '#fff' : '#fff',
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
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#888' }}>Color</h4>
                    <div className="colors-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {colors.map((c, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedColor(c)}
                                style={{
                                    padding: '8px 16px',
                                    border: selectedColor === c ? '1px solid var(--accent)' : '1px solid #333',
                                    borderRadius: '8px',
                                    background: selectedColor === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: selectedColor === c ? '#fff' : '#aaa',
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

export default AddToCartSection;
