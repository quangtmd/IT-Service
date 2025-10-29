import React, { useState, useEffect, useRef } from 'react';
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

                setProducts(filteredProducts.slice(0, 8)); // Load more products for carousel
            } catch (err) {
                console.error(`Error loading products for carousel "${title}":`, err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [categoryName, filterTag, title]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.offsetWidth * 0.75;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

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
                <div className="bg-white p-6 rounded-b-lg shadow-md border-x border-b border-borderDefault relative">
                    {isLoading ? (
                        <div className="text-center py-10 text-textMuted">Đang tải sản phẩm...</div>
                    ) : (
                        <>
                            <div
                                ref={scrollContainerRef}
                                className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth"
                            >
                                {products.map((product) => (
                                    <div key={product.id} className="w-64 flex-shrink-0">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                            {products.length > 4 && (
                                <>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleScroll('left')}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 shadow-lg border hidden md:flex"
                                    aria-label="Previous Products"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleScroll('right')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 shadow-lg border hidden md:flex"
                                    aria-label="Next Products"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductCarouselSection;