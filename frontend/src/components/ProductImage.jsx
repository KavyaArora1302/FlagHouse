import { useState } from 'react';
import { resolveProductImage } from '../utils/productImage';

const ProductImage = ({
  product,
  productId,
  image,
  alt = 'Product',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackClassName = 'text-5xl',
  fallbackEmoji = '🚩',
}) => {
  const [failed, setFailed] = useState(false);
  const src = resolveProductImage(product ?? productId, image);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        aria-hidden={!alt}
      >
        <span className={fallbackClassName}>{fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-gray-100 ${className}`}>
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default ProductImage;
