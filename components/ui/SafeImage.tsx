import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/assets/brandmark_white.svg',
  loading = 'lazy',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // If source changes, reset error state
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      loading={loading}
      className={`${className} ${hasError ? 'object-contain p-4 bg-brand-surface' : ''}`}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;