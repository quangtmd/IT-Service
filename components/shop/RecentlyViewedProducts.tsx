import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { getProducts } from '../../services/localDataService';

interface RecentlyViewedProductsProps {
    currentProductId: string;
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({ currentProductId }) => {
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
    const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

    useEffect(() => {
        const fetchViewedProducts = async () => {
            const storedIdsRaw = localStorage.getItem(RECENTLY_VIEWED_KEY);
            const storedIds: string[] = storedIdsRaw ? JSON.parse(storedIdsRaw) : [];
            
            // Filter out the current product from the "recently viewed" list itself
            const idsToFetch = storedIds.filter(id => id !== currentProductId).slice(0, 4);

            if (idsToFetch.length > 0) {
                try {
                    const allProducts = await getProducts();
                    const products = idsToFetch
                        // FIX: Compare product ID (number) with stored ID (string) correctly.
                        .map(id => allProducts.find(p => String(p.id) === id))
                        .filter((p): p is Product => p !== undefined);
                    setViewedProducts(products);
                } catch (error) {
                    console.error("Error fetching recently viewed products:", error);
                }
            }
        };

        fetchViewedProducts();
    }, [currentProductId]); // Rerun when the current product changes

    if (viewedProducts.length === 0) {
        return (
            <div className="bg-bgBase p-4 rounded-lg shadow-md border border-borderDefault sticky top-24 text-center">
                 <h3 className="text-lg font-semibold text-textBase mb-2">Sản phẩm vừa xem</h3>
                 <p className="text-sm text-textMuted">Chưa có sản phẩm nào được xem gần đây.</p>
            </div>
        );
    }

    return (
        <div className="bg-bgBase p-4 rounded-lg shadow-md border border-borderDefault sticky top-24">
            <h3 className="text-lg font-semibold text-textBase mb-4 border-b border-borderDefault pb-2">Sản phẩm vừa xem</h3>
            <div className="space-y-4">
                {viewedProducts.map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="flex items-start gap-3 group">
                        <img 
                            // FIX: Use 'images' property which exists on the Product type, instead of 'imageUrls'.
                            src={product.images?.[0] || ''}
                            alt={product.name}
                            className="w-16 h-16 object-contain rounded-md border border-borderDefault flex-shrink-0"
                        />
                        <div>
                            <p className="text-sm font-medium text-textBase group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {product.name}
                            </p>
                            <p className="text-sm font-bold text-primary mt-1">
                                {product.price.toLocaleString('vi-VN')}₫
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewedProducts;