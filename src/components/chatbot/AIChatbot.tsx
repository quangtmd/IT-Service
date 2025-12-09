import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk, ChatLogSession } from '@/types';
import ChatMessage from './ChatMessage';
import geminiService from '@/services/geminiService';
import * as Constants from '@/constants'; 
import { useChatbotContext } from '@/contexts/ChatbotContext'; 
import { saveChatLogSession, getOrders } from '@/services/localDataService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AIChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any | null>(null);
  const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const [siteSettings, setSiteSettings] = useState(Constants.INITIAL_SITE_SETTINGS);

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const [currentChatLogSession, setCurrentChatLogSession] = useState<ChatLogSession | null>(null);

  const { currentContext } = useChatbotContext();
  const { currentUser } = useAuth();
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(!!currentUser);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Settings
  useEffect(() => {
    const loadSiteSettings = () => {
        const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
        if (storedSettingsRaw) setSiteSettings(JSON.parse(storedSettingsRaw));
    };
    loadSiteSettings();
  }, []);

  // Sync Auth State
  useEffect(() => {
    if (currentUser) {
        setIsUserInfoSubmitted(true);
        setUserName(currentUser.username);
        setUserPhone(currentUser.phone || '');
    } else {
        setIsUserInfoSubmitted(false);
        setUserName('');
        setUserPhone('');
    }
  }, [currentUser]);

  // Chat Initialization
  const initializeChat = useCallback(async () => {
    if (!isUserInfoSubmitted || !isOpen || chatSession) return; 
    setIsLoading(true);
    try {
      const newChatSession = geminiService.startChat(siteSettings, currentUser); 
      setChatSession(newChatSession);
      
      const initialBotGreeting = currentUser 
        ? `Chào ${currentUser.username}! Em là trợ lý ảo IQ Tech. Anh/chị cần em hỗ trợ gì không ạ?`
        : `Xin chào ${userName}! Em là trợ lý ảo IQ Tech. Em có thể giúp gì cho bạn ạ?`;
        
      const welcomeMessage = { 
        id: Date.now().toString(), 
        text: initialBotGreeting,
        sender: 'bot' as const, 
        timestamp: new Date() 
      };
      setMessages([welcomeMessage]);
      
      setCurrentChatLogSession({
        id: `chat-${Date.now()}`,
        userName: currentUser ? currentUser.username : userName,
        userPhone: currentUser ? (currentUser.phone || '') : userPhone,
        startTime: new Date().toISOString(),
        messages: [welcomeMessage]
      });

    } catch (err) {
      setError(Constants.API_KEY_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, isUserInfoSubmitted, chatSession, siteSettings, userName, userPhone, currentUser]);

  useEffect(() => {
    if (isOpen && isUserInfoSubmitted && !chatSession) initializeChat();
  }, [isOpen, isUserInfoSubmitted, chatSession, initializeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !imageFile) || isLoading || !chatSession) return;

    const currentInput = input;
    const currentImageFile = imageFile;
    
    const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        text: currentInput,
        sender: 'user',
        timestamp: new Date(),
        imageUrl: imagePreview || undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', timestamp: new Date() }]);

    try {
        let stream: AsyncIterable<any>;
        if (currentImageFile) {
            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(currentImageFile);
            });
            stream = await geminiService.sendMessageWithImage(currentInput, base64Data, currentImageFile.type, chatSession);
        } else {
            const messageWithContext = currentContext ? `[Bối cảnh: ${currentContext}]\n\n${currentInput}` : currentInput;
            stream = await geminiService.sendMessageToChatStream(messageWithContext, chatSession);
        }

        let currentText = '';
        const functionCalls: any[] = [];

        for await (const chunk of stream) {
             if (chunk.functionCalls) functionCalls.push(...chunk.functionCalls);
             if (chunk.text) {
                 currentText += chunk.text;
                 setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: currentText } : msg));
             }
        }

        if (functionCalls.length > 0) {
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: "Đang tra cứu thông tin..." } : msg));
            
            for (const call of functionCalls) {
                let toolResponse;
                
                if (call.name === 'lookupCustomerOrders') {
                    const identifier = String(call.args.identifier).toLowerCase();
                    const allOrders = await getOrders();
                    const matches = allOrders.filter(o => 
                        o.customerInfo.phone?.includes(identifier) || 
                        o.customerInfo.email?.toLowerCase().includes(identifier) ||
                        o.userId === identifier
                    );
                    
                    toolResponse = {
                        count: matches.length,
                        orders: matches.slice(0, 5).map(o => ({ id: o.id, date: o.orderDate, status: o.status, total: o.totalAmount }))
                    };
                } else if (call.name === 'getOrderStatus') {
                    const orderId = String(call.args.orderId).toLowerCase();
                    const allOrders = await getOrders();
                    const order = allOrders.find(o => o.id.toLowerCase().endsWith(orderId.replace('t', '')));
                    
                    toolResponse = order 
                        ? { found: true, status: order.status, total: order.totalAmount, items: order.items.length }
                        : { found: false, message: "Không tìm thấy đơn hàng." };
                }

                const toolStream = await chatSession.sendToolResponse({
                    functionResponses: [{ id: call.id, name: call.name, response: { result: toolResponse } }]
                });
                
                let finalText = '';
                for await (const chunk of toolStream) {
                    if (chunk.text) finalText += chunk.text;
                }
                setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: finalText } : msg));
            }
        }

    } catch (err) {
        setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.", sender: 'system' } : msg));
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setImageFile(e.target.files[0]);
        setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(userName && userPhone) setIsUserInfoSubmitted(true);
  };

  return (
    <div
      className={`fixed z-50 bg-bgBase shadow-2xl flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}
        /* Mobile: Full Screen */
        inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:rounded-xl sm:border sm:border-borderDefault
      `}
    >
      <header className="bg-primary text-white p-4 flex justify-between items-center sm:rounded-t-xl shadow-md shrink-0">
        <h3 className="font-semibold text-lg flex items-center gap-2"><i className="fas fa-robot"></i> Trợ lý AI IQ Tech</h3>
        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><i className="fas fa-times text-xl"></i></button>
      </header>

      {!isUserInfoSubmitted ? (
        <div className="p-6 flex-grow flex flex-col justify-center bg-bgCanvas">
          <form onSubmit={handleUserInfoSubmit} className="space-y-4">
            <h4 className="text-xl font-bold text-center mb-6">Thông tin của bạn</h4>
            <input type="text" placeholder="Tên của bạn *" className="input-style w-full" value={userName} onChange={e => setUserName(e.target.value)} required />
            <input type="tel" placeholder="Số điện thoại *" className="input-style w-full" value={userPhone} onChange={e => setUserPhone(e.target.value)} required />
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:bg-primary-dark transition-all">Bắt đầu chat</button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-grow p-4 overflow-y-auto bg-bgCanvas scroll-smooth">
            {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-borderDefault bg-bgBase pb-safe">
            {imagePreview && (
                <div className="mb-2 relative w-16 h-16">
                    <img src={imagePreview} className="w-full h-full object-cover rounded-lg" alt="preview" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
               <button type="button" onClick={() => imageInputRef.current?.click()} className="text-textMuted hover:text-primary p-2"><i className="fas fa-paperclip"></i></button>
               <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
               
               <input 
                 type="text" 
                 value={input} 
                 onChange={e => setInput(e.target.value)} 
                 placeholder="Nhập tin nhắn..." 
                 className="flex-grow bg-bgMuted rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                 disabled={isLoading}
               />
               <button type="submit" disabled={isLoading || (!input && !imageFile)} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md disabled:opacity-50">
                 <i className="fas fa-paper-plane"></i>
               </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatbot;