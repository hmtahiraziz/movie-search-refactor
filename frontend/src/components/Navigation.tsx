'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { parseSearchParams, buildSearchUrl } from '@/utils/urlUtils';
import { getSearchState } from '@/utils/storageUtils';

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [searchPageUrl, setSearchPageUrl] = useState(() => {
    const urlParams = parseSearchParams(searchParams);
    return buildSearchUrl(urlParams.query, urlParams.page);
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Search Movies', icon: '🔍' },
    { href: '/favorites', label: 'My Favorites', icon: '❤️' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (!isMounted) return;

    const urlParams = parseSearchParams(searchParams);
    let query = urlParams.query;
    let page = urlParams.page;
    
    if (!query) {
      const stored = getSearchState();
      query = stored.query;
      page = stored.page;
    }
    
    const newUrl = buildSearchUrl(query, page);
    setSearchPageUrl(newUrl);
  }, [searchParams, isMounted]);

  const isSearchPageActive = useMemo(() => {
    return pathname === '/' || pathname.startsWith('/?');
  }, [pathname]);

  return (
    <nav className="bg-gradient-hero border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={searchPageUrl} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-foreground">OMDb</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const href = item.href === '/' ? searchPageUrl : item.href;
              const isActive = item.href === '/' ? isSearchPageActive : pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary/50 transition-smooth"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              {navItems.map((item) => {
                const href = item.href === '/' ? searchPageUrl : item.href;
                const isActive = item.href === '/' ? isSearchPageActive : pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

