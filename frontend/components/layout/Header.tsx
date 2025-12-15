'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AcornLmsLogo } from '@/components/icon/AcornLogo';
import { isAuthenticated, clearToken, getUserId } from '@/lib/auth';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [pathname]); // Re-check auth status when route changes

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setShowUserMenu(false);
    router.push('/');
  };

  const handleDashboard = () => {
    const userId = getUserId();
    if (userId) {
      router.push(`/dashboard/${userId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-navy border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <AcornLmsLogo className="h-8 w-auto text-white" />
          </Link>

          {/* Right: Auth UI */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="inline-flex items-center rounded-md bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Overlay to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu">
                      <button
                        onClick={handleDashboard}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
