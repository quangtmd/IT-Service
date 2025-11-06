import React from 'react';

interface FeatureItemProps {
  icon: string; // FontAwesome class
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-6 bg-bgBase rounded-lg shadow-md hover:shadow-lg transition-shadow border border-borderDefault">
    <div className="flex-shrink-0">
      <div className="bg-primary/10 text-primary rounded-full p-3">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-textBase mb-1">{title}</h3>
      <p className="text-textMuted text-sm">{description}</p>
    </div>
  </div>
);

const WhyChooseUs: React.FC = () => {
  const features: FeatureItemProps[] = [
    { icon: 'fa-shield-alt', title: 'Uy Tín Hàng Đầu', description: 'Cam kết sản phẩm chính hãng, chất lượng đảm bảo.' },
    { icon: 'fa-dollar-sign', title: 'Giá Cả Cạnh Tranh', description: 'Luôn mang đến mức giá tốt nhất cho khách hàng.' },
    { icon: 'fa-headset', title: 'Hỗ Trợ Tận Nơi', description: 'Dịch vụ sửa chữa, lắp đặt tại nhà nhanh chóng, tiện lợi.' },
    { icon: 'fa-users-cog', title: 'Kỹ Thuật Viên Giàu Kinh Nghiệm', description: 'Đội ngũ chuyên nghiệp, am hiểu sâu về công nghệ.' },
  ];

  return (
    <section className="py-16 bg-bgCanvas">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-textBase mb-4">Vì Sao Chọn Chúng Tôi?</h2>
        <p className="text-center text-textMuted mb-12 max-w-xl mx-auto">
          Chúng tôi không chỉ bán sản phẩm, chúng tôi mang đến giải pháp và sự hài lòng.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map(feature => (
            <FeatureItem key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;