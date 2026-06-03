import { useEffect, useRef, } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductCarousel.css';

/**
 * ProductCarousel Component
 * Horizontal scrollable carousel with auto-slide and manual navigation
 * @param {Array} products - Array of product objects
 * @param {Function} onProductClick - Callback function when a product is clicked
 * @param {String} language - Current language ('ar' or 'en')
 * @param {Object} sectionTitle - Section object with title_ar and title_en
 */
const ProductCarousel = ({ products, onProductClick, language = 'ar', sectionTitle }) => {
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  // ✅ Refs بدل State عشان الـ interval ميتـ reset ش
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const userScrollTimerRef = useRef(null);

  // State للـ drag بس (محتاجينه للـ mousemove logic)
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // النصوص حسب اللغة
  const texts = {
    ar: {
      featuredCollection: 'المجموعة المميزة',
      scrollLeft: 'التمرير لليسار',
      scrollRight: 'التمرير لليمين'
    },
    en: {
      featuredCollection: 'Featured Collection',
      scrollLeft: 'Scroll left',
      scrollRight: 'Scroll right'
    }
  };

  const t = texts[language] || texts.ar;

  // ✅ Get dynamic title from section or use default
  const getTitle = () => {
    if (sectionTitle) {
      return language === 'ar' ? sectionTitle.title_ar : sectionTitle.title_en;
    }
    return t.featuredCollection;
  };

  // ✅ Helper: reset user scrolling flag with debounce
  const resetUserScrolling = () => {
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
    userScrollTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 1000);
  };

  // ✅ Auto-slide - يشتغل مرة واحدة بس، يقرأ من الـ refs
 useEffect(() => {
  autoSlideRef.current = setInterval(() => {
    if (
      carouselRef.current &&
      !isHoveredRef.current &&
      !isDraggingRef.current &&
      !isUserScrollingRef.current
    ) {
      const carousel = carouselRef.current;
      const cardWidth = carousel.querySelector('.carousel-card-wrapper')?.offsetWidth || 300;
      const gap = 32;
      const scrollAmount = cardWidth + gap;

      const isRTL = language === 'ar';

      if (isRTL) {    
        if (carousel.scrollLeft >= -10) {
          carousel.scrollTo({ left: -(carousel.scrollWidth - carousel.offsetWidth), behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 10) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  }, 3000);

  return () => {
    clearInterval(autoSlideRef.current);
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
  };
}, [language]); 

  const scrollLeftHandler = () => {
    if (carouselRef.current) {
      isUserScrollingRef.current = true;
      const cardWidth = carouselRef.current.querySelector('.carousel-card-wrapper')?.offsetWidth || 300;
      const gap = 32;
      const scrollAmount = cardWidth + gap;

      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      resetUserScrolling();
    }
  };

  const scrollRightHandler = () => {
    if (carouselRef.current) {
      isUserScrollingRef.current = true;
      const cardWidth = carouselRef.current.querySelector('.carousel-card-wrapper')?.offsetWidth || 300;
      const gap = 32;
      const scrollAmount = cardWidth + gap;

      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      resetUserScrolling();
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    isHoveredRef.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
    resetUserScrolling();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    e.preventDefault();
    isUserScrollingRef.current = true;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    isUserScrollingRef.current = true;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    resetUserScrolling();
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  return (
    <section id="featured-collection" className="product-carousel-section">
      <div className="carousel-container">
        <h2 className="carousel-title">{getTitle()}</h2>
        <div className="carousel-wrapper">
          <button
            className="carousel-button carousel-button-left"
            onClick={scrollLeftHandler}
            aria-label={t.scrollLeft}
          >
            ‹
          </button>
          <div
            ref={carouselRef}
            className="product-carousel"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {products.map((product) => (
              <div key={product.id} className="carousel-card-wrapper">
                <ProductCard
                  product={product}
                  onCardClick={onProductClick}
                  language={language}
                />
              </div>
            ))}
          </div>
          <button
            className="carousel-button carousel-button-right"
            onClick={scrollRightHandler}
            aria-label={t.scrollRight}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;