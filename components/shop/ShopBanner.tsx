import React from 'react';

const ShopBanner: React.FC = () => {
    return (
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center text-white bg-gray-900">
            <img
                src="https://images.unsplash.com/photo-1555774698-0b77e0abfe3d?q=80&w=1770&auto=format&fit=crop"
                alt="Shop Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 text-center p-4">
                <h1 className="text-4xl md:text-5xl font-bold font-condensed mb-3 drop-shadow-lg">
                    KHÁM PHÁ THẾ GIỚI CÔNG NGHỆ
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                    Tất cả những gì bạn cần cho một hệ thống PC hoàn hảo, từ linh kiện cao cấp đến các thiết bị ngoại vi hàng đầu.
                </p>
            </div>
        </div>
    );
};

export default ShopBanner;
