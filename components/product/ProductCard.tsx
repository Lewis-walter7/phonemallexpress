"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import './ProductCard.css';

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice?: number;
        salePrice?: number;
        imageUrl?: string;
        images?: { url: string; alt: string }[];
        category: string | { name: string; slug: string };
    };
}

const ProductCard = ({ product }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // Determine the product image, prioritizing images[0] then imageUrl
    let productImage = product.images?.[0]?.url || product.imageUrl;
    const productAlt = product.images?.[0]?.alt || product.name;

    // Validate image URL to prevent next/image errors with unconfigured hosts
    // Allowed all domains in next.config.ts, so strict check removed.
    // if (productImage?.startsWith('http')) { ... }

    // Support both salePrice (jelectronics) and compareAtPrice
    const originalPrice = product.compareAtPrice || product.salePrice;

    // Calculate discount if originalPrice > current price
    const discount = (originalPrice && originalPrice > product.price)
        ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
        : null;

    // Handle category name and link slug
    const catName = typeof product.category === 'string' ? product.category : product.category.name;
    const catSlug = typeof product.category === 'string' ? product.category.toLowerCase() : product.category.slug;

    const inWishlist = isInWishlist(product._id);

    const seoSlug = `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${product._id}`;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: productImage || '',
            slug: product.slug,
            category: catName
        });
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist({
                id: product._id,
                name: product.name,
                price: product.price,
                image: productImage || '',
                slug: product.slug,
                category: catName
            });
        }
    };

    return (
        <div className="product-card">
            <Link href={`/accessories/${catSlug}/${seoSlug}`} className="product-image-link">
                <div className="product-image-container">
                    {productImage && !imageError ? (
                        <Image
                            src={productImage}
                            alt={productAlt}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="product-image"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="product-image-placeholder" />
                    )}
                    {discount && <span className="discount-badge">-{discount}%</span>}

                    <button
                        className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                        onClick={handleWishlistToggle}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                    </button>
                </div>
            </Link>

            <div className="product-info">
                <Link href={`/accessories/${catSlug}`} className="product-category">
                    {catName}
                </Link>
                <Link href={`/accessories/${catSlug}/${seoSlug}`}>
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="product-footer-row">
                    <div className="product-price-container">
                        <span className="product-price">KSh {product.price.toLocaleString()}</span>
                        {originalPrice && originalPrice > product.price && (
                            <span className="product-old-price">KSh {originalPrice.toLocaleString()}</span>
                        )}
                    </div>

                    <button
                        className="add-to-cart-action-btn"
                        aria-label="Add to cart"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
