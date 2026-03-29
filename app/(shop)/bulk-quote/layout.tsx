import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return generateSEOMetadata({
        title: 'Bulk Purchase Requests',
        description: 'Need to equip your office or organization? Get a competitive custom quote for bulk orders of phones, computers, laptops, and accessories in Kenya. Serving corporates, NGOs, universities, and government institutions.',
        path: '/bulk-quote',
    });
}

export default function BulkQuoteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
