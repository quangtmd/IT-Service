import React from 'react';
import { Link } from 'react-router-dom';

const PromotionCard: React.FC<{ icon: string; title: string; description: string; link: string; color: string }> = ({ icon, title, description, link, color }) => {
    return (
        <Link to={link} className="block group">
            <div className={`p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${color}`}>
                <div className="flex items-center">
                    <i className={`fas ${icon} text-3xl mr-4 ${color.replace('border-', 'text-')}`}></i>
                    <div>
                        <h4 className="font-bold text-textBase group-hover:text-primary transition-colors">{title}</h4>
                        <p className="text-sm text-textMuted">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const ShopPromotions: React.FC = () => {
    const promotions = [
        {
            icon: 'fa-shipping-fast',
            title: 'Miễn Phí Vận Chuyển',
            description: 'Cho đơn hàng từ 500.000₫',
            link: '/cart',
            color: 'border-blue-500'
        },
        {
            icon: 'fa-laptop-code',
            title: 'Laptop Sinh Viên',
            description: 'Ưu đãi tựu trường giảm sốc',
            link: '/shop?mainCategory=laptop',
            color: 'border-green-500'
        },
        {
            icon: 'fa-tools',
            title: 'Build PC Giá Tốt',
            description: 'Nhận tư vấn cấu hình miễn phí',
            link: '/pc-builder',
            color: 'border-purple-500'
        },
        {
            icon: 'fa-tags',
            title: 'Flash Sale Hàng Tuần',
            description: 'Săn deal linh kiện giá hời',
            link: '/shop?tags=Khuyến%20mãi',
            color: 'border-primary'
        }
    ];

    return (
        <div className="container mx-auto px-4 my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promotions.map(promo => (
                    <PromotionCard key={promo.title} {...promo} />
                ))}
            </div>
        </div>
    );
};

export default ShopPromotions;
