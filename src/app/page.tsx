"use client";

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { Select } from 'antd';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { PublicBundleCard } from '@/components/PublicBundleCard';
import { useBundles } from '@/hooks/useBundles';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, string | number>>({});
  const { bundles, loading } = useBundles(filters);

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query });
  };

  const handleFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <SearchBar onSearch={handleSearch} />
          <Select placeholder="Subject" onChange={(value) => handleFilter('subjectId', value)} className="w-32">
            {/* Options from API */}
          </Select>
          <Select placeholder="Lesson" onChange={(value) => handleFilter('lessonId', value)} className="w-32">
            {/* Options */}
          </Select>
          <Select placeholder="Type" onChange={(value) => handleFilter('type', value)} className="w-32">
            <Select.Option value="MCQ">MCQ</Select.Option>
            <Select.Option value="ESSAY">Essay</Select.Option>
            <Select.Option value="BOTH">Both</Select.Option>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            bundles.map((bundle) => (
              <PublicBundleCard key={bundle.id} bundle={bundle} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
