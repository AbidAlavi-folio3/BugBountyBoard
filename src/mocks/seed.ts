import type { Category, Product } from '../types/api';
const categories: Category[] = ['keyboards', 'ducks', 'coffee', 'stickers'];
const names: Record<Category, string[]> = {
  keyboards: [
    'Mechanical Keyboard',
    'Low Profile Keyboard',
    'Split Ergonomic Keyboard',
    'RGB Keyboard',
    'Compact 60% Keyboard',
  ],
  ducks: [
    'Debugging Rubber Duck',
    'Ninja Rubber Duck',
    'Astronaut Rubber Duck',
    'Pixel Rubber Duck',
    'Classic Yellow Duck',
  ],
  coffee: [
    'Developer Coffee Beans',
    'Midnight Espresso',
    'Code Fuel Blend',
    'Cold Brew Kit',
    'Coffee Mug',
  ],
  stickers: [
    'Ship It Sticker Pack',
    'Syntax Error Stickers',
    'Git Commit Stickers',
    'Pixel Art Stickers',
    'Open Source Stickers',
  ],
};
const emoji: Record<Category, string> = {
  keyboards: '⌨️',
  ducks: '🦆',
  coffee: '☕',
  stickers: '✨',
};
export const PRODUCTS: Product[] = Array.from({ length: 5000 }, (_, i) => {
  const category = categories[i % 4];
  const name = names[category][Math.floor(i / 4) % 5];
  return {
    id: `p${i + 1}`,
    name: `${name} ${String(Math.floor(i / 20) + 1).padStart(3, '0')}`,
    price: 499 + ((i * 137) % 14500),
    category,
    stock: i % 19 === 0 ? 0 : 1 + (i % 24),
    rating: Math.round((3 + (i % 21) / 10) * 10) / 10,
    imageUrl: emoji[category],
  };
});
