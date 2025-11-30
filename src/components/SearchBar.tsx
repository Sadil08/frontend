import { Input } from 'antd';
import { useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, onSearch]);

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