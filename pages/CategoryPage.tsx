import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../hooks/useStore';
import { TitleType } from '../types';
import Icon from '../components/ui/Icon';

const MAIN_CATEGORIES = {
  movies: { id: 'movie' as TitleType, name: 'Movies', icon: 'movies' },
  'tv-shows': { id: 'tv-show' as TitleType, name: 'TV Shows', icon: 'tv' },
  podcasts: { id: 'podcast' as TitleType, name: 'Podcasts', icon: 'podcasts' },
  books: { id: 'book' as TitleType, name: 'Books', icon: 'books' },
  tours: { id: 'tour' as TitleType, name: 'Tours', icon: 'tours' },
} as const;

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { titles } = useStore();

  const categoryConfig = categorySlug ? MAIN_CATEGORIES[categorySlug as keyof typeof MAIN_CATEGORIES] : null;

  const subCategories = useMemo(() => {
    if (!categoryConfig) return [];

    // Get all titles of this type
    const titlesOfType = titles.filter(title => title.type === categoryConfig.id);
    
    // Extract unique sub-categories from these titles
    const subCatMap = new Map<string, number>();
    
    titlesOfType.forEach(title => {
      title.categories.forEach(cat => {
        // Skip generic categories like "Featured", "Latest"
        if (!['Featured', 'Latest', 'New'].includes(cat)) {
          subCatMap.set(cat, (subCatMap.get(cat) || 0) + 1);
        }
      });
    });

    return Array.from(subCatMap.entries())
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [titles, categoryConfig]);

  if (!categoryConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <Icon name="search" className="w-24 h-24 mb-6 opacity-30 text-brand-text-secondary" />
        <h1 className="text-2xl font-bold text-brand-text mb-2">Category Not Found</h1>
        <p className="text-brand-text-secondary mb-6">The category you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10 border-b border-brand-surface-light">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Link 
                          to="/" 
                          className="p-2 text-brand-text hover:text-brand-primary rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                          aria-label="Back to home"
                        >
                          <Icon name="arrow-left" className="w-5 h-5" />
                          <span className="sr-only">Back to home</span>
                        </Link>
            <Icon name={categoryConfig.icon} className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-bold text-brand-text">{categoryConfig.name}</h1>
          </div>
          <p className="text-brand-text-secondary ml-11">
            Choose a category to explore {categoryConfig.name.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Sub-categories Grid */}
      <div className="p-4">
        {subCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories.map((subCat, index) => (
              <motion.div
                key={subCat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                                  to={`/category/${categorySlug}/${subCat.id}`}
                                  className="block p-6 bg-brand-surface rounded-lg hover:bg-brand-surface-light transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                                  aria-label={`${subCat.name}, ${subCat.count} ${subCat.count === 1 ? 'item' : 'items'}`}
                                >
                                <div className="flex items-center justify-between mb-2" aria-hidden="true">
                                    <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                                      {subCat.name}
                                    </h3>
                                    <Icon name="arrow-right" className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-primary transition-colors" aria-hidden="true" />
                                  </div>
                                  <p className="text-brand-text-secondary" aria-hidden="true">
                                    {subCat.count} {subCat.count === 1 ? 'item' : 'items'}
                                  </p>
                                  <span className="sr-only">{`${subCat.name}, ${subCat.count} ${subCat.count === 1 ? 'item' : 'items'}`}</span>
                                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Icon name={categoryConfig.icon} className="w-24 h-24 mb-6 opacity-30 text-brand-text-secondary" />
            <h2 className="text-2xl font-bold text-brand-text mb-2">No Categories Found</h2>
            <p className="text-brand-text-secondary">
              We don't have any {categoryConfig.name.toLowerCase()} categories available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;