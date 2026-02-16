import { useState, useEffect, useRef } from 'react';
import { getBundles } from '@/services/bundleService';
import { PaperBundleSummaryDto } from '@/types';
import { BundleFilterParams } from '@/services/bundleService';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CacheEntry {
  data: any; // Page object or array
  timestamp: number;
  filters: string;
}

let bundleCache: CacheEntry | null = null;

export const useBundles = (filters?: BundleFilterParams) => {
  const [bundles, setBundles] = useState<PaperBundleSummaryDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const filtersRef = useRef<string>('');

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      try {
        // Serialize filters for comparison
        const filtersString = JSON.stringify(filters || {});
        const now = Date.now();

        // Check if we have cached data for these filters
        if (
          bundleCache &&
          bundleCache.filters === filtersString &&
          now - bundleCache.timestamp < CACHE_DURATION
        ) {
          // Use cached data
          const cachedData = bundleCache.data;
          if (cachedData.content) {
            setBundles(cachedData.content);
            setTotal(cachedData.totalElements);
          } else if (Array.isArray(cachedData)) {
            setBundles(cachedData);
            setTotal(cachedData.length);
          }
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const data = await getBundles(filters);

        if (data.content) {
          setBundles(data.content);
          setTotal(data.totalElements);
        } else if (Array.isArray(data)) {
          // Fallback for non-paginated response if any
          setBundles(data);
          setTotal(data.length);
        }

        // Update cache
        bundleCache = {
          data,
          timestamp: now,
          filters: filtersString
        };
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if filters have actually changed
    const filtersString = JSON.stringify(filters || {});

    if (filtersRef.current !== filtersString) {
      filtersRef.current = filtersString;
      fetchBundles();
    }
  }, [filters]);

  return { bundles, total, loading };
};