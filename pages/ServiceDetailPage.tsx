import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_SERVICES } from '../data/mockData';
import { Service } from '../types';
import Button from '../components/ui/Button';
import PageTitleBannerIts from '../components/services_page_its/PageTitleBannerIts';
import { useChatbotContext } from '../contexts/ChatbotContext'; // Import the context hook

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const { setCurrentContext } = useChatbotContext(); // Get the context setter

  useEffect(() => {
    // When the service data is loaded, set the chatbot context.
    if (service) {
      setCurrentContext(`Khách hàng đang xem dịch vụ: "${service.name}".`);
    }
    // Cleanup function to clear the context when the component unmounts.
    return () => {
      setCurrentContext(null);
    };
  }, [service, setCurrentContext]);

  useEffect(() => {
    const foundService = MOCK_SERVICES.find(s => s.id === serviceId || s.slug === serviceId);
    setService(foundService || null);
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <PageTitleBannerIts title="Dịch Vụ Không Tìm Thấy" breadcrumbs={[{label: "Trang chủ", path: "/"}, {label: "Dịch vụ", path: "/services"}, {label: "Lỗi"}]} />
        <div className="py-16">
            <i className="fas fa-exclamation-triangle text-5xl text-warning-text mb-4"></i>
            <h2 className="text-2xl font-semibold text-textBase mb-4">Không tìm thấy dịch vụ</h2>
            <p className="text-textMuted mb-6">Dịch vụ bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa.</p>
            <Link to="/services">
            <Button variant="primary" size="lg">
                Quay lại trang Dịch vụ
            </Button>
            </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Trang chủ", path: "/" },
    { label: "Dịch vụ", path: "/services" },
    { label: service.name }
  ];

  return (
    <div>
        <PageTitleBannerIts title={service.name} breadcrumbs={breadcrumbs} />
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto bg-bgBase p-6 md:p-10 rounded-lg shadow-xl border border-borderDefault">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3">
                <img
                    src={service.imageUrl || `https://picsum.photos/seed/${service.id}/500/350`}
                    alt={service.name}
                    className="w-full rounded-lg shadow-md object-cover aspect-video border border-borderDefault"
                />
                <div className="flex items-center mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg mr-3 shadow-sm">
                        <i className={`${service.icon || 'fas fa-concierge-bell'} text-2xl w-6 h-6 text-center`}></i>
                    </div>
                    <h2 className="text-xl font-semibold text-primary">{service.name}</h2>
                </div>
                </div>
                <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-textBase mb-6 border-b border-borderDefault pb-4">{service.name}</h1>
                <div className="prose prose-lg max-w-none text-textMuted leading-relaxed">
                    <p>{service.description}</p>
                    <p>Chúng tôi cam kết mang đến giải pháp <strong className="text-textBase">{service.name.toLowerCase()}</strong> chất lượng cao, đáp ứng mọi nhu cầu của quý khách hàng. Với đội ngũ chuyên gia giàu kinh nghiệm và quy trình làm việc chuyên nghiệp, IQ Technology tự tin là đối tác tin cậy đồng hành cùng sự phát triển của bạn.</p>
                    <h4 className="font-semibold text-textBase mt-4 mb-2">Lợi ích khi chọn dịch vụ của chúng tôi:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Giải pháp tùy chỉnh, phù hợp với từng yêu cầu cụ thể.</li>
                        <li>Hỗ trợ kỹ thuật nhanh chóng, tận tâm 24/7.</li>
                        <li>Chi phí hợp lý, cạnh tranh trên thị trường.</li>
                        <li>Công nghệ cập nhật, đảm bảo hiệu quả và bảo mật.</li>
                    </ul>
                </div>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-borderDefault text-center">
                <Link to="/services">
                <Button variant="outline" size="lg">
                    <i className="fas fa-arrow-left mr-2"></i> Xem Tất Cả Dịch Vụ
                </Button>
                </Link>
                 <Link to="/contact" className="ml-4">
                    <Button variant="primary" size="lg">
                        <i className="fas fa-headset mr-2"></i> Yêu Cầu Tư Vấn
                    </Button>
                </Link>
            </div>
            </div>
        </div>
    </div>
  );
};

export default ServiceDetailPage;