import { Input } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const onSearchRef = useRef(onSearch);

  // Keep ref updated
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Sync with initialQuery if it changes externally (optional, but good for URL sync)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchRef.current(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Input
      placeholder="Search bundles, papers, or topics..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      prefix={<SearchOutlined className={query ? "text-primary-600" : "text-gray-400"} />}
      className={`w-full max-w-md rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm transition-all duration-200 py-2 ${query ? 'border-primary-500' : ''
        }`}
      size="large"
      allowClear
      onClear={() => setQuery('')}
    />
  );
};

export default SearchBar;