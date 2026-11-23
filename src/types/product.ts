export type Product = {
  id: string;
  name: string;
  price: number;
  category: 'keyboards' | 'ducks' | 'coffee' | 'stickers';
  stock: number;
  rating: number;
  imageUrl: string;
};
