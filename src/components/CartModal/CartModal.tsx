import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import {
  FaWhatsapp,
  FaTrash,
  FaExclamationTriangle,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import "../CartModal/CartModal.css";
import translations from "../CartModal/translate.json";

export interface Product {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  image_file?: string;
  image_url?: string;
  quantity?: number;
  description?: string;
  isDeleted?: boolean;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
  language?: string;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onProductClick,
  language = "ar",
}) => {
  const {
    cartItems,
    removeFromCart,
    addToCart,
    removeEntireItem,
    cleanupDeletedProducts,
  } = useCart();
  const [validatedItems, setValidatedItems] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (cartItems.length > 0) {
        validateCartItems();
      } else {
        setValidatedItems([]);
      }
    }
  }, [isOpen, cartItems]);

  const validateCartItems = async () => {
    try {
      const response = await fetch(
        "https://omarawad9.pythonanywhere.com/api/products/",
      );
      const existingProducts = await response.json();
      const existingMap = new Map(existingProducts.map((p: any) => [p.id, p]));
      const validated = cartItems.map((item) => {
        const freshProduct = existingMap.get(item.id);
        if (!freshProduct) {
          return { ...item, isDeleted: true };
        }
        return { ...item, ...freshProduct, isDeleted: false };
      });

      setValidatedItems(validated);
    } catch (error) {
      setValidatedItems(cartItems);
    }
  };

  const texts: Record<
    string,
    {
      shoppingCart: string;
      item: string;
      items: string;
      cartEmpty: string;
      nothingAdded: string;
      total: string;
      connectToBuy: string;
      removeFromCart: string;
      closeCart: string;
      whatsappMessage: string;
      productDeleted: string;
      cleanDeletedItems: string;
    }
  > = {
    ar: {
      shoppingCart: "سلة التسوق",
      item: "عنصر",
      items: "عناصر",
      cartEmpty: "سلة التسوق فارغة",
      nothingAdded: "يبدو أنك لم تضف أي شيء بعد.",
      total: "الإجمالي:",
      connectToBuy: "اطلب عبر واتساب",
      removeFromCart: "إزالة من السلة",
      closeCart: "إغلاق السلة",
      whatsappMessage: "مرحباً، أود طلب العناصر التالية من El-Saudi jewelry:",
      productDeleted: "هذا المنتج تم حذفه",
      cleanDeletedItems: "إزالة المنتجات المحذوفة",
    },
    en: {
      shoppingCart: "Shopping Cart",
      item: "item",
      items: "items",
      cartEmpty: "Your cart is empty",
      nothingAdded: "Looks like you haven't added anything yet.",
      total: "Total:",
      connectToBuy: "Connect to Buy",
      removeFromCart: "Remove from cart",
      closeCart: "Close cart",
      whatsappMessage:
        "Hello, I would like to order the following items from El-Saudi jewelry:",
      productDeleted: "This product has been deleted",
      cleanDeletedItems: "Remove Deleted Items",
    },
  };

  const t =
    translations.cart[language as keyof typeof translations.cart] ||
    translations.cart.ar;

  const getImageUrl = (product: Product): string => {
    if (product.image_url) return product.image_url;
    if (product.image_file) return product.image_file;
    if (product.image) return product.image;
    return "https://via.placeholder.com/400x400?text=No+Image";
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const calculateTotal = (): number =>
    validatedItems
      .filter((item) => !item.isDeleted)
      .reduce(
        (acc: number, item: any) =>
          acc + Math.ceil(item.price / 5) * 5 * (item.quantity || 1),
        0,
      );

  const handleConnectToBuy = () => {
    const validItems = validatedItems.filter((item) => !item.isDeleted);
    if (validItems.length === 0) return;

    const phoneNumber = "201067365567";
    let message = `${t.whatsappMessage}\n\n`;

    validItems.forEach((item: any, index: number) => {
      const qty = item.quantity || 1;
      const productName =
        language === "ar"
          ? item.name_ar || item.arabic_name || item.name || "منتج"
          : item.name_en || item.english_name || item.name || "Product";

      message += `${index + 1}. ${productName} (x${qty}) - $${(Math.ceil(item.price / 5) * 5 * qty).toLocaleString()}\n`;
      message += `   🔗 https://elsaudi-jewelry.vercel.app/?product=${item.id}\n\n`;
    });

    message += `*${t.total} $${calculateTotal().toLocaleString()}*`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleProductClick = (product: Product) => {
    if (product.isDeleted) return;
    if (onProductClick) {
      onProductClick(product);
      onClose();
    }
  };

  const getProductName = (product: any): string => {
    if (!product) return "";
    return language === "ar"
      ? product.arabic_name || product.name_ar || product.name || "منتج"
      : product.english_name || product.name_en || product.name || "Product";
  };

  const getTotalQuantity = (): number =>
    validatedItems
      .filter((item) => !item.isDeleted)
      .reduce((total: number, item: any) => total + (item.quantity || 1), 0);

  const hasDeletedItems = validatedItems.some((item) => item.isDeleted);

  return (
    <div
      className={`cart-modal-backdrop ${isOpen ? "modal-open" : ""}`}
      onClick={handleBackdropClick}
    >
      <div className="cart-modal-content">
        {/* ── Close button ── */}
        <button
          className="cart-modal-close-button"
          onClick={onClose}
          aria-label={t.closeCart}
          style={{ fontSize: "35px" }}
        >
          &times;
        </button>

        {/* ── Header ── */}
        <div className="cart-modal-header">
          <h2 className="cart-modal-title">{t.shoppingCart}</h2>
          <p className="cart-modal-count">
            {getTotalQuantity()} {getTotalQuantity() === 1 ? t.item : t.items}
          </p>
        </div>

        {/* ── Deleted items warning ── */}
        {hasDeletedItems && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              padding: "12px",
              margin: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaExclamationTriangle color="#856404" size={20} />
            <span style={{ flex: 1, color: "#856404", fontSize: "14px" }}>
              {t.someProductsDeleted}
            </span>
            <button
              onClick={() => cleanupDeletedProducts?.()}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.cleanDeletedItems}
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="cart-modal-body">
          {validatedItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3>{t.cartEmpty}</h3>
              <p>{t.nothingAdded}</p>
            </div>
          ) : (
            <div className="cart-items">
              {validatedItems.map((product: any) => (
                <div
                  key={product.id}
                  className={`cart-item ${product.isDeleted ? "cart-item-deleted" : ""}`}
                  onClick={() => handleProductClick(product)}
                  style={{
                    cursor: product.isDeleted ? "not-allowed" : "pointer",
                    opacity: product.isDeleted ? 0.6 : 1,
                    position: "relative",
                  }}
                >
                  {/* Deleted badge */}
                  {product.isDeleted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#dc3545",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        zIndex: 2,
                      }}
                    >
                      {t.productDeleted}
                    </div>
                  )}

                  {/* Image + desktop hover overlay */}
                  <div className="cart-item-image-container">
                    <img
                      src={getImageUrl(product)}
                      alt={getProductName(product)}
                      className="cart-item-image"
                      style={{
                        filter: product.isDeleted ? "grayscale(100%)" : "none",
                      }}
                    />

                    {/* Quantity badge — fades on hover */}
                    {!product.isDeleted && (product.quantity ?? 0) > 0 && (
                      <div className="cart-item-qty-badge">
                        x{product.quantity}
                      </div>
                    )}

                    {/* Desktop: hover overlay controls */}
                    <div className="cart-item-controls-overlay">
                      <div className="overlay-controls-row">
                        <div className="quantity-selector">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product.id);
                            }}
                            disabled={(product.quantity || 1) <= 1}
                            type="button"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span>{product.quantity || 1}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                            }}
                            type="button"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <button
                          className="cart-item-remove-entire"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntireItem(product.id);
                          }}
                          aria-label={t.removeFromCart}
                          type="button"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Text info */}
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">
                      {getProductName(product)}
                    </h3>

                    <div className="cart-item-details">
                      <p className="cart-item-price">
                        $
                        {(
                          Math.ceil((product.price || 0) / 5) * 5
                        ).toLocaleString() ?? "N/A"}
                      </p>
                      {(product.quantity ?? 0) > 1 && !product.isDeleted && (
                        <span className="cart-item-subtotal">
                          $
                          {(
                            Math.ceil((product.price || 0) / 5) *
                            5 *
                            (product.quantity || 0)
                          ).toLocaleString()}{" "}
                          total
                        </span>
                      )}
                    </div>

                    {/* ── Mobile: always-visible inline controls ── */}
                    {!product.isDeleted && (
                      <div className="cart-item-mobile-controls">
                        {/* − qty + pill */}
                        <div className="mobile-qty-selector">
                          <button
                            className="mobile-qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(product.id);
                            }}
                            disabled={(product.quantity || 1) <= 1}
                            type="button"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={12} />
                          </button>

                          <span className="mobile-qty-count">
                            {product.quantity || 1}
                          </span>

                          <button
                            className="mobile-qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                            }}
                            type="button"
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        {/* Trash */}
                        <button
                          className="mobile-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntireItem(product.id);
                          }}
                          aria-label={t.removeFromCart}
                          type="button"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {validatedItems.filter((item) => !item.isDeleted).length > 0 && (
          <div className="cart-modal-footer">
            <div className="cart-footer-total-block">
              <span className="cart-footer-total-label">{t.total}</span>
              <span className="cart-total-price">
                ${calculateTotal().toLocaleString()}
              </span>
              <span className="cart-footer-items-note">
                {getTotalQuantity()}{" "}
                {getTotalQuantity() === 1 ? t.item : t.items}
              </span>
            </div>

            <div className="cart-footer-sep" />

            <div className="cart-footer-actions">
              <button className="cart-connect-btn" onClick={handleConnectToBuy}>
                <span>{t.connectToBuy}</span>
                <FaWhatsapp size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
