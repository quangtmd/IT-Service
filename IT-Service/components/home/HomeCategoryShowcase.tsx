import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CategoryTabItem {
  name: string;
  discount: string;
  link: string;
}

const CATEGORY_TABS_DATA: CategoryTabItem[] = [
  { name: 'Laptop', discount: 'Giảm Đến 30%', link: '/shop?mainCategory=laptop' },
  { name: 'Linh Kiện', discount: 'Giảm Sốc Đến 50%', link: '/shop?mainCategory=linh_kien_may_tinh' },
  { name: 'Màn Hình', discount: 'Giảm Tới 30%', link: '/shop?mainCategory=thiet_bi_ngoai_vi&subCategory=man_hinh' },
  { name: 'Gear', discount: 'Giảm Đến 49%', link: '/shop?mainCategory=thiet_bi_ngoai_vi' },
  { name: 'Apple', discount: 'Ưu Đãi Đến 49%', link: '/shop?mainCategory=laptop&subCategory=macbook' },
  { name: 'Phụ Kiện', discount: 'Giảm Đến 57%', link: '/shop?mainCategory=phu_kien_khac' },
];

const HomeCategoryShowcase: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(1); // 'Linh Kiện' is active in example

    return (
        <section className="bg-bgCanvas">
            <div className="container mx-auto px-4">
                <div className="relative">
                    <div className="flex justify-center -space-x-5 md:-space-x-8 pb-14">
                        {CATEGORY_TABS_DATA.map((tab, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setActiveIndex(index)}
                                className="relative flex-1 z-10 transition-all duration-300 ease-out"
                                style={{
                                    transform: activeIndex === index ? 'translateY(-1rem)' : 'translateY(0)',
                                    zIndex: activeIndex === index ? 20 : 10,
                                }}
                            >
                                <Link to={tab.link} className="block w-full h-full">
                                    <div
                                        className={`h-24 pt-4 text-center cursor-pointer transition-all duration-300 ${activeIndex === index ? 'shadow-xl' : 'shadow-md'}`}
                                        style={{
                                            clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0% 100%)',
                                            backgroundColor: activeIndex === index ? 'var(--color-primary-default)' : 'white'
                                        }}
                                    >
                                        <h3 className={`text-base md:text-lg font-bold transition-colors duration-300 ${activeIndex === index ? 'text-white' : 'text-gray-800'}`}>
                                            {tab.name}
                                        </h3>
                                        <p className={`text-xs transition-colors duration-300 ${activeIndex === index ? 'text-red-100' : 'text-gray-500'}`}>
                                            {tab.discount}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 h-14 bg-primary rounded-md shadow-lg">
                        <Link to="/shop" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
                            Xem tất cả <i className="fas fa-chevron-right text-xs ml-1"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeCategoryShowcase;