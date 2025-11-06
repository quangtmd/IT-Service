import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk, Service, SiteSettings, ChatLogSession, Product } from '../../types';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import geminiService from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import * as Constants from '../../constants.tsx'; 
import { useChatbotContext } from '../../contexts/ChatbotContext'; // Import the context hook
import { saveChatLogSession } from '../../services/localDataService';

// Add SpeechRecognition types for browser compatibility
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
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(false);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const [currentChatLogSession, setCurrentChatLogSession] = useState<ChatLogSession | null>(null);

  const { currentContext } = useChatbotContext(); // Get the current viewing context

  // New state for image and voice input
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);


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
    // Cleanup function for speech recognition
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSiteSettings);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [loadSiteSettings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const initializeChat = useCallback(async () => {
    if (!isUserInfoSubmitted || !isOpen || chatSession) return; 

    setIsLoading(true);
    setError(null);
    try {
      // This call will now throw a specific, catchable error if the API key is missing.
      const newChatSession = geminiService.startChat(siteSettings); 
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
      // Gracefully handle the error inside the component instead of crashing.
      console.error("Failed to initialize chat:", err);
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định.";
      const displayError = errorMessage.includes("API Key") 
        ? Constants.API_KEY_ERROR_MESSAGE 
        : "Không thể khởi tạo chatbot. Vui lòng thử lại sau.";
      setError(displayError);
      setMessages([{
        id: Date.now().toString(),
        text: `Lỗi: ${displayError}`,
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

  const saveChatLog = useCallback(async () => {
    if (currentChatLogSession && currentChatLogSession.messages.length > 0) {
      try {
        await saveChatLogSession(currentChatLogSession);
      } catch (error) {
        console.error("Failed to save chat log to backend:", error);
        // Optionally notify user of save failure, but don't block UI
      }
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
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple size check (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (imageInputRef.current) {
        imageInputRef.current.value = '';
    }
  };

  const handleToggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng nhập liệu bằng giọng nói.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.start();
  };


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if ((!input.trim() && !imageFile) || isLoading || !chatSession || !isUserInfoSubmitted) return;

    const currentInput = input;
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;

    const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        text: currentInput,
        sender: 'user',
        timestamp: new Date(),
        imageUrl: currentImagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentChatLogSession(prevLog => prevLog ? { ...prevLog, messages: [...prevLog.messages, userMessage] } : null);

    const messageWithContext = currentContext ? `[Bối cảnh: ${currentContext}]\n\n${currentInput}` : currentInput;
    
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    if (currentImagePreview) URL.revokeObjectURL(currentImagePreview);

    setIsLoading(true);
    setError(null);
    setCurrentGroundingChunks(undefined);

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessageType = { id: botMessageId, text: '', sender: 'bot', timestamp: new Date() };
    setMessages((prev) => [...prev, initialBotMessage]);
    setCurrentChatLogSession(prevLog => prevLog ? {...prevLog, messages: [...prevLog.messages, initialBotMessage]} : null);
    
    try {
        let stream: AsyncIterable<GenerateContentResponse>;

        if (currentImageFile) {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(currentImageFile);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
            });
            stream = await geminiService.sendMessageWithImage(messageWithContext, base64Data, currentImageFile.type, chatSession);
        } else {
            stream = await geminiService.sendMessageToChatStream(messageWithContext, chatSession);
        }

        let currentText = '';
        for await (const chunk of stream) {
            currentText += chunk.text; 
            setMessages((prevMessages) => prevMessages.map((msg) => msg.id === botMessageId ? { ...msg, text: currentText } : msg));
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
      setMessages((prevMessages) => prevMessages.map((msg) => msg.id === botMessageId ? { ...msg, text: `Lỗi: ${errorText}`, sender: 'system' } : msg));
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
              <ChatMessage key={msg.id} message={msg} groundingChunks={msg.id === currentBotMessageId ? currentGroundingChunks : undefined} />
            ))}
            <div ref={messagesEndRef} />
            {error && <div className="text-danger-text text-sm p-2 bg-danger-bg rounded border border-danger-border">{error}</div>}
          </div>

          <div className="p-4 border-t border-borderDefault bg-bgBase">
            {imagePreview && (
                <div className="mb-2 relative w-20 h-20">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                    <button onClick={handleRemoveImage} className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">&times;</button>
                </div>
            )}
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center space-x-2">
                <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" aria-hidden="true" />
                <Button type="button" variant="ghost" className="!px-2 text-textMuted" onClick={() => imageInputRef.current?.click()} aria-label="Đính kèm ảnh" title="Đính kèm ảnh">
                    <i className="fas fa-paperclip"></i>
                </Button>
                 <Button type="button" variant="ghost" className={`!px-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-textMuted'}`} onClick={handleToggleRecording} aria-label="Bật/tắt nhập giọng nói" title="Nhập bằng giọng nói">
                    <i className="fas fa-microphone"></i>
                </Button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-grow bg-white border border-borderStrong text-textBase rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-textSubtle"
                  disabled={isLoading || !chatSession}
                  aria-label="Tin nhắn của bạn"
                />
                <Button type="submit" isLoading={isLoading} disabled={isLoading || (!input.trim() && !imageFile) || !chatSession} aria-label="Gửi tin nhắn" className="w-10 h-10 !p-0 flex-shrink-0">
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatbot;
