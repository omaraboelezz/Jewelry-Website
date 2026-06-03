import { useState, FormEvent } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

const Login = ({ onLogin, language, onLanguageChange }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🔗 Backend API URL
  const API_URL = 'https://omarawad9.pythonanywhere.com/api';

  const texts = {
    ar: {
      title: 'تسجيل الدخول',
      subtitle: 'لوحة التحكم - El-Saudi jewelry',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'دخول',
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      required: 'من فضلك أدخل اسم المستخدم وكلمة المرور',
      networkError: 'خطأ في الاتصال بالخادم. يرجى إبلاغ الأدمن أن اشتراك سيرفر PythonAnywhere يحتاج يتمد شهر إضافي.',
      loggingIn: 'جاري تسجيل الدخول...'
    },
    en: {
      title: 'Login',
      subtitle: 'Admin Panel - El-Saudi jewelry',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      error: 'Invalid username or password',
      required: 'Please enter username and password',
      networkError: 'PythonAnywhere server subscription needs to be renewed for another month.',
      loggingIn: 'Logging in...'
    }
  };

  const t = texts[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ Validation
    if (!username || !password) {
      setError(t.required);
      return;
    }

    setIsLoading(true);

    try {
      // 🔐 Send login request to Backend
      const response = await fetch(`${API_URL}/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.access_token) {
          localStorage.setItem('accessToken', data.access_token);
        }

        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }

        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminUsername', username);

        if (data.role) {
          localStorage.setItem('adminRole', data.role);
        }

        onLogin();
      } else {
        setError(data.message || t.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError(t.networkError);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">{t.title}</h1>
          <p className="login-subtitle">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <FaUser /> {t.username}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder={t.username}
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FaLock /> {t.password}
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder={t.password}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? t.loggingIn : t.login}
          </button>
        </form>

        <div className="language-selector-login">
          <button
            type="button"
            className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
            onClick={() => onLanguageChange('ar')}
            disabled={isLoading}
          >
            العربية
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => onLanguageChange('en')}
            disabled={isLoading}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;