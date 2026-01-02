
import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
// FIX: The PCBuildSuggestion interface is now defined in types.ts.
import { PCBuildSuggestion } from '../types';
import geminiService from '../services/geminiService';
import * as Constants from '../constants';
import { Link } from 'react-router-dom';
import { useChatbotContext } from '../contexts/ChatbotContext';

const PCBuildSuggestionsPage: React.FC = () => {
    const [useCase, setUseCase] = useState<'PC Gaming' | 'PC Văn phòng'>('PC Gaming');
    const [budget, setBudget] = useState<string>('20000000');
    const [additionalRequirements, setAdditionalRequirements] = useState('');
    const [suggestions, setSuggestions] = useState<PCBuildSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setCurrentContext } = useChatbotContext();

    useEffect(() => {
        setCurrentContext('Khách hàng đang ở trang Gợi ý Cấu hình PC từ AI.');
        return () => setCurrentContext(null); // Clear context on unmount
    }, [setCurrentContext]);

    const isApiKeyConfigured = process.env.API_KEY && process.env.API_KEY !== 'undefined';

    const budgetOptions = [
        { label: 'Dưới 15 triệu', value: '15000000' },
        { label: '15 - 25 triệu', value: '25000000' },
        { label: '25 - 40 triệu', value: '40000000' },
        { label: 'Trên 40 triệu', value: '60000000' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isApiKeyConfigured) {
            setError(Constants.API_KEY_ERROR_MESSAGE);
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const response = await geminiService.generatePCBuildSuggestions(useCase, budget, additionalRequirements);
            if (response.suggestions && response.suggestions.length > 0) {
                setSuggestions(response.suggestions);
            } else {
                setError("AI không thể tìm thấy cấu hình phù hợp. Vui lòng thử lại với yêu cầu khác.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-textBase mb-3">Gợi ý Cấu hình PC thông minh</h1>
                <p className="text-textMuted max-w-2xl mx-auto">
                    Chỉ cần cho chúng tôi biết nhu cầu và ngân sách, AI sẽ đề xuất những cấu hình tối ưu nhất dành cho bạn!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Input Form */}
                <Card className="lg:col-span-1 p-6 space-y-6 h-fit sticky top-[180px] border border-borderDefault shadow-lg">
                    <h2 className="text-xl font-semibold text-textBase border-b pb-3">Thông tin yêu cầu</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Nhu cầu sử dụng</label>
                            <div className="flex gap-2">
                                <Button type="button" onClick={() => setUseCase('PC Gaming')} variant={useCase === 'PC Gaming' ? 'primary' : 'outline'} className="w-full">PC Gaming</Button>
                                <Button type="button" onClick={() => setUseCase('PC Văn phòng')} variant={useCase === 'PC Văn phòng' ? 'primary' : 'outline'} className="w-full">PC Văn phòng</Button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-textMuted mb-2">Ngân sách (VNĐ)</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {budgetOptions.map(opt => (
                                    <Button key={opt.value} type="button" size="sm" variant={budget === opt.value ? 'secondary' : 'outline'} onClick={() => setBudget(opt.value)}>
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                            <input
                                type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}
                                className="input-style bg-white text-textBase" placeholder="VD: 20000000" step="1000000"
                            />
                        </div>
                        <div>
                            <label htmlFor="additionalRequirements" className="block text-sm font-medium text-textMuted mb-2">Yêu cầu thêm (tùy chọn)</label>
                            <textarea
                                id="additionalRequirements" value={additionalRequirements} onChange={(e) => setAdditionalRequirements(e.target.value)}
                                className="input-style bg-white text-textBase" rows={3} placeholder="VD: ưu tiên card NVIDIA, cần tản nhiệt nước, case màu trắng..."
                            ></textarea>
                        </div>
                        <Button type="submit" isLoading={isLoading} className="w-full" size="lg" disabled={!isApiKeyConfigured}>
                            <i className="fas fa-magic mr-2"></i> Nhận gợi ý từ AI
                        </Button>
                        {!isApiKeyConfigured && <p className="text-xs text-warning-text mt-2 text-center">{Constants.API_KEY_ERROR_MESSAGE}</p>}
                    </form>
                </Card>

                {/* Results Area */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading && (
                        <Card className="p-8 text-center text-textMuted border-borderDefault">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 font-semibold">AI đang phân tích yêu cầu của bạn...</p>
                            <p className="text-sm">Quá trình này có thể mất vài giây.</p>
                        </Card>
                    )}
                    {error && (
                        <Card className="p-8 text-center bg-danger-bg border-danger-border text-danger-text">
                            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                            <h3 className="font-bold text-lg">Đã xảy ra lỗi</h3>
                            <p className="text-sm mt-2">{error}</p>
                        </Card>
                    )}
                    {!isLoading && !error && suggestions.length === 0 && (
                        <Card className="p-8 text-center text-textMuted border-2 border-dashed border-borderDefault bg-bgCanvas shadow-none">
                            <i className="fas fa-robot text-5xl mb-4 text-textSubtle"></i>
                            <h3 className="font-semibold text-xl text-textBase">Sẵn sàng nhận gợi ý!</h3>
                            <p>Các cấu hình do AI đề xuất sẽ xuất hiện ở đây.</p>
                        </Card>
                    )}
                    {suggestions.map((suggestion, index) => (
                        <Card key={index} className="p-6 border border-borderDefault shadow-lg">
                            <h3 className="text-xl font-bold text-primary mb-2">{suggestion.name}</h3>
                            <p className="text-lg font-semibold text-textBase mb-3">Tổng chi phí dự kiến: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(suggestion.total_price)}</p>
                            <p className="text-sm text-textMuted italic mb-4 p-3 bg-bgCanvas rounded-md border border-borderDefault">"{suggestion.reasoning}"</p>
                            
                            <h4 className="font-semibold text-textBase mb-2">Chi tiết linh kiện:</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                {/* FIX: Added safe access for components and checking Object.entries input */}
                                {suggestion.components ? (
                                    Object.entries(suggestion.components).map(([key, value]) => (
                                        <li key={key} className="py-1 border-b border-borderDefault border-dashed">
                                            <strong className="text-textMuted w-28 inline-block">{key}:</strong> 
                                            <span className="text-textBase">{value}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-textMuted italic">Chi tiết cấu hình không khả dụng.</li>
                                )}
                            </ul>
                            <div className="mt-6 text-right">
                               <Link to="/contact">
                                 <Button variant='primary'><i className="fas fa-headset mr-2"></i> Yêu cầu tư vấn thêm</Button>
                               </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PCBuildSuggestionsPage;
