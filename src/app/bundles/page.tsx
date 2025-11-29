"use client";

import { useState, useMemo } from 'react';

export const dynamic = 'force-dynamic';
import { Select } from 'antd';
import SearchBar from '@/components/SearchBar';
import { PublicBundleCard } from '@/components/PublicBundleCard';
import { useBundles } from '@/hooks/useBundles';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [filterState, setFilterState] = useState<Record<string, string | number>>({});

  // Serialize filters to prevent object recreations
  const filtersKey = JSON.stringify(filterState);
  const filters = useMemo(() => filterState, [filtersKey]);
  const { bundles, loading } = useBundles(filters);

  const handleSearch = (query: string) => {
    setFilterState(prev => ({ ...prev, search: query }));
  };

  const handleFilter = (key: string, value: string) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-secondary-900">Featured Bundles</h2>
          <div className="w-full md:w-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-center">
          <span className="text-gray-500 font-medium mr-2">Filter by:</span>
          <Select
            placeholder="Subject"
            onChange={(value) => handleFilter('subjectId', value)}
            className="w-40"
            size="large"
            allowClear
          >
            {/* Options would be populated from API */}
            <Select.Option value="1">Mathematics</Select.Option>
            <Select.Option value="2">Science</Select.Option>
            <Select.Option value="3">English</Select.Option>
          </Select>
          <Select
            placeholder="Type"
            onChange={(value) => handleFilter('type', value)}
            className="w-40"
            size="large"
            allowClear
          >
            <Select.Option value="MCQ">Multiple Choice</Select.Option>
            <Select.Option value="ESSAY">Essay</Select.Option>
            <Select.Option value="BOTH">Mixed</Select.Option>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <PublicBundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
