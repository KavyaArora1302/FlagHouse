/** Local product image paths — served from frontend/public/products/ */

export const catalogImagePath = (legacyId) => `/products/${legacyId}.jpg`;

export const withCatalogImages = (products) =>
  products.map((product) => ({
    ...product,
    image: catalogImagePath(product.legacyId),
  }));
