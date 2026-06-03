import { useEffect, useState } from "react";
import useWishlist from "../../context/useWishlist";
import { useCart } from "../../context/CartContext";
import LogoImage from "../../assets/Logos/Saudi-Silver-Logo-removebg-preview.png";
import {
  FaShoppingCart,
  FaHeart,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaHome,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import "./Header.css";

interface Section {
  id: number;
  title_ar: string;
  title_en: string;
  order: number;
  is_featured: boolean;
}

interface Product {
  id: number;
  section: number;
  [key: string]: any;
}

interface LanguageTexts {
  home: string;
  features: string;
  admin: string;
  logout: string;
  location: string;
  language: string;
}

interface Texts {
  ar: LanguageTexts;
  en: LanguageTexts;
}

interface HeaderProps {
  onWishlistClick?: () => void;
  onCartClick?: () => void;
  language?: "ar" | "en";
  onLanguageChange?: (lang: "ar" | "en") => void;
  adminMode?: boolean;
  onLogout?: () => void;
  isAdmin?: boolean;
  // في الـ interface HeaderProps ضيف:
  activeFilter?: "gold" | "silver" | "accessories" | null;
  onFilterChange?: (filter: "gold" | "silver" | "accessories" | null) => void;
}

const Header = ({
  onWishlistClick,
  onCartClick,
  language = "ar",
  onLanguageChange,
  adminMode = false,
  onLogout,
  isAdmin = false,
  activeFilter = null,
  onFilterChange,
}: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasFeaturedWithProducts, setHasFeaturedWithProducts] = useState(false);

  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();

  const SECTION_API_URL = "https://omarawad9.pythonanywhere.com/api/sections/";
  const PRODUCTS_API_URL = "https://omarawad9.pythonanywhere.com/api/products/";

  // في الـ state:
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Close on outside click (زي language):
  // ✅ useEffect مخصص للـ filter
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".filter-selector")) {
        setIsFilterMenuOpen(false);
      }
    };
    if (isFilterMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isFilterMenuOpen]);

  /* ── Fetch sections & products ── */
  useEffect(() => {
    const fetchSectionsAndProducts = async () => {
      try {
        const [sectionsRes, productsRes] = await Promise.all([
          fetch(SECTION_API_URL),
          fetch(PRODUCTS_API_URL),
        ]);
        const sectionsData: Section[] = await sectionsRes.json();
        const productsData: Product[] = await productsRes.json();

        if (Array.isArray(sectionsData)) {
          const sorted = sectionsData.sort((a, b) => a.order - b.order);
          setSections(sorted);

          if (Array.isArray(productsData)) {
            setProducts(productsData);
            const featured = sorted.find((s) => s.is_featured === true);
            setHasFeaturedWithProducts(
              featured
                ? productsData.some((p) => p.section === featured.id)
                : false,
            );
          } else {
            setHasFeaturedWithProducts(false);
          }
        }
      } catch {
        setHasFeaturedWithProducts(false);
      }
    };

    if (!adminMode) fetchSectionsAndProducts();
  }, [adminMode]);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close desktop language menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".language-selector")) {
        setIsLanguageMenuOpen(false);
      }
    };
    if (isLanguageMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isLanguageMenuOpen]);

  /* ── Lock body scroll when drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  /* ── Scroll helpers ── */
  const closeDrawer = () => setIsDrawerOpen(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeDrawer();
  };

  const scrollToFeatures = () => {
    const el = document.getElementById("featured-collection");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    closeDrawer();
  };

  const scrollToSection = (sectionId: number) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    closeDrawer();
  };

  const openLocation = () => {
    window.open("https://maps.app.goo.gl/9QRFR7vEsF17gERB7", "_blank");
    closeDrawer();
  };

  const handleLanguageChange = (lang: "ar" | "en") => {
    onLanguageChange?.(lang);
    setIsLanguageMenuOpen(false);
    closeDrawer();
  };

  /* ── Texts ── */
  const texts: Texts = {
    ar: {
      home: "الرئيسية",
      features: "المميزات",
      admin: "لوحة التحكم",
      logout: "تسجيل الخروج",
      location: "موقعنا",
      language: "اللغة",
    },
    en: {
      home: "Home",
      features: "Features",
      admin: "Admin",
      logout: "Logout",
      location: "Our Location",
      language: "Language",
    },
  };

  const t = texts[language] || texts.ar;
  const isRtl = language === "ar";

  return (
    <>
      <header
        className={`header ${isScrolled ? "header-scrolled" : ""} ${adminMode ? "admin-mode" : ""}`}
      >
        <div className="header-container">
          {/* ── Logo ── */}
          {!adminMode && (
            <div className="header-logo" onClick={scrollToTop}>
              {/* موبايل: صورة — ديسكتوب: نص */}

              <img
                src={LogoImage}
                alt="El-Saudi Jewelry"
                className="header-logo-img"
              />
              <h1 className="header-logo-text">El-Saudi jewelry</h1>
            </div>
          )}

          {/* ── Desktop nav ── */}
          {!adminMode && (
            <nav className="header-nav">
              <button className="nav-link" onClick={scrollToTop}>
                {t.home}
              </button>

              {hasFeaturedWithProducts && (
                <button className="nav-link" onClick={scrollToFeatures}>
                  {t.features}
                </button>
              )}

              {sections
                .filter((s) => {
                  if (s.is_featured) return false;
                  const filterVal =
                    activeFilter === null || activeFilter === "gold"
                      ? "gold"
                      : activeFilter;
                  return products.some(
                    (p) => p.section === s.id && p.type === filterVal,
                  );
                })
                .map((s) => (
                  <button
                    key={s.id}
                    className="nav-link"
                    onClick={() => scrollToSection(s.id)}
                  >
                    {language === "ar" ? s.title_ar : s.title_en}
                  </button>
                ))}
            </nav>
          )}

          {/* ── Right icons ── */}
          <div
            className={`header-icons ${adminMode ? "admin-icons-only" : ""}`}
          >
            {!adminMode && (
              <div className="filter-selector language-selector">
                <button
                  className="language-toggle"
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: "0.5px",
                    minWidth: "52px",
                    padding: "0 8px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterMenuOpen(!isFilterMenuOpen);
                  }}
                  aria-label="Filter by type"
                  title={activeFilter ?? "gold"}
                >
                  {/* أيقونة حسب الفلتر الحالي */}
                  {(activeFilter ?? "gold") === "gold" && (
                    <span
                      style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}
                    >
                      {language === "ar" ? "ذهب" : "Gold"}
                    </span>
                  )}
                  {activeFilter === "silver" && (
                    <span
                      style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}
                    >
                      {language === "ar" ? "فضة" : "Silver"}
                    </span>
                  )}
                  {activeFilter === "accessories" && (
                    <span
                      style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}
                    >
                      {language === "ar" ? "إكسسوارات" : "Accessories"}
                    </span>
                  )}
                </button>

                {isFilterMenuOpen && (
                  <div className="language-menu">
                    <button
                      className={`language-option ${(activeFilter ?? "gold") === "gold" ? "active" : ""}`}
                      onClick={() => {
                        onFilterChange?.(null);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      {language === "ar" ? "ذهب" : "Gold"}
                    </button>
                    <button
                      className={`language-option ${activeFilter === "silver" ? "active" : ""}`}
                      onClick={() => {
                        onFilterChange?.("silver");
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      {language === "ar" ? "فضة" : "Silver"}
                    </button>
                    <button
                      className={`language-option ${activeFilter === "accessories" ? "active" : ""}`}
                      onClick={() => {
                        onFilterChange?.("accessories");
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      {language === "ar" ? "إكسسوارات" : "Accessories"}{" "}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="language-selector">
              <button
                className="language-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLanguageMenuOpen(!isLanguageMenuOpen);
                }}
                aria-label="Change language"
              >
                <FaGlobeAmericas size={24} style={{ color: "#fff" }} />
              </button>

              {isLanguageMenuOpen && (
                <div className="language-menu">
                  <button
                    className={`language-option ${language === "ar" ? "active" : ""}`}
                    onClick={() => handleLanguageChange("ar")}
                  >
                    العربية
                  </button>
                  <button
                    className={`language-option ${language === "en" ? "active" : ""}`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </button>
                </div>
              )}
            </div>
            {adminMode && onLogout && (
              <button
                className="logout-btn"
                onClick={onLogout}
                aria-label="Logout"
              >
                {t.logout}
              </button>
            )}
            {!adminMode && (
              <div
                className="wishlist-badge location-badge"
                onClick={openLocation}
                style={{ marginRight: "2px", cursor: "pointer" }}
              >
                <FaMapMarkerAlt
                  size={25}
                  className="wishlist-icon"
                  style={{ color: "#fff" }}
                />
              </div>
            )}

            {/* Wishlist heart — always visible */}
            {!adminMode && (
              <div
                className="wishlist-badge-heart"
                onClick={() => onWishlistClick?.()}
              >
                <span className="wishlist-icon">
                  <FaHeart
                    color="white"
                    size={22}
                    style={{ marginTop: "12px" }}
                  />
                </span>
                {wishlistCount > 0 && (
                  <span className="wishlist-count">{wishlistCount}</span>
                )}
              </div>
            )}

            {/* Cart — always visible */}
            {!adminMode && (
              <div
                className="wishlist-badge"
                onClick={() => onCartClick?.()}
                style={{ marginRight: "2px" }}
              >
                <FaShoppingCart
                  size={25}
                  className="wishlist-icon"
                  style={{ color: "#fff" }}
                />
                {cartCount > 0 && (
                  <span className="wishlist-count">{cartCount}</span>
                )}
              </div>
            )}
            {!adminMode && (
              <button
                className="mobile-menu-toggle"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                aria-label="Open menu"
                aria-expanded={isDrawerOpen}
              >
                <span className={`hamburger ${isDrawerOpen ? "active" : ""}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            )}
          </div>
        </div>
      </header>
      {!adminMode && (
        <div
          className={`mobile-drawer ${isDrawerOpen ? "open" : ""}`}
          aria-hidden={!isDrawerOpen}
        >
          {/* Overlay — tap to close */}
          <div className="mobile-drawer-overlay" onClick={closeDrawer} />

          {/* Panel */}
          <div className="mobile-drawer-panel" dir={isRtl ? "rtl" : "ltr"}>
            <div className="drawer-header">
              <span className="drawer-brand">El-Saudi</span>
              <button
                className="drawer-close"
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* ── Navigation section ── */}
            <p className="drawer-section-label">
              {language === "ar" ? "التنقل" : "Navigation"}
            </p>

            <div className="drawer-nav">
              <button className="drawer-nav-link" onClick={scrollToTop}>
                <FaHome size={15} style={{ color: "#d4af37", flexShrink: 0 }} />
                {t.home}
              </button>

              {hasFeaturedWithProducts && (
                <button className="drawer-nav-link" onClick={scrollToFeatures}>
                  <FaStar
                    size={14}
                    style={{ color: "#d4af37", flexShrink: 0 }}
                  />
                  {t.features}
                </button>
              )}

              {sections
                .filter((s) => {
                  if (s.is_featured) return false;
                  const filterVal =
                    activeFilter === null || activeFilter === "gold"
                      ? "gold"
                      : activeFilter;
                  return products.some(
                    (p) => p.section === s.id && p.type === filterVal,
                  );
                })
                .map((s) => (
                  <button
                    key={s.id}
                    className="drawer-nav-link"
                    onClick={() => scrollToSection(s.id)}
                  >
                    {/* Bullet dot */}
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d4af37",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    {language === "ar" ? s.title_ar : s.title_en}
                  </button>
                ))}
            </div>

            <div className="drawer-divider" />

            {/* ── Location ── */}
            <p className="drawer-section-label">
              {language === "ar" ? "زيارتنا" : "Visit Us"}
            </p>

            <button className="drawer-location-btn" onClick={openLocation}>
              <FaMapMarkerAlt
                size={16}
                style={{ color: "#d4af37", flexShrink: 0 }}
              />
              {t.location}
            </button>

            <div className="drawer-divider" />

            {/* ── Language ── */}
            <p className="drawer-section-label">
              {language === "ar" ? "اللغة" : "Language"}
            </p>

            <div className="drawer-lang-row">
              <button
                className={`drawer-lang-btn ${language === "ar" ? "active" : ""}`}
                onClick={() => handleLanguageChange("ar")}
              >
                العربية
              </button>
              <button
                className={`drawer-lang-btn ${language === "en" ? "active" : ""}`}
                onClick={() => handleLanguageChange("en")}
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
