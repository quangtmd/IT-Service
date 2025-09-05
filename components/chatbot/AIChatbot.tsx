
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk, Service, SiteSettings, ChatLogSession, Project, Product } from '../../types';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import geminiService from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import * as Constants from '../../constants.tsx'; 
import { MOCK_SERVICES, MOCK_PROJECTS, MOCK_PRODUCTS } from '../../data/mockData'; 

const CHATBOT_AUTO_OPENED_KEY = 'chatbotAutoOpened_v1';

const fetchServicesFromBackend = async (query: string): Promise<Service[]> => {
  const baseUrl = Constants.BACKEND_API_BASE_URL;
  const lowerQuery = query.toLowerCase();

  const getMockServices = () => {
    return MOCK_SERVICES.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
  };

  if (!baseUrl) {
    console.warn("[AIChatbot] BACKEND_API_BASE_URL is not set. Falling back to mock services.");
    return getMockServices();
  }

  const endpoint = `${baseUrl}/api/services/search?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.warn(`[AIChatbot] Backend service API request failed: ${response.status} ${response.statusText}. URL: ${response.url}. Falling back to mock services.`);
      return getMockServices();
    }
    const services: Service[] = await response.json();
    return services.slice(0, 3);
  } catch (error) {
    console.error(`[AIChatbot] Error fetching services from backend (URL: ${endpoint}):`, error, ". Falling back to mock services.");
    return getMockServices();
  }
};

const AIChatbot: React.FC = () => {
  // If the API key is not available, don't render the component at all.
  // This is a safer pattern than conditional rendering in the parent component (App.tsx).
  if (!process.env.API_KEY) {
    return null;
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(false);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const [currentChatLogSession, setCurrentChatLogSession] = useState<ChatLogSession | null>(null);


  const loadSiteSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSiteSettings(JSON.parse(storedSettingsRaw));
    } else {
      setSiteSettings(Constants.INITIAL_SITE_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSiteSettings();
    window.addEventListener('siteSettingsUpdated', loadSiteSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
    };
  }, [loadSiteSettings]);

  useEffect(() => {
    const alreadyOpened = localStorage.getItem(CHATBOT_AUTO_OPENED_KEY);
    if (!alreadyOpened) {
      setIsOpen(true);
      localStorage.setItem(CHATBOT_AUTO_OPENED_KEY, 'true');
    }
  }, []);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const initializeChat = useCallback(async () => {
    if (!isUserInfoSubmitted || !isOpen || chatSession) return; 

    setIsLoading(true);
    setError(null);
    try {
      const newChatSession = geminiService.startChat(siteSettings); // Pass siteSettings
      setChatSession(newChatSession);
      const initialBotGreeting = `Xin chào ${userName}! Tôi là trợ lý AI của ${siteSettings.companyName}. Tôi có thể giúp gì cho bạn?`;
      setMessages([{ 
        id: Date.now().toString(), 
        text: initialBotGreeting,
        sender: 'bot', 
        timestamp: new Date() 
      }]);
      
      const newLogSession: ChatLogSession = {
        id: `chat-${Date.now()}`,
        userName: userName,
        userPhone: userPhone,
        startTime: new Date().toISOString(),
        messages: [{ 
            id: Date.now().toString(), 
            text: initialBotGreeting,
            sender: 'bot', 
            timestamp: new Date() 
          }]
      };
      setCurrentChatLogSession(newLogSession);

    } catch (err) {
      console.error("Failed to initialize chat:", err);
      const specificError = (err instanceof Error && err.message.includes(Constants.API_KEY_ERROR_MESSAGE)) ? Constants.API_KEY_ERROR_MESSAGE : "Không thể khởi tạo chatbot. Vui lòng thử lại sau.";
      setError(specificError);
      setMessages([{
        id: Date.now().toString(),
        text: `Lỗi: ${specificError}`,
        sender: 'system',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, isUserInfoSubmitted, chatSession, siteSettings, userName, userPhone]);


  useEffect(() => {
    if (isOpen && isUserInfoSubmitted && !chatSession) { 
      initializeChat();
    }
  }, [isOpen, isUserInfoSubmitted, chatSession, initializeChat]);

  const saveChatLog = useCallback(() => {
    if (currentChatLogSession && currentChatLogSession.messages.length > 0) {
      const existingLogsRaw = localStorage.getItem(Constants.CHAT_LOGS_STORAGE_KEY);
      const existingLogs: ChatLogSession[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
      // Add the current session to the beginning, ensuring it's the most recent
      const updatedLogs = [currentChatLogSession, ...existingLogs.filter(log => log.id !== currentChatLogSession.id)].slice(0, 50);
      localStorage.setItem(Constants.CHAT_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    }
  }, [currentChatLogSession]);

  useEffect(() => {
    if (currentChatLogSession) {
      saveChatLog();
    }
  }, [messages, currentChatLogSession, saveChatLog]);
  
  const handleUserInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserInfoError(null);
    if (!userName.trim() || !userPhone.trim()) {
      setUserInfoError("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    if (!/^\d{10,11}$/.test(userPhone)) {
      setUserInfoError("Số điện thoại không hợp lệ (10-11 chữ số).");
      return;
    }
    setIsUserInfoSubmitted(true);
  };


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatSession || !isUserInfoSubmitted) return;

    const userMessageText = input;
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentChatLogSession(prevLog => prevLog ? {...prevLog, messages: [...prevLog.messages, userMessage]} : null);
    setInput('');
    setIsLoading(true);
    setError(null);
    setCurrentGroundingChunks(undefined);

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessageType = { id: botMessageId, text: '', sender: 'bot', timestamp: new Date() };
    setMessages((prev) => [...prev, initialBotMessage]);
    setCurrentChatLogSession(prevLog => prevLog ? {...prevLog, messages: [...prevLog.messages, initialBotMessage]} : null);
    
    let dynamicContext = ""; 
    const lowerQuery = userMessageText.toLowerCase();
    
    const productKeywords = ["laptop", "pc", "máy tính", "linh kiện", "cpu", "vga", "ram", "mainboard", "giá", "mua", "sản phẩm", "gaming", "văn phòng", "đồ họa", "workstation"];
    const mentionsProduct = productKeywords.some(kw => lowerQuery.includes(kw)) || MOCK_PRODUCTS.some(p => lowerQuery.includes(p.name.toLowerCase()));

    if (mentionsProduct) {
        const relevantProducts = MOCK_PRODUCTS.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(lowerQuery);
            const categoryMatch = p.mainCategory.toLowerCase().includes(lowerQuery) || p.subCategory.toLowerCase().includes(lowerQuery);
            // Check if user query includes specific product keywords that are also in product name/category
            const keywordInProductMatch = productKeywords.some(kw => 
                (p.name.toLowerCase().includes(kw) || p.mainCategory.toLowerCase().includes(kw) || p.subCategory.toLowerCase().includes(kw)) &&
                lowerQuery.includes(kw)
            );
            return nameMatch || categoryMatch || keywordInProductMatch;
        }).slice(0, 3);

        if (relevantProducts.length > 0) {
            dynamicContext += "\n\n[Sản phẩm liên quan từ cửa hàng]:\n";
            relevantProducts.forEach(p => {
                const productUrl = `${window.location.origin}${window.location.pathname}#/product/${p.id}`;
                dynamicContext += `- Tên: ${p.name}, Giá: ${p.price.toLocaleString('vi-VN')}₫. Xem chi tiết: [Link sản phẩm](${productUrl})\n`;
            });
             dynamicContext += "Nếu người dùng hỏi về các sản phẩm này, hãy cung cấp thông tin và link đã cho.\n";
        }
    }
    
    const serviceKeywords = ["dịch vụ", "sửa chữa", "bảo trì", "lắp đặt", "cài đặt", "tư vấn web", "giải pháp", "it", "thuê ngoài", "hỗ trợ"];
    const mentionsService = serviceKeywords.some(kw => lowerQuery.includes(kw)) || MOCK_SERVICES.some(s => lowerQuery.includes(s.name.toLowerCase()));

    if (mentionsService) {
        let fetchedServices: Service[] = [];
        try {
            fetchedServices = await fetchServicesFromBackend(userMessageText);
        } catch (fetchErr) { 
            console.error("[AIChatbot] Error fetching services for context:", fetchErr); 
            // Fallback to mock if API fails
            fetchedServices = MOCK_SERVICES.filter(s =>
                s.name.toLowerCase().includes(lowerQuery) ||
                s.description.toLowerCase().includes(lowerQuery) ||
                serviceKeywords.some(kw => (s.name.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)) && lowerQuery.includes(kw))
            ).slice(0, 2);
        }
        
        if (fetchedServices.length > 0) {
            dynamicContext += "\n\n[Dịch vụ liên quan từ cửa hàng]:\n";
            fetchedServices.forEach(s => {
                const serviceUrl = `${window.location.origin}${window.location.pathname}#/service/${s.slug || s.id}`;
                dynamicContext += `- Dịch vụ: ${s.name}. Mô tả: ${s.description.substring(0, 100)}... Xem chi tiết: [Link dịch vụ](${serviceUrl})\n`;
            });
            dynamicContext += "Nếu người dùng hỏi về các dịch vụ này, hãy cung cấp thông tin và link đã cho.\n";
        }
    }
    
    const messageToSendToGemini = userMessageText + (dynamicContext ? `\n\n${dynamicContext}` : "");
    
    try {
      const stream: AsyncIterable<GenerateContentResponse> = await geminiService.sendMessageToChatStream(messageToSendToGemini, chatSession);
      let currentText = '';
      for await (const chunk of stream) {
        currentText += chunk.text; 
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: currentText } : msg
          )
        );
        setCurrentChatLogSession(prevLog => {
            if (!prevLog) return null;
            const updatedMessages = prevLog.messages.map(m => m.id === botMessageId ? {...m, text: currentText } : m);
            return {...prevLog, messages: updatedMessages};
        });

         if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          setCurrentGroundingChunks(chunk.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[]);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorText = err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi tin nhắn.";
      setError(errorText);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: `Lỗi: ${errorText}`, sender: 'system' } : msg
        )
      );
      setCurrentChatLogSession(prevLog => {
        if (!prevLog) return null;
        const updatedMessages = prevLog.messages.map(m => m.id === botMessageId ? {...m, text: `Lỗi: ${errorText}`, sender: 'system' as const } : m);
        return {...prevLog, messages: updatedMessages};
      });
    } finally {
      setIsLoading(false);
      setCurrentBotMessageId(null); 
      saveChatLog(); 
    }
  };
  
  const quickContactCommonClasses = "text-white rounded-full p-3.5 shadow-lg transition-all duration-300 flex items-center justify-center text-xl";
  const fabVisibilityClass = isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100';


  const renderFABs = () => (
    <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-center space-y-3 ${fabVisibilityClass}`}>
      {siteSettings.companyPhone && (
        <a 
          href={`tel:${siteSettings.companyPhone.replace(/\./g, '')}`}
          className={`${quickContactCommonClasses} bg-green-500 hover:bg-green-600 animate-subtle-beat`}
          aria-label="Call Now"
          title={siteSettings.companyPhone}
        >
          <i className="fas fa-phone-alt"></i>
        </a>
      )}
      {siteSettings.socialZaloUrl && (
        <a 
          href={siteSettings.socialZaloUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className={`${quickContactCommonClasses} bg-blue-500 hover:bg-blue-600`}
          aria-label="Chat on Zalo"
          title="Chat on Zalo"
        >
          <i className="fas fa-comment-dots"></i> {/* Standard Zalo-like icon */}
        </a>
      )}
       {siteSettings.socialFacebookUrl && (
        <a 
          href={siteSettings.socialFacebookUrl.includes('m.me') || siteSettings.socialFacebookUrl.includes('messenger.com') ? siteSettings.socialFacebookUrl : `https://m.me/${siteSettings.socialFacebookUrl.split('/').pop()}`}
          target="_blank" 
          rel="noopener noreferrer"
          className={`${quickContactCommonClasses} bg-blue-600 hover:bg-blue-700`}
          aria-label="Chat on Messenger"
          title="Chat on Messenger"
        >
          <i className="fab fa-facebook-messenger"></i>
        </a>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${quickContactCommonClasses} bg-primary hover:bg-primary-dark`}
        aria-label="Toggle Chatbot"
        title="Mở Chatbot"
      >
        <i className="fas fa-comments"></i>
      </button>
    </div>
  );

  return (
    <>
      {renderFABs()}

      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 bg-bgBase rounded-t-lg sm:rounded-lg shadow-xl w-full sm:w-96 h-[70vh] sm:h-[calc(100vh-10rem)] max-h-[600px] flex flex-col z-50 transition-all duration-300 ease-in-out transform border border-borderDefault ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-16 opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
      >
        <header className="bg-primary text-white p-4 flex justify-between items-center rounded-t-lg sm:rounded-t-lg">
          <h3 id="chatbot-title" className="font-semibold text-lg">AI Chatbot {siteSettings.companyName}</h3>
          <button onClick={() => setIsOpen(false)} className="text-xl hover:text-red-100" aria-label="Đóng chatbot">
            <i className="fas fa-times"></i>
          </button>
        </header>

        {!isUserInfoSubmitted ? (
          <div className="p-6 flex-grow flex flex-col justify-center bg-bgCanvas">
            <h4 className="text-lg font-semibold text-textBase mb-3 text-center">Thông tin của bạn</h4>
            <p className="text-sm text-textMuted mb-4 text-center">Vui lòng cung cấp thông tin để chúng tôi hỗ trợ bạn tốt hơn.</p>
            {userInfoError && <p className="text-sm text-danger-text mb-3 bg-danger-bg p-2 rounded-md">{userInfoError}</p>}
            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
              <div>
                <label htmlFor="userName" className="sr-only">Tên của bạn</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tên của bạn *"
                  className="input-style bg-white text-textBase w-full" 
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="userPhone" className="sr-only">Số điện thoại</label>
                <input
                  type="tel"
                  id="userPhone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="Số điện thoại *"
                  className="input-style bg-white text-textBase w-full" 
                  aria-required="true"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Bắt đầu trò chuyện
              </Button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-grow p-4 overflow-y-auto bg-bgCanvas" aria-live="polite">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} groundingChunks={msg.id === currentBotMessageId ? currentGroundingChunks : undefined} />
              ))}
              <div ref={messagesEndRef} />
              {error && <div className="text-danger-text text-sm p-2 bg-danger-bg rounded border border-danger-border">{error}</div>}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-borderDefault bg-bgBase">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-grow bg-white border border-borderStrong text-textBase rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-textSubtle"
                  disabled={isLoading || !chatSession}
                  aria-label="Tin nhắn của bạn"
                />
                <Button type="submit" isLoading={isLoading} disabled={isLoading || !input.trim() || !chatSession} aria-label="Gửi tin nhắn">
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default AIChatbot;
