import ProductCollectionCard from '../ProductCollectionCard/ProductCollectionCard';
import './SectionProducts.css';

/**
 * SectionProducts Component
 * Displays products organized by sections
 */

const SectionProducts = ({
  sections,
  products,
  onProductClick,
  onContactClick,
  searchQuery = '',
  language = 'ar',
  activeFilter = 'gold'
}) => {
  const texts = {
    ar: {
      noProducts: 'لا توجد منتجات في هذا القسم.',
      noSections: 'لا توجد أقسام متاحة حالياً.',
      viewAll: 'عرض الكل'
    },
    en: {
      noProducts: 'No products found in this section.',
      noSections: 'No sections available at the moment.',
      viewAll: 'View All'
    }
  };

  const t = texts[language] || texts.ar;

  // Filter products by search query
  const filterProducts = (productsArray) => {
    if (!searchQuery) return productsArray;

    return productsArray.filter(product => {
      const name = language === 'ar'
        ? (product.name_ar || product.name || '')
        : (product.name_en || product.name || '');

      const description = language === 'ar'
        ? (product.description_ar || product.description || '')
        : (product.description_en || product.description || '');

      const shortDescription = language === 'ar'
        ? (product.shortDescription_ar || product.shortDescription || '')
        : (product.shortDescription_en || product.shortDescription || '');

      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };



  // Group products by section
  const getProductsBySection = (sectionId) => {
    const sectionProducts = products.filter(
      product => product.section === sectionId
    );

    // ✅ ضيف الفلتر بالـ type
    const filterType = activeFilter === null || activeFilter === 'gold' ? 'gold' : activeFilter;
    const typeFiltered = sectionProducts.filter(p => p.type === filterType);

    return filterProducts(typeFiltered);
  };

  const getSectionTitle = (section, originalTitle) => {
    return originalTitle;
  };
  // Get products without section
  const getProductsWithoutSection = () => {
    const noSectionProducts = products.filter(
      product => !product.section
    );
    return filterProducts(noSectionProducts);
  };

  const handleContactClick = (product) => {
    if (onContactClick) {
      onContactClick(product);
    }
  };

  // If no sections, return null
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="section-products-container">
      {/* Render each section */}
      {sections.map((section) => {
        const sectionProducts = getProductsBySection(section.id);

        // Skip section if no products (and there's a search query)
        if (sectionProducts.length === 0) {
          return null;
        }

        return (
          <section key={section.id} className="product-section" id={`section-${section.id}`} style={{ transition: 'opacity 0.4s ease-in-out' }}>
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  {getSectionTitle(section, language === 'ar' ? section.title_ar : section.title_en)}
                  <span style={{ fontSize: '1.2rem', color: '#6c757d', marginLeft: '10px', alignSelf: 'center', fontWeight: 'normal' }}>
                    ({sectionProducts.length})
                  </span>
                </h2>
              </div>

              {sectionProducts.length > 0 ? (
                <div className="product-collection-grid">
                  {sectionProducts.map((product) => (
                    <ProductCollectionCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      onContactClick={handleContactClick}
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-products-message">
                  <p>{t.noProducts}</p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Products without section (if any) */}
      {(() => {
        const noSectionProducts = getProductsWithoutSection();
        if (noSectionProducts.length === 0) return null;

        return (
          <section className="product-section" id="no-section">
            <div className="container">
              <div className="">
                <h2 className="section-title">
                  {language === 'ar' ? 'منتجات أخرى' : 'Other Products'}
                </h2>
              </div>

              <div className="product-collection-grid">
                {noSectionProducts.map((product) => (
                  <ProductCollectionCard
                    key={product.id}
                    product={product}
                    onProductClick={onProductClick}
                    onContactClick={handleContactClick}
                    language={language}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default SectionProducts;