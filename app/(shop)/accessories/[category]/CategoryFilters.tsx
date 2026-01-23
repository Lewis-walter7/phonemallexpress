"use client";

import { useState, useEffect } from 'react';
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

    const handleToggle = (key: string, value: string) => {
        const current = searchParams.get(key);
        updateParams({ [key]: current === value ? null : value });
    };

    return (
        <aside className="filters-card" style={{
            backgroundColor: '#0c0c0c',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '24px',
            position: 'sticky',
            top: '160px' // Adjust based on sticky header
        }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Filters</h2>

            {/* Brands */}
            <div className="filter-group" style={{ marginBottom: '24px' }}>
                <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Brand</h3>
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
                                    border: isSelected ? '1px solid var(--accent)' : '1px solid #262626',
                                    backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                    color: isSelected ? '#fff' : '#aaa',
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
                <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range (KES)</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{ flex: 1, padding: '10px', background: '#1a1a1a', border: '1px solid #262626', color: '#fff', borderRadius: '8px', fontSize: '13px' }}
                    />
                    <span style={{ color: '#444' }}>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{ flex: 1, padding: '10px', background: '#1a1a1a', border: '1px solid #262626', color: '#fff', borderRadius: '8px', fontSize: '13px' }}
                    />
                </div>
            </div>

            {/* Colors */}
            <div className="filter-group" style={{ marginBottom: '24px' }}>
                <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Color</h3>
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
                                    border: isSelected ? '1px solid var(--accent)' : '1px solid #262626',
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isSelected ? '#fff' : '#888',
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
                <h3 className="filter-title" style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Storage</h3>
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
                                    border: isSelected ? '1px solid var(--accent)' : '1px solid #262626',
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isSelected ? '#fff' : '#888'
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
                style={{ marginTop: '20px', fontSize: '12px', textDecoration: 'underline', color: '#666' }}
            >
                Clear all filters
            </button>
        </aside>
    );
}
