const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400?text=No+Image';

export const getImageUrl = (product) => {
  if (!product) return PLACEHOLDER_IMAGE;
  return product.image_file || product.image_url || product.image || PLACEHOLDER_IMAGE;
};


export const getProductName = (product, language = 'ar') => {
  if (!product) return '';
  return language === 'ar'
    ? (product.name_ar || product.arabic_name || product.name || 'منتج')
    : (product.name_en || product.english_name || product.name || 'Product');
};

const BADGE_TRANSLATIONS = {
  ar: { 'New Arrival': 'وصل حديثاً', 'Best Seller': 'الأكثر مبيعاً', 'Limited Edition': 'إصدار محدود' },
  en: { 'New Arrival': 'New Arrival', 'Best Seller': 'Best Seller', 'Limited Edition': 'Limited Edition' }
};

const STOCK_TRANSLATIONS = {
  ar: { 'In Stock': 'متوفر', 'Limited Stock': 'مخزون محدود', 'Out of Stock': 'غير متوفر' },
  en: { 'In Stock': 'In Stock', 'Limited Stock': 'Limited Stock', 'Out of Stock': 'Out of Stock' }
};

export const translateBadge = (badge, language = 'ar') => {
  return BADGE_TRANSLATIONS[language]?.[badge] || badge;
};


export const translateStock = (stock, language = 'ar') => {
  return STOCK_TRANSLATIONS[language]?.[stock] || stock;
};
