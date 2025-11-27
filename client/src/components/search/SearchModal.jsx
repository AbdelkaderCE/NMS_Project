import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../api';
import { 
  FiX, 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiBriefcase,
  FiBook,
  FiGrid,
  FiDollarSign,
  FiActivity,
  FiCalendar,
  FiArrowRight,
  FiLayout
} from 'react-icons/fi';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({});
      setTotalResults(0);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchAPI.search(query, 10);
        setResults(response.data.results);
        setTotalResults(response.data.totalResults);
        setSelectedIndex(0); // Reset selection on new results
      } catch (error) {
        console.error('Search error:', error);
        setResults({});
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Flatten results for keyboard navigation
  const flatResults = [];
  Object.entries(results).forEach(([category, items]) => {
    if (items && items.length > 0) {
      flatResults.push({ type: 'category', label: category });
      items.forEach(item => {
        flatResults.push({ ...item, category });
      });
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const nextIndex = prev + 1;
            // Skip category headers
            while (nextIndex < flatResults.length && flatResults[nextIndex].type === 'category') {
              return nextIndex + 1;
            }
            return Math.min(nextIndex, flatResults.length - 1);
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const prevIndex = prev - 1;
            // Skip category headers
            while (prevIndex >= 0 && flatResults[prevIndex].type === 'category') {
              return prevIndex - 1;
            }
            return Math.max(prevIndex, 0);
          });
          break;
        case 'Enter':
          e.preventDefault();
          const selected = flatResults[selectedIndex];
          if (selected && selected.route) {
            navigate(selected.route);
            handleClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, navigate]);

  const handleClose = () => {
    setQuery('');
    setResults({});
    setTotalResults(0);
    setSelectedIndex(0);
    onClose();
  };

  const handleResultClick = (route) => {
    navigate(route);
    handleClose();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      pages: <FiLayout className="w-4 h-4" />,
      children: <FiUser className="w-4 h-4" />,
      parents: <FiUsers className="w-4 h-4" />,
      staff: <FiBriefcase className="w-4 h-4" />,
      classes: <FiBook className="w-4 h-4" />,
      groups: <FiGrid className="w-4 h-4" />,
      payments: <FiDollarSign className="w-4 h-4" />,
      activities: <FiActivity className="w-4 h-4" />,
      attendance: <FiCalendar className="w-4 h-4" />
    };
    return icons[category] || <FiSearch className="w-4 h-4" />;
  };

  const getCategoryLabel = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for pages, children, staff, classes, payments..."
            className="flex-1 outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="ml-2 px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="py-12 text-center text-gray-500">
              <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Type at least 2 characters to search</p>
              <p className="text-xs mt-1 text-gray-400">
                Search pages, children, staff, payments, and more
              </p>
            </div>
          )}

          {!loading && query.length >= 2 && totalResults === 0 && (
            <div className="py-12 text-center text-gray-500">
              <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1 text-gray-400">
                Try different keywords or check spelling
              </p>
            </div>
          )}

          {!loading && totalResults > 0 && (
            <div className="py-2">
              {Object.entries(results).map(([category, items]) => {
                if (!items || items.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {getCategoryIcon(category)}
                      <span>{getCategoryLabel(category)}</span>
                      <span className="text-gray-400">({items.length})</span>
                    </div>

                    {/* Category Items */}
                    <div>
                      {items.map((item, index) => {
                        const flatIndex = flatResults.findIndex(
                          r => r._id === item._id && r.type !== 'category'
                        );
                        const isSelected = flatIndex === selectedIndex;

                        return (
                          <button
                            key={item._id}
                            onClick={() => handleResultClick(item.route)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary-50 border-l-2 border-primary-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium truncate ${
                                  isSelected ? 'text-primary-700' : 'text-gray-900'
                                }`}>
                                  {item.label}
                                </p>
                                {item._score >= 500 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Exact match
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            <FiArrowRight className={`w-4 h-4 flex-shrink-0 ml-3 ${
                              isSelected ? 'text-primary-600' : 'text-gray-400'
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        {totalResults > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">ESC</kbd>
                to close
              </span>
            </div>
            <span>{totalResults} total results</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;