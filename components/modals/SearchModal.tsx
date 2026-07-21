import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useStore from '../../hooks/useStore';
import Icon from '../ui/Icon';
import SafeImage from '../ui/SafeImage';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const SearchModal: React.FC = () => {
    const { isSearchOpen, closeSearch, titles, recentSearches, addRecentSearch } = useStore();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const modalRef = useFocusTrap<HTMLDivElement>(isSearchOpen);

    const searchResults = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        const lowerQuery = debouncedQuery.toLowerCase();
        return titles.filter(title =>
            title.title.toLowerCase().includes(lowerQuery) ||
            title.synopsis.toLowerCase().includes(lowerQuery) ||
            title.actors?.some(a => a.toLowerCase().includes(lowerQuery)) ||
            title.directors?.some(d => d.toLowerCase().includes(lowerQuery))
        ).slice(0, 15);
    }, [debouncedQuery, titles]);

    const handleSearchSubmit = (searchTerm: string) => {
        if (searchTerm.trim()) {
            addRecentSearch(searchTerm.trim());
        }
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(value);
        }, 300);
    };

    useEffect(() => {
        if (!isSearchOpen) {
            setTimeout(() => { setQuery(''); setDebouncedQuery(''); }, 300);
        }
    }, [isSearchOpen]);

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-brand-bg flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search"
                >
                    <header className="flex items-center gap-2 p-4 border-b border-brand-surface-light flex-shrink-0">
                        <button
                            onClick={closeSearch}
                            aria-label="Close search"
                            className="focus-visible:ring-2 focus-visible:ring-brand-primary rounded-full p-2"
                        >
                            <Icon name="close" className="w-6 h-6 text-brand-text-secondary" />
                            <span className="sr-only">Close search</span>
                        </button>
                        <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(query); }} className="relative flex-1">
                            <input
                                type="search"
                                placeholder="Search titles, actors, directors..."
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                className="w-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-2 py-1 text-lg text-brand-text"
                                autoFocus
                            />
                        </form>
                        <button
                            type="submit"
                            onClick={() => handleSearchSubmit(query)}
                            aria-label="Submit search"
                            className="p-2 focus-visible:ring-2 focus-visible:ring-brand-primary rounded-full"
                        >
                            <Icon name="search" className="w-6 h-6 text-brand-primary" />
                            <span className="sr-only">Submit search</span>
                        </button>
                    </header>
                    <div className="p-4 overflow-y-auto">
                        {query.trim() === '' ? (
                            <div>
                                <h2 className="text-brand-text-secondary font-semibold mb-3">Recent Searches</h2>
                                <ul className="space-y-3">
                                    {recentSearches.map((term, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => setQuery(term)}
                                                className="w-full flex items-center justify-between group cursor-pointer text-left p-2 rounded-lg hover:bg-brand-surface-light focus-visible:ring-2 focus-visible:ring-brand-primary focus:outline-none"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Icon name="clock" className="w-5 h-5 text-brand-text-secondary" />
                                                    <span className="text-lg">{term}</span>
                                                </div>
                                                <Icon name="forward" className="w-5 h-5 text-brand-text-secondary rotate-[-45deg] group-hover:text-white" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-brand-text-secondary font-semibold mb-3">Results for "{query}"</h2>
                                {searchResults.length > 0 ? (
                                    <ul className="space-y-2">
                                        {searchResults.map(title => (
                                            <li key={title.titleId}>
                                                <Link to={`/title/${title.titleId}`} onClick={closeSearch} className="flex items-center gap-4 p-2 rounded-lg hover:bg-brand-surface-light group focus-visible:ring-2 focus-visible:ring-brand-primary focus:outline-none">
                                                    <SafeImage src={title.images.poster} alt={title.title} className="w-10 h-14 object-cover rounded-md flex-shrink-0" />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-brand-text truncate">{title.title}</p>
                                                        <p className="text-sm text-brand-text-secondary truncate">{title.year}</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-brand-text-secondary text-center py-8" role="status" aria-live="polite">No results found. Try a different search term or browse categories.</p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;