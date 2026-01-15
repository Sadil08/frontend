"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from 'antd';

export const dynamic = 'force-dynamic';
import SearchBar from '@/components/SearchBar';
import { PublicBundleCard } from '@/components/PublicBundleCard';
import BundleFilters from '@/components/BundleFilters';
import { useBundles } from '@/hooks/useBundles';
import { useAuth } from '@/context/AuthContext';
import { BundleFilterParams } from '@/services/bundleService';

function BundlesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

  // Initialize filters from URL parameters
  const [filterState, setFilterState] = useState<BundleFilterParams>(() => {
    const params: BundleFilterParams = {};

    const page = searchParams.get('page');
    if (page) params.page = parseInt(page);
    else params.page = 0;

    const size = searchParams.get('size');
    if (size) params.size = parseInt(size);
    else params.size = 12; // Default page size for frontend

    const type = searchParams.get('type');
    if (type === 'MCQ' || type === 'ESSAY' || type === 'MIXED') {
      params.type = type;
    }

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
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filterState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `/bundles?${queryString}` : '/bundles';

    // Only update if URL actually changed
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filterState, router]);

  // Serialize filters to prevent object recreations
  const filtersKey = JSON.stringify(filterState);
  const filters = useMemo(() => filterState, [filtersKey]);
  const { bundles, total, loading } = useBundles(filters);

  const handleSearch = (query: string) => {
    setFilterState(prev => ({ ...prev, name: query || undefined, page: 0 })); // Reset page on search
  };

  const handleFilterChange = (newFilters: BundleFilterParams) => {
    setFilterState({ ...newFilters, page: 0 }); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setFilterState({});
  };

  const activeFilterCount = Object.values(filterState).filter(
    (value) => value !== undefined && value !== null && value !== ''
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in">
            Master Your Exams with <span className="text-primary-200">EduApp</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-10 animate-slide-up">
            Access premium past papers, practice exams, and get instant AI-powered feedback to improve your grades.
          </p>
          <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {!user && (
              <a href="/register" className="px-8 py-3 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl">
                Get Started Free
              </a>
            )}
            <a href="#bundles" className="px-8 py-3 bg-primary-700 text-white rounded-full font-bold text-lg hover:bg-primary-600 transition-colors shadow-lg border border-primary-600">
              Browse Papers
            </a>
          </div>
        </div>
      </div>

      <div id="bundles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-secondary-900">
            Featured Bundles
            {activeFilterCount > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-500">
                ({bundles.length} result{bundles.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <div className="w-full md:w-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Filters and Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Desktop) / Drawer (Mobile) */}
          <div className="lg:col-span-1">
            <BundleFilters
              filters={filterState}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isMobile={isMobile}
            />
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl h-96 animate-pulse shadow-sm border border-gray-200">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bundles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {bundles.map((bundle) => (
                    <PublicBundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center">
                  <Pagination
                    current={(filterState.page || 0) + 1}
                    pageSize={filterState.size || 20}
                    total={total}
                    onChange={(page, size) => {
                      setFilterState(prev => ({
                        ...prev,
                        page: page - 1,
                        size: size
                      }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger
                    pageSizeOptions={['12', '24', '48']}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No bundles found</h3>
                <p className="text-gray-500 mb-4">
                  {activeFilterCount > 0
                    ? 'Try adjusting your filters to find what you\'re looking for.'
                    : 'No bundles are currently available.'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear All Filters
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }>
      <BundlesContent />
    </Suspense>
  );
}
