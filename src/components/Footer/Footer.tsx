import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

interface LanguageTexts {
  tagline: string;
  quickLinks: string;
  home: string;
  features: string;
  collection: string;
  contact: string;
  email: string;
  phone: string;
  followUs: string;
  allRightsReserved: string;
}

interface Texts {
  ar: LanguageTexts;
  en: LanguageTexts;
}

interface FooterProps {
  language?: 'ar' | 'en';
}

const Footer = ({ language = 'ar' }: FooterProps) => {
  const texts: Texts = {
    ar: {
      tagline: 'أناقة خالدة في كل قطعة',
      quickLinks: 'روابط سريعة',
      home: 'الرئيسية',
      features: 'المميزات',
      collection: 'المجموعة',
      contact: 'تواصل معنا',
      email: 'البريد الإلكتروني:',
      phone: 'الهاتف:',
      followUs: 'تابعنا',
      allRightsReserved: 'جميع الحقوق محفوظة'
    },
    en: {
      tagline: 'Timeless Elegance in Every Piece',
      quickLinks: 'Quick Links',
      home: 'Home',
      features: 'Features',
      collection: 'Collection',
      contact: 'Contact',
      email: 'Email:',
      phone: 'Phone:',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved'
    }
  };

  const t: LanguageTexts = texts[language] || texts.ar;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const featuredCollectionElement = document.getElementById('featured-collection');
    if (featuredCollectionElement) {
      const headerHeight = 80;
      const featuredPosition = featuredCollectionElement.offsetTop - headerHeight;
      window.scrollTo({ top: featuredPosition, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">El-Saudi jewelry</h3>
          <p className="footer-tagline">{t.tagline}</p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">{t.quickLinks}</h4>
          <ul className="footer-links">
            <li>
              <button className="footer-link" onClick={scrollToTop}>
                {t.home}
              </button>
            </li>
            <li>
              <button className="footer-link" onClick={scrollToFeatures}>
                {t.features}
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">{t.contact}</h4>
          <p className="footer-text">
            {t.phone}{' '}
            <a href="tel:+201067365567" className="footer-phone-link">
              +201067365567
            </a>
          </p>

          <div className="footer-social">
            <h4 className="footer-heading" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              {t.followUs}
            </h4>
            <div className="social-links">
              <a
                href="https://www.instagram.com/saudi.silver?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="social-link instagram"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61584713551844"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
                aria-label="Facebook"
              >
                <FaFacebookF size={24} />
              </a>
              <a
                href="https://wa.me/201067365567"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link whatsapp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} El-Saudi jewelry | {t.allRightsReserved}.</p>
      </div>
    </footer>
  );
};

export default Footer;