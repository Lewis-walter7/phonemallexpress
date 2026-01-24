import Link from 'next/link';
import Image from 'next/image';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-info">
                        <Link href="/" className="logo">
                            <Image src="/logo.png" alt="Phone Mall Express" width={200} height={80} />
                        </Link>
                        <p className="footer-desc">
                            Premium phone accessories delivered with speed and quality. Elevate your mobile experience with our curated collection.
                        </p>
                    </div>
                    <div className="social-links" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <a href="https://www.facebook.com/PhonemallExpress?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                        </a>
                        <a href="https://www.instagram.com/phonemallexpress?igsh=OTB0anRzbzgybGlz&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        </a>
                        <a href="https://www.tiktok.com/@phonemallexpress" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)' }}>
                            {/* Simple TikTok Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music-2"><circle cx="8" cy="18" r="4" /><path d="M12 18V2l7 4" /></svg>
                        </a>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">Shop</h4>
                        <ul>
                            <li><Link href="/products/phones">Smartphones</Link></li>
                            <li><Link href="/repairs">Repairs & Services</Link></li>
                            <li><Link href="/products/tablets">Tablets & iPads</Link></li>
                            <li><Link href="/products/audio">Audio Gear</Link></li>
                            <li><Link href="/products/gaming">Gaming</Link></li>
                            <li><Link href="/products/wearables">Wearables</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">Company</h4>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/bulk-quote">Bulk Purchase (RSQ)</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                            <li><Link href="/shipping">Shipping Policy</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">Location</h4>
                        <ul className="footer-contact">
                            <li>
                                <strong>Nairobi CBD</strong><br />
                                Old Mutual Building, First Floor, Suite 105
                            </li>
                            <li style={{ marginTop: '10px' }}>
                                <strong>Call / WhatsApp:</strong><br />
                                <a href="tel:+254701445445" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>0701 445 445</a>
                            </li>
                        </ul>
                    </div>


                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Phone Mall Express. All rights reserved.</p>
                    <div className="payment-icons">
                        {/* Payment icons would go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
