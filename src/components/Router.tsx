import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Route Context for navigation
const RouteContext = createContext<{
  currentRoute: string;
  params: Record<string, string>;
  navigate: (path: string, params?: Record<string, string>) => void;
}>({
  currentRoute: '/',
  params: {},
  navigate: () => {},
});

export const useRouter = () => useContext(RouteContext);

export function Router({ children }: { children?: React.ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [params, setParams] = useState<Record<string, string>>({});

  const parseSearchParams = (search: string): Record<string, string> => {
    const urlSearchParams = new URLSearchParams(search);
    const parsed: Record<string, string> = {};
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

  const navigate = useCallback((path: string, newParams: Record<string, string> = {}) => {
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

interface RouteProps {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

export function Route({ path, component: Component, exact = false }: RouteProps) {
  const { currentRoute } = useRouter();
  
  const isMatch = exact 
    ? currentRoute === path 
    : currentRoute.startsWith(path);

  if (!isMatch) return null;

  return <Component />;
}

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  params?: Record<string, string>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  role?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, children, className, params, onMouseEnter, onMouseLeave, onClick, role }, ref) => {
    const { navigate } = useRouter();

    const handleClick = (e: React.MouseEvent) => {
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
  }
);

Link.displayName = 'Link';