import { Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { generateSEOMetadata } from '@/lib/seo';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return generateSEOMetadata({
        title: 'Special Offers & Deals',
        description: 'Check out our latest deals and special offers on premium electronics and mobile accessories.',
        path: '/special-offers',
    });
}

async function getSpecialOfferProducts() {
    await dbConnect();
    const products = await Product.find({
        status: 'published',
        $or: [
            { isOnSpecialOffer: true },
            { compareAtPrice: { $gt: 0 } },
            { discountPercentage: { $gt: 0 } }
        ]
    })
        .sort({ discountPercentage: -1, createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(products));
}

export default async function SpecialOffersPage() {
    const products = await getSpecialOfferProducts();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phonemallexpress.com';
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Special Offers & Deals",
        "description": "Check out our latest deals and special offers on premium electronics and mobile accessories.",
        "url": `${baseUrl}/special-offers`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": products.map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": product.name,
                    "url": `${baseUrl}/products/${product.category}/${product.slug}`,
                    "description": product.description,
                    "image": product.imageUrl || (product.images && product.images[0]) || "",
                    "sku": product.sku || product._id.toString(),
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "KES",
                        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        "url": `${baseUrl}/products/${product.category}/${product.slug}`,
                        "hasMerchantReturnPolicy": {
                            "@type": "MerchantReturnPolicy",
                            "applicableCountry": "KE",
                            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                            "merchantReturnDays": 14,
                            "returnMethod": "https://schema.org/ReturnByMail",
                            "returnFees": "https://schema.org/FreeReturn"
                        },
                        "shippingDetails": {
                            "@type": "OfferShippingDetails",
                            "shippingRate": {
                                "@type": "MonetaryAmount",
                                "value": "0",
                                "currency": "KES"
                            },
                            "shippingDestination": {
                                "@type": "DefinedRegion",
                                "addressCountry": "KE"
                            },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "handlingTime": {
                                    "@type": "QuantitativeValue",
                                    "minValue": 1,
                                    "maxValue": 2,
                                    "unitCode": "DAY"
                                },
                                "transitTime": {
                                    "@type": "QuantitativeValue",
                                    "minValue": 1,
                                    "maxValue": 3,
                                    "unitCode": "DAY"
                                }
                            }
                        }
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": product.averageRating || 5,
                        "reviewCount": product.reviewCount || 1,
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                }
            }))
        }
    };

    return (
        <main className="container">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Breadcrumbs items={[{ label: 'Special Offers', href: '/special-offers' }]} />

            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-lg)', marginTop: '0.5rem' }}>
                <Tag className="text-accent" size={32} />
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                        Special <span className="text-accent">Offers</span>
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                        Limited time deals and exclusive discounts on top tech.
                    </p>
                </div>
            </div>

            {products.length > 0 ? (
                <div className="product-grid-search">
                    {products.map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center" style={{ padding: 'var(--spacing-3xl) 0', color: 'var(--muted-foreground)' }}>
                    <Tag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>No active offers</h2>
                    <p>We're currently updating our deals. Check back soon for more specialized offers!</p>
                </div>
            )}
        </main>
    );
}
