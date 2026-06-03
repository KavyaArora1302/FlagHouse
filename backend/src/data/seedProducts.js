/** Catalog seed data — mirrors frontend/src/data/products.js */

import { withCatalogImages } from './productImages.js';

export const FEATURED_LEGACY_IDS = [1, 5, 9, 13];

const rawSeedProducts = [
  {
    legacyId: 1,
    name: 'India Cricket Flag',
    category: 'Sports',
    price: 499,
    originalPrice: 699,
    tag: 'Bestseller',
    rating: 4.8,
    reviews: 124,
    description:
      'Show your love for Indian cricket with this premium quality wall flag. Made from thick polyester fabric with vivid, fade-resistant printing. Perfect for your room, study, or sports den.',
  },
  {
    legacyId: 2,
    name: 'FC Barcelona Flag',
    category: 'Sports',
    price: 449,
    originalPrice: null,
    tag: 'New',
    rating: 4.6,
    reviews: 38,
    description:
      'Rep your favourite football club with this bold and vibrant FC Barcelona wall flag. Great gift for any football fan.',
  },
  {
    legacyId: 3,
    name: 'NBA Lakers Flag',
    category: 'Sports',
    price: 399,
    originalPrice: 549,
    tag: 'Sale',
    rating: 4.5,
    reviews: 61,
    description:
      'Purple and gold all the way! This Lakers fan flag brings the LA spirit straight to your walls.',
  },
  {
    legacyId: 4,
    name: 'Chess Club Flag',
    category: 'Sports',
    price: 349,
    originalPrice: null,
    tag: null,
    rating: 4.3,
    reviews: 19,
    description: 'A minimalist flag for the chess enthusiast. Clean design, great print quality.',
  },
  {
    legacyId: 5,
    name: 'Gaming Setup Flag',
    category: 'Gaming',
    price: 399,
    originalPrice: null,
    tag: 'New',
    rating: 4.7,
    reviews: 55,
    description:
      'The ultimate flag for your gaming setup. Features a sleek neon design on dark background — looks incredible under RGB lighting.',
  },
  {
    legacyId: 6,
    name: 'PS5 Fan Flag',
    category: 'Gaming',
    price: 449,
    originalPrice: 599,
    tag: 'Sale',
    rating: 4.6,
    reviews: 47,
    description: 'PlayStation fans, this one is for you. Crisp logo print on high-quality fabric.',
  },
  {
    legacyId: 7,
    name: 'Minecraft World Flag',
    category: 'Gaming',
    price: 379,
    originalPrice: null,
    tag: null,
    rating: 4.4,
    reviews: 33,
    description:
      'Build your wall like you build your world. A Minecraft-themed flag that every gamer will love.',
  },
  {
    legacyId: 8,
    name: 'Esports Team Flag',
    category: 'Gaming',
    price: 499,
    originalPrice: null,
    tag: 'Bestseller',
    rating: 4.9,
    reviews: 88,
    description:
      'Rep your esports team with this sharp, vivid flag. Great for streaming rooms and gaming setups.',
  },
  {
    legacyId: 9,
    name: 'Rock Band Classic',
    category: 'Music',
    price: 449,
    originalPrice: 599,
    tag: 'Sale',
    rating: 4.7,
    reviews: 72,
    description:
      'A timeless flag for rock music lovers. Features iconic band artwork on premium fabric.',
  },
  {
    legacyId: 10,
    name: 'Hip Hop Legends Flag',
    category: 'Music',
    price: 399,
    originalPrice: null,
    tag: null,
    rating: 4.5,
    reviews: 41,
    description:
      'Pay tribute to the legends of hip hop with this bold wall flag. A conversation starter for any room.',
  },
  {
    legacyId: 11,
    name: 'Jazz Vibes Flag',
    category: 'Music',
    price: 349,
    originalPrice: null,
    tag: 'New',
    rating: 4.4,
    reviews: 14,
    description:
      'Smooth, stylish, and soulful — just like jazz itself. Perfect for music lovers and collectors.',
  },
  {
    legacyId: 12,
    name: 'Vinyl Record Art Flag',
    category: 'Music',
    price: 429,
    originalPrice: 499,
    tag: null,
    rating: 4.6,
    reviews: 29,
    description:
      'A beautiful artistic flag inspired by the golden age of vinyl records. Minimal and stunning.',
  },
  {
    legacyId: 13,
    name: 'World Map Minimalist Flag',
    category: 'Travel',
    price: 349,
    originalPrice: null,
    tag: null,
    rating: 4.5,
    reviews: 36,
    description:
      'A clean world-map design for travellers and dreamers. Adds a sophisticated wanderlust vibe to any room.',
  },
  {
    legacyId: 14,
    name: 'Sunset Horizon Flag',
    category: 'Travel',
    price: 379,
    originalPrice: null,
    tag: 'New',
    rating: 4.8,
    reviews: 52,
    description:
      'Warm sunset tones inspired by destinations around the globe. Gorgeous on any wall with natural light.',
  },
  {
    legacyId: 15,
    name: 'Vintage Passport Stamp Flag',
    category: 'Travel',
    price: 399,
    originalPrice: 499,
    tag: 'Sale',
    rating: 4.6,
    reviews: 44,
    description:
      'Retro passport-stamp artwork for explorers and collectors. Brings character to your travel corner.',
  },
  {
    legacyId: 16,
    name: 'City Skyline Line Art Flag',
    category: 'Travel',
    price: 329,
    originalPrice: null,
    tag: null,
    rating: 4.4,
    reviews: 22,
    description:
      'Striking skyline line art celebrating iconic cities. Simple, bold, and perfect for urban travel lovers.',
  },
].map((product) => ({
  ...product,
  featured: FEATURED_LEGACY_IDS.includes(product.legacyId),
}));

export const seedProducts = withCatalogImages(rawSeedProducts);
