import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phonemallexpress.com';

    await connectDB();

    // Fetch all categories and products
    const categories = await Category.find({}, { slug: 1, updatedAt: 1 }).lean();
    const products = await Product.find({}, { slug: 1, category: 1, updatedAt: 1 }).populate('category', 'slug').lean();

    const categoryUrls = categories.map((cat) => ({
        url: `${baseUrl}/accessories/${cat.slug}`,
        lastModified: (cat as any).updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const productUrls = products.map((prod) => ({
        url: `${baseUrl}/accessories/${(prod.category as any).slug}/${prod.slug}`,
        lastModified: (prod as any).updatedAt,
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...categoryUrls,
        ...productUrls,
    ];
}
