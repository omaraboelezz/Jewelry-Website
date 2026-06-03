import { FaShippingFast, FaGem, FaUndo, FaHeadset } from 'react-icons/fa';
import './Features.css';
import { ReactElement } from 'react';

interface Feature {
  icon: ReactElement;
  title: string;
  description: string;
  color: string;
}
interface LanguageTexts {
  freeShipping: string;
  freeShippingDesc: string;
  premiumQuality: string;
  premiumQualityDesc: string;
  easyReturns: string;
  easyReturnsDesc: string;
  support: string;
  supportDesc: string;
}

interface Texts {
  ar: LanguageTexts;
  en: LanguageTexts;
}

interface FeaturesProps {
  language?: 'ar' | 'en';
}

/**
 * @param {String} language - Current language ('ar' or 'en')
 */
const Features = ({ language = 'ar' }: FeaturesProps) => {
  // النصوص حسب اللغة
  const texts: Texts = {
    ar: {
      freeShipping: 'شحن مجاني',
      freeShippingDesc: 'توصيل مجاني للطلبات فوق 200$',
      premiumQuality: 'جودة فائقة',
      premiumQualityDesc: 'فضة أصلية 925 معتمدة',
      easyReturns: 'إرجاع سهل',
      easyReturnsDesc: 'ضمان استرجاع لمدة 30 يوم',
      support: 'دعم 24/7',
      supportDesc: 'فريق دعم متواجد دائماً'
    },
    en: {
      freeShipping: 'Free Shipping',
      freeShippingDesc: 'Free delivery on orders over $200',
      premiumQuality: 'Premium Quality',
      premiumQualityDesc: 'Certified 925 Sterling Silver',
      easyReturns: 'Easy Returns',
      easyReturnsDesc: '30-day return guarantee',
      support: '24/7 Support',
      supportDesc: 'Always here to help you'
    }
  };

  const t: LanguageTexts = texts[language] || texts.ar;

  const features: Feature[] = [
    {
      icon: <FaShippingFast size={40} />,
      title: t.freeShipping,
      description: t.freeShippingDesc,
      color: '#667eea'
    },
    {
      icon: <FaGem size={40} />,
      title: t.premiumQuality,
      description: t.premiumQualityDesc,
      color: '#f093fb'
    },
    {
      icon: <FaUndo size={40} />,
      title: t.easyReturns,
      description: t.easyReturnsDesc,
      color: '#4facfe'
    },
    {
      icon: <FaHeadset size={40} />,
      title: t.support,
      description: t.supportDesc,
      color: '#43e97b'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;