import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../shop/ProductCard';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { getProducts } from '../../services/localDataService';
import SkeletonProductCard from './SkeletonProductCard';

interface ProductCarouselSectionProps {
    title: string;
    filterParams: Record<string, string | number>;
    viewAllLink: string;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({ title, filterParams, viewAllLink }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const query = new URLSearchParams(filterParams as any).toString();
                const { products: fetchedProducts } = await getProducts(query);
                setProducts(fetchedProducts);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể tải sản phẩm.");
                console.error(`Lỗi khi tải sản phẩm cho "${title}":`, err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [JSON.stringify(filterParams)]); // Use stringify to compare object props

     const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth * 0.8; // Scroll 80% of the visible width
            carouselRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        if (!isVisible || isLoading || products.length < 5) return;

        const interval = setInterval(() => {
             if (carouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 1) { // -1 for tolerance
                    // If at the end, scroll back to the beginning
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll('right');
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isVisible, isLoading, products.length]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex space-x-6">
                    {[...Array(5)].map((_, index) => (
                         <div key={index} className="w-full sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/5)] flex-shrink-0">
                            <SkeletonProductCard />
                        </div>
                    ))}
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500 py-4">{error}</p>;
        }
        if (products.length === 0) {
            return <p className="text-center text-textMuted py-4">Không có sản phẩm nào trong danh mục này.</p>;
        }
        return (
            <div className="flex space-x-6">
                {products.map(product => (
                    <div key={product.id} className="w-[80vw] sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/5)] flex-shrink-0">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section ref={sectionRef} className={`py-8 md:py-12 bg-white animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6 bg-primary text-white p-3 rounded-md shadow-md">
                    <h2 className="text-xl md:text-2xl font-bold uppercase">{title}</h2>
                    <Link to={viewAllLink} className="text-sm font-semibold hover:text-red-100 transition-colors flex items-center">
                        Xem tất cả <i className="fas fa-chevron-right text-xs ml-2"></i>
                    </Link>
                </div>
                 <div className="relative">
                    <div ref={carouselRef} className="flex overflow-x-auto scroll-smooth scrollbar-hide -mx-4 px-4 pb-4">
                        {renderContent()}
                    </div>
                    {products.length > 4 && (
                        <>
                            <Button variant="ghost" onClick={() => scroll('left')} className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full !p-0 w-10 h-10 shadow-lg hidden lg:flex items-center justify-center text-gray-700 hover:text-primary">
                                <i className="fas fa-chevron-left"></i>
                            </Button>
                             <Button variant="ghost" onClick={() => scroll('right')} className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full !p-0 w-10 h-10 shadow-lg hidden lg:flex items-center justify-center text-gray-700 hover:text-primary">
                                <i className="fas fa-chevron-right"></i>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductCarouselSection;
