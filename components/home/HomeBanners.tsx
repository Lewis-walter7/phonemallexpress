"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BANNERS = [
    {
        id: 1,
        image: '/banners/allaccessoriesbanner.png',
        title: 'Exclusive Deals',
        link: '/special-offers',
        buttonText: 'View Offers'
    },
    {
        id: 2,
        image: '/banners/financingbanner.png',
        title: 'Financing Available',
        link: '/financing',
        buttonText: 'Learn More'
    },
    {
        id: 3,
        image: '/banners/freechargerbanner.png',
        title: 'Free Charger',
        link: '/products/charger',
        buttonText: 'Shop Now'
    },
    {
        id: 4,
        image: '/banners/iphonewarranty.png',
        title: 'iPhone Warranty',
        link: '/products/phones/iphone',
        buttonText: 'Shop Now'
    },
    {
        id: 5,
        image: '/banners/samsungbanner.png',
        title: 'Samsung Galaxy S25',
        link: '/search?q=z%20fold7',
        buttonText: 'Shop Now'
    },
    {
        id: 6,
        image: '/banners/iphonebanner.png',
        title: 'iPhone 17 Pro Max',
        link: '/search?q=Apple',
        buttonText: 'Shop Now'
    },
    {
        id: 7,
        image: '/banners/pixelbanner.png',
        title: 'Pixel 8 Pro',
        link: '/products/phones?brand=pixell',
        buttonText: 'Shop Now'
    }
];

export default function HomeBanners() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % BANNERS.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + BANNERS.length) % BANNERS.length);
    };

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 7000);

        return () => clearInterval(interval);
    }, [nextSlide, isPaused]);

    return (
        <section className="home-banners-section">
            <div
                className="carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {BANNERS.map((banner) => (
                        <div key={banner.id} className="carousel-slide">
                            <Link href={banner.link} className="banner-card carousel-card" style={{ display: 'block', height: '100%' }}>
                                <div className="banner-image-container">
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="banner-image"
                                        sizes="100vw"
                                        priority={banner.id === 1}
                                    />
                                </div>
                                <div className="banner-overlay carousel-overlay">
                                    <span className="banner-btn">
                                        {banner.buttonText}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <button className="carousel-arrow prev" onClick={prevSlide} aria-label="Previous slide">
                    &#10094;
                </button>
                <button className="carousel-arrow next" onClick={nextSlide} aria-label="Next slide">
                    &#10095;
                </button>

                <div className="carousel-dots">
                    {BANNERS.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
