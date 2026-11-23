import type { ProductsResponse } from '../types/api';

export async function getProducts(): Promise<ProductsResponse> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized access');
    }
    if (response.status === 404) {
      throw new Error('Products not found');
    }
    if (response.status === 500) {
      throw new Error('Server error');
    }

    throw new Error('Failed to fetch products');
  }

  const data: ProductsResponse = await response.json();

  return data;
}
