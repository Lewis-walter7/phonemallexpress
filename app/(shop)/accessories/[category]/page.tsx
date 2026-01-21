import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductCard from '@/components/product/ProductCard';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSEOMetadata } from '@/lib/seo';
import './CategoryPage.css';

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ brand?: string; minPrice?: string; maxPrice?: string; search?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { category: slug } = await params;
    await connectDB();
    const category = await Category.findOne({ slug });

    if (!category) return {};

    return generateSEOMetadata({
        title: category.name,
        description: category.description || `Browse our wide selection of ${category.name} accessories.`,
        path: `/accessories/${slug}`,
        image: category.image,
    });
}

async function getCategoryProducts(categorySlug: string, search?: string) {
    await connectDB();
    let query: any = { status: 'published' };

    // Handle Search
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
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

    const products = await Product.find(query).lean();
    return JSON.parse(JSON.stringify(products));
}

const CategoryPage = async ({ params, searchParams }: PageProps) => {
    const { category: slug } = await params;
    const { search } = await searchParams;

    await connectDB();
    let categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    let categoryDesc = `Browse our wide selection of ${slug} accessories.`;

    const category = await Category.findOne({ slug }).lean();
    if (category) {
        categoryName = category.name;
        categoryDesc = (category as any).description || categoryDesc;
    }

    const products = await getCategoryProducts(slug, search);

    return (
        <div className="container section-py">
            <Breadcrumbs items={[{ label: categoryName, href: `/accessories/${slug}` }]} />

            <div className="category-header">
                <h1 className="category-title">{categoryName}</h1>
                <p className="category-desc">{categoryDesc}</p>
            </div>

            <div className="shop-layout">
                {/* Mobile Filters Toggle would go here */}
                <aside className="shop-sidebar">
                    <div className="filter-group">
                        <h3 className="filter-title">Price Range</h3>
                        {/* Filter UI */}
                    </div>
                    <div className="filter-group">
                        <h3 className="filter-title">Brands</h3>
                        {/* Brands UI */}
                    </div>
                </aside>

                <main className="shop-content">
                    <div className="shop-controls">
                        <p className="product-count">{products.length} Products</p>
                        {/* Sort Dropdown */}
                    </div>

                    <div className="product-grid">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                        {products.length === 0 && (
                            <div className="no-products">
                                <p>No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CategoryPage;
