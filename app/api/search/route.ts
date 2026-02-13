import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ products: [], totalCount: 0, totalPages: 0 });
        }

        await dbConnect();

        // optimize search with text index if available, fall back to regex for partial matches on small datasets or specific fields
        let searchQuery: any = { status: 'published' };

        if (query && query.trim().length > 0) {
            // Check if it's a specific field search (e.g. brand:Samsung) - simplified for now to just general search
            // We use $text search for performance on large datasets
            // However, $text search doesn't do partial word matches (e.g. "sam" won't find "samsung")
            // So we can use a hybrid approach or just stick to regex if the dataset is < 100k docs (MongoDB handles regex fine for small sets)
            // But for "5000 users", we want speed.

            // Hybrid: Use $text if query is long enough, else regex? 
            // Or just $text. $text is vastly more efficient.
            // Let's use $text for main search, but maybe regex for very short queries?

            // For now, let's implement the Text Search as primary
            searchQuery = {
                $and: [
                    { $text: { $search: query } },
                    { status: 'published' }
                ]
            };
        }

        // Cache-Control for high concurrency
        // s-maxage=60: Shared cache (content delivery network) 60 seconds
        // stale-while-revalidate=300: Serve stale content while updating in background
        const headers = {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        };

        const [products, totalCount] = await Promise.all([
            Product.find(searchQuery)
                .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
                .skip(skip)
                .limit(limit)
                .select('name slug price compareAtPrice salePrice imageUrl images category')
                .lean(),
            Product.countDocuments(searchQuery)
        ]);

        return NextResponse.json({
            products: JSON.parse(JSON.stringify(products)),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            query
        }, { headers });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
