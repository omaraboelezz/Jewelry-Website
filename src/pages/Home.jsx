import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import ProductCarousel from '../components/ProductCarousel/ProductCarousel';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import SectionProducts from '../components/SectionProducts/SectionProducts';
import Footer from '../components/Footer/Footer';
import { fetchProducts } from '../utils/api';
import ScrollReveal from '../components/ScrollReveal/ScrollReveal';
import HomeSkeleton from '../components/SkeletonLoading/HomeSkeleton';
import './Home.css';

const ProductModal = lazy(() => import('../components/ProductModal/ProductModal'));
const WishlistModal = lazy(() => import('../components/WishlistModal/WishlistModal'));
const CartModal = lazy(() => import('../components/CartModal/CartModal'));



const Home = ({ language, onLanguageChange, navigate }) => {
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);



  const SECTION_API_URL = 'https://omarawad9.pythonanywhere.com/api/sections/';


  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminUsername');
    if (navigate) {
      navigate('login');
    }
  };

  const isAdmin = () => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  };



  useEffect(() => {
    // Hide the hybrid splash overlay strictly after 800ms
    const timer = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchPromise = Promise.all([
          fetchProducts(),
          fetch(SECTION_API_URL).then(res => res.json())
        ]);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 4000);
        });

        // Use Promise.race to abort waiting if it takes more than 4 seconds
        const [fetchedProducts, sectionsData] = await Promise.race([fetchPromise, timeoutPromise]);

        setProducts(fetchedProducts || []);
        if (Array.isArray(sectionsData)) {
          setSections(sectionsData);
        }
      } catch (err) {
        setError(err.message === "Timeout" ? "Connection timeout. Please try again." : "Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ فتح المنتج من الـ URL تلقائياً لما الـ products تتحمل
  useEffect(() => {
    if (products.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');

    if (productId) {
      const found = products.find(p => String(p.id) === String(productId));
      if (found) {
        setSelectedProduct(found);
        setIsModalOpen(true);
      }
    }
  }, [products]);

  const getFeaturedSection = () => {
    return sections.find(s => s.is_featured === true);
  };

  const getFeaturedProducts = () => {
    return products;
  };

  const hasFeaturedSection = () => {
    return products.length > 0;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const getProductName = (product) => {
    if (!product) return '';
    return language === 'ar'
      ? (product.name_ar || product.name || 'منتج')
      : (product.name_en || product.name || 'Product');
  };

  const handleContactClick = (product) => {
    const phoneNumber = '201067365567';

    const helloText =
      language === 'ar'
        ? 'مرحباً! أنا مهتم بشراء هذا المنتج'
        : "Hello! I'm interested in purchasing";

    const productText =
      language === 'ar'
        ? 'المنتج'
        : 'Product';

    const priceText =
      language === 'ar'
        ? 'السعر'
        : 'Price';

    const moreInfoText =
      language === 'ar'
        ? 'هل يمكنك من فضلك تزويدي بمزيد من المعلومات؟'
        : 'Could you please provide more information?';

    const message = encodeURIComponent(
      `${helloText}\n\n` +
      `${productText}: ${getProductName(product)}\n` +
      `${priceText}: $${product.price ? (Math.ceil(product.price / 5) * 5).toLocaleString() : 'غير متوفر'}\n\n` +
      `${moreInfoText}`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);

    // ✅ امسح الـ ?product من الـ URL لما تقفل الـ modal
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.replaceState({}, '', url.toString());

    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  const handleWishlistClick = () => {
    setIsWishlistOpen(true);
  };

  const handleCloseWishlist = () => {
    setIsWishlistOpen(false);
  };

  const featuredProducts = getFeaturedProducts();

  return (
    <div className="home">
      <Header
        language={language}
        onLanguageChange={onLanguageChange}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onWishlistClick={handleWishlistClick}
        onCartClick={() => setIsCartOpen(true)}
        navigate={navigate}
        onLogout={handleLogout}
        isAdmin={isAdmin()}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ScrollReveal>
        <Hero language={language} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </ScrollReveal>

      {showSplash && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(5px)', transition: 'opacity 0.3s ease-out' }}>
          <div className="loader-ring"></div>
          <div className="loader-logo">El-Saudi Jewelry</div>
        </div>
      )}

      {loading ? (
        <HomeSkeleton />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '1.2rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#d4af37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {/* ✅ Main Featured Carousel - عرض المنتجات المميزة في carousel كبير */}
          {hasFeaturedSection() && (
            <ScrollReveal delay={100}>
              <ProductCarousel
                language={language}
                onLanguageChange={onLanguageChange}
                products={featuredProducts.filter(p =>
                  activeFilter === null ? p.type === 'gold' : p.type === activeFilter
                )}

                onProductClick={handleProductClick}
                sectionTitle={getFeaturedSection()}
              />
            </ScrollReveal>
          )}

          {/* ✅ عرض كل الـ Sections (بدون Featured عشان اتعرض فوق) */}
          {sections.length > 0 ? (
            <ScrollReveal delay={200}>
              <SectionProducts
                sections={sections.filter(s => s.is_featured !== true)}
                products={products}
                onProductClick={handleProductClick}
                onContactClick={handleContactClick}
                activeFilter={activeFilter ?? 'gold'}
                searchQuery={searchQuery}
                language={language}
              />
            </ScrollReveal>
          ) : (
            // ✅ لو مفيش sections، اعرض الـ Grid العادي
            <ScrollReveal delay={200}>
              <ProductGrid
                language={language}
                onLanguageChange={onLanguageChange}
                products={products}
                onProductClick={handleProductClick}
                onContactClick={handleContactClick}
                searchQuery={searchQuery}
              />
            </ScrollReveal>
          )}
        </>
      )}

      {/* <Features /> */}
      <Footer language={language} onLanguageChange={onLanguageChange} />

      <Suspense fallback={null}>
        {isModalOpen && (
          <ProductModal
            language={language}
            onLanguageChange={onLanguageChange}
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {isWishlistOpen && (
          <WishlistModal
            language={language}
            onLanguageChange={onLanguageChange}
            isOpen={isWishlistOpen}
            onClose={handleCloseWishlist}
            onProductClick={handleProductClick}
            onContactClick={handleContactClick}
          />
        )}

        {isCartOpen && (
          <CartModal
            language={language}
            onLanguageChange={onLanguageChange}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onProductClick={handleProductClick}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Home;