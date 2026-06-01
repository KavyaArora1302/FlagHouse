/** Shape MongoDB product documents for the React storefront */
export const formatProduct = (doc) => {
  const product = doc.toObject ? doc.toObject() : doc;

  return {
    id: product.legacyId,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    tag: product.tag ?? null,
    rating: product.rating,
    reviews: product.reviews,
    description: product.description,
    featured: Boolean(product.featured),
    image: product.image ?? null,
  };
};
