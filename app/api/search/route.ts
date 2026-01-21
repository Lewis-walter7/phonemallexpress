import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ products: [] });
        }

        await dbConnect();

        // Use regex search for flexibility (works without text indexes)
        const products = await Product.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                },
                { status: 'published' }
            ]
        })
            .limit(20)
            .select('name slug price compareAtPrice salePrice imageUrl images category')
            .lean();

        return NextResponse.json({
            products: JSON.parse(JSON.stringify(products)),
            query
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
