/** Default catalog image path by legacy product id */
export const productImagePath = (id) => `/products/${id}.jpg`;

/** Resolve image URL from a product object or id + optional image field */
export const resolveProductImage = (productOrId, imageOverride) => {
  if (imageOverride) return imageOverride;

  if (typeof productOrId === 'object' && productOrId) {
    if (productOrId.image) return productOrId.image;
    if (productOrId.id) return productImagePath(productOrId.id);
    if (productOrId.productId) return productImagePath(productOrId.productId);
    return null;
  }

  if (productOrId) return productImagePath(productOrId);
  return null;
};
