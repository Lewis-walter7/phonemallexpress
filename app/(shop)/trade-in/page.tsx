import dbConnect from '@/lib/db';
import TradeInDevice from '@/models/TradeInDevice';
import TradeInWizard from './TradeInWizard';
import TradeInFAQ from './TradeInFAQ';
import styles from './trade-in.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trade In Your Old Device - Phone Mall Express',
    description: 'Get the best trade-in value for your iPhone, Samsung, iPad, or Mac. Upgrade to the latest device today.',
    openGraph: {
        title: 'Trade In & Upgrade - Phone Mall Express',
        description: 'Instant credit for your old device. Check your trade-in value now.',
    }
};

export const revalidate = 3600;

export default async function TradeInPage() {
    await dbConnect();

    // Fetch all active trade-in devices
    const devices = await TradeInDevice.find({}).sort({ maxCredit: -1 }).lean();

    // Serialize generic object ensuring ID is string
    const serializedDevices = devices.map((d: any) => ({
        ...d,
        _id: d._id.toString(),
        createdAt: d.createdAt?.toISOString(),
        updatedAt: d.updatedAt?.toISOString()
    }));

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Apple & Samsung Trade-in Program</h1>
                <p className={styles.heroSubtitle}>
                    Turn the device you have into the one you want.
                    We give our customers the option of saving money on their new purchase by trading in their current device.
                </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Estimated Values of Products</h2>
                <div style={{ width: 60, height: 4, background: 'var(--accent)', margin: '0 auto', borderRadius: 2 }}></div>
            </div>

            <TradeInWizard devices={serializedDevices} />

            <TradeInFAQ />

            <div className={styles.infoSection}>
                <h3>Why Trade In with Phone Mall Express?</h3>
                <div className={styles.grid}>
                    <div className={styles.card} style={{ pointerEvents: 'none', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}>�</div>
                        <h4>Instant Upgrade</h4>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Use your trade-in credit immediately towards your new purchase.</p>
                    </div>
                    <div className={styles.card} style={{ pointerEvents: 'none', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}>�</div>
                        <h4>Safe & Secure</h4>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>We ensure all your data is wiped before the device finds a new home.</p>
                    </div>
                    <div className={styles.card} style={{ pointerEvents: 'none', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}>♻️</div>
                        <h4>Eco-Friendly</h4>
                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Extending the life of devices reduces electronic waste.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
