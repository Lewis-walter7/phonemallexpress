"use client";

import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import './Testimonials.css';

const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
};

const REVIEWS = [
    {
        id: 1,
        name: "David K.",
        role: "Verified Buyer",
        content: "Bought my iPhone 15 Pro Max here. The 1-hour delivery within Nairobi is no joke! Excellent customer service and genuine products.",
        rating: 4,
    },
    {
        id: 2,
        name: "Sarah Wanjiku",
        role: "Local Guide",
        content: "My go-to tech store in the CBD. They fixed my MacBook screen in under an hour for a very reasonable price. Highly recommend their repair services.",
        rating: 5,
    },
    {
        id: 3,
        name: "Brian M.",
        role: "Verified Buyer",
        content: "Traded in my old S22 for the new S24 Ultra. The transition was smooth, data transfer was free, and they gave me a fantastic valuation on my old device.",
        rating: 5,
    },
    {
        id: 4,
        name: "Mercy O.",
        role: "Verified Buyer",
        content: "Purchased a complete CCTV system for my business. The technicians came to install it the next day and trained my team. Very professional setup.",
        rating: 4,
    },
    {
        id: 5,
        name: "Kevin N.",
        role: "Local Guide",
        content: "I've bought a fridge, a microwave, and most recently a PS5 from PhoneMallExpress. Always the best prices in town and authentic warranties.",
        rating: 5,
    },
    {
        id: 6,
        name: "Linda A.",
        role: "Verified Buyer",
        content: "Customer care is top notch. The delivery guy from PhoneMallExpress even helped me set up my new Smart TV. Will definitely shop here again.",
        rating: 5,
    }
];

export default function Testimonials() {
    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="testimonials-header text-center">
                    <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '8px' }}>
                        <span className="badge-pulse" style={{ backgroundColor: '#fbbc04' }}></span>
                        <h2 className="section-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Customer Reviews</h2>
                    </div>
                    <p className="section-subtitle" style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Real experiences from our customers. Find out why thousands across Kenya trust PhoneMallExpress for their tech needs.
                    </p>
                    <div className="flex items-center justify-center gap-sm" style={{ marginTop: '24px' }}>
                        <a href="https://maps.app.goo.gl/tLhG8F7d5hH6yqRb6" target="_blank" rel="noopener noreferrer" className="google-rating-badge hover:opacity-90 transition-opacity">
                            <span className="font-bold" style={{ color: 'var(--foreground)' }}>4.9</span>
                            <div className="flex" style={{ gap: '2px' }}>
                                {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#fbbc04" color="#fbbc04" />)}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginLeft: '4px' }}>Google Reviews</span>
                        </a>
                    </div>
                </div>

                <div className="testimonials-grid">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < review.rating ? "#fbbc04" : "none"}
                                        color={i < review.rating ? "#fbbc04" : "var(--border)"}
                                        className="star-icon"
                                    />
                                ))}
                            </div>
                            <p className="testimonial-text">"{review.content}"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar-wrapper">
                                    <span className="author-initials">{getInitials(review.name)}</span>
                                </div>
                                <div className="author-info">
                                    <h4 className="author-name">{review.name}</h4>
                                    <span className="author-role">{review.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
