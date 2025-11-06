import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChatbotContextType {
  currentContext: string | null;
  setCurrentContext: (context: string | null) => void;
}

export const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [currentContext, setCurrentContext] = useState<string | null>(null);

  return (
    <ChatbotContext.Provider value={{ currentContext, setCurrentContext }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};
