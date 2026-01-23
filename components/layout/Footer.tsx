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
                            <Image src="/logo.png" alt="Phone Mall Express" width={150} height={40} className="logo-image" style={{ width: 'auto', height: '40px' }} />
                        </Link>
                        <p className="footer-desc">
                            Premium phone accessories delivered with speed and quality. Elevate your mobile experience with our curated collection.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">Shop</h4>
                        <ul>
                            <li><Link href="/accessories/phones">Smartphones</Link></li>
                            <li><Link href="/accessories/tablets">Tablets & iPads</Link></li>
                            <li><Link href="/accessories/audio">Audio Gear</Link></li>
                            <li><Link href="/accessories/gaming">Gaming</Link></li>
                            <li><Link href="/accessories/wearables">Wearables</Link></li>
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

                    <div className="footer-newsletter">
                        <h4 className="footer-title">Stay Updated</h4>
                        <p className="newsletter-text">Get the latest offers and product releases.</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Email address" required className="newsletter-input" />
                            <button type="submit" className="newsletter-btn">Join</button>
                        </form>
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
