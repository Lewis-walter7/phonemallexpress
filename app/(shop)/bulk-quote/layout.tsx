import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Bulk Purchase Requests',
    description: 'Request a custom quote for bulk orders of electronics and accessories for your organization or office.',
    alternates: {
        canonical: '/bulk-quote',
    },
};

export default function BulkQuoteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
