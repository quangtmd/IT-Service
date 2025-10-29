import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import Button from '../ui/Button';
import { getProducts } from '../../services/localDataService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface ProductCarouselSectionProps {
    title: string;
    categoryName?: string;
    filterTag?: string;
    viewAllLink: string;
    bgColor?: string;
    textColor?: string;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({ 
    title, 
    categoryName, 
    filterTag,
    viewAllLink, 
    bgColor = 'bg-primary', 
    textColor = 'text-white' 
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const allProducts = await getProducts();
                let filteredProducts;

                if (filterTag) {
                    filteredProducts = allProducts.filter(p => Array.isArray(p.tags) && p.tags.includes(filterTag) && p.isVisible !== false);
                } else if (categoryName) {
                    filteredProducts = allProducts.filter(p => (p.mainCategory === categoryName || p.subCategory === categoryName) && p.isVisible !== false);
                } else {
                    filteredProducts = allProducts.filter(p => p.isVisible !== false);
                }

                setProducts(filteredProducts.slice(0, 4));
            } catch (err) {
                console.error(`Error loading products for carousel "${title}":`, err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [categoryName, filterTag, title]);

    if (products.length === 0 && !isLoading) {
        return null;
    }

    return (
        <section 
            ref={ref}
            className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}
        >
            <div className="container mx-auto px-4">
                <div className={`${bgColor} rounded-t-lg shadow-md`}>
                    <div className="flex justify-between items-center py-4 px-5">
                        <h2 className={`text-2xl md:text-3xl font-extrabold font-condensed ${textColor}`}>{title}</h2>
                        <Link to={viewAllLink}>
                            <Button size="sm" variant="outline" className={`border-white/50 ${textColor} hover:bg-white hover:text-primary`}>
                                Xem tất cả <i className="fas fa-chevron-right ml-2 text-xs"></i>
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-b-lg shadow-md border-x border-b border-borderDefault">
                    {isLoading ? (
                        <div className="text-center py-10 text-textMuted">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {products.map((product) => (
                                <div key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductCarouselSection;