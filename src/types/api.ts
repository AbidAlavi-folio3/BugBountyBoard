export type Category = 'keyboards' | 'ducks' | 'coffee' | 'stickers';
export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: number;
  rating: number;
  imageUrl: string;
};
export type ProductsResponse = { items: Product[]; total: number };
export type ApiError = {
  error: { code: string; message: string; details?: Record<string, string> };
};
export type User = { id: string; name: string; email: string };
export type LoginResponse = { token: string; user: User };
export type Order = { id: string; status: 'queued' };
export type CartLine = { product: Product; quantity: number };
export type Sort = 'featured' | 'price-asc' | 'price-desc' | 'rating';
export type Filters = {
  search: string;
  category: Category | '';
  sort: Sort;
  page: number;
  inStock: boolean;
};
export type RemoteError = {
  status: 'error';
  message: string;
  /** HTTP status when the server answered; undefined for network failures. */
  httpStatus?: number;
  /** True when trying the same request again could succeed (network or 5xx). */
  retryable: boolean;
};
export type Remote<T> = { status: 'loading' } | { status: 'success'; data: T } | RemoteError;
