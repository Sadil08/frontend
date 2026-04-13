"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import { PublicBundleCard } from '@/components/PublicBundleCard';
import BundleFilters from '@/components/BundleFilters';
import { useBundles } from '@/hooks/useBundles';
import { useAuth } from '@/context/AuthContext';
import { BundleFilterParams } from '@/services/bundleService';
import { PublicCustomBundleCard } from '@/components/PublicCustomBundleCard';
import { customBundleService, CustomBundleDto } from '@/services/customBundleService';

// Quick-filter pill definitions — edit labels/values to match your exam types in the backend
const QUICK_FILTERS: { label: string; filter: Partial<BundleFilterParams> }[] = [
  { label: 'All Bundles',   filter: {} },
  { label: 'Past Papers',   filter: { isPastPaper: true } },
  { label: 'MCQ',           filter: { type: 'MCQ' } },
  { label: 'Essay',         filter: { type: 'ESSAY' } },
  { label: 'Mixed',         filter: { type: 'MIXED' } },
];

function BundlesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [communityBundles, setCommunityBundles] = useState<CustomBundleDto[]>([]);
  const [searchInput, setSearchInput] = useState('');

  // Parse filters from URL
  const filters: BundleFilterParams = useMemo(() => {
    const params: BundleFilterParams = {};
    const page = searchParams.get('page');
    params.page = page ? parseInt(page) : 0;

    const size = searchParams.get('size');
    params.size = size ? parseInt(size) : 12;

    const type = searchParams.get('type');
    if (type === 'MCQ' || type === 'ESSAY' || type === 'MIXED') params.type = type;

    const examTypeId = searchParams.get('examTypeId');
    if (examTypeId) params.examTypeId = parseInt(examTypeId);

    const subjectId = searchParams.get('subjectId');
    if (subjectId) params.subjectId = parseInt(subjectId);

    const lessonId = searchParams.get('lessonId');
    if (lessonId) params.lessonId = parseInt(lessonId);

    const isPastPaper = searchParams.get('isPastPaper');
    if (isPastPaper === 'true') params.isPastPaper = true;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) params.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) params.maxPrice = parseFloat(maxPrice);

    const name = searchParams.get('name');
    if (name) params.name = name;

    return params;
  }, [searchParams]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(filters.name || '');
  }, [filters.name]);

  useEffect(() => {
    customBundleService.getPublicBundles()
      .then(data => setCommunityBundles(data))
      .catch(err => console.error('Failed to load community bundles', err));
  }, []);

  const updateFilters = (newFilters: Partial<BundleFilterParams>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    const qs = params.toString();
    router.push(qs ? `/bundles?${qs}` : '/bundles', { scroll: false });
  };

  const { bundles, total, loading } = useBundles(filters);

  const handleSearch = (q: string) => updateFilters({ name: q || undefined, page: 0 });
  const handleFilterChange = (newFilters: BundleFilterParams) => updateFilters({ ...newFilters, page: 0 });
  const handleClearFilters = () => router.push('/bundles');

  // Active filter count (exclude pagination keys)
  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'size'].includes(k) && v !== undefined && v !== null && v !== ''
  ).length;

  // Which quick-filter pill is active?
  const activeQuickFilter = QUICK_FILTERS.findIndex(qf => {
    const entries = Object.entries(qf.filter);
    if (entries.length === 0) return activeFilterCount === 0;
    return entries.every(([k, v]) => (filters as any)[k] === v) && activeFilterCount === entries.length;
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <span className="inline-block px-4 py-1 bg-white/10 text-indigo-200 text-sm font-semibold rounded-full mb-5 tracking-wide">
            Sri Lanka's #1 Exam Prep Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Study Smarter,<br className="hidden sm:block" /> Score Higher
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto mb-8">
            Past papers, MCQ drills, and essay practice — all in one place. Find exactly what you need.
          </p>

          {/* Hero Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(searchInput)}
                placeholder="Search by name, subject, or exam..."
                className="w-full pl-11 pr-12 py-4 rounded-xl text-gray-900 text-base font-medium shadow-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-0"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); handleSearch(''); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <CloseCircleFilled />
                </button>
              )}
            </div>
            {searchInput && (
              <button
                onClick={() => handleSearch(searchInput)}
                className="mt-3 px-6 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
              >
                Search
              </button>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            {!user && (
              <a href="/register" className="px-7 py-3 bg-white text-indigo-900 rounded-full font-bold text-base hover:bg-indigo-50 transition-colors shadow-lg">
                Get Started Free
              </a>
            )}
            {user && (
              <button
                onClick={() => router.push('/bundles/create-custom')}
                className="px-7 py-3 bg-white/10 border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                + Build Custom Bundle
              </button>
            )}
            <a href="#bundles" className="px-7 py-3 bg-indigo-700/60 border border-indigo-500 text-white rounded-full font-bold text-base hover:bg-indigo-600/80 transition-colors">
              Browse Papers ↓
            </a>
          </div>
        </div>

        {/* Quick-filter pills row anchored to the bottom of the hero */}
        <div id="bundles" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_FILTERS.map((qf, i) => (
              <button
                key={i}
                onClick={() => {
                  handleClearFilters();
                  if (Object.keys(qf.filter).length > 0) {
                    // slight delay so the clear fires first
                    setTimeout(() => updateFilters({ ...qf.filter, page: 0 }), 0);
                  }
                }}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeQuickFilter === i
                    ? 'bg-white text-indigo-700 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {qf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeFilterCount > 0 ? 'Filtered Results' : 'All Study Bundles'}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {total > 0
                  ? `${total} bundle${total !== 1 ? 's' : ''} found${filters.name ? ` for "${filters.name}"` : ''}`
                  : 'No bundles match your search'}
              </p>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.name && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                  "{filters.name}"
                  <button onClick={() => updateFilters({ name: undefined, page: 0 })} className="hover:text-indigo-900 ml-0.5">×</button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {filters.type}
                  <button onClick={() => updateFilters({ type: undefined, page: 0 })} className="hover:text-blue-900 ml-0.5">×</button>
                </span>
              )}
              {filters.isPastPaper && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  Past Papers
                  <button onClick={() => updateFilters({ isPastPaper: undefined, page: 0 })} className="hover:text-amber-900 ml-0.5">×</button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <BundleFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isMobile={isMobile}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-10">

            {/* Community Bundles */}
            {communityBundles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                  <h3 className="text-lg font-bold text-gray-900">Community Bundles</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                    Student Created
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {communityBundles.map(bundle => (
                    <PublicCustomBundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
                <div className="my-8 border-t border-gray-200" />
              </div>
            )}

            {/* Main Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100 shadow-sm">
                    <div className="h-2 bg-gray-200 rounded-t-xl" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bundles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {bundles.map(bundle => (
                    <PublicBundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={(filters.page || 0) + 1}
                    pageSize={filters.size || 12}
                    total={total}
                    onChange={(page, size) => {
                      updateFilters({ page: page - 1, size });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger
                    pageSizeOptions={['12', '24', '48']}
                    showTotal={(t) => `${t} bundles`}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-6xl mb-5">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No bundles found</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {activeFilterCount > 0
                    ? "Try broadening your search or clearing some filters."
                    : "No bundles are currently available."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BundlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    }>
      <BundlesContent />
    </Suspense>
  );
}
