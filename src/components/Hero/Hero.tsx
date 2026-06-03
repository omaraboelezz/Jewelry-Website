import { useEffect, useRef, useState } from 'react';
import './Hero.css';
import ringIcon from '../../assets/Logos/magic-ring.png';

type FilterType = 'gold' | 'silver' | 'accessories';

interface LanguageTexts {
  tagline: string;
  gold: string;
  silver: string;
  accessories: string;
}

interface Texts {
  ar: LanguageTexts;
  en: LanguageTexts;
}

interface HeroProps {
  language?: 'ar' | 'en';
  activeFilter?: FilterType | null;
  onFilterChange?: (filter: FilterType) => void;
}

const Hero = ({ language = 'ar', activeFilter, onFilterChange }: HeroProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const userScrolledRef = useRef(false);
  const [showFilters, setShowFilters] = useState(false);

  const texts: Texts = {
    ar: {
      tagline: 'أناقة خالدة في كل قطعة',
      gold: 'ذهب',
      silver: 'فضة',
      accessories: 'إكسسوارات'
    },
    en: {
      tagline: 'Timeless Elegance in Every Piece',
      gold: 'Gold',
      silver: 'Silver',
      accessories: 'Accessories'
    }
  };

  const t: LanguageTexts = texts[language] || texts.en;

  const filters: FilterType[] = ['gold', 'silver', 'accessories'];

  const handleFilterClick = (filter: FilterType) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    // Scroll to products section
    setTimeout(() => {
      const el = document.getElementById('featured-collection') || document.querySelector('.section-products-container') || document.querySelector('.product-section');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    const updateScrollEffects = (currentScrollY: number) => {
      const isMobile = window.innerWidth < 768;
      const parallaxMultiplier = isMobile ? 0.15 : 0.3;
      const contentOffsetMultiplier = isMobile ? 0.1 : 0.2;

      if (backgroundRef.current) {
        const parallaxOffset = currentScrollY * parallaxMultiplier;
        backgroundRef.current.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
      }

      if (contentRef.current && heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const contentOpacity = Math.max(0, 1 - (currentScrollY / heroHeight) * 2.5);
        const contentOffset = currentScrollY * contentOffsetMultiplier;
        contentRef.current.style.setProperty('--content-opacity', contentOpacity.toString());
        contentRef.current.style.setProperty('--content-offset', `${contentOffset}px`);
      }
    };

    if (contentRef.current) {
      contentRef.current.style.setProperty('--content-opacity', '1');
      contentRef.current.style.setProperty('--content-offset', '0px');
    }
    if (backgroundRef.current) {
      backgroundRef.current.style.setProperty('--parallax-offset', '0px');
    }

    const initialScrollY = window.scrollY;
    updateScrollEffects(initialScrollY);

    if (initialScrollY > 50) {
      userScrolledRef.current = true;
    }

    const startAutoScroll = () => {
      autoScrollRef.current = window.setTimeout(() => {
        if (!userScrolledRef.current && heroRef.current && window.scrollY < 50) {
          const heroHeight = heroRef.current.offsetHeight;
          window.scrollTo({
            top: heroHeight - 50,
            behavior: 'smooth'
          });
        }
      }, 3000);
    };

    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        updateScrollEffects(currentScrollY);

        if (currentScrollY > 10) {
          userScrolledRef.current = true;
          if (autoScrollRef.current) {
            clearTimeout(autoScrollRef.current);
          }
        }
      });
    };

    if (initialScrollY < 50) {
      startAutoScroll();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentFilter = activeFilter || 'gold';

  return (
    <section ref={heroRef} className="hero">
      <div
        ref={backgroundRef}
        className="hero-background"
      ></div>
      <div className="hero-overlay"></div>
      <div ref={contentRef} className="hero-content">
        <div className="hero-content-inner">
          <h1 className="hero-title">El-Saudi jewelry</h1>
          <p className="hero-tagline">{t.tagline}</p>

          {/* CTA Button that toggles filter options */}
          <div className="hero-cta-wrapper">
            <button
              className={`hero-cta-btn ${showFilters ? 'hero-cta-btn--expanded' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="hero-cta-text">
                {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
              </span>
              <span className={`hero-cta-arrow ${showFilters ? 'hero-cta-arrow--up' : ''}`}>▾</span>
            </button>

            {/* Filter options dropdown */}
            <div className={`hero-filter-options ${showFilters ? 'hero-filter-options--visible' : ''}`}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`hero-filter-btn ${currentFilter === filter ? 'hero-filter-btn--active' : ''} hero-filter-btn--${filter}`}
                  onClick={() => handleFilterClick(filter)}
                >
                  <img src={ringIcon} alt="" className={`hero-filter-icon-img hero-filter-icon-img--${filter}`} />
                  <span className="hero-filter-label">{t[filter]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;