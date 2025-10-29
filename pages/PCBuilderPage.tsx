import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
import ComponentSelector from '../components/pcbuilder/ComponentSelector';
import Button from '../components/ui/Button';
import { MOCK_PC_COMPONENTS } from '../data/mockData';
import * as Constants from '../constants.tsx';
import { AIBuildResponse, PCComponent, AIRecommendedComponent, CustomPCBuildCartItem } from '../types';
import geminiService from '../services/geminiService';
import Card from '../components/ui/Card';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';

type BuilderSelectorKey = 'CPU' | 'Motherboard' | 'RAM' | 'GPU' | 'SSD' | 'PSU' | 'Case';
type SelectedComponents = Partial<Record<BuilderSelectorKey, string>>;

const BUILDER_SELECTABLE_KEYS: BuilderSelectorKey[] = ['CPU', 'Motherboard', 'RAM', 'GPU', 'SSD', 'PSU', 'Case'];

const selectorKeyToMockKeyMap: Record<BuilderSelectorKey, keyof typeof MOCK_PC_COMPONENTS | string> = {
  CPU: 'CPU',
  Motherboard: 'Bo mạch chủ',
  RAM: 'RAM',
  GPU: 'Card màn hình',
  SSD: 'Ổ cứng',
  PSU: 'Nguồn máy tính',
  Case: 'Vỏ case',
};

const selectorKeyToAiKeyMap: Record<BuilderSelectorKey, keyof Omit<AIBuildResponse, 'error'>> = {
    CPU: 'cpu',
    Motherboard: 'motherboard',
    RAM: 'ram',
    GPU: 'gpu',
    SSD: 'ssd',
    PSU: 'psu',
    Case: 'case',
};


const PCBuilderPage: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [useCase, setUseCase] = useState<string>(Constants.USE_CASES[0]);
  const [budget, setBudget] = useState<string>('20000000');
  const [aiRecommendation, setAiRecommendation] = useState<AIBuildResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addAdminNotification } = useAuth();
  const navigate = useNavigate(); // Changed from useHistory

  const handleComponentChange = useCallback((
    type: BuilderSelectorKey,
    value: string
  ) => {
    setSelectedComponents(prev => ({ ...prev, [type]: value }));
  }, []);

  const getAIRecommendation = async () => {
    // This check is now secondary; the primary error handling is in the service.
    // However, it provides a fast failure path without a service call.
    // Fix: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY to fix TypeScript error.
    if (!process.env.API_KEY) {
      setError(Constants.API_KEY_ERROR_MESSAGE);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiRecommendation(null);
    try {
      const componentsForAI: Record<string, string> = {};
      for (const key in selectedComponents) {
          const selectorKey = key as BuilderSelectorKey;
          const value = selectedComponents[selectorKey];
          if (value) {
            componentsForAI[selectorKey] = value;
          }
      }

      const recommendation = await geminiService.generatePCBuildRecommendation(useCase, budget, componentsForAI);
      setAiRecommendation(recommendation);
      if (recommendation.error) {
        setError(recommendation.error);
      }
    } catch (err) {
      console.error("Lỗi khi nhận đề xuất từ AI:", err);
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định từ AI.";
      // Display the specific, user-friendly API key error if it occurs.
      if (errorMessage.includes("API Key chưa được cấu hình")) {
          setError(Constants.API_KEY_ERROR_MESSAGE);
      } else {
          setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalCostAndComponents = (): { total: number; components: Record<string, { name: string; price?: number }> } => {
    let total = 0;
    const components: Record<string, { name: string; price?: number }> = {};

    (Object.keys(selectedComponents) as BuilderSelectorKey[]).forEach(selectorKey => {
      const compName = selectedComponents[selectorKey];
      if (compName) {
        const mockKey = selectorKeyToMockKeyMap[selectorKey];

        const componentList: PCComponent[] = (
          typeof MOCK_PC_COMPONENTS === 'object' &&
          MOCK_PC_COMPONENTS !== null &&
          Array.isArray(MOCK_PC_COMPONENTS[mockKey])
        ) ? MOCK_PC_COMPONENTS[mockKey] : [];

        const componentDetails = componentList.find(c => c.name === compName);

        if (componentDetails) {
          total += componentDetails.price || 0;
          components[selectorKey] = { name: compName, price: componentDetails.price };
        } else {
           const aiKey = selectorKeyToAiKeyMap[selectorKey];
           const aiComp = aiRecommendation?.[aiKey] as AIRecommendedComponent | undefined;
           if (aiComp && typeof aiComp === 'object' && aiComp.name === compName) {
             components[selectorKey] = { name: compName, price: 0 };
           } else {
             components[selectorKey] = { name: compName, price: 0 };
           }
        }
      }
    });
    return { total, components };
  };

  const { total: totalCost, components: builtComponents } = calculateTotalCostAndComponents();

  const handleAddToCartAndNotify = () => {
    if (Object.keys(builtComponents).length === 0) {
        alert("Vui lòng chọn ít nhất một linh kiện.");
        return;
    }

    let descriptionString = "Cấu hình PC theo yêu cầu:\n";
    for (const [key, value] of Object.entries(builtComponents)) {
        descriptionString += `- ${key}: ${value.name} (${(value.price || 0).toLocaleString('vi-VN')}₫)\n`;
    }
    descriptionString += `Tổng cộng: ${totalCost.toLocaleString('vi-VN')}₫`;

    const customBuildItem: CustomPCBuildCartItem = {
        id: `custom-pc-${Date.now()}`,
        name: `PC Xây Dựng Theo Yêu Cầu - ${useCase}`,
        price: totalCost,
        quantity: 1,
        imageUrl: Constants.GENERIC_PC_BUILD_IMAGE_URL,
        imageUrls: [Constants.GENERIC_PC_BUILD_IMAGE_URL],
        isCustomBuild: true,
        buildComponents: builtComponents,
        description: descriptionString,
        mainCategory: "PC Xây Dựng",
        subCategory: "Theo Yêu Cầu",
        category: "PC Xây Dựng",
        tags: ['PC Xây Dựng', 'Theo Yêu Cầu', useCase],
    };

    addToCart(customBuildItem as any);
    addAdminNotification(`Yêu cầu xây dựng PC mới (Ngân sách: ${parseInt(budget).toLocaleString('vi-VN')}₫, Nhu cầu: ${useCase}) đã được thêm vào giỏ hàng.`, 'info');
    navigate('/cart'); // Changed from history.push
  };

  const renderRecommendation = (componentAiKey: keyof Omit<AIBuildResponse, 'error'>) => {
    if (!aiRecommendation) return null;
    const compCandidate = aiRecommendation[componentAiKey];

    if (compCandidate && typeof compCandidate === 'object' && 'name' in compCandidate && 'reasoning' in compCandidate) {
        const comp = compCandidate as AIRecommendedComponent;
         return (
            <div className="p-3 bg-success-bg border border-success-border rounded-md mb-3 mt-1">
                <p className="font-semibold text-success-text">{comp.name}</p>
                <p className="text-xs text-green-700 italic">{comp.reasoning}</p>
            </div>
        );
    }
    return null;
  };

  try {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-textBase mb-2">Xây Dựng Cấu Hình PC</h1>
          <p className="text-textMuted max-w-xl mx-auto">
            Tự tay lựa chọn linh kiện hoặc để AI của chúng tôi gợi ý cấu hình phù hợp với nhu cầu và ngân sách của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 p-6 space-y-6 h-fit sticky top-24 border border-borderDefault">
            <h2 className="text-xl font-semibold text-textBase border-b pb-3">Tuỳ chọn AI</h2>
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-textMuted mb-1">Nhu cầu sử dụng</label>
              <select
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full p-2 bg-white border border-borderStrong text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                {Constants.USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-textMuted mb-1">Ngân sách (VNĐ)</label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2 bg-white border border-borderStrong text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="VD: 20000000"
                step="1000000"
              />
            </div>
            {/* Fix: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY to fix TypeScript error. */}
            <Button onClick={getAIRecommendation} isLoading={isLoading} className="w-full" size="lg" disabled={!process.env.API_KEY}>
              <i className="fas fa-robot mr-2"></i> AI Đề Xuất Cấu Hình
            </Button>
            {error && <p className="text-sm text-danger-text mt-2">{error}</p>}
            {aiRecommendation?.error && !error && <p className="text-sm text-warning-text mt-2">{aiRecommendation.error}</p>}
            {/* Fix: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY to fix TypeScript error. */}
            {!process.env.API_KEY && <p className="text-xs text-warning-text mt-1">API_KEY chưa được cấu hình. Tính năng AI sẽ không hoạt động.</p>}
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-borderDefault">
              <h2 className="text-2xl font-semibold text-textBase mb-6 border-b pb-3">Chọn Linh Kiện Thủ Công</h2>
              {BUILDER_SELECTABLE_KEYS.map(selectorKey => {
                const mockKey = selectorKeyToMockKeyMap[selectorKey];
                const aiKey = selectorKeyToAiKeyMap[selectorKey];

                const aiComp = aiRecommendation?.[aiKey];
                let currentRecommendedValue: string | undefined = undefined;

                if (aiComp && typeof aiComp === 'object' && 'name' in aiComp && typeof (aiComp as any).name === 'string') {
                    currentRecommendedValue = (aiComp as AIRecommendedComponent).name;
                }

                const componentOptionsForSelector: PCComponent[] =
                  (typeof MOCK_PC_COMPONENTS === 'object' && MOCK_PC_COMPONENTS !== null && MOCK_PC_COMPONENTS[mockKey] && Array.isArray(MOCK_PC_COMPONENTS[mockKey]))
                  ? MOCK_PC_COMPONENTS[mockKey]
                  : [];

                return (
                  <div key={selectorKey}>
                    <ComponentSelector
                      type={selectorKey}
                      options={componentOptionsForSelector}
                      selectedValue={selectedComponents[selectorKey]}
                      onChange={handleComponentChange}
                      recommendedValue={currentRecommendedValue}
                    />
                    {currentRecommendedValue && renderRecommendation(aiKey)}
                  </div>
                );
              })}
            </Card>

            <Card className="p-6 border border-borderDefault">
              <h2 className="text-2xl font-semibold text-textBase mb-4 border-b pb-3">Tổng Quan Cấu Hình</h2>
              {Object.entries(builtComponents).filter(([_, value]) => value.name).length > 0 ? (
                  <ul className="space-y-1 mb-4">
                  {(Object.keys(builtComponents) as BuilderSelectorKey[]).map((selectorKey) => {
                      const component = builtComponents[selectorKey];
                      if (component && component.name) {
                          return <li key={selectorKey} className="text-textMuted"><strong className="font-medium text-textBase">{selectorKey}:</strong> {component.name} {(component.price || 0) > 0 ? `(${(component.price || 0).toLocaleString('vi-VN')}₫)`: ''}</li>;
                      }
                      return null;
                  })}
                  </ul>
              ) : <p className="text-textMuted mb-4">Chưa có linh kiện nào được chọn. Sử dụng AI hoặc chọn thủ công ở trên.</p>}

              <p className="text-xl font-bold text-primary">
                  Tổng chi phí dự kiến: {totalCost.toLocaleString('vi-VN')}₫
              </p>
              <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={Object.keys(builtComponents).filter(key => builtComponents[key as BuilderSelectorKey]?.name).length === 0}
                  onClick={handleAddToCartAndNotify}
              >
                  Thêm vào giỏ hàng
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error("Lỗi render trang PCBuilderPage:", renderError);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-danger-text">Lỗi hiển thị trang Xây dựng PC</h1>
        <p className="text-textMuted">Đã có lỗi xảy ra khi cố gắng hiển thị trang này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
        {renderError instanceof Error && (
            <pre className="text-xs text-left bg-bgMuted p-2 mt-4 rounded overflow-auto max-w-full">
                {renderError.stack}
            </pre>
        )}
      </div>
    );
  }
};

export default PCBuilderPage;