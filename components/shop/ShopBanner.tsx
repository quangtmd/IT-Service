
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const ShopBanner: React.FC = () => {
  const bannerImageUrl = "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1920&auto=format&fit=crop";

  return (
    <div 
      className="relative w-full h-[300px] md:h-[400px] bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden shadow-lg mb-8"
      style={{ backgroundImage: `url('${bannerImageUrl}')` }}
      aria-label="Banner ưu đãi sản phẩm công nghệ"
    >
      <div className="absolute inset-0 bg-black/60"></div> {/* Dark overlay */}

      <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 text-white z-10">
        {/* Left content area */}
        <div className="md:w-3/5 text-center md:text-left mb-6 md:mb-0 md:pr-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 drop-shadow-md">
            TIÊN PHONG CÔNG NGHỆ <br className="hidden md:block"/> ƯU ĐÃI CỰC PHÊ
          </h2>
          <p className="text-sm md:text-base text-gray-200 mb-6 drop-shadow-sm max-w-xl mx-auto md:mx-0">
            Khám phá những sản phẩm công nghệ mới nhất với ưu đãi không thể bỏ lỡ! Từ laptop hiệu năng cao đến linh kiện gaming đỉnh cấp.
          </p>
          <Link to="/shop?tags=Khuyến%20mãi">
            <Button size="md" variant="primary" className="px-6 py-2.5 text-base shadow-lg hover:shadow-primary/40">
              Xem Ưu Đãi Ngay <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </div>

        {/* Right floating deal box */}
        <div className="md:w-2/5 flex items-center justify-center">
          <div className="bg-primary relative p-5 md:p-6 rounded-lg shadow-2xl text-center border-2 border-white transform scale-90 md:scale-100">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                SIÊU ƯU ĐÃI ĐẶC BIỆT
            </div>
            <p className="text-red-100 text-xs font-semibold mb-2 mt-2">Mức giá không tưởng</p>
            <p className="text-3xl md:text-4xl font-extrabold line-through mb-1 text-red-200">
              49.081.000₫
            </p>
            <p className="text-4xl md:text-5xl font-extrabold text-white">
              28.990.000₫
            </p>
            <p className="text-red-100 text-sm mt-3">Tiết kiệm: 20.091.000₫</p>
            <Link to="/product/PCGM002" className="mt-4 block">
                <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary !py-2 !text-sm">
                    Sản phẩm gợi ý
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBanner;
