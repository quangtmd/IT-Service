

import React from 'react';
// Fix: Correct import path for types
import { PCComponent } from '../../types';

interface ComponentSelectorProps {
  type: 'CPU' | 'Motherboard' | 'RAM' | 'GPU' | 'SSD' | 'PSU' | 'Case';
  options: PCComponent[];
  selectedValue: string | undefined;
  onChange: (type: ComponentSelectorProps['type'], value: string) => void;
  recommendedValue?: string;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({ type, options, selectedValue, onChange, recommendedValue }) => {
  const typeLabels = {
    CPU: 'CPU (Vi xử lý)',
    Motherboard: 'Bo mạch chủ',
    RAM: 'RAM',
    GPU: 'Card đồ họa (VGA)',
    SSD: 'Ổ cứng SSD',
    PSU: 'Nguồn (PSU)',
    Case: 'Vỏ máy (Case)',
  };

  const getOptionLabel = (option: PCComponent) => {
    let label = option.name;
    if (option.details) {
      label += ` (${option.details})`;
    }
    return label;
  };

  // Fix: Completed the component to return JSX, resolving the FC type error.
  return (
    <div>
        <label htmlFor={type} className={`block text-sm font-medium mb-1 ${recommendedValue && !selectedValue ? 'text-blue-600' : 'text-textMuted'}`}>
          {typeLabels[type]}
          {recommendedValue && !selectedValue && <span className="text-xs ml-2">(Có gợi ý từ AI)</span>}
        </label>
        <select
            id={type}
            value={selectedValue || ''}
            onChange={(e) => onChange(type, e.target.value)}
            className={`input-style bg-white text-textBase ${recommendedValue && !selectedValue ? 'border-blue-400 ring-1 ring-blue-300' : ''}`}
        >
            <option value="">-- Chọn {typeLabels[type]} --</option>
            {/* If AI recommendation is not in the list, add it as a special option */}
            {recommendedValue && !options.some(opt => opt.name === recommendedValue) && (
                <option value={recommendedValue}>
                    [AI] {recommendedValue}
                </option>
            )}
            {options.map(option => (
                <option key={option.name} value={option.name}>
                    {getOptionLabel(option)} {option.price ? `- ${option.price.toLocaleString('vi-VN')}₫` : ''}
                    {option.name === recommendedValue ? ' (AI Đề xuất)' : ''}
                </option>
            ))}
        </select>
    </div>
  );
};

export default ComponentSelector;