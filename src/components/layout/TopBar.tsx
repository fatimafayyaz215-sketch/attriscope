"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useChurnStore } from "@/store/churn-store";
import { createClient } from "@/lib/supabase/client";

type SearchResult = {
  id: string;
  name: string;
  email: string;
  company: string | null;
};

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userInitials, setUserInitials] = useState("CG");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("User");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const selectCustomer = useChurnStore((s) => s.selectCustomer);

  // Fetch user info for avatar initials
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUserEmail(u.email ?? "");
      const fullName = u.user_metadata?.full_name as string | undefined;
      if (fullName && fullName.trim()) {
        setUserName(fullName.trim());
        const parts = fullName.trim().split(/\s+/);
        setUserInitials(
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : fullName.trim().slice(0, 2).toUpperCase()
        );
      } else if (u.email) {
        const local = u.email.split("@")[0];
        setUserName(local);
        setUserInitials(local.slice(0, 2).toUpperCase());
      }
    });
  }, []);

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/risk-analysis": "Risk Analysis",
    "/outreach-hub": "Retention Outreach Hub",
    "/data-management": "Data Import Wizard",
    "/settings": "Calibration & Setup",
  };
  const title = titles[pathname] || "Dashboard Overview";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedSearch = search.trim();
  const isSearchActive = trimmedSearch.length >= 2;

  useEffect(() => {
    if (!isSearchActive) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/customers?limit=8&search=${encodeURIComponent(trimmedSearch)}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok || data.error) {
          setSearchResults([]);
          setSearchOpen(true);
          return;
        }
        setSearchResults(Array.isArray(data.customers) ? data.customers : []);
        setSearchOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
          setSearchOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isSearchActive, trimmedSearch]);

  const displayResults = isSearchActive ? searchResults : [];
  const displayOpen = isSearchActive && searchOpen;
  const displayLoading = isSearchActive && searchLoading;

  const handleLogout = async () => {
    setMenuOpen(false);
    await authService.signOut();
    router.push("/login");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/risk-analysis?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
    }
  };

  const handlePickCustomer = (customer: SearchResult) => {
    selectCustomer(customer.id);
    setSearch(customer.name);
    setSearchOpen(false);
    router.push(`/risk-analysis?q=${encodeURIComponent(customer.name)}`);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">

      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base md:text-lg font-bold text-gray-800 truncate">{title}</h1>
      </div>

      {/* Right: search + user */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">

        {/* Search – visible md+ */}
        <div className="relative hidden md:block" ref={searchRef}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (value.trim().length < 2) {
                setSearchResults([]);
                setSearchOpen(false);
                setSearchLoading(false);
              }
            }}
            onFocus={() => {
              if (search.trim().length >= 2) setSearchOpen(true);
            }}
            onKeyDown={handleSearch}
            className="w-56 lg:w-72 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
          />

          {displayOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-50">
              {displayLoading ? (
                <div className="px-4 py-3 text-xs text-gray-500">Searching...</div>
              ) : displayResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-500">No customers found</div>
              ) : (
                <ul className="py-1">
                  {displayResults.map((customer) => (
                    <li key={customer.id}>
                      <button
                        type="button"
                        onClick={() => handlePickCustomer(customer)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.email || customer.company || "No details"}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 hidden md:block" />

        {/* User profile avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm"
            aria-label="Account menu"
          >
            {userInitials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

              {/* User info header */}
              <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {/* <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium leading-tight">My Profile</p>
                    <p className="text-xs text-gray-400 leading-tight">Account details</p>
                  </div>
                </Link> */}

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium leading-tight">Settings</p>
                    <p className="text-xs text-gray-400 leading-tight">Calibration & weights</p>
                  </div>
                </Link>
              </div>

              <div className="border-t border-gray-100" />

              <div className="py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  <div className="text-left">
                    <p className="font-medium leading-tight">Sign Out</p>
                    <p className="text-xs text-red-400 leading-tight">End your session</p>
                  </div>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
