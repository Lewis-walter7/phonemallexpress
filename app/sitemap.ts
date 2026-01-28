import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const BASE_URL = 'https://phonemallexpress.com';

    await connectDB();

    // Fetch all categories and products
    // Fetch all categories
    const categories = await Category.find({}, { name: 1, slug: 1, updatedAt: 1 }).lean();

    // Create a map of category Name -> Slug for quick lookup
    // The Product model stores category as a String name (e.g. "Phones"), not an ID.
    const categorySlugMap = new Map();
    categories.forEach((cat: any) => {
        if (cat.name) {
            categorySlugMap.set(cat.name.toLowerCase(), cat.slug);
            categorySlugMap.set(cat.name, cat.slug); // Handle exact match too
        }
    });

    const products = await Product.find({ status: 'published' }, { slug: 1, category: 1, updatedAt: 1, name: 1, _id: 1 }).lean();

    const categoryUrls = categories.map((cat) => ({
        url: `${BASE_URL}/products/${cat.slug}`,
        lastModified: (cat as any).updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const productUrls = products.map((prod) => {
        // Fallback for missing slugs (generate one on the fly if needed, though mostly relying on DB)
        let prodSlug = prod.slug;
        if (!prodSlug && prod.name) {
            prodSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + prod._id;
        }

        // Fallback for missing category
        let catSlug = 'undefined';
        if (prod.category) {
            // Try lookup
            const foundSlug = categorySlugMap.get(prod.category.toLowerCase()) || categorySlugMap.get(prod.category);
            if (foundSlug) {
                catSlug = foundSlug;
            } else {
                // If category not found in map, just slugify the category string
                catSlug = prod.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }
        }

        if (!prodSlug) return null; // Skip if absolutely no slug possible

        return {
            url: `${BASE_URL}/products/${catSlug}/${prodSlug}`,
            lastModified: (prod as any).updatedAt,
            changeFrequency: 'daily' as const,
            priority: 1.0,
        };
    }).filter(url => url !== null);

    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/shipping',
        '/faq',
        '/privacy',
        '/bulk-quote',
        '/repairs',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    return [
        ...staticRoutes,
        ...categoryUrls,
        ...productUrls,
    ];
}
