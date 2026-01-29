"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// ... imports
import { ChevronRight, ShieldCheck, Truck, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import './Checkout.css';

const CheckoutPage = () => {
    const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
    const [step, setStep] = useState(1);
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        shippingMethod: 'standard',
        paymentMethod: 'mpesa' // 'mpesa', 'card', 'pesapal'
    });

    const handleNext = () => setStep(step + 1);
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
                const shippingCost = formData.shippingMethod === 'standard' ? 300 : 500;
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
                        description: `Order ${orderId} - ${totalItems} items`
                    })
                });

                const data = await res.json();
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    console.error('PesaPal Checkout Error:', data);
                    const errorMessage = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                    alert('PesaPal Error: ' + (errorMessage || 'Failed to initiate payment'));
                    setIsProcessing(false);
                }
            } else {
                // ... Existing handlers for M-Pesa or others
                alert('Payment method implementation pending for ' + formData.paymentMethod);
                setIsProcessing(false);
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
                                <div className="shipping-options">
                                    <label className="shipping-option">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="standard"
                                            checked={formData.shippingMethod === 'standard'}
                                            onChange={handleOptionChange}
                                        />
                                        <div className="option-info">
                                            <span className="option-name">Standard Delivery (Nairobi)</span>
                                            <span className="option-time">1-2 business days</span>
                                        </div>
                                        <span className="option-price">KSh 300</span>
                                    </label>
                                    <label className="shipping-option">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value="upcountry"
                                            checked={formData.shippingMethod === 'upcountry'}
                                            onChange={handleOptionChange}
                                        />
                                        <div className="option-info">
                                            <span className="option-name">Standard Delivery (Upcountry)</span>
                                            <span className="option-time">2-4 business days</span>
                                        </div>
                                        <span className="option-price">KSh 500</span>
                                    </label>
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
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="mpesa"
                                            checked={formData.paymentMethod === 'mpesa'}
                                            onChange={handleOptionChange}
                                        />
                                        <div className="option-info">
                                            <span className="option-name">M-PESA / Mobile Money</span>
                                            <span className="option-desc">Pay via Lipa na M-Pesa</span>
                                        </div>
                                        <CreditCard size={24} />
                                    </label>
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="pesapal"
                                            checked={formData.paymentMethod === 'pesapal'}
                                            onChange={handleOptionChange}
                                        />
                                        <div className="option-info">
                                            <span className="option-name">PesaPal (Card/Mobile)</span>
                                            <span className="option-desc">Secure payment via PesaPal</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold text-blue-500">P</span>
                                        </div>
                                    </label>
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
                                <span>KSh {formData.shippingMethod === 'standard' ? 300 : 500}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>KSh {(totalPrice + (formData.shippingMethod === 'standard' ? 300 : 500)).toLocaleString()}</span>
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
        </div>
    );
};


export default CheckoutPage;
