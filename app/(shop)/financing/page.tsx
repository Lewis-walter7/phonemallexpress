import { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Financing & Lipa Mdogo Mdogo | PhoneMallExpress™',
    description: 'Learn about our flexible financing options including Lipa Mdogo Mdogo. Get your favorite smartphone today and pay in easy installments.',
};

export default function FinancingPage() {
    return (
        <div className="container">
            <Breadcrumbs items={[{ label: 'Financing', href: '/financing' }]} />

            <div className="info-page-header" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-sm)' }}>
                    Financing Options
                </h1>
                <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--muted-foreground)', maxWidth: '800px', lineHeight: 1.6 }}>
                    Own your dream device today with our flexible payment plans. We offer various financing options to suit your budget, including the popular Lipa Mdogo Mdogo service.
                </p>
            </div>

            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', color: 'var(--muted-foreground)', lineHeight: 1.8, marginBottom: 'var(--spacing-sm)' }}>
                <section style={{ background: 'var(--secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--accent)' }}>
                        Lipa Mdogo Mdogo
                    </h2>
                    <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                        Our most popular financing plan allows you to walk away with a premium smartphone with a small down payment and affordable daily or weekly installments.
                    </p>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                        <li>Instant approval for eligible customers</li>
                        <li>Small initial deposit</li>
                        <li>Flexible daily, weekly, or monthly payments</li>
                        <li>Applicable to selected Samsung and iPhone models</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>
                        How It Works
                    </h2>
                    <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <li>
                            <strong style={{ color: 'var(--foreground)' }}>Select Your Device:</strong> Browse our collection and look for the "Financing Available" badge or visit our physical store.
                        </li>
                        <li>
                            <strong style={{ color: 'var(--foreground)' }}>Credit Check:</strong> Provide your ID and phone number for a quick eligibility assessment.
                        </li>
                        <li>
                            <strong style={{ color: 'var(--foreground)' }}>Make Deposit:</strong> Pay the required down payment amount.
                        </li>
                        <li>
                            <strong style={{ color: 'var(--foreground)' }}>Walk Away with Your Phone:</strong> Take your new device home and start your payment journey.
                        </li>
                    </ol>
                </section>

                <section>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>
                        Basic Requirements
                    </h2>
                    <p>To qualify for our financing plans, you typically need to meet the following criteria:</p>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                        <li>Must be at least 18 years of age</li>
                        <li>Valid National ID / Passport</li>
                        <li>Registered M-Pesa number used for at least 6 months</li>
                        <li>Positive credit history with previous mobile lenders</li>
                    </ul>
                </section>

                <section style={{ borderTop: '1px solid var(--border)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--foreground)' }}>
                        Terms & Conditions
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                        Financing is subject to credit approval. Interest rates and late payment fees may apply. The device remains the property of the lender until the full amount is settled. Remote locking may be applied in case of default. Visit our store for detailed terms for specific lenders.
                    </p>
                </section>

                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--accent-gradient)',
                    //color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>Need More Details?</h3>
                    <p style={{ marginBottom: 'var(--spacing-sm)' }}>Call or WhatsApp us to check your eligibility today!</p>
                    <a href="tel:+254700000000" className="btn" style={{ background: 'white', color: 'var(--accent)', fontWeight: 700 }}>
                        Inquire Now
                    </a>
                </div>
            </div>
        </div>
    );
}
