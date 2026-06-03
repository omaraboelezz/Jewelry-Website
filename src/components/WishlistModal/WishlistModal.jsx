import { useEffect } from 'react';
import useWishlist from '../../context/useWishlist';
import { FaHeart } from 'react-icons/fa';
import './WishlistModal.css';

/**
 * @param {Boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback function to close the modal
 * @param {Function} onProductClick - Callback function when a product is clicked (for modal)
 * @param {Function} onContactClick - Callback function when "Contact to Buy" is clicked
 * @param {String} language - Current language ('ar' or 'en')
 */
const WishlistModal = ({ isOpen, onClose, onProductClick, onContactClick, language = 'ar' }) => {
  const { wishlist, removeFromWishlist } = useWishlist();

  const texts = {
    ar: {
      myWishlist: 'قائمة أمنياتي',
      item: 'عنصر',
      items: 'عناصر',
      wishlistEmpty: 'قائمة أمنياتك فارغة',
      startAdding: 'ابدأ بإضافة العناصر التي تحبها!',
      contactToBuy: 'تواصل للشراء',
      removeFromWishlist: 'إزالة من المفضلة',
      closeWishlist: 'إغلاق قائمة الأمنيات'
    },
    en: {
      myWishlist: 'My Wishlist',
      item: 'item',
      items: 'items',
      wishlistEmpty: 'Your wishlist is empty',
      startAdding: 'Start adding items you love!',
      contactToBuy: 'Contact to Buy',
      removeFromWishlist: 'Remove from wishlist',
      closeWishlist: 'Close wishlist'
    }
  };

  const t = texts[language] || texts.ar;

  // ✅ دالة للحصول على الاسم حسب اللغة
  const getProductName = (product) => {
    if (!product) return '';
    return language === 'ar'
      ? (product.name_ar || product.name || 'منتج')
      : (product.name_en || product.name || 'Product');
  };

  // دالة للحصول على رابط الصورة الصحيح
  const getImageUrl = (product) => {
    if (product.image_file) {
      return product.image_file;
    }
    if (product.image_url) {
      return product.image_url;
    }
    if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/400x400?text=No+Image';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
      onClose();
    }
  };

  const handleContactClick = (product, e) => {
    e.stopPropagation();
    if (onContactClick) {
      onContactClick(product);
    }
  };

  const handleRemoveClick = (product, e) => {
    e.stopPropagation();
    removeFromWishlist(product.id);
  };

  return (
    <div
      className={`wishlist-modal-backdrop ${isOpen ? 'modal-open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="wishlist-modal-content">
        <button
          className="wishlist-modal-close-button"
          onClick={onClose}
          aria-label={t.closeWishlist}
          style={{ fontSize: '35px' }}
        >
          &times;
        </button>

        <div className="wishlist-modal-header">
          <h2 className="wishlist-modal-title">{t.myWishlist}</h2>
          <p className="wishlist-modal-count">
            {wishlist.length} {wishlist.length === 1 ? t.item : t.items}
          </p>
        </div>

        <div className="wishlist-modal-body">
          {wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon"><FaHeart /></div>
              <h3>{t.wishlistEmpty}</h3>
              <p>{t.startAdding}</p>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="wishlist-item"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="wishlist-item-image-container">
                    <img
                      src={getImageUrl(product)}
                      alt={getProductName(product)}
                      className="wishlist-item-image"
                    />
                    <button
                      className="wishlist-item-remove"
                      onClick={(e) => handleRemoveClick(product, e)}
                      aria-label={t.removeFromWishlist}
                    >
                      ×
                    </button>
                  </div>
                  <div className="wishlist-item-info">
                    {/* ✅ عرض الاسم حسب اللغة */}
                    <h3 className="wishlist-item-name">{getProductName(product)}</h3>
                    <p className="wishlist-item-price">${Math.ceil(product.price || 0).toLocaleString() || 'N/A'}</p>
                    <button
                      className="wishlist-item-contact"
                      onClick={(e) => handleContactClick(product, e)}
                    >
                      {t.contactToBuy}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;