import { useState, useEffect, lazy, Suspense } from 'react';
import WishlistProvider from './context/WishlistProvider';
import Home from './pages/Home';
import './App.css';

const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));

type Page = 'admin' | 'home' | 'login';
type Language = 'ar' | 'en';

const ADMIN_PATH = '/admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const pathname = window.location.pathname;
    if (pathname === ADMIN_PATH) {
      const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
      return isAuthenticated ? 'admin' : 'login';
    }
    return 'home';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    return savedLanguage || 'ar';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    let scrollTimer: number | null = null;

    const handleScroll = () => {
      document.documentElement.classList.add('scrolling');
      
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      if (pathname === ADMIN_PATH) {
        const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
        setCurrentPage(isAuthenticated ? 'admin' : 'login');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (page: Page) => {
    if (page === 'admin') {
      const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
      if (isAuthenticated) {
        window.history.pushState({}, '', ADMIN_PATH);
        setCurrentPage('admin');
      } else {
        window.history.pushState({}, '', ADMIN_PATH);
        setCurrentPage('login');
      }
    } else if (page === 'login') {
      window.history.pushState({}, '', ADMIN_PATH);
      setCurrentPage('login');
    } else {
      window.history.pushState({}, '', '/');
      setCurrentPage('home');
    }
  };

  const handleLogin = () => {
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setCurrentPage('login');
    window.history.pushState({}, '', ADMIN_PATH);
  };

  return (
    <WishlistProvider>
        <Suspense fallback={null}>
          {currentPage === 'login' ? (
            <Login 
              onLogin={handleLogin}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          ) : currentPage === 'admin' ? (
            <Admin 
              navigate={navigate}
              onLogout={handleLogout}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          ) : (
            <Home 
              navigate={navigate}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          )}
        </Suspense>
    </WishlistProvider>
  );
}

export default App;