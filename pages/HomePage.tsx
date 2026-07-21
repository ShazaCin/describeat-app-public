import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../hooks/useStore';
import { TitleType } from '../types';
import Icon, { type IconName } from '../components/ui/Icon';
import SafeImage from '../components/ui/SafeImage';
import SimplifiedHomePage from './SimplifiedHomePage';

const MAIN_CATEGORIES = [
    { id: 'movies', name: 'Movies', type: 'movie' as TitleType, icon: 'movies' as IconName, color: 'bg-yellow-500' },
    { id: 'tv-shows', name: 'TV Shows', type: 'tv-show' as TitleType, icon: 'tv' as IconName, color: 'bg-blue-500' },
    { id: 'podcasts', name: 'Podcasts', type: 'podcast' as TitleType, icon: 'podcasts' as IconName, color: 'bg-orange-500' },
    { id: 'books', name: 'Books', type: 'book' as TitleType, icon: 'books' as IconName, color: 'bg-green-500' },
    { id: 'tours', name: 'Tours', type: 'tour' as TitleType, icon: 'tours' as IconName, color: 'bg-purple-500' },
];

const CategoryCard: React.FC<{ category: typeof MAIN_CATEGORIES[0]; count: number }> = ({ category, count }) => {
    const label = `${category.name}, ${count} ${count === 1 ? 'item' : 'items'} available`;
    return (
        <Link
            to={`/category/${category.id}`}
            aria-label={label}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-xl"
        >
            <div className="bg-brand-surface rounded-xl p-6 hover:bg-brand-surface-light transition-all duration-300 group-hover:scale-105" aria-hidden="true">
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon name={category.icon} className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors mb-2">
                    {category.name}
                </h2>
                <p className="text-brand-text-secondary">
                    {count} {count === 1 ? 'item' : 'items'} available
                </p>
            </div>
        </Link>
    );
};

const FeaturedSection: React.FC = () => {
    const { titles } = useStore();

    const featuredTitles = useMemo(() => {
        return titles
            .filter(title => title.categories.includes('Featured'))
            .slice(0, 6);
    }, [titles]);

    if (featuredTitles.length === 0) return null;

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-text mb-6 px-4">Featured Content</h2>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
                {featuredTitles.map(title => (
                    <Link
                        key={title.titleId}
                        to={`/title/${title.titleId}`}
                        className="flex-shrink-0 w-36 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg"
                        aria-label={`${title.title}, ${title.year}`}
                    >
                        <div className="aspect-[2/3] w-full bg-brand-surface rounded-lg overflow-hidden relative" aria-hidden="true">
                            <SafeImage
                                src={title.images.poster}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-sm font-semibold truncate">{title.title}</p>
                                <p className="text-white/80 text-xs">{title.year}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
    const { titles, loading, error, useSimplifiedLayout } = useStore();

    // If simplified layout is enabled, show the simplified home page
    if (useSimplifiedLayout) {
        return <SimplifiedHomePage />;
    }

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        MAIN_CATEGORIES.forEach(category => {
            counts[category.id] = titles.filter(title => title.type === category.type).length;
        });
        return counts;
    }, [titles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-brand-text-secondary">Loading your content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-center p-4" role="status" aria-live="polite">
                <div>
                    <Icon name="alert-circle" className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-brand-text mb-2">Something went wrong</h2>
                    <p className="text-brand-text-secondary">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-brand-text mb-2">Welcome to describeAT</h1>
                <p className="text-brand-text-secondary">Choose a category to explore audio described content</p>
            </div>

            {/* Featured Content */}
            <FeaturedSection />

            {/* Main Categories */}
            <section className="px-4 pb-8">
                <h2 className="text-2xl font-bold text-brand-text mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {MAIN_CATEGORIES.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <CategoryCard
                                category={category}
                                count={categoryCounts[category.id] || 0}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;