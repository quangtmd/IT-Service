import React, { useState, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
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


export const PCBuilderPage: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [useCase, setUseCase] = useState<string>(Constants.USE_CASES[0]);
  const [budget, setBudget] = useState<string>('20000000');
  const [aiRecommendation, setAiRecommendation] = useState<AIBuildResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addAdminNotification } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const handleComponentChange = useCallback((
    type: BuilderSelectorKey,
    value: string
  ) => {
    setSelectedComponents(prev => ({ ...prev, [type]: value }));
  }, []);

  // Fix: Add explicit Promise<void> return type to `getAIRecommendation` function to clarify its non-component nature and resolve TypeScript error.
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
// ... (rest of the file content)
