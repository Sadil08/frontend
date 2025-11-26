import { useState, useEffect } from 'react';
import { getBundles } from '@/services/bundleService';
import { PaperBundleSummaryDto } from '@/types';

export const useBundles = (filters?: Record<string, string | number>) => {
  const [bundles, setBundles] = useState<PaperBundleSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const data = await getBundles(filters);
        setBundles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, [filters]);

  return { bundles, loading };
};