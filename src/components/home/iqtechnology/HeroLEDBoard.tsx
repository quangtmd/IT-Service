
import React, { useState, useEffect } from 'react';

const PROMOTIONS = [
  {
    title: "KHUYẾN MÃI HOT",
    content: "Giảm ngay 20% cho dịch vụ Build PC Gaming trọn gói trong tháng này!",
    highlight: "Ưu đãi có hạn"
  },
  {
    title: "DỊCH VỤ MỚI",
    content: "Miễn phí vệ sinh & bảo dưỡng PC khi nâng cấp Ram/SSD tại cửa hàng.",
    highlight: "Đặt lịch ngay"
  },
  {
    title: "HỖ TRỢ 24/7",
    content: "Đội ngũ kỹ thuật viên sẵn sàng hỗ trợ sự cố tận nơi cho doanh nghiệp.",
    highlight: "Hotline: 0911.855.055"
  }
];

const HeroLEDBoard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
    }, 4000); // Chuyển đổi mỗi 4 giây
    return () => clearInterval(timer);
  }, []);

  const currentPromo = PROMOTIONS[currentIndex];

  return (
    <div className="relative w-full max-w-xl transform rotate-y-12 hover:rotate-0 transition-transform duration-500 perspective-1000">
        {/* Outer Frame - Glass Effect */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden group">
            
            {/* Neon Border Effect */}
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)_inset] z-10 pointer-events-none"></div>
            
            {/* Decorative Screws - More subtle */}
            <div className="absolute top-3 left-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute bottom-3 left-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>
            <div className="absolute bottom-3 right-3 w-2 h-2 bg-gray-500/50 rounded-full z-20 shadow-inner"></div>

            {/* Inner Screen - Semi-transparent */}
            <div className="bg-black/40 h-80 rounded-lg relative overflow-hidden flex flex-col font-mono border border-white/5">
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-0 pointer-events-none opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-0 animate-pulse"></div>

                {/* Header Bar */}
                <div className="bg-cyan-900/30 border-b border-cyan-500/20 p-4 flex justify-between items-center z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_red]"></div>
                        <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase drop-shadow-md">System Notice</span>
                    </div>
                    <div className="text-cyan-500/80 text-[10px]">ID: 0X{Date.now().toString().slice(-4)}</div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex-grow flex flex-col justify-center items-center text-center z-10 relative">
                    <div key={currentIndex} className="animate-fade-in-up w-full">
                        <h3 className="text-yellow-300 font-bold text-2xl md:text-3xl mb-4 tracking-wider drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                            [{currentPromo.title}]
                        </h3>
                        <p className="text-cyan-50 text-base md:text-xl leading-relaxed mb-6 drop-shadow-md font-medium">
                            {currentPromo.content}
                        </p>
                        <div className="inline-block bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 px-4 py-1.5 rounded-full text-sm font-bold uppercase animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            {currentPromo.highlight} <i className="fas fa-chevron-right ml-1"></i>
                        </div>
                    </div>
                </div>

                {/* Footer Bar (Marquee) */}
                <div className="bg-black/60 border-t border-white/10 p-2 z-10 overflow-hidden whitespace-nowrap backdrop-blur-sm">
                    <div className="inline-block animate-[marquee_15s_linear_infinite] text-green-400 text-xs md:text-sm font-mono font-semibold drop-shadow-sm">
                        +++ CẬP NHẬT CÔNG NGHỆ MỚI NHẤT +++ LIÊN HỆ NGAY ĐỂ NHẬN TƯ VẤN MIỄN PHÍ +++ GIẢM GIÁ SỐC LINH KIỆN MÁY TÍNH +++
                    </div>
                </div>
            </div>
        </div>
        
        {/* Glowing Reflection beneath - enhanced for glass feel */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[95%] h-6 bg-cyan-500/10 blur-2xl rounded-full"></div>
    </div>
  );
};

export default HeroLEDBoard;
