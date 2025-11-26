import { Input } from 'antd';
import { useState, useEffect } from 'react';

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
      placeholder="Search bundles..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="border rounded"
    />
  );
};

export default SearchBar;