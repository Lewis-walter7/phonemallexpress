import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSEOMetadata } from '@/lib/seo';
import CategoryFilters from './CategoryFilters';
import Pagination from '@/components/ui/Pagination';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import './CategoryPage.css';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ brand?: string; minPrice?: string; maxPrice?: string; search?: string; page?: string; type?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { category: slug } = await params;
    await connectDB();
    const category = await Category.findOne({ slug });

    if (!category) {
        if (slug === 'all') {
            return generateSEOMetadata({
                title: 'All Products',
                description: 'Browse our entire collection of premium electronics and mobile accessories.',
                path: '/products/all',
            });
        }
        return {};
    }

    return generateSEOMetadata({
        title: category.name,
        description: category.description || `Browse our wide selection of ${category.name} accessories.`,
        path: `/products/${slug}`,
        image: category.image,
    });
}

async function getCategoryProducts(categorySlug: string, search?: string, brand?: string, subcategory?: string, page: number = 1, limit: number = 20) {
    await connectDB();
    let query: any = { status: 'published' };

    // Handle Search
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Handle Brand
    if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
    }

    // Handle Subcategory (Type)
    if (subcategory) {
        query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Handle Category
    if (categorySlug !== 'all') {
        const categoryDoc = await Category.findOne({ slug: categorySlug });
        if (categoryDoc) {
            query.category = categoryDoc._id;
        } else {
            // Support jelectronics string categories (fallback)
            const formattedSlug = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
            query.category = { $in: [categorySlug, formattedSlug] };
        }
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
        Product.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
        Product.countDocuments(query)
    ]);

    return {
        products: JSON.parse(JSON.stringify(products)),
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
}

const CategoryPage = async ({ params, searchParams }: PageProps) => {
    const { category: slug } = await params;
    const { search, brand, page, type } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 20;

    await connectDB();

    // Check if category exists (logic simplified for brevity as we need fallback for 'all')
    let categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    if (slug !== 'all') {
        const category = await Category.findOne({ slug }).lean();
        if (category) {
            categoryName = category.name;
        }
    } else {
        categoryName = 'All Accessories';
    }

    const { products, totalPages, totalCount } = await getCategoryProducts(slug, search, brand, type, currentPage, limit);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phonemallexpress.com';
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": categoryName,
        "description": `Browse our wide selection of ${categoryName} at PhoneMallExpress.`,
        "url": `${baseUrl}/products/${slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": products.map((product: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": product.name,
                    "url": `${baseUrl}/products/${slug}/${product.slug}`,
                    "description": product.description,
                    "image": product.imageUrl || (product.images && product.images[0]) || "",
                    "sku": product.sku || product._id.toString(),
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "KES",
                        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        "url": `${baseUrl}/products/${slug}/${product.slug}`,
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
        <div className="container" style={{ paddingTop: '0.15rem', paddingBottom: 'var(--spacing-lg)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="shop-layout">
                {/* Mobile Filters Toggle would go here */}
                <aside className="shop-sidebar">
                    <CategoryFilters />
                </aside>

                <main className="shop-content">
                    <Breadcrumbs items={[{ label: 'Products', href: '/products/all' }, { label: categoryName, href: `/products/${slug}` }]} />

                    <div style={{ marginTop: '0.25rem', marginBottom: 'var(--spacing-md)' }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
                            {categoryName}
                        </h1>
                    </div>
                    <div className="product-grid">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 ? (
                        <div className="no-products">
                            <p>No products found in this category.</p>
                        </div>
                    ) : (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default CategoryPage;
