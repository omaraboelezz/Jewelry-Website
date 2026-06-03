import './CategoriesBar.css';

type CategoryKey = 'All' | 'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings' | 'Watches' | 'New Arrivals';

interface LanguageTexts {
  [key: string]: string;
  All: string;
  Rings: string;
  Necklaces: string;
  Bracelets: string;
  Earrings: string;
  Watches: string;
  'New Arrivals': string;
}

interface Texts {
  ar: LanguageTexts;
  en: LanguageTexts;
}

interface CategoriesBarProps {
  selectedCategory: CategoryKey;
  onCategoryChange: (category: CategoryKey) => void;
  language?: 'ar' | 'en';
}

const CategoriesBar = ({ selectedCategory, onCategoryChange, language = 'ar' }: CategoriesBarProps) => {
  const texts: Texts = {
    ar: {
      All: 'الكل',
      Rings: 'خواتم',
      Necklaces: 'قلادات',
      Bracelets: 'أساور',
      Earrings: 'أقراط',
      Watches: 'ساعات',
      'New Arrivals': 'وصل حديثاً'
    },
    en: {
      All: 'All',
      Rings: 'Rings',
      Necklaces: 'Necklaces',
      Bracelets: 'Bracelets',
      Earrings: 'Earrings',
      Watches: 'Watches',
      'New Arrivals': 'New Arrivals'
    }
  };

  const t: LanguageTexts = texts[language] || texts.ar;

  const categories: CategoryKey[] = ['All', 'Rings', 'Necklaces', 'Bracelets', 'New Arrivals'];

  return (
    <div className="categories-bar-container">
      <div className="categories-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {t[category]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesBar;