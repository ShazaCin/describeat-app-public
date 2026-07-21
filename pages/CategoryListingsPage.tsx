import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../hooks/useStore';
import { Title, TitleType } from '../types';
import Icon from '../components/ui/Icon';
import SafeImage from '../components/ui/SafeImage';

const MAIN_CATEGORIES = {
  movies: { id: 'movie' as TitleType, name: 'Movies', icon: 'movies' },
  'tv-shows': { id: 'tv-show' as TitleType, name: 'TV Shows', icon: 'tv' },
  podcasts: { id: 'podcast' as TitleType, name: 'Podcasts', icon: 'podcasts' },
  books: { id: 'book' as TitleType, name: 'Books', icon: 'books' },
  tours: { id: 'tour' as TitleType, name: 'Tours', icon: 'tours' },
} as const;

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'movie':
      return 'bg-yellow-400 text-black';
    case 'series':
    case 'tv-show':
    case 'episode':
      return 'bg-blue-500 text-white';
    case 'book':
    case 'chapter':
      return 'bg-green-600 text-white';
    case 'tour':
      return 'bg-purple-600 text-white';
    case 'podcast':
      return 'bg-orange-600 text-white';
    default:
      return 'bg-brand-surface text-brand-text-secondary';
  }
};

const TitleCard: React.FC<{ title: Title }> = ({ title }) => {
  return (
    <Link
      to={`/title/${title.titleId}`}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg"
    >
      <div className="bg-brand-surface rounded-lg overflow-hidden hover:bg-brand-surface-light transition-colors">
        <div className="aspect-[2/3] w-full bg-brand-surface-light relative overflow-hidden">
          <SafeImage 
            src={title.images.poster} 
            alt={title.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTypeStyles(title.type)} shadow-lg`}>
            {title.type}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2 mb-1">
            {title.title}
          </h3>
          <p className="text-sm text-brand-text-secondary mb-2">{title.year}</p>
          {title.synopsis && (
            <p className="text-xs text-brand-text-secondary line-clamp-3">
              {title.synopsis}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

const TitleRow: React.FC<{ title: Title }> = ({ title }) => {
  return (
    <Link
      to={`/title/${title.titleId}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-surface-light group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      <SafeImage
        src={title.images.poster}
        alt={title.title}
        className="w-16 h-20 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTypeStyles(title.type)}`}>
            {title.type}
          </span>
          <h3 className="font-semibold text-brand-text group-hover:text-brand-primary transition-colors truncate">
            {title.title}
          </h3>
        </div>
        <p className="text-sm text-brand-text-secondary mb-1">
          {title.year} {title.genre?.[0] && `• ${title.genre[0]}`}
        </p>
        {title.synopsis && (
          <p className="text-xs text-brand-text-secondary line-clamp-2">
            {title.synopsis}
          </p>
        )}
      </div>
      <Icon name="arrow-right" className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-primary transition-colors flex-shrink-0" />
    </Link>
  );
};

const CategoryListingsPage: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string; subCategorySlug: string }>();
  const { titles, viewMode } = useStore();

  const categoryConfig = categorySlug ? MAIN_CATEGORIES[categorySlug as keyof typeof MAIN_CATEGORIES] : null;

  const { subCategoryName, filteredTitles } = useMemo(() => {
    if (!categoryConfig || !subCategorySlug) {
      return { subCategoryName: '', filteredTitles: [] };
    }

    // Convert slug back to category name
    const subCategoryName = subCategorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Filter titles by type and category
    const filtered = titles.filter(title => 
      title.type === categoryConfig.id && 
      title.categories.some(cat => 
        cat.toLowerCase().replace(/\s+/g, '-') === subCategorySlug
      )
    );

    // Sort by year (newest first)
    filtered.sort((a, b) => (b.year || 0) - (a.year || 0));

    return { subCategoryName, filteredTitles: filtered };
  }, [titles, categoryConfig, subCategorySlug]);

  if (!categoryConfig || !subCategorySlug) {
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
                          to={`/category/${categorySlug}`}
                          className="p-2 text-brand-text hover:text-brand-primary rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                          aria-label={`Back to ${categoryConfig.name}`}
                        >
                          <Icon name="arrow-left" className="w-5 h-5" />
                          <span className="sr-only">{`Back to ${categoryConfig.name}`}</span>
                        </Link>
            <Icon name={categoryConfig.icon} className="w-6 h-6 text-brand-primary" />
            <div>
              <h1 className="text-2xl font-bold text-brand-text">{subCategoryName}</h1>
              <p className="text-sm text-brand-text-secondary">
                {categoryConfig.name} • {filteredTitles.length} {filteredTitles.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredTitles.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredTitles.map((title, index) => (
                <motion.div
                  key={title.titleId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TitleCard title={title} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTitles.map((title, index) => (
                <motion.div
                  key={title.titleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TitleRow title={title} />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Icon name={categoryConfig.icon} className="w-24 h-24 mb-6 opacity-30 text-brand-text-secondary" />
            <h2 className="text-2xl font-bold text-brand-text mb-2">No {categoryConfig.name} Found</h2>
            <p className="text-brand-text-secondary mb-6">
              We don't have any {categoryConfig.name.toLowerCase()} in the "{subCategoryName}" category yet.
            </p>
            <Link 
              to={`/category/${categorySlug}`}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Browse Other Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListingsPage;