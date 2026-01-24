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
                                Pujita House, 2nd Floor, Shop 1<br />
                                Moi Avenue
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
