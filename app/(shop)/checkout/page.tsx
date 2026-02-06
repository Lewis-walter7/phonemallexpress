"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// ... imports
import { ChevronRight, ShieldCheck, Truck, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import './Checkout.css';

const SHIPPING_METHODS = [
    { id: 'cbd-fast', name: 'CBD (Fast Delivery)', price: 1 },
    { id: 'near-cbd', name: 'Near Nairobi CBD (Upperhill, Ngara, Westlands) - Immediate Delivery by Rider', price: 250 },
    { id: 'nairobi-estates', name: 'Within Nairobi Estates - Immediate Delivery by Rider', price: 500 },
    { id: 'nairobi-outskirts', name: 'Nairobi Outskirts - Immediate Delivery by Rider', price: 800 },
    { id: 'westlands', name: 'Westlands', price: 300 },
    { id: 'kangemi', name: 'Kangemi', price: 450 },
    { id: 'ngara', name: 'Ngara', price: 250 },
    { id: 'muthaiga', name: 'Muthaiga / Survey / Allsops', price: 350 },
    { id: 'roysambu', name: 'Thome / Garden Estate / Roysambu / Githurai', price: 500 },
    { id: 'kahawa', name: 'Kahawa Wendani / Kahawa Sukari', price: 600 },
    { id: 'south-b', name: 'Nyayo Stadium / South B / Capital Centre', price: 300 },
    { id: 'jamhuri', name: 'Fig Tree / Jamhuri Sec / Slima Plaza', price: 250 },
    { id: 'parklands', name: 'Parklands / City Park', price: 300 },
    { id: 'gigiri', name: 'U.N / Gachie / Kitisuru / Village Market / Two Rivers', price: 500 },
    { id: 'ruaka', name: 'Ruaka', price: 550 },
];

const CheckoutPage = () => {
    const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
    const [step, setStep] = useState(1);
    const [showAddressInput, setShowAddressInput] = useState(false);
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        shippingMethod: 'near-cbd',
        paymentMethod: 'pesapal' // 'pesapal', 'card'
    });
    const [pesapalUrl, setPesapalUrl] = useState<string | null>(null);

    const validateStep1 = () => {
        const { firstName, lastName, email, address, city, phone } = formData;
        if (!firstName || !lastName || !email || !address || !city || !phone) {
            toast.error('Please fill in all required fields');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) {
            return;
        }
        setStep(step + 1);
    };
    const handleBack = () => setStep(step - 1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Map 'shipping' radio group to 'shippingMethod' state key
        // Map 'payment' radio group to 'paymentMethod' state key
        const key = name === 'shipping' ? 'shippingMethod' : 'paymentMethod';
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleCompletePurchase = async () => {
        setIsProcessing(true);
        try {
            if (formData.paymentMethod === 'pesapal') {
                const orderId = `ORDER-${Date.now()}`;
                const selectedShipping = SHIPPING_METHODS.find(m => m.id === formData.shippingMethod);
                const shippingCost = selectedShipping ? selectedShipping.price : 0;
                const grandTotal = totalPrice + shippingCost;

                const res = await fetch('/api/pesapal/submit-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        amount: grandTotal,
                        currency: 'KES',
                        email: formData.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        shippingMethod: selectedShipping?.name || formData.shippingMethod,
                        items: cart.map(item => ({
                            productId: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            variant: item.variant || item.selectedStorage, // Prioritize storage as main variant
                            color: item.selectedColor
                        })),
                        description: `Order ${orderId} - ${totalItems} items`
                    })
                });

                const data = await res.json();
                if (data.redirect_url) {
                    setPesapalUrl(data.redirect_url);
                    // window.location.href = data.redirect_url;
                } else {
                    console.error('PesaPal Checkout Error:', data);
                    const errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                    alert('PesaPal Error: ' + (errorMessage || 'Failed to initiate payment'));
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        // ... (empty cart render)
        return (
            <div className="container section-py empty-checkout">
                <h2>Your cart is empty</h2>
                <p>Add some premium accessories to your cart to proceed with checkout.</p>
                <Link href="/products" className="btn btn-primary">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="checkout-page section-py">
            <div className="container checkout-container">
                <div className="checkout-main">
                    {/* Progress Steps */}
                    <div className="checkout-steps">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-num">1</span>
                            <span className="step-label">Info</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-num">2</span>
                            <span className="step-label">Shipping</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-label">Payment</span>
                        </div>
                    </div>

                    <div className="step-content">
                        {step === 1 && (
                            <div className="step-info">
                                <h3 className="section-title">Customer Information</h3>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Delivery Address</label>
                                    <input type="text" id="address" placeholder="Stree name, Apartment, etc." value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input type="text" id="city" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input type="tel" id="phone" placeholder="0712 345 678" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="step-actions">
                                    <div></div>
                                    <button className="btn btn-primary" onClick={handleNext}>
                                        Continue to Shipping
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-shipping">
                                <h3 className="section-title">Shipping Method</h3>
                                <div className="shipping-layout-custom">
                                    <div className="shipping-label-column">
                                        <label className="main-side-label">SHIPPING</label>
                                    </div>
                                    <div className="shipping-options-column">
                                        {SHIPPING_METHODS.map((method) => (
                                            <label key={method.id} className="shipping-radio-item">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value={method.id}
                                                    checked={formData.shippingMethod === method.id}
                                                    onChange={handleOptionChange}
                                                />
                                                <span className="radio-custom-text">
                                                    {method.name}: <strong>KSh {method.price.toLocaleString()}</strong>
                                                </span>
                                            </label>
                                        ))}
                                        <div className="shipping-info-footer">
                                            <p className="shipping-to-text">Shipping to <strong>{formData.city || 'Nairobi County'}</strong>.</p>

                                            {showAddressInput ? (
                                                <div className="inline-address-edit">
                                                    <input
                                                        type="text"
                                                        id="city"
                                                        placeholder="Enter your City/County"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        autoFocus
                                                    />
                                                    <button className="btn-done" onClick={() => setShowAddressInput(false)}>Done</button>
                                                </div>
                                            ) : (
                                                <button className="change-address-btn" onClick={() => setShowAddressInput(true)}>
                                                    <Truck size={12} />
                                                    CHANGE ADDRESS
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-link" onClick={handleBack}>Back to Info</button>
                                    <button className="btn btn-primary" onClick={handleNext}>
                                        Continue to Payment
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-payment">
                                <h3 className="section-title">Payment Method</h3>
                                <div className="payment-options">
                                    <div className="payment-option selected">
                                        <div className="option-info">
                                            <span className="option-name">PesaPal (Card/Mobile)</span>
                                            <span className="option-desc">Secure payment via PesaPal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-link" onClick={handleBack} disabled={isProcessing}>Back to Shipping</button>
                                    <button className="btn btn-primary" onClick={handleCompletePurchase} disabled={isProcessing}>
                                        {isProcessing ? 'Processing...' : 'Complete Purchase'}
                                        {!isProcessing && <ShieldCheck size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="order-summary-card">
                        <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
                            <h3 className="card-title" style={{ margin: 0, border: 0, padding: 0 }}>Order Summary</h3>
                            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>{totalItems} items</span>
                        </div>

                        <div className="summary-items">
                            {cart.map((item) => (
                                <div key={item.id} className="summary-item-interactive">
                                    <div className="item-img-container">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded-md"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                                <ShoppingCart size={20} className="text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-details">
                                        <div className="flex justify-between items-start gap-xs">
                                            <span className="item-name">{item.name}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="remove-item-btn"
                                                aria-label="Remove item"
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <div className="item-actions">
                                            <div className="mini-qty-selector">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <span className="item-price">KSh {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>KSh {totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>KSh {(SHIPPING_METHODS.find(m => m.id === formData.shippingMethod)?.price || 0).toLocaleString()}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>KSh {(totalPrice + (SHIPPING_METHODS.find(m => m.id === formData.shippingMethod)?.price || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="trust-badges">
                            <div className="badge">
                                <ShieldCheck size={16} />
                                <span>SSL Encrypted</span>
                            </div>
                            <div className="badge">
                                <Truck size={16} />
                                <span>Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PesaPal Iframe Modal */}
            {/* PesaPal Iframe Modal */}
            {pesapalUrl && (
                <div className="pesapal-modal-overlay">
                    <div className="pesapal-modal-container">
                        <div className="pesapal-modal-header">
                            <h3 className="section-title" style={{ marginBottom: 0 }}>Complete Payment</h3>
                            <button
                                onClick={() => {
                                    setPesapalUrl(null);
                                    setIsProcessing(false);
                                }}
                                className="pesapal-close-btn"
                            >
                                &times; Close
                            </button>
                        </div>
                        <div className="pesapal-iframe-wrapper">
                            <iframe
                                src={pesapalUrl}
                                className="pesapal-iframe"
                                title="PesaPal Payment"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default CheckoutPage;
