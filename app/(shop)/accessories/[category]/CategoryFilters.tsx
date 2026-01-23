"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial States
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    // Debounce price
    useEffect(() => {
        const handler = setTimeout(() => {
            updateParams({ minPrice, maxPrice });
        }, 500);
        return () => clearTimeout(handler);
    }, [minPrice, maxPrice]);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const brands = ['Samsung', 'Apple', 'Xiaomi', 'Tecno', 'Infinix', 'Oppo', 'OnePlus', 'Google'];
    const colors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Grey'];
    const storage = ['64GB', '128GB', '256GB', '512GB', '1TB'];

    const [isOpen, setIsOpen] = useState(false);

    // Auto-close timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => {
                setIsOpen(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleToggle = (key: string, value: string) => {
        const current = searchParams.get(key);
        updateParams({ [key]: current === value ? null : value });
        // Reset timer on interaction if we wanted to keep it open, but requirements said "closes after 5 seconds", likely implies pure visibility timer or inactivity. 
        // I will interpret as strict 5s for now, or maybe reset on interaction? 
        // User said "closes after 5 seconds". I'll stick to the effect above.
    };

    return (
        <>
            <button
                className="mobile-filter-toggle"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'none', // Hidden on desktop by default via CSS
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--foreground)'
                }}
            >
                <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <aside className={`filters-card ${isOpen ? 'open' : ''}`} style={{
                backgroundColor: 'var(--secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                position: 'sticky',
                top: '160px',
                // Mobile styles will be handled by CSS class 'open' or media queries ideally, 
                // but since we are using inline styles for some parts, we need to be careful.
                // I will add a className helper.
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Filters</h2>

                {/* Brands */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Brand</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {brands.map(brand => {
                            const isSelected = searchParams.get('brand') === brand;
                            return (
                                <button
                                    key={brand}
                                    onClick={() => handleToggle('brand', brand)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        borderRadius: '8px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                        color: isSelected ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {brand}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range (KES)</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ flex: 1, padding: '10px', background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '8px', fontSize: '13px' }}
                        />
                        <span style={{ color: 'var(--muted-foreground)' }}>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ flex: 1, padding: '10px', background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '8px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* Colors */}
                <div className="filter-group" style={{ marginBottom: '24px' }}>
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Color</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {colors.map(color => {
                            const isSelected = searchParams.get('color') === color;
                            return (
                                <button
                                    key={color}
                                    onClick={() => handleToggle('color', color)}
                                    style={{
                                        padding: '6px',
                                        fontSize: '11px',
                                        borderRadius: '6px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                                        color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
                                        textAlign: 'center'
                                    }}
                                >
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Storage */}
                <div className="filter-group">
                    <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Storage</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {storage.map(opt => {
                            const isSelected = searchParams.get('storage') === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleToggle('storage', opt)}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '11px',
                                        borderRadius: '6px',
                                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                                        color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)'
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={() => router.push(window.location.pathname)}
                    style={{ marginTop: '20px', fontSize: '12px', textDecoration: 'underline', color: 'var(--muted-foreground)' }}
                >
                    Clear all filters
                </button>
            </aside>
        </>
    );
}
