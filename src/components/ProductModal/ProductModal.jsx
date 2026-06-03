import { useEffect, useState } from 'react';
import useWishlist from '../../context/useWishlist';
import { FaWhatsapp, FaStar, FaRegStar, FaHeart, FaLink, FaShoppingCart, FaMinus, FaPlus, FaShareAlt, FaInstagram } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { FaRegHeart } from 'react-icons/fa';
import useBadges from '../../utils/useBadges';
import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose, language = 'ar' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { getBadgeColor, getLocalizedBadgeName } = useBadges();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);


  const texts = {
    ar: {
      closeModal: 'إغلاق',
      clickToZoom: 'اضغط للتكبير',
      reviews: 'تقييم',
      addToWishlist: 'أضف للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      addToCart: 'أضف للسلة',
      share: 'مشاركة',
      shareProduct: 'مشاركة المنتج',
      copied: 'تم النسخ!',
      newArrival: 'وصل حديثاً',
      bestSeller: 'الأكثر مبيعاً',
      limitedEdition: 'إصدار محدود',
      inStock: 'متوفر',
      limitedStock: 'مخزون محدود',
      outOfStock: 'غير متوفر',
      whatsapp: 'واتساب',
      copyLink: 'نسخ الرابط',
      copySuccess: '✅ تم النسخ!',
      copyFailed: '❌ فشل النسخ. الرجاء النسخ يدوياً',
      instagram: 'انستغرام'
    },
    en: {
      closeModal: 'Close modal',
      clickToZoom: 'Click to zoom',
      reviews: 'reviews',
      addToWishlist: 'Add to wishlist',
      removeFromWishlist: 'Remove from wishlist',
      addToCart: 'Add to Cart',
      share: 'Share',
      shareProduct: 'Share product',
      copied: 'Copied!',
      newArrival: 'New Arrival',
      bestSeller: 'Best Seller',
      limitedEdition: 'Limited Edition',
      inStock: 'In Stock',
      limitedStock: 'Limited Stock',
      outOfStock: 'Out of Stock',
      whatsapp: 'WhatsApp',
      copyLink: 'Copy link',
      copySuccess: '✅ Copied!',
      copyFailed: '❌ Failed to copy. Please copy manually',
      instagram: 'Instagram'
    }
  };

  const t = texts[language] || texts.ar;

  const isWishlisted = isInWishlist(product?.id);
  const customBadgeColor = getBadgeColor(product?.badge);

  const getProductName = () => {
    if (!product) return '';
    return language === 'ar'
      ? (product.name_ar || product.name || 'منتج')
      : (product.name_en || product.name || 'Product');
  };

  const getProductDescription = () => {
    if (!product) return '';
    return language === 'ar'
      ? (product.description_ar || product.description || '')
      : (product.description_en || product.description || '');
  };

  const getImageUrl = () => {
    if (!product) return '';
    if (product.image_file) {
      return product.image_file;
    }
    if (product.image_url) {
      return product.image_url;
    }
    if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/800x800?text=No+Image';
  };

  const getBadgeClass = (badge) => {
    if (customBadgeColor) return 'badge-custom';
    if (badge === 'New Arrival') return 'badge-new';
    if (badge === 'Best Seller') return 'badge-bestseller';
    if (badge === 'Limited Edition') return 'badge-limited';
    return 'badge-default';
  };

  const translateBadge = (badge) => {
    if (badge === 'New Arrival') return t.newArrival;
    if (badge === 'Best Seller') return t.bestSeller;
    if (badge === 'Limited Edition') return t.limitedEdition;
    return getLocalizedBadgeName(badge, language);
  };

  const translateStock = (stock) => {
    if (stock === 'In Stock') return t.inStock;
    if (stock === 'Limited Stock') return t.limitedStock;
    if (stock === 'Out of Stock') return t.outOfStock;
    return stock;
  };

  const handleClose = () => {
    setQuantity(1);
    setIsZoomed(false);
    setCopySuccess(false);
    setIsShareOpen(false);
    onClose();
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  useEffect(() => {
    if (!product) return;
    setHoveredRating(0);
    setUserRating(5);
    setHasRated(false);
    const saved = localStorage.getItem(`rating_${product.id}`);
    if (saved) {
      setUserRating(Number(saved));
      setHasRated(true);

      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    } else {
      setUserRating(5);
      setHasRated(false);
    }
  }, [product?.id]);

  const handleRating = (value) => {
    if (hasRated) return; // ✅ مقدرش تغير تقييمك
    setUserRating(value);
    setHasRated(true);
    localStorage.setItem(`rating_${product.id}`, value);

    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleShare = async (platform) => {
    const productUrl = `${window.location.origin}?product=${product.id}`;
    const productName = getProductName();
    const productDesc = getProductDescription();

    switch (platform) {

      case 'whatsapp': {
        const safeDesc = productDesc
          ? [...productDesc].slice(0, 80).join('') + '...\n\n'
          : '';

        const whatsappText =
          `✨ *El-Saudi jewelry* ✨\n` +
          `──────────\n\n` +
          `💎 *${productName}*\n\n` +
          safeDesc +
          `💰 Price: *$${product.price ? (Math.ceil(product.price / 5) * 5).toLocaleString() : 0}*\n\n` +
          `🔥 *Limited Stock - Order Now!*\n\n` +
          `🌐 View Product :\n${productUrl}\n\n` +
          `✅ Premium Quality Guaranteed\n` +
          `✅ Worldwide Shipping Available\n` +
          `✅ Free Shipping Over $200\n\n` +
          `📱 *Reply to order or ask questions!*`;

        const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
        window.open(shareUrl, '_blank');
        break;
      }

      case 'instagram': {
        const instaText =
          `✨ El-Saudi jewelry ✨\n` +
          `──────────\n\n` +
          `💎 ${productName}\n\n` +
          `💰 Price: $${product.price ? (Math.ceil(product.price / 5) * 5).toLocaleString() : 0}\n\n` +
          `🌐 View Product:\n${productUrl}\n\n` +
          `✅ Premium Quality Guaranteed\n` +
          `✅ Worldwide Shipping Available`;

        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(instaText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          } catch {
            fallbackCopyToClipboard(instaText);
          }
        } else {
          fallbackCopyToClipboard(instaText);
        }

        // أقرب صفحة لـ share مباشرة في Instagram
        window.open('https://www.instagram.com/direct/new/', '_blank');
        break;
      }

      case 'copy': {
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(productUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          } catch {
            fallbackCopyToClipboard(productUrl);
          }
        } else {
          fallbackCopyToClipboard(productUrl);
        }
        break;
      }

      default:
        return;
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert(`${t.copyFailed}:\n\n${text}`);
    }

    document.body.removeChild(textArea);
  };


  if (!isOpen || !product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleModalContentClick = (e) => {
    // Close share options when clicking outside the share area
    if (!e.target.closest('.modal-share')) {
      setIsShareOpen(false);
    }
    e.stopPropagation();
  };

  const handleImageMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
      setIsZoomed(true);
    } else setIsZoomed(false);
  };

  const formatPrice = (price) => {
    if (!price) return language === 'ar' ? 'غير متاح' : 'N/A';
    const formatted = (Math.ceil(price / 5) * 5).toLocaleString();
    return language === 'ar'
      ? `${formatted} ج.م`
      : `EGP ${formatted}`; // add `EGP` prefix for English
  };


  return (
    <div className={`modal-backdrop ${isOpen ? 'modal-open' : ''}`} onClick={handleBackdropClick}>
      <div className="modal-content" onClick={handleModalContentClick}>

        <button className="modal-close-button" onClick={handleClose} aria-label={t.closeModal} style={{ fontSize: '35px' }}>
          &times;
        </button>

        <div className="modal-body">
          {/* Image Section */}
          <div
            className={`modal-image-container ${isZoomed ? 'zoomed' : ''}`}
            onMouseMove={handleImageMouseMove}
            onClick={handleImageClick}
          >
            <img
              src={getImageUrl()}
              alt={getProductName()}
              className="modal-image"
              style={
                isZoomed
                  ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)',
                    cursor: 'zoom-out'
                  }
                  : { cursor: 'zoom-in' }
              }
            />
            {!isZoomed && <div className="zoom-hint">{t.clickToZoom}</div>}
          </div>

          {/* Info Section */}
          <div className="modal-info">
            <div className="modal-header">
              <h2 className="modal-title">{getProductName()}</h2>
            </div>
            {(product.badge || product.stock) && (
              <div className="badge-stock-row">
                {product.badge && (
                  <div
                    className={`modal-badge ${getBadgeClass(product.badge)}`}
                    style={customBadgeColor ? { backgroundColor: customBadgeColor, color: '#fff', border: 'none' } : {}}
                  >
                    {translateBadge(product.badge)}
                  </div>
                )}

                {product.stock && (
                  <div className={`modal-stock ${product.stock === 'Limited Stock' ? 'stock-limited' :
                    product.stock === 'Out of Stock' ? 'stock-out' :
                      'stock-in'
                    }`}>
                    {translateStock(product.stock)}
                  </div>
                )}
              </div>
            )}


            <p className="modal-description">{getProductDescription()}</p>

            {/* النجوم والقلب */}
            <div className="modal-rating">
              <div className="stars">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  const displayRating = hoveredRating || userRating;

                  return (
                    <span
                      key={index}
                      onClick={() => handleRating(starValue)}
                      onMouseEnter={() => !hasRated && setHoveredRating(starValue)}
                      onMouseLeave={() => !hasRated && setHoveredRating(0)}
                      style={{ cursor: hasRated ? 'default' : 'pointer' }}
                    >
                      {displayRating >= starValue ? (
                        <FaStar style={{ color: '#FFD700' }} /> // ✅ دايماً دهبي
                      ) : (
                        <FaRegStar style={{ color: '#FFD700' }} />
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="rating-count">
                {showThankYou && hasRated
                  ? (language === 'ar' ? `شكراً! قيّمت بـ ${userRating}/5` : `Thanks! You rated ${userRating}/5`)
                  : hasRated
                    ? (language === 'ar' ? ` تقييمك ${userRating}/5` : ` Your rating ${userRating}/5`)
                    : (language === 'ar' ? ' قيّم هذا المنتج' : ' Rate this product')
                }
              </span>

              <button
                className={`modal-wishlist-button ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart style={{ color: '#333' }} />}
              </button>
            </div>

            {/* السعر والـ Quantity في نفس الصف */}
            <div className="price-quantity-row">

              <div className="quantity-selector">
                <button onClick={handleDecrement} disabled={quantity <= 1} type="button">
                  <FaMinus size={10} />
                </button>
                <span>{quantity}</span>
                <button onClick={handleIncrement} type="button">
                  <FaPlus size={10} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <p className="modal-price" style={{ margin: 0 }}>{formatPrice(Math.ceil(product.price))}</p>
                {product.show_weight !== false && product.weight && parseFloat(product.weight) > 0 && (
                  <p className="modal-weight" style={{ fontSize: '1rem', color: '#666', margin: '4px 0 0 0', fontWeight: '500' }}>
                    {language === 'ar' ? `الوزن: ${product.weight} جرام` : `Weight: ${product.weight}g`}
                  </p>
                )}
              </div>


            </div>

            {/* Add to Cart + Share */}
            <div className="modal-actions" >
              <div className="modal-actions-row">
                <button className="add-to-cart-btn" style={{ minWidth: "40%", maxWidth: "10vw" }} onClick={handleAddToCart}>
                  <FaShoppingCart size={18} />
                  <span>{t.addToCart}</span>
                </button>

                <div className="modal-share">
                  {/* Share button — always rendered to hold its space */}
                  <button
                    className="share-main-btn"
                    style={{
                      visibility: isShareOpen ? 'hidden' : 'visible',
                      pointerEvents: isShareOpen ? 'none' : 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsShareOpen(true);
                    }}
                    aria-label={t.shareProduct}
                  >
                    <FaShareAlt size={18} />
                  </button>

                  {/* Share options — uses .share-options CSS (position: absolute, bottom: 60px, left: 0) */}
                  {isShareOpen && (
                    <div
                      className="share-options"
                      onClick={(e) => e.stopPropagation()}
                    >

                      <button onClick={() => handleShare('whatsapp')} title={t.whatsapp}>
                        <FaWhatsapp size={18} />
                      </button>

                      <button onClick={() => handleShare('instagram')} title={t.instagram}>
                        <FaInstagram size={18} />
                      </button>

                      <button
                        onClick={() => handleShare('copy')}
                        title={t.copyLink}
                        style={{ position: 'relative' }}
                      >
                        <FaLink size={18} />
                        {copySuccess && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '-30px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#000000',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              animation: 'fadeInOut 2s ease-in-out',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {t.copied}
                          </span>
                        )}
                      </button>


                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;