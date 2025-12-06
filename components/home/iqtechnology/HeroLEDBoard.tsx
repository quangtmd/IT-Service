
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
        {/* Outer Frame - Transparent Glass Effect */}
        <div className="bg-white/5 backdrop-blur-[2px] border border-white/20 rounded-xl p-3 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden group">
            
            {/* Neon Border Effect */}
            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)_inset] z-10 pointer-events-none"></div>
            
            {/* Decorative Screws */}
            <div className="absolute top-3 left-3 w-2 h-2 bg-cyan-300/80 rounded-full z-20 shadow-[0_0_5px_cyan]"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-300/80 rounded-full z-20 shadow-[0_0_5px_cyan]"></div>
            <div className="absolute bottom-3 left-3 w-2 h-2 bg-cyan-300/80 rounded-full z-20 shadow-[0_0_5px_cyan]"></div>
            <div className="absolute bottom-3 right-3 w-2 h-2 bg-cyan-300/80 rounded-full z-20 shadow-[0_0_5px_cyan]"></div>

            {/* Inner Screen - Fully Transparent to see 3D behind */}
            <div className="bg-black/30 h-80 rounded-lg relative overflow-hidden flex flex-col font-mono border border-cyan-500/20">
                
                {/* Scanline Effect - Subtle */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,243,255,0.05)_50%)] bg-[length:100%_3px] z-0 pointer-events-none"></div>
                
                {/* Header Bar - Transparent */}
                <div className="bg-cyan-950/40 border-b border-cyan-500/30 p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_red]"></div>
                        <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase drop-shadow-md">IQ System Interface</span>
                    </div>
                    <div className="text-cyan-400 text-[10px] font-bold">LIVE FEED</div>
                </div>

                {/* Content Area - High Contrast Text */}
                <div className="p-8 flex-grow flex flex-col justify-center items-center text-center z-10 relative">
                    <div key={currentIndex} className="animate-fade-in-up w-full">
                        <h3 className="text-yellow-300 font-bold text-2xl md:text-3xl mb-4 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            [{currentPromo.title}]
                        </h3>
                        <p className="text-white text-base md:text-xl leading-relaxed mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-bold">
                            {currentPromo.content}
                        </p>
                        <div className="inline-block bg-cyan-500/30 border border-cyan-400 text-white px-5 py-2 rounded-full text-sm font-bold uppercase animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.5)] backdrop-blur-sm">
                            {currentPromo.highlight} <i className="fas fa-chevron-right ml-1"></i>
                        </div>
                    </div>
                </div>

                {/* Footer Bar (Marquee) - Transparent */}
                <div className="bg-cyan-950/40 border-t border-cyan-500/30 p-2 z-10 overflow-hidden whitespace-nowrap">
                    <div className="inline-block animate-[marquee_15s_linear_infinite] text-green-400 text-xs md:text-sm font-mono font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        +++ CẬP NHẬT CÔNG NGHỆ MỚI NHẤT +++ LIÊN HỆ NGAY ĐỂ NHẬN TƯ VẤN MIỄN PHÍ +++ GIẢM GIÁ SỐC LINH KIỆN MÁY TÍNH +++
                    </div>
                </div>
            </div>
        </div>
        
        {/* Enhanced Glow beneath */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-cyan-400/20 blur-xl rounded-full"></div>
    </div>
  );
};

export default HeroLEDBoard;
