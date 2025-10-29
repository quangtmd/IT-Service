import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import Button from '../ui/Button';
import { getProducts } from '../../services/localDataService';

interface ProductCarouselSectionProps {
    title: string;
    categoryName: string;
    viewAllLink: string;
    bgColor?: string;
    textColor?: string;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({ 
    title, 
    categoryName, 
    viewAllLink, 
    bgColor = 'bg-primary', 
    textColor = 'text-white' 
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const allProducts = await getProducts();
                const categoryProducts = allProducts
                    .filter(p => (p.mainCategory === categoryName || p.subCategory === categoryName) && p.isVisible !== false)
                    .slice(0, 4); // Show up to 4 products
                setProducts(categoryProducts);
            } catch (err) {
                console.error(`Error loading products for category ${categoryName}:`, err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [categoryName]);

    if (products.length === 0) {
        return null;
    }

    return (
        <section 
            className="bg-bgCanvas"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductCarouselSection;