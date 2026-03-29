import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return generateSEOMetadata({
        title: 'Professional Device Repairs',
        description: 'Expert repair services for smartphones, tablets, laptops, and more in Nairobi. Screen replacement, battery swaps, and hardware fixes with warranty. Fast turnaround at PhoneMallExpress.',
        path: '/repairs',
    });
}

export default function RepairsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

