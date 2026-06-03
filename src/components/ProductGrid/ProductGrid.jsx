import { useState } from 'react';
import CategoriesBar from '../CategoriesBar/CategoriesBar';
import ProductCollectionCard from '../ProductCollectionCard/ProductCollectionCard';
import './ProductGrid.css';

/**
 * ProductGrid Component
 * Displays products in a responsive grid layout with category filtering and search
 * @param {Array} products - Array of product objects
 * @param {Function} onProductClick - Callback function when a product is clicked (for modal)
 * @param {Function} onContactClick - Callback function when "Contact to Buy" is clicked
 * @param {String} searchQuery - Search query string
 * @param {String} language - Current language ('ar' or 'en')
 */
const ProductGrid = ({ products, onProductClick, onContactClick, searchQuery = '', language = 'ar' }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // النصوص حسب اللغة
  const texts = {
    ar: {
      ourCollection: 'مجموعتنا',
      noProducts: 'لا توجد منتجات في هذه الفئة.'
    },
    en: {
      ourCollection: 'Our Collection',
      noProducts: 'No products found in this category.'
    }
  };

  const t = texts[language] || texts.ar;

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(product => {
    // Category filter
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    // Search filter
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Smooth scroll to collection section when category changes
    const collectionElement = document.getElementById('collection');
    if (collectionElement) {
      const headerHeight = 80;
      const categoriesBarHeight = 60;
      const collectionPosition = collectionElement.offsetTop - headerHeight - categoriesBarHeight;
      window.scrollTo({ top: collectionPosition, behavior: 'smooth' });
    }
  };

  const handleContactClick = (product) => {
    if (onContactClick) {
      onContactClick(product);
    }
  };

  return (
    <section id="collection" className="product-grid-section">
      <CategoriesBar 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
      />
      <div className="container">
        <h2 className="section-title">{t.ourCollection}</h2>
        {filteredProducts.length > 0 ? (
          <div className="product-collection-grid">
            {filteredProducts.map((product) => (
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
};

export default ProductGrid;