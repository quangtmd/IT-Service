import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; 
import { FaqItem } from '../../types';
import { FAQ_STORAGE_KEY, INITIAL_FAQS, INITIAL_SITE_SETTINGS, SITE_CONFIG_STORAGE_KEY } from '../../constants'; 
import Markdown from 'react-markdown';

const AccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      <button
        className={`w-full flex justify-between items-center text-left p-5 focus:outline-none transition-colors duration-200 ${isOpen ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50 text-textBase'}`}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={`faq-content-${item.id}`}
      >
        <span className="font-semibold text-base">{item.question}</span>
        <i className={`fas ${isOpen ? 'fa-minus' : 'fa-plus'} text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div
        id={`faq-content-${item.id}`}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-5 border-t border-gray-200 text-textMuted text-sm leading-relaxed bg-gray-50 prose prose-sm max-w-none">
          <Markdown>{item.answer}</Markdown>
        </div>
      </div>
    </div>
  );
};

// New wrapper component for individual FAQ item observation
const FaqDisplayItemWrapper: React.FC<{
  item: FaqItem;
  index: number;
  openAccordionId: string | null;
  toggleAccordion: (id: string) => void;
}> = ({ item, index, openAccordionId, toggleAccordion }) => {
  const [itemRef, isItemVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });
  
  return (
    <div 
      ref={itemRef} 
      className={`animate-on-scroll fade-in-up ${isItemVisible ? 'is-visible' : ''}`} 
      style={{ animationDelay: `${index * 50}ms`}} 
      key={item.id}
    >
      <AccordionItem
        item={item}
        isOpen={openAccordionId === item.id}
        onClick={() => toggleAccordion(item.id)}
      />
    </div>
  );
};


const ServiceFaqIts: React.FC = () => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [siteSettings, setSiteSettings] = useState(INITIAL_SITE_SETTINGS);

  const loadData = useCallback(() => {
    const storedSettings = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (storedSettings) {
      setSiteSettings(JSON.parse(storedSettings));
    } else {
      setSiteSettings(INITIAL_SITE_SETTINGS);
    }

    const storedFaqs = localStorage.getItem(FAQ_STORAGE_KEY);
    let faqItems: FaqItem[];
    if (storedFaqs) {
      faqItems = JSON.parse(storedFaqs);
    } else {
      faqItems = INITIAL_FAQS; 
    }
    setFaqs(faqItems.filter(faq => faq.isVisible !== false));
  },[]);

  useEffect(() => {
    loadData(); 
    
    window.addEventListener('faqsUpdated', loadData);
    window.addEventListener('siteSettingsUpdated', loadData); 
    
    return () => {
      window.removeEventListener('faqsUpdated', loadData);
      window.removeEventListener('siteSettingsUpdated', loadData);
    };
  }, [loadData]);


  const toggleAccordion = (id: string) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  return (
    <section className="py-16 md:py-20 bg-bgCanvas">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-12 md:mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          <div className="flex justify-center items-center mb-3">
            <img src="https://picsum.photos/seed/faqIconOrange1/40/40" alt="icon" className="mr-2 opacity-70 rounded-full" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Câu Hỏi Liên Quan Đến Dịch Vụ
            </span>
            <img src="https://picsum.photos/seed/faqIconOrange2/40/40" alt="icon" className="ml-2 opacity-70 rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-textBase leading-tight">
            Giải Đáp Thắc Mắc Cùng {siteSettings.companyName.split(' ')[0] || 'Chúng Tôi'}
          </h2>
        </div>
        
        {faqs.length > 0 ? (
            <div className="max-w-3xl mx-auto">
            {faqs.map((item, index) => (
              <FaqDisplayItemWrapper
                key={item.id}
                item={item}
                index={index}
                openAccordionId={openAccordionId}
                toggleAccordion={toggleAccordion}
              />
            ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Chưa có câu hỏi thường gặp nào được cập nhật.</p>
        )}
      </div>
    </section>
  );
};

export default ServiceFaqIts;