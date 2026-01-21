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
}

const AddToCartSection = ({ product }: AddToCartSectionProps) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

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
            price: product.price,
            quantity: quantity,
            image: product.image,
            slug: product.slug,
            category: product.category
        });
    };

    return (
        <div className="product-actions-wrapper">
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
