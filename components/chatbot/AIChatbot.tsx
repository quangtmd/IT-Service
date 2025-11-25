
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk, Service, SiteSettings, ChatLogSession, Product, Order } from '../../types';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import geminiService from '../../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import * as Constants from '../../constants.tsx'; 
import { useChatbotContext } from '../../contexts/ChatbotContext'; // Import the context hook
import { saveChatLogSession, getCustomerOrders, getOrders } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';

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
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const [currentChatLogSession, setCurrentChatLogSession] = useState<ChatLogSession | null>(null);

  const { currentContext } = useChatbotContext(); // Get the current viewing context
  const { currentUser } = useAuth(); // Get current user for order lookups

  // Initialize based on whether user is logged in initially
  const [isUserInfoSubmitted, setIsUserInfoSubmitted] = useState(!!currentUser);


  // New state for image and voice input
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


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

  // Handle auto-filling user info if logged in, and resetting state when chat closes
  useEffect(() => {
    // Sync user info with auth state
    if (currentUser) {
        setIsUserInfoSubmitted(true);
        setUserName(currentUser.username);
        setUserPhone(currentUser.phone || '');
    } else {
        // If user logs out, reset the form state
        setIsUserInfoSubmitted(false);
        setUserName('');
        setUserPhone('');
    }
  }, [currentUser]);

  useEffect(() => {
    // Reset only chat-session-specific state when chat is closed
    if (!isOpen) {
      setChatSession(null);
      setMessages([]);
      setInput('');
      setError(null);
      setCurrentChatLogSession(null);
      handleRemoveImage(); // Clear any selected image
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // When the bot is not loading and the chat is open, focus the input
    // Use a slight delay to allow the UI transition to complete on mobile
    if (!isLoading && isOpen && inputRef.current) {
       setTimeout(() => {
          inputRef.current?.focus();
       }, 300); 
    }
  }, [isLoading, isOpen]);

  const initializeChat = useCallback(async () => {
    // Check if user info is submitted (either by form or auto-filled) and chat isn't already active
    if (!isUserInfoSubmitted || !isOpen || chatSession) return; 

    setIsLoading(true);
    setError(null);
    try {
      // Update startChat to pass currentUser
      const newChatSession = geminiService.startChat(siteSettings, currentUser); 
      setChatSession(newChatSession);
      const initialBotGreeting = currentUser 
        ? `Chào ${currentUser.username}! Em là trợ lý AI của ${siteSettings.companyName}. Em có thể hỗ trợ gì cho anh/chị hôm nay ạ?`
        : `Xin chào ${userName}! Em là trợ lý AI của ${siteSettings.companyName}. Em có thể giúp gì cho bạn ạ?`;
        
      const welcomeMessage = { 
        id: Date.now().toString(), 
        text: initialBotGreeting,
        sender: 'bot' as const, 
        timestamp: new Date() 
      };
      setMessages([welcomeMessage]);
      
      const newLogSession: ChatLogSession = {
        id: `chat-${Date.now()}`,
        userName: currentUser ? currentUser.username : userName,
        userPhone: currentUser ? (currentUser.phone || '') : userPhone,
        startTime: new Date().toISOString(),
        messages: [welcomeMessage]
      };
      setCurrentChatLogSession(newLogSession);

    } catch (err) {
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
  }, [isOpen, isUserInfoSubmitted, chatSession, siteSettings, userName, userPhone, currentUser]);


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
      }
    }
  }, [currentChatLogSession]);

  useEffect(() => {
    const handleBeforeUnload = () => {
        if (currentChatLogSession && currentChatLogSession.messages.length > 1) {
             saveChatLog();
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentChatLogSession, saveChatLog]);
  
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
    if (imageInputRef.current) imageInputRef.current.value = '';

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
        const functionCalls: any[] = [];
        
        for await (const chunk of stream) {
            if (chunk.functionCalls) {
                functionCalls.push(...chunk.functionCalls);
            }
            if(chunk.text) {
                currentText += chunk.text;
                setMessages((prevMessages) => prevMessages.map((msg) => msg.id === botMessageId ? { ...msg, text: currentText } : msg));
                setCurrentChatLogSession(prevLog => {
                    if (!prevLog) return null;
                    const updatedMessages = prevLog.messages.map(m => m.id === botMessageId ? {...m, text: currentText } : m);
                    return {...prevLog, messages: updatedMessages};
                });
            }
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                setCurrentGroundingChunks(chunk.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[]);
            }
        }

        if (functionCalls.length > 0) {
            setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: "Đang tìm kiếm thông tin..." } : msg));
            setIsLoading(true);

            // Process all function calls (typically just one in this context)
            for (const call of functionCalls) {
                let toolResponsePayload;
                let functionName = call.name;

                try {
                    // --- TOOL 1: getOrderStatus ---
                    if (functionName === 'getOrderStatus') {
                        let orderIdArg = call.args.orderId;
                        if (typeof orderIdArg !== 'string') orderIdArg = String(orderIdArg);
                        
                        const cleanInput = orderIdArg.trim().toLowerCase();
                        const cleanInputDigits = cleanInput.replace(/\D/g, '');
            
                        if (cleanInput) {
                            const allOrders = await getOrders();
                            const orderResult = allOrders.find(o => {
                                const id = o.id.toLowerCase();
                                if (id === cleanInput) return true;
                                if (id.endsWith(cleanInput)) return true;
                                if (cleanInput.length > 5 && id.includes(cleanInput)) return true;
                                const idDigits = id.replace(/\D/g, '');
                                if (cleanInputDigits.length >= 4 && idDigits.endsWith(cleanInputDigits)) return true;
                                return false;
                            }) || null;

                            if (orderResult) {
                                toolResponsePayload = {
                                    id: orderResult.id,
                                    status: orderResult.status,
                                    totalAmount: orderResult.totalAmount,
                                    shippingAddress: orderResult.customerInfo.address,
                                    shippingCarrier: orderResult.shippingInfo?.carrier,
                                    shippingTrackingNumber: orderResult.shippingInfo?.trackingNumber
                                };
                            } else {
                                toolResponsePayload = { status: "not_found", message: `Không tìm thấy đơn hàng nào khớp với mã "${orderIdArg}".` };
                            }
                        }
                    } 
                    // --- TOOL 2: lookupCustomerOrders ---
                    else if (functionName === 'lookupCustomerOrders') {
                        let identifier = call.args.identifier;
                        if (typeof identifier !== 'string') identifier = String(identifier);
                        const cleanIdentifier = identifier.trim().toLowerCase();

                        const allOrders = await getOrders();
                        // Filter orders matching phone, email, or user ID
                        const matchingOrders = allOrders.filter(o => {
                            const phoneMatch = o.customerInfo.phone?.replace(/\D/g, '').includes(cleanIdentifier.replace(/\D/g, ''));
                            const emailMatch = o.customerInfo.email?.toLowerCase().includes(cleanIdentifier);
                            const userIdMatch = o.userId === cleanIdentifier;
                            return phoneMatch || emailMatch || userIdMatch;
                        });

                        if (matchingOrders.length > 0) {
                            // Provide a summary of recent orders (max 5)
                            toolResponsePayload = {
                                count: matchingOrders.length,
                                orders: matchingOrders.slice(0, 5).map(o => ({
                                    id: o.id,
                                    date: o.orderDate,
                                    status: o.status,
                                    total: o.totalAmount,
                                    itemCount: o.items.length
                                }))
                            };
                        } else {
                            toolResponsePayload = { 
                                count: 0, 
                                message: `Không tìm thấy lịch sử mua hàng nào cho "${identifier}".` 
                            };
                        }
                    } else {
                        toolResponsePayload = { error: "Unknown function called." };
                    }

                    const toolResponseStream = await chatSession.sendToolResponse({
                        functionResponses: [{
                            id: call.id,
                            name: call.name,
                            response: { result: toolResponsePayload }
                        }]
                    });

                    let finalText = '';
                    for await (const finalChunk of toolResponseStream) {
                        if (finalChunk.text) {
                            finalText += finalChunk.text;
                             setMessages((prevMessages) => prevMessages.map((msg) => msg.id === botMessageId ? { ...msg, text: finalText } : msg));
                             setCurrentChatLogSession(prevLog => {
                                if (!prevLog) return null;
                                const updatedMessages = prevLog.messages.map(m => m.id === botMessageId ? {...m, text: finalText } : m);
                                return {...prevLog, messages: updatedMessages};
                            });
                        }
                    }

                } catch (toolError) {
                     console.error("Error executing tool or sending response:", toolError);
                     setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: 'Rất tiếc, đã có lỗi khi truy xuất thông tin.', sender: 'system' } : msg));
                }
            }
        }

    } catch (err) {
      console.error("Error sending message:", err);
      let errorText = "Đã có lỗi xảy ra khi giao tiếp với AI. Vui lòng thử lại sau.";
      if (err instanceof Error) {
        if (err.message.includes("503") || err.message.toLowerCase().includes("overloaded")) {
          errorText = "Hệ thống AI đang quá tải, vui lòng thử lại sau giây lát.";
        }
      }
      
      const errorMessageForUser = `Lỗi: ${errorText}`;

      setMessages((prevMessages) => prevMessages.map((msg) => msg.id === botMessageId ? { ...msg, text: errorMessageForUser, sender: 'system' } : msg));
      
      setCurrentChatLogSession(prevLog => {
        if (!prevLog) return null;
        const updatedMessages = prevLog.messages.map(m => m.id === botMessageId ? {...m, text: errorMessageForUser, sender: 'system' as const } : m);
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
      className={`fixed z-50 transition-all duration-300 ease-in-out bg-bgBase shadow-2xl flex flex-col
        ${isOpen 
          ? 'translate-y-0 opacity-100 pointer-events-auto' 
          : 'translate-y-full opacity-0 pointer-events-none'
        }
        /* Mobile Styles: Full screen fixed */
        inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[calc(100vh-10rem)] sm:max-h-[600px] sm:rounded-xl sm:border sm:border-borderDefault
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      <header className="bg-primary text-white p-4 flex justify-between items-center sm:rounded-t-xl shadow-md shrink-0">
        <div className="flex flex-col">
            <h3 id="chatbot-title" className="font-semibold text-lg flex items-center gap-2">
                <i className="fas fa-robot"></i>
                Trợ lý AI {siteSettings.companyName}
            </h3>
            {currentUser && <span className="text-xs text-white/80">Xin chào, {currentUser.username}</span>}
        </div>
        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" aria-label="Đóng chatbot">
          <i className="fas fa-times text-xl"></i>
        </button>
      </header>

      {!isUserInfoSubmitted ? (
        <div className="p-6 flex-grow flex flex-col justify-center bg-bgCanvas overflow-y-auto">
          <div className="text-center mb-8">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <i className="fas fa-user-shield text-4xl"></i>
             </div>
             <h4 className="text-xl font-bold text-textBase mb-2">Thông tin của bạn</h4>
             <p className="text-sm text-textMuted">Vui lòng cung cấp thông tin để chúng tôi hỗ trợ bạn tốt hơn.</p>
          </div>
          
          {userInfoError && <p className="text-sm text-danger-text mb-4 bg-danger-bg p-3 rounded-md border border-danger-border text-center">{userInfoError}</p>}
          
          <form onSubmit={handleUserInfoSubmit} className="space-y-5 max-w-xs mx-auto w-full">
            <div>
              <label htmlFor="userName" className="sr-only">Tên của bạn</label>
              <div className="relative">
                  <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-textSubtle"></i>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Tên của bạn *"
                    className="input-style pl-10 w-full py-3" 
                    aria-required="true"
                  />
              </div>
            </div>
            <div>
              <label htmlFor="userPhone" className="sr-only">Số điện thoại</label>
              <div className="relative">
                  <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-textSubtle"></i>
                  <input
                    type="tel"
                    id="userPhone"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Số điện thoại *"
                    className="input-style pl-10 w-full py-3" 
                    aria-required="true"
                  />
              </div>
            </div>
            <Button type="submit" className="w-full shadow-lg shadow-primary/30" size="lg" isLoading={isLoading}>
              Bắt đầu trò chuyện
            </Button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-grow p-4 overflow-y-auto bg-bgCanvas scroll-smooth" aria-live="polite">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} groundingChunks={msg.id === currentBotMessageId ? currentGroundingChunks : undefined} />
            ))}
            <div ref={messagesEndRef} />
            {error && <div className="text-danger-text text-sm p-3 bg-danger-bg rounded-lg border border-danger-border mx-4 mb-4 text-center">{error}</div>}
          </div>

          <div className="p-3 sm:p-4 border-t border-borderDefault bg-bgBase shrink-0 pb-safe">
            {imagePreview && (
                <div className="mb-2 relative w-20 h-20 group">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg border border-borderDefault shadow-sm" />
                    <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">&times;</button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
               <div className="flex-shrink-0 flex gap-1">
                    <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" aria-hidden="true" />
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-textMuted hover:text-primary hover:bg-bgMuted rounded-full transition-colors" onClick={() => imageInputRef.current?.click()} aria-label="Đính kèm ảnh">
                        <i className="fas fa-paperclip text-lg"></i>
                    </button>
                    <button type="button" className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-textMuted hover:text-primary hover:bg-bgMuted'}`} onClick={handleToggleRecording} aria-label="Nhập giọng nói">
                        <i className="fas fa-microphone text-lg"></i>
                    </button>
               </div>
               
               <div className="flex-grow relative">
                    <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full bg-bgMuted border-none text-textBase rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-textSubtle shadow-inner"
                    disabled={isLoading || !chatSession}
                    aria-label="Tin nhắn của bạn"
                    />
               </div>

                <button 
                    type="submit" 
                    disabled={isLoading || (!input.trim() && !imageFile) || !chatSession} 
                    className="w-10 h-10 flex-shrink-0 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95"
                    aria-label="Gửi"
                >
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatbot;
