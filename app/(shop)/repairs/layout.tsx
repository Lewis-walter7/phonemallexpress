import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Professional Device Repairs',
    description: 'Expert repair services for smartphones, tablets, and laptops. Screen replacement, battery swaps, and hardware fixes with warranty.',
    alternates: {
        canonical: '/repairs',
    },
};

export default function RepairsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
