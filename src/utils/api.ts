/**
 * API Utility Functions
 * Handles all API calls to the backend with JWT Authentication
 */

const API_BASE_URL = 'https://omarawad9.pythonanywhere.com/api';

/**
 * Helper function to make authenticated API calls (for admin only)
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    // ✅ بعت الـ token بس لو موجود
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // ✅ متبعتش Content-Type لو الـ body هو FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // إذا كان 401 - جرب تجديد الـ Token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');


      if (refreshToken) {
        try {
          // محاولة تجديد الـ Token
          const refreshResponse = await fetch(`${API_BASE_URL}/accounts/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('accessToken', data.access);

            // إعادة المحاولة بالـ Token الجديد
            headers['Authorization'] = `Bearer ${data.access}`;
            return await fetch(url, { ...options, headers });
          } else {
            // ✅ فشل التجديد - امسح الـ tokens بس (مش كل الـ localStorage)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          // ✅ فشل التجديد - امسح الـ tokens بس
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw error;
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all products from the backend (public - no auth needed)
 * @returns {Promise<Array>} Array of product objects
 */
export const fetchProducts = async () => {
  try {
    // ✅ fetch مباشر بدون auth - endpoint عام للكل
    const response = await fetch(`${API_BASE_URL}/products/`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return [];
  }
};

/**
 * Fetch all sections from the backend (public - no auth needed)
 * @returns {Promise<Array>} Array of section objects
 */
export const fetchSections = async () => {
  try {
    // ✅ fetch مباشر بدون auth - endpoint عام للكل
    const response = await fetch(`${API_BASE_URL}/sections/`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return [];
  }
};

/**
 * Add a new product to the backend (admin only)
 * @param {FormData | Object} productData - Product data object or FormData
 * @returns {Promise<Object>} Response from the server
 */
export const addProduct = async (productData: any) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/`, {
      method: 'POST',
      body: productData instanceof FormData ? productData : JSON.stringify(productData),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.error || 'Failed to add product');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing product (admin only)
 * @param {number} id - Product ID
 * @param {FormData | Object} productData - Updated product data
 * @returns {Promise<Object>} Response from the server
 */
export const updateProduct = async (id: number, productData: any) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}/`, {
      method: 'PATCH',
      body: productData instanceof FormData ? productData : JSON.stringify(productData),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.error || 'Failed to update product');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a product (admin only)
 * @param {number} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id: number) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}/`, {
      method: 'DELETE',
    });

    if (!response || !response.ok) {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Add a new section (admin only)
 * @param {Object} sectionData - Section data
 * @returns {Promise<Object>} Response from the server
 */
export const addSection = async (sectionData: any) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.error || 'Failed to add section');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing section (admin only)
 * @param {number} id - Section ID
 * @param {Object} sectionData - Updated section data
 * @returns {Promise<Object>} Response from the server
 */
export const updateSection = async (id: number, sectionData: any) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(sectionData),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.error || 'Failed to update section');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a section (admin only)
 * @param {number} id - Section ID
 * @returns {Promise<void>}
 */
export const deleteSection = async (id: number) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sections/${id}/`, {
      method: 'DELETE',
    });

    if (!response || !response.ok) {
      throw new Error('Failed to delete section');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch metal prices (public)
 * @returns {Promise<Object>} Metal prices object
 */
export const fetchMetalPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/metal-prices/`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

/**
 * Update metal prices (admin only)
 * @param {Object} pricesData - { gold_price_per_gram, silver_price_per_gram }
 * @returns {Promise<Object>} Response from the server
 */
export const updateMetalPrices = async (pricesData: { gold_price_per_gram?: number; silver_price_per_gram?: number }) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/metal-prices/`, {
      method: 'PUT',
      body: JSON.stringify(pricesData),
    });

    if (!response || !response.ok) {
      const errorData = await response?.json();
      throw new Error(errorData?.error || 'Failed to update metal prices');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};