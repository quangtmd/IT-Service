
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ComponentSelector from '../components/pcbuilder/ComponentSelector';
import Button from '../components/ui/Button';
import { MOCK_PC_COMPONENTS } from '../data/mockData';
import * as Constants from '../constants';
import { AIBuildResponse, PCComponent, AIRecommendedComponent, CustomPCBuildCartItem } from '../types';
import { generatePCBuildRecommendation } from '../services/geminiService'; // Updated import
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
  const navigate = useNavigate();

  const handleComponentChange = useCallback((type: BuilderSelectorKey, value: string) => {
    setSelectedComponents(prev => ({ ...prev, [type]: value }));
  }, []);

  const getAIRecommendation = async () => {
    setIsLoading(true);
    setError(null);
    setAiRecommendation(null);
    try {
      const componentsForAI: Record<string, string> = {};
      for (const key in selectedComponents) {
          const selectorKey = key as BuilderSelectorKey;
          const value = selectedComponents[selectorKey];
          if (value) componentsForAI[selectorKey] = value;
      }

      // Use the imported function directly
      const recommendation = await generatePCBuildRecommendation(useCase, budget, componentsForAI);
      setAiRecommendation(recommendation);
      if (recommendation.error) {
        setError(recommendation.error);
      }
    } catch (err) {
      console.error("AI recommendation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown AI error.";
      if (errorMessage.includes('Initialization failed')) {
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
      if (!compName) return;
      
      const mockKey = selectorKeyToMockKeyMap[selectorKey];
      const componentList: PCComponent[] = Array.isArray(MOCK_PC_COMPONENTS[mockKey]) ? MOCK_PC_COMPONENTS[mockKey] : [];
      const componentDetails = componentList.find(c => c.name === compName);

      if (componentDetails) {
        total += componentDetails.price || 0;
        components[selectorKey] = { name: compName, price: componentDetails.price };
      } else {
        components[selectorKey] = { name: compName, price: 0 };
      }
    });
    return { total, components };
  };

  const { total: totalCost, components: builtComponents } = calculateTotalCostAndComponents();

  const handleAddToCartAndNotify = () => {
    if (Object.keys(builtComponents).length === 0) {
        alert("Please select at least one component.");
        return;
    }

    let description = "Custom PC Build:\n" + 
        Object.entries(builtComponents)
            .map(([key, value]) => `- ${key}: ${value.name} (${(value.price || 0).toLocaleString('vi-VN')}₫)`)
            .join('\n') + `\nTotal: ${totalCost.toLocaleString('vi-VN')}₫`;

    const customBuildItem: CustomPCBuildCartItem = {
        id: `custom-pc-${Date.now()}`,
        name: `Custom PC Build - ${useCase}`,
        price: totalCost,
        quantity: 1,
        imageUrl: Constants.GENERIC_PC_BUILD_IMAGE_URL,
        isCustomBuild: true,
        buildComponents: builtComponents,
        description: description,
        category: "PC Builds",
    };

    addToCart(customBuildItem as any);
    addAdminNotification(`New PC build request (Budget: ${parseInt(budget).toLocaleString('vi-VN')}₫, Use Case: ${useCase}) added to cart.`, 'info');
    navigate('/cart');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-textBase mb-2">Build Your PC</h1>
        <p className="text-textMuted max-w-xl mx-auto">Select parts manually or let our AI suggest a build for your needs and budget.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 space-y-6 h-fit sticky top-24 border border-borderDefault">
          <h2 className="text-xl font-semibold text-textBase border-b pb-3">AI Options</h2>
          <div>
            <label htmlFor="useCase" className="block text-sm font-medium text-textMuted mb-1">Use Case</label>
            <select id="useCase" value={useCase} onChange={(e) => setUseCase(e.target.value)} className="w-full p-2 bg-white border border-borderStrong text-textBase rounded-md shadow-sm">
              {Constants.USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-textMuted mb-1">Budget (VND)</label>
            <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-2 bg-white border border-borderStrong text-textBase rounded-md shadow-sm" placeholder="e.g., 20000000" step="1000000" />
          </div>
          <Button onClick={getAIRecommendation} isLoading={isLoading} className="w-full" size="lg">
            <i className="fas fa-robot mr-2"></i> Get AI Recommendation
          </Button>
          {error && <p className="text-sm text-danger-text mt-2">{error}</p>}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-borderDefault">
            <h2 className="text-2xl font-semibold text-textBase mb-6 border-b pb-3">Manual Component Selection</h2>
            {BUILDER_SELECTABLE_KEYS.map(selectorKey => {
              const mockKey = selectorKeyToMockKeyMap[selectorKey];
              const aiKey = selectorKeyToAiKeyMap[selectorKey];
              const componentOptions = Array.isArray(MOCK_PC_COMPONENTS[mockKey]) ? MOCK_PC_COMPONENTS[mockKey] : [];
              const recommendedValue = aiRecommendation?.[aiKey] as AIRecommendedComponent | undefined;

              return (
                <div key={selectorKey}>
                  <ComponentSelector type={selectorKey} options={componentOptions} selectedValue={selectedComponents[selectorKey]} onChange={handleComponentChange} recommendedValue={recommendedValue?.name} />
                  {recommendedValue && (
                      <div className="p-3 bg-success-bg border border-success-border rounded-md mb-3 mt-1">
                          <p className="font-semibold text-success-text">{recommendedValue.name}</p>
                          <p className="text-xs text-green-700 italic">{recommendedValue.reasoning}</p>
                      </div>
                  )}
                </div>
              );
            })}
          </Card>

          <Card className="p-6 border border-borderDefault">
            <h2 className="text-2xl font-semibold text-textBase mb-4 border-b pb-3">Build Summary</h2>
            {Object.keys(builtComponents).length > 0 ? (
              <ul className="space-y-1 mb-4">
                {Object.entries(builtComponents).map(([key, value]) => (
                  <li key={key} className="text-textMuted"><strong className="font-medium text-textBase">{key}:</strong> {value.name} {(value.price || 0) > 0 ? `(${(value.price || 0).toLocaleString('vi-VN')}₫)` : ''}</li>
                ))}
              </ul>
            ) : <p className="text-textMuted mb-4">No components selected yet.</p>}
            <p className="text-xl font-bold text-primary">Total Estimated Cost: {totalCost.toLocaleString('vi-VN')}₫</p>
            <Button className="w-full mt-6" size="lg" disabled={Object.keys(builtComponents).length === 0} onClick={handleAddToCartAndNotify}>
              Add to Cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PCBuilderPage;
