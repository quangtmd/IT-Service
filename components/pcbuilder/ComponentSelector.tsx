
import React from 'react';
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
    if (option.price && option.price > 0) {
      label += ` - ${option.price.toLocaleString('vi-VN')}₫`;
    } else if (option.price === 0) {
      // Could indicate price not set or free item, adjust as needed
      // label += ` - (Liên hệ)`; 
    }
    return label;
  };

  return (
    <div className="mb-4">
      <label htmlFor={type} className="block text-sm font-medium text-textMuted mb-1">
        {typeLabels[type]}
        {recommendedValue && <span className="text-xs text-success-text ml-2">(AI đề xuất: {recommendedValue.split('(')[0].trim()})</span>}
      </label>
      <select
        id={type}
        name={type}
        value={selectedValue || ""}
        onChange={(e) => onChange(type, e.target.value)}
        className="w-full p-2.5 bg-white border border-borderStrong text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
      >
        <option value="">-- Chọn {typeLabels[type]} --</option>
        {options.map(option => (
          <option key={option.name} value={option.name}>
            {getOptionLabel(option)}
          </option>
        ))}
        {/* If AI recommends something not in the list, show it as a disabled option for info */}
        {recommendedValue && !options.find(o => o.name === recommendedValue.split(' - ')[0].trim()) && (
            <option value={recommendedValue.split(' - ')[0].trim()} disabled className="italic text-textSubtle">
                (AI Đề xuất) {recommendedValue}
            </option>
        )}
      </select>
    </div>
  );
};

export default ComponentSelector;