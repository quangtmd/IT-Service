
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk, SiteSettings, ChatLogSession } from '../../types';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import { startChat, sendMessageToChatStream } from '../../services/geminiService'; // Correctly import named functions
import { Chat, GenerateContentResponse } from '@google/generative-ai';
import * as Constants from '../../constants';

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
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(false);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const [currentChatLogSession, setCurrentChatLogSession] = useState<ChatLogSession | null>(null);

  const loadSiteSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    setSiteSettings(storedSettingsRaw ? JSON.parse(storedSettingsRaw) : Constants.INITIAL_SITE_SETTINGS);
  }, []);

  useEffect(() => {
    loadSiteSettings();
    window.addEventListener('siteSettingsUpdated', loadSiteSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
  }, [loadSiteSettings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = useCallback(async () => {
    if (!isUserInfoSubmitted || !isOpen || chatSession) return;

    setIsLoading(true);
    setError(null);
    setMessages([]); // Clear previous messages

    try {
      const newChatSession = await startChat(siteSettings); 
      setChatSession(newChatSession);
      
      const initialBotGreeting = `Xin chào ${userName}! Tôi là trợ lý AI của ${siteSettings.companyName}. Tôi có thể giúp gì cho bạn?`;
      const initialMsg: ChatMessageType = { 
        id: `bot-${Date.now()}`,
        text: initialBotGreeting,
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages([initialMsg]);
      
      const newLogSession: ChatLogSession = {
        id: `chat-${Date.now()}`,
        userName: userName,
        userPhone: userPhone,
        startTime: new Date().toISOString(),
        messages: [initialMsg]
      };
      setCurrentChatLogSession(newLogSession);

    } catch (err) {
      console.error("Failed to initialize chat:", err);
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định.";
      const displayError = errorMessage.includes("API key") || errorMessage.includes("initialization")
        ? Constants.API_KEY_ERROR_MESSAGE 
        : "Không thể khởi tạo chatbot. Vui lòng thử lại sau.";
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, isUserInfoSubmitted, chatSession, siteSettings, userName, userPhone]);

  useEffect(() => {
    if (isOpen && isUserInfoSubmitted && !chatSession) {
      initializeChat();
    }
  }, [isOpen, isUserInfoSubmitted, chatSession, initializeChat]);

  const saveChatLogToApi = useCallback(async (logData: ChatLogSession) => {
      try {
        await fetch('/api/chat-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: logData.id,
                userName: logData.userName,
                userPhone: logData.userPhone,
                startTime: logData.startTime,
                messages: logData.messages,
            }),
        });
      } catch (error) {
          console.error("Failed to save chat log to API:", error);
      }
  }, []);

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
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    let botResponseText = '';
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: ChatMessageType = { id: botMessageId, text: '...', sender: 'bot', timestamp: new Date() };
    setMessages(prev => [...prev, botMessage]);

    try {
      const stream = await sendMessageToChatStream(userMessage.text, chatSession);
      for await (const chunk of stream) {
        botResponseText += chunk.text();
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: botResponseText } : msg
        ));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorText = err instanceof Error ? err.message : "Đã xảy ra lỗi.";
      setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: `Lỗi: ${errorText}`, sender: 'system' } : msg
      ));
    } finally {
      setIsLoading(false);
      // Update log session after bot has finished responding
      setCurrentChatLogSession(prevLog => {
          if (!prevLog) return null;
          const finalBotMessage: ChatMessageType = { id: botMessageId, text: botResponseText, sender: 'bot', timestamp: new Date() };
          const newLog = { ...prevLog, messages: [...prevLog.messages, userMessage, finalBotMessage] };
          saveChatLogToApi(newLog); // Save the complete log to API
          return newLog;
      });
    }
  };

  return (
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
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
            {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                <ChatMessage message={{id: 'thinking', text: '...', sender: 'bot', timestamp: new Date()}} />
            )}
            {error && <div className="text-center text-danger-text text-sm p-2 bg-danger-bg rounded my-2">{error}</div>}
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
  );
};

export default AIChatbot;
