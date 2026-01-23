import Link from 'next/link';
import Image from 'next/image';
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import './Home.css';

const CATEGORIES = [
  { name: 'Smartphones', slug: 'phones', image: '/phones.png' },
  { name: 'Audio', slug: 'audio', image: '/audio.png' },
  { name: 'Wearables', slug: 'wearables', image: '/wearables.png' },
  { name: 'Gaming', slug: 'gaming', image: '/gaming.png' },
  { name: 'Laptops', slug: 'laptops', image: '/laptops.png' },
  { name: 'Accessories', slug: 'accessories', image: '/accessories.png' }
];


async function getFeaturedProducts() {
  await dbConnect();
  const featuredProducts = await Product.find({ isFeatured: true, status: 'published' })
    .limit(8)
    .lean();
  return JSON.parse(JSON.stringify(featuredProducts));
}

async function getSpecialOffers() {
  await dbConnect();
  const specialOffers = await Product.find({
    status: 'published',
    $or: [
      { isOnSpecialOffer: true },
      { compareAtPrice: { $gt: 0 } }
    ]
  })
    .limit(12)
    .sort({ discountPercentage: -1 })
    .lean();
  return JSON.parse(JSON.stringify(specialOffers));
}

async function getAppleProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    brand: { $regex: 'Apple', $options: 'i' }
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getSamsungProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    brand: { $regex: 'Samsung', $options: 'i' }
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getGamingProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    category: 'gaming'
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getFlashSales() {
  await dbConnect();
  const products = await Product.find({
    status: 'published',
    isOnSpecialOffer: true
  })
    .limit(10)
    .sort({ discountPercentage: -1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getPocketFriendlyProducts() {
  await dbConnect();
  const products = await Product.find({
    status: 'published'
  })
    .limit(10)
    .sort({ price: 1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  viewMoreLink: string;
}

const SectionHeader = ({ title, subtitle, viewMoreLink }: SectionHeaderProps) => (
  <div className="flex items-end justify-between" style={{ marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-sm)' }}>
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '4px' }}>{subtitle}</p>
    </div>
    <Link href={viewMoreLink} className="btn-link" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
      View More &rarr;
    </Link>
  </div>
);

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const specialOffers = await getSpecialOffers();
  const appleProducts = await getAppleProducts();
  const samsungProducts = await getSamsungProducts();
  const gamingProducts = await getGamingProducts();
  const flashSales = await getFlashSales();
  const pocketFriendly = await getPocketFriendlyProducts();

  const renderProductSection = (title: string, subtitle: string, link: string, products: any[]) => {
    if (products.length === 0) return null;
    return (
      <section className="section-py" style={{ paddingTop: '0' }}>
        <div className="container">
          <SectionHeader title={title} subtitle={subtitle} viewMoreLink={link} />
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="home-page">
      {/* Shop by Category Section */}
      <section className="section-py" style={{ paddingTop: '0.25rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginBottom: '4px'
            }}>
              PREMIUM <span className="text-accent">ACCESSORIES</span>
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontWeight: 500 }}>
              Shop by Category
            </p>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/accessories/${cat.slug}`} className="category-card-premium">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="category-card-image"
                />
                <div className="category-card-overlay">
                  <span className="category-card-explore">Explore</span>
                  <h3 className="category-card-name">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section (Moved Here) */}
      <section className="section-py" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Featured Products</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '4px' }}>Handpicked essentials for your mobile device.</p>
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <Link href="/accessories" className="btn btn-link" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View All Accessories</Link>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
              {featuredProducts.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-xl" style={{ padding: 'var(--spacing-3xl) 0', color: 'var(--muted-foreground)' }}>
              <p>No featured products found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      {specialOffers.length > 0 && (
        <section className="section-py" style={{ paddingTop: '0', paddingBottom: '2rem' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-md)', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)' }}>
              <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '4px' }}>
                <span className="badge-pulse"></span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Special Offers</h2>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Limited time deals on your favorite tech.</p>
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <Link href="/search?q=deal" className="btn btn-link" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View More Special Offers</Link>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
              {specialOffers.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Apple Ecosystem */}
      {renderProductSection("The Apple Ecosystem", "Designed for iPhone, iPad, and Mac.", "/search?q=Apple", appleProducts)}

      {/* Samsung Galaxy */}
      {renderProductSection("Galaxy of Innovation", "Enhance your Samsung experience.", "/search?q=Samsung", samsungProducts)}

      {/* Gaming */}
      {renderProductSection("Level Up Your Gear", "Pro-grade peripherals for victory.", "/accessories/gaming", gamingProducts)}

      {/* Flash Sales */}
      {renderProductSection("Lightning Deals", "Grab them before they're gone.", "/search?q=deal", flashSales)}

      {/* Pocket Friendly */}
      {renderProductSection("Smart Savings", "Top tech that won't break the bank.", "/search?sort=price_asc", pocketFriendly)}

    </div>
  );
}
