
import React from 'react';
import { Link } from 'react-router-dom';
import { Product, SubCategoryInfo } from '../../types';
import ProductCard from './ProductCard';

interface ProductCarouselSectionProps {
  title: string;
  products: Product[];
  viewAllLink: string;
  subCategories?: SubCategoryInfo[];
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({ title, products, viewAllLink, subCategories }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <header className="flex justify-between items-center bg-primary text-white py-2 px-4 rounded-t-md">
        <h2 className="text-lg md:text-xl font-bold uppercase">{title}</h2>
        <Link to={viewAllLink} className="text-xs md:text-sm font-semibold hover:underline flex items-center shrink-0 ml-4">
          Xem tất cả <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </Link>
      </header>
      
      {subCategories && subCategories.length > 0 && (
         <div className="bg-white p-2 border-b border-x border-gray-200 flex flex-wrap gap-x-4 gap-y-2">
            {subCategories.slice(0, 10).map(sc => (
                <Link key={sc.slug} to={`${viewAllLink}&subCategory=${sc.slug}`} className="text-xs text-gray-600 hover:text-primary transition-colors">
                  {sc.name}
                </Link>
            ))}
        </div>
      )}

      <div className="bg-white p-4 rounded-b-md shadow-lg border border-t-0 border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarouselSection;
