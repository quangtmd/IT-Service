
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import Button from '../ui/Button';
import SkeletonProductCard from './SkeletonProductCard';
import BackendConnectionError from '../shared/BackendConnectionError';
import { getProducts } from '../../services/localDataService';
import { getFeaturedProducts } from '../../services/localDataService'; // Import for featured products

interface ShopProductSectionProps {
  title: string;
  linkToAll: string; // Link to view all products in this section
  fetchParams?: string; // Query params string for fetching, e.g., 'mainCategory=laptop&limit=4'
  fetchType?: 'featured' | 'custom'; // 'featured' uses getFeaturedProducts, 'custom' uses getProducts with fetchParams
  limit?: number; // Max number of products to show in this section
}

const ShopProductSection: React.FC<ShopProductSectionProps> = ({ 
  title, 
  linkToAll, 
  fetchParams = '', 
  fetchType = 'custom', 
  limit = 4 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedProducts: Product[] = [];
      if (fetchType === 'featured') {
        fetchedProducts = await getFeaturedProducts();
      } else { // fetchType === 'custom'
        const params = new URLSearchParams(fetchParams);
        if (!params.has('limit')) {
          params.set('limit', String(limit));
        }
        const { products: customProducts } = await getProducts(params.toString());
        fetchedProducts = customProducts;
      }
      setProducts(fetchedProducts.slice(0, limit)); // Ensure limit is applied
    } catch (err) {
      setError(err instanceof Error ? err.message : `Lỗi khi tải ${title.toLowerCase()}.`);
      console.error(`Lỗi khi tải ${title.toLowerCase()}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchParams, fetchType, limit, title]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (error) {
    return (
      <section className="py-8 bg-bgCanvas">
        <div className="container mx-auto px-4">
          <BackendConnectionError error={error} />
        </div>
      </section>
    );
  }

  if (products.length === 0 && !isLoading) {
    return null; // Don't render section if no products and not loading
  }

  return (
    <section className="py-8 md:py-10 bg-bgCanvas">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-baseline mb-6 border-b border-borderDefault pb-3">
          <h2 className="text-2xl font-bold text-textBase">{title}</h2>
          <Link to={linkToAll} className="text-primary hover:text-primary-dark font-medium text-sm flex items-center group">
            Xem tất cả <i className="fas fa-arrow-right ml-1 text-xs group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: limit }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopProductSection;
    