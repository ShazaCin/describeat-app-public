import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../hooks/useStore';
import { TitleType } from '../types';
import Icon, { type IconName } from '../components/ui/Icon';

const MAIN_CATEGORIES = [
    { id: 'movies', name: 'Movies', type: 'movie' as TitleType, icon: 'movies' as IconName },
    { id: 'tv-shows', name: 'TV Shows', type: 'tv-show' as TitleType, icon: 'tv' as IconName },
    { id: 'podcasts', name: 'Podcasts', type: 'podcast' as TitleType, icon: 'podcasts' as IconName },
    { id: 'books', name: 'Books', type: 'book' as TitleType, icon: 'books' as IconName },
    { id: 'tours', name: 'Tours', type: 'tour' as TitleType, icon: 'tours' as IconName },
];

const SimplifiedHomePage: React.FC = () => {
    const { titles, loading } = useStore();

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        MAIN_CATEGORIES.forEach(category => {
            counts[category.id] = titles.filter(title => title.type === category.type).length;
        });
        return counts;
    }, [titles]);

    if (loading) {
        return (
            <div className="w-full" role="status" aria-live="polite">
                <div className="flex items-center justify-center h-64">
                    <p className="text-brand-text-secondary">Loading content...</p>
                </div>
            </div>
        );
    }

    if (titles.length === 0) {
        return (
            <div className="w-full" role="status" aria-live="polite">
                <div className="flex items-center justify-center h-64">
                    <p className="text-brand-text-secondary">No content available yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full" role="status" aria-live="polite">
            {/* Header */}
            <div className="px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-brand-text mb-2">Welcome to describeAT</h1>
                <p className="text-brand-text-secondary">Choose a category to explore audio described content</p>
            </div>

            {/* Main Categories */}
            <section className="px-4 pb-8">
                <h2 className="text-2xl font-bold text-brand-text mb-6">Browse by Category</h2>
                <div className="space-y-3">
                    {MAIN_CATEGORIES.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/category/${category.id}`}
                                className="flex items-center gap-4 p-4 bg-brand-surface rounded-lg hover:bg-brand-surface-light transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                                role="button"
                                aria-label={`${category.name}, ${categoryCounts[category.id] || 0} ${(categoryCounts[category.id] || 0) === 1 ? 'item' : 'items'}`}
                            >
                                <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
                                    <Icon name={category.icon} className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-brand-text-secondary">
                                        {categoryCounts[category.id] || 0} {(categoryCounts[category.id] || 0) === 1 ? 'item' : 'items'} available
                                    </p>
                                </div>
                                <Icon name="arrow-right" className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-primary transition-colors flex-shrink-0" aria-hidden="true" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SimplifiedHomePage;
