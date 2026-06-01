/** UI constants for the storefront (catalog data lives in MongoDB / API) */

export const PRODUCT_CATEGORIES = ['Sports', 'Gaming', 'Music', 'Travel'];

export const SHOP_FILTER_CATEGORIES = ['All', ...PRODUCT_CATEGORIES];

export const PRODUCT_SIZES = [
  'Small (2×3 ft)',
  'Medium (3×5 ft)',
  'Large (4×6 ft)',
  'XL (5×8 ft)',
];

export const homeCategoryCards = [
  {
    id: 1,
    title: 'Sports',
    description: 'Football, cricket, basketball & more. Rep your team on your wall.',
    bg: '#dbeafe',
    gif: '/gifs/sports.gif',
  },
  {
    id: 2,
    title: 'Gaming',
    description: 'Level up your gaming den with flags that match your setup.',
    bg: '#ede9fe',
    gif: '/gifs/gaming.gif',
  },
  {
    id: 3,
    title: 'Music',
    description: 'Rock, hip-hop, artists & bands. Wear your music on your walls.',
    bg: '#ffedd5',
    gif: '/gifs/music.gif',
  },
  {
    id: 4,
    title: 'Travel',
    description: 'Countries, cities & destinations. Fly your flag from around the world.',
    bg: '#dcfce7',
    gif: '/gifs/travel.gif',
  },
];
