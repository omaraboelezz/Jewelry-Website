import { useState, useEffect } from 'react';

// Module-level cache to prevent multiple fetches across different card instances
let cachedBadges = null;
let fetchPromise = null;

const BADGES_API_URL = "https://omarawad9.pythonanywhere.com/api/badges/";

const useBadges = () => {
  const [badges, setBadges] = useState(cachedBadges || []);
  const [loading, setLoading] = useState(!cachedBadges);

  useEffect(() => {
    // If we already have the cached badges, do not fetch again
    if (cachedBadges) {
      return;
    }

    // If a fetch is not already in progress, start one
    if (!fetchPromise) {
      fetchPromise = fetch(BADGES_API_URL)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            cachedBadges = data;
            setBadges(data);
          }
        })
        .catch(err => {
          // Retry logic can be added here if necessary
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // If a fetch is currently in progress, wait for it to complete
      fetchPromise.then(() => {
        setBadges(cachedBadges || []);
        setLoading(false);
      });
    }
  }, []);

  // Retrieve the custom color for a given badge name
  const getBadgeColor = (badgeName) => {
    if (!badgeName || !badges || badges.length === 0) return null;
    const found = badges.find(b => b.name_ar === badgeName || b.name_en === badgeName || b.name === badgeName);
    return found ? found.color : null;
  };

  // Retrieve the localized name for a given badge name
  const getLocalizedBadgeName = (badgeName, language) => {
    if (!badgeName || !badges || badges.length === 0) return badgeName;
    const found = badges.find(b => b.name_ar === badgeName || b.name_en === badgeName || b.name === badgeName);
    if (!found) return badgeName;
    return language === 'ar' ? found.name_ar : found.name_en;
  };

  return { badges, loading, getBadgeColor, getLocalizedBadgeName };
};

export default useBadges;
