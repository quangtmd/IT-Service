import React, { useState, useCallback, useEffect } from 'react';
// Fix: Use named import for useNavigate
import { useNavigate, useLocation } from 'react-router-dom';
import ComponentSelector from '../components/pcbuilder/ComponentSelector';
import Button from '../components/ui/Button';
import { MOCK_PC_COMPONENTS } from '../data/mockData';
import * as Constants from '../constants.tsx';
import { AIBuildResponse, PCComponent, AIRecommendedComponent, CustomPCBuildCartItem } from '../types';
import geminiService from '../services/geminiService';
import Card from '../components/ui/Card';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useChatbotContext } from '../contexts/ChatbotContext';

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


export const PCBuilderPage: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [useCase, setUseCase] = useState<string>(Constants.USE_CASES[0]);
  const [budget, setBudget] = useState<string>('20000000');
  const [aiRecommendation, setAiRecommendation] = useState<AIBuildResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addAdminNotification } = useAuth();
  // Fix: Use useNavigate directly
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentContext } = useChatbotContext();

  useEffect(() => {
    setCurrentContext('Khách hàng đang ở trang Xây Dựng Cấu Hình PC.');
    return () => setCurrentContext(null); // Clear context on unmount
  }, [setCurrentContext]);


  const handleComponentChange = useCallback((
    type: BuilderSelectorKey,
    value: string
  ) => {
    setSelectedComponents(prev => ({ ...prev, [type]: value }));
  }, []);

  // Fix: Explicitly typed useCallback for getAIRecommendation to ensure correct type inference,
  // addressing a peculiar TypeScript error where the function was being incorrectly assigned to FC{{}}.
  const getAIRecommendation = useCallback(async (): Promise<void> => {
    // This check is now secondary; the primary error handling is in the service.
    // However, it provides a fast failure path without a service call.
    if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
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
  }, [useCase, budget, selectedComponents]); // Added dependencies


  // Handle loading a custom build from URL (e.g., from CartPage)
  React.useEffect(() => {
    const query = new URLSearchParams(location.search);
    const loadBuildId = query.get('load');
    if (loadBuildId) {
      // Find this build in the cart and populate the selector
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CustomPCBuildCartItem[];
      const customBuild = cartItems.find(item => item.id === loadBuildId && item.isCustomBuild);

      if (customBuild && customBuild.buildComponents) {
        const components: SelectedComponents = {};
        for (const [key, value] of Object.entries(customBuild.buildComponents)) {
          // Ensure the key is a valid BuilderSelectorKey
          if (BUILDER_SELECTABLE_KEYS.includes(key as BuilderSelectorKey)) {
            components[key as BuilderSelectorKey] = value.name;
          }
        }
        setSelectedComponents(components);
        // Optionally update useCase and budget if stored, or clear the query param
        navigate('/pc-builder', { replace: true });
      }
    }
  }, [navigate, location.search]);


  const calculateTotalPrice = () => {
    let total = 0;
    for (const key of BUILDER_SELECTABLE_KEYS) {
      const selectedName = selectedComponents[key];
      if (selectedName) {
        const mockKey = selectorKeyToMockKeyMap[key];
        const componentList = MOCK_PC_COMPONENTS[mockKey as keyof typeof MOCK_PC_COMPONENTS];
        const component = componentList?.find(c => c.name === selectedName);
        if (component && component.price !== undefined) {
          total += component.price;
        }
      }
    }
    return total;
  };

  const currentTotalPrice = calculateTotalPrice();

  const handleAddToCart = () => {
    if (!selectedComponents.CPU || !selectedComponents.Motherboard || !selectedComponents.RAM ||
        !selectedComponents.GPU || !selectedComponents.SSD || !selectedComponents.PSU || !selectedComponents.Case) {
        alert('Vui lòng chọn đủ tất cả các linh kiện PC.');
        return;
    }

    const buildComponents: CustomPCBuildCartItem['buildComponents'] = {};
    const buildNameParts: string[] = [];
    let totalPrice = 0;

    for (const key of BUILDER_SELECTABLE_KEYS) {
      const selectedName = selectedComponents[key];
      const mockKey = selectorKeyToMockKeyMap[key];
      const componentList = MOCK_PC_COMPONENTS[mockKey as keyof typeof MOCK_PC_COMPONENTS];
      const component = componentList?.find(c => c.name === selectedName);

      buildComponents[key] = {
        name: selectedName || 'Chưa chọn',
        price: component?.price,
      };
      if (component?.price !== undefined) {
        totalPrice += component.price;
      }
      if (selectedName) {
        buildNameParts.push(`${key}: ${selectedName.split('(')[0].trim()}`);
      }
    }

    const buildName = `PC Cấu hình Tùy chỉnh (${useCase} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)})`;
    const buildDescription = `Cấu hình PC được xây dựng theo yêu cầu: ${buildNameParts.join('; ')}.`;

    // FIX: Ensure all required Product fields are populated for CustomPCBuildCartItem.
    const customBuildProduct: CustomPCBuildCartItem = {
      id: `custom-build-${Date.now()}`,
      name: buildName,
      price: totalPrice,
      quantity: 1,
      description: buildDescription,
      // For imageUrl, ensure it matches imageUrls: [string] from the updated type.
      imageUrl: Constants.GENERIC_PC_BUILD_IMAGE_URL, // Single image URL for the custom build
      isCustomBuild: true,
      buildComponents: buildComponents,
      mainCategory: "PC Xây Dựng",
      subCategory: "Theo Yêu Cầu",
      category: "PC Xây Dựng",
      imageUrls: [Constants.GENERIC_PC_BUILD_IMAGE_URL], // Explicitly set as a tuple/array of one string
      tags: ["custom-build", useCase.toLowerCase().replace(' ', '-')],
      
      // Required Product properties that need default values for a custom build
      specifications: {}, // Custom builds typically don't have aggregated specs at this level
      stock: 999, // A high arbitrary stock for custom builds, as they are "built on demand"
      
      // Optional Product properties can be set or left undefined
      shortDescription: buildDescription,
      status: 'Mới',
      brand: 'IQ Technology Custom Build',
      isVisible: true,
      is_featured: false,
    };

    addToCart(customBuildProduct, 1);
    addAdminNotification(`Đã thêm cấu hình PC tùy chỉnh vào giỏ hàng: ${buildName}`, 'success');
    alert('Cấu hình PC đã được thêm vào giỏ hàng!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-textBase mb-3">Xây Dựng Cấu Hình PC Của Bạn</h1>
        <p className="text-lg text-textMuted max-w-2xl mx-auto">
          Tự tay lắp ráp bộ PC mơ ước hoặc nhận gợi ý cấu hình thông minh từ AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: AI Recommendation & Inputs */}
        <Card className="lg:col-span-1 p-6 space-y-6 sticky top-24 h-fit border border-borderDefault shadow-lg">
          <h2 className="text-xl font-semibold text-textBase border-b pb-3">Gợi ý AI & Nhu cầu</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-textMuted mb-1">Mục đích sử dụng</label>
              <select
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="input-style bg-white text-textBase"
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
                className="input-style bg-white text-textBase"
                placeholder="VD: 20000000"
                step="1000000"
              />
            </div>
            <Button onClick={getAIRecommendation} isLoading={isLoading} className="w-full" size="lg" disabled={!process.env.API_KEY || process.env.API_KEY === 'undefined'}>
                <i className="fas fa-robot mr-2"></i> Nhận gợi ý từ AI
            </Button>
            {(!process.env.API_KEY || process.env.API_KEY === 'undefined') && (
                <p className="text-xs text-warning-text mt-2 text-center">{Constants.API_KEY_ERROR_MESSAGE}</p>
            )}

            {error && (
              <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm">
                {error}
              </div>
            )}

            {aiRecommendation && !aiRecommendation.error && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                <h3 className="font-semibold text-blue-900 mb-2">AI đã đề xuất các linh kiện:</h3>
                <ul className="space-y-1">
                  {BUILDER_SELECTABLE_KEYS.map(key => {
                    const aiKey = selectorKeyToAiKeyMap[key];
                    const recommendation = aiRecommendation[aiKey] as AIRecommendedComponent | undefined;
                    return recommendation ? (
                      <li key={key}><strong>{key}:</strong> {recommendation.name} (<span className="italic">{recommendation.reasoning}</span>)</li>
                    ) : null;
                  })}
                </ul>
                <p className="mt-3 text-xs italic">
                    Chọn các linh kiện được đề xuất ở cột bên phải để hoàn tất cấu hình.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Middle Section: Component Selectors */}
        <Card className="lg:col-span-2 p-6 space-y-4 border border-borderDefault shadow-lg">
          <h2 className="text-xl font-semibold text-textBase border-b pb-3">Chọn linh kiện của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILDER_SELECTABLE_KEYS.map(type => (
              <ComponentSelector
                key={type}
                type={type}
                options={MOCK_PC_COMPONENTS[selectorKeyToMockKeyMap[type] as keyof typeof MOCK_PC_COMPONENTS] || []}
                selectedValue={selectedComponents[type]}
                onChange={handleComponentChange}
                recommendedValue={aiRecommendation ? (aiRecommendation[selectorKeyToAiKeyMap[type]] as AIRecommendedComponent)?.name : undefined}
              />
            ))}
          </div>

          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-textBase">Tổng giá ước tính:</span>
            <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentTotalPrice)}</span>
          </div>

          <Button onClick={handleAddToCart} className="w-full mt-4" size="lg">
            <i className="fas fa-cart-plus mr-2"></i> Thêm vào giỏ hàng
          </Button>
        </Card>
      </div>
    </div>
  );
};
