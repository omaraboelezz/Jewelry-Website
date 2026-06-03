import './Skeleton.css';

const HomeSkeleton = () => {
  return (
    <div className="home-skeleton-wrapper" style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      {/* Hero Skeleton */}
      <div className="skeleton-box skeleton-hero"></div>

      {/* Featured Section Title Skeleton */}
      <div className="skeleton-box skeleton-section-title" style={{ marginTop: '60px' }}></div>
      <div className="skeleton-box skeleton-section-title" style={{ height: '10px', width: '100px', margin: '0 auto 40px', background: '#e0e0e0' }}></div>

      {/* Grid Skeleton */}
      <div className="skeleton-grid" style={{ paddingBottom: '60px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-box skeleton-card-img"></div>
            <div className="skeleton-card-text">
              <div className="skeleton-box skeleton-card-line"></div>
              <div className="skeleton-box skeleton-card-line short"></div>
              <div className="skeleton-box skeleton-card-line" style={{ marginTop: '10px', width: '30%' }}></div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <div className="skeleton-box skeleton-card-button" style={{ flex: 1 }}></div>
                <div className="skeleton-box skeleton-card-button" style={{ flex: 1 }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeSkeleton;
