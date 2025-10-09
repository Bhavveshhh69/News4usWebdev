import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Route Context for navigation
const RouteContext = createContext({
  currentRoute: '/',
  params: {},
  navigate: () => {},
});

export const useRouter = () => useContext(RouteContext);

export function Router({ children }) {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [params, setParams] = useState({});

  const parseSearchParams = (search) => {
    const urlSearchParams = new URLSearchParams(search);
    const parsed = {};
    urlSearchParams.forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  };

  useEffect(() => {
    const setFromLocation = () => {
      const { pathname, search } = window.location;
      setCurrentRoute(pathname || '/');
      setParams(parseSearchParams(search));
    };

    // Initialize from current URL
    setFromLocation();

    // Handle back/forward navigation
    const onPopState = () => setFromLocation();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path, newParams = {}) => {
    // Build a normalized URL with merged query params
    const url = new URL(path, window.location.origin);
    Object.entries(newParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const nextPath = url.pathname || '/';
    const nextSearch = url.search;

    window.history.pushState({}, '', nextPath + nextSearch);
    setCurrentRoute(nextPath);
    setParams(parseSearchParams(nextSearch));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouteContext.Provider value={{ currentRoute, params, navigate }}>
      {children}
    </RouteContext.Provider>
  );
}

export function Route({ path, component: Component, exact = false }) {
  const { currentRoute } = useRouter();
  
  const isMatch = exact 
    ? currentRoute === path 
    : currentRoute.startsWith(path);

  if (!isMatch) return null;

  return <Component />;
}

// Create Link component
const LinkComponent = React.forwardRef(({ to, children, className, params, onMouseEnter, onMouseLeave, onClick, role }, ref) => {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    // Compose URL with query params for shareable links
    let toWithQuery = to;
    if (params && Object.keys(params).length > 0) {
      const url = new URL(to, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
      toWithQuery = url.pathname + url.search;
    }

    navigate(toWithQuery, params);
    onClick?.();
  };

  return (
    <a 
      ref={ref}
      href={params && Object.keys(params).length > 0 ? (() => { const u = new URL(to, window.location.origin); Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) u.searchParams.set(k, String(v)); }); return u.pathname + u.search; })() : to}
      onClick={handleClick} 
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
    >
      {children}
    </a>
  );
});

LinkComponent.displayName = 'Link';

// Export Link
export const Link = LinkComponent;