'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
    images: { url: string; alt: string }[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Fallback if no images
    if (!images || images.length === 0) {
        return (
            <div className="main-image-container">
                <div className="product-image-placeholder" />
            </div>
        );
    }

    return (
        <div className="product-media">
            <div className="main-image-container">
                <Image
                    src={images[activeIndex]?.url}
                    alt={images[activeIndex]?.alt || name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="main-image"
                />
            </div>

            {images.length > 1 && (
                <div className="image-thumbnails">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={`thumbnail-container ${activeIndex === i ? 'active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                        >
                            <Image src={img.url} alt={img.alt || `${name} thumbnail ${i + 1}`} fill sizes="60px" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
