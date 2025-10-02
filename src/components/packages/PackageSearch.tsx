'use client';

import { useState, useEffect, useRef } from 'react';
import { Package } from '@/lib/types';
import { packageService } from '@/lib/services/packageService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Package as PackageIcon,
  MapPin,
  Calendar
} from 'lucide-react';

interface PackageSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'package' | 'destination' | 'tag';
  subtitle?: string;
}

export default function PackageSearch({ onSearch, placeholder = "Search packages..." }: PackageSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('package-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('package-recent-searches', JSON.stringify(updated));
  };

  // Fetch search suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await packageService.searchPackages(searchQuery, 10);
      
      if (response.success) {
        const packageSuggestions: SearchSuggestion[] = response.data.map(pkg => ({
          id: pkg.id,
          title: pkg.title,
          type: 'package' as const,
          subtitle: `${pkg.destinations.join(', ')} • ${pkg.duration.days} days`,
        }));

        // Add destination suggestions
        const destinationSuggestions: SearchSuggestion[] = Array.from(
          new Set(response.data.flatMap(pkg => pkg.destinations))
        )
          .filter(dest => dest.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map(dest => ({
            id: `dest-${dest}`,
            title: dest,
            type: 'destination' as const,
            subtitle: 'Destination',
          }));

        // Add tag suggestions
        const tagSuggestions: SearchSuggestion[] = Array.from(
          new Set(response.data.flatMap(pkg => pkg.tags))
        )
          .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map(tag => ({
            id: `tag-${tag}`,
            title: tag,
            type: 'tag' as const,
            subtitle: 'Tag',
          }));

        setSuggestions([...packageSuggestions, ...destinationSuggestions, ...tagSuggestions]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  // Handle search
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onSearch(searchQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    handleSearch(suggestion.title);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Remove recent search
  const removeRecentSearch = (searchToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('package-recent-searches', JSON.stringify(updated));
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('package-recent-searches');
                  }}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((recentQuery, index) => (
                  <div
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                  >
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{recentQuery}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => removeRecentSearch(recentQuery, e)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {query && (
            <div className="p-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div className="flex-shrink-0 mr-3">
                        {suggestion.type === 'package' && <PackageIcon className="w-4 h-4 text-blue-600" />}
                        {suggestion.type === 'destination' && <MapPin className="w-4 h-4 text-green-600" />}
                        {suggestion.type === 'tag' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.title}
                        </div>
                        {suggestion.subtitle && (
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">No results found</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Try searching for packages, destinations, or tags
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Filters */}
          {!query && (
            <div className="p-3 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Quick Filters
              </h4>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => handleSearch('featured')}
                >
                  Featured
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleSearch('active')}
                >
                  Active
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => handleSearch('adventure')}
                >
                  Adventure
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-700"
                  onClick={() => handleSearch('culture')}
                >
                  Culture
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
