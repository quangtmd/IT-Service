import React, { useState, useEffect } from 'react';
import { ChatLogSession } from '../../types';
import ChatMessage from '../chatbot/ChatMessage';
import { getChatLogs } from '../../services/localDataService';

const ChatLogView: React.FC = () => {
    const [chatLogs, setChatLogs] = useState<ChatLogSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [selectedSession, setSelectedSession] = useState<ChatLogSession | null>(null);

    useEffect(() => {
        const loadLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const logs = await getChatLogs();
                
                // Deduplicate logs based on ID, keeping the one with the most messages (latest update)
                const uniqueLogMap = new Map<string, ChatLogSession>();
                logs.forEach(log => {
                    const existing = uniqueLogMap.get(log.id);
                    if (!existing || (log.messages && existing.messages && log.messages.length > existing.messages.length)) {
                        uniqueLogMap.set(log.id, log);
                    }
                });
                
                const uniqueLogs = Array.from(uniqueLogMap.values()).sort((a, b) => 
                    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                );

                setChatLogs(uniqueLogs);
                
                if (uniqueLogs.length > 0) {
                    setSelectedSession(uniqueLogs[0]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải lịch sử chat.');
            } finally {
                setIsLoading(false);
            }
        };
        loadLogs();
    }, []);
    
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Lịch sử Chatbot AI</h3>
            </div>
            <div className="admin-card-body">
                {isLoading ? (
                    <p className="text-center text-textMuted">Đang tải lịch sử chat...</p>
                ) : error ? (
                    <p className="text-center text-danger-text">{error}</p>
                ) : chatLogs.length === 0 ? (
                    <p className="text-center text-textMuted">Chưa có lịch sử hội thoại nào được ghi lại.</p>
                ) : (
                    <div className="chat-log-viewer">
                        <div className="chat-log-list">
                            {chatLogs.map(session => (
                                <div 
                                    key={session.id}
                                    className={`chat-log-list-item ${selectedSession?.id === session.id ? 'active' : ''}`}
                                    onClick={() => setSelectedSession(session)}
                                >
                                    <p className="font-semibold text-sm text-textBase">{session.userName}</p>
                                    <p className="text-xs text-textMuted">{session.userPhone}</p>
                                    <p className="text-xs text-textSubtle mt-1">{new Date(session.startTime).toLocaleString('vi-VN')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="chat-log-detail">
                            {selectedSession ? (
                                <>
                                    <div className="p-3 border-b border-borderDefault flex-shrink-0">
                                        <h4 className="font-semibold">{selectedSession.userName}</h4>
                                        <p className="text-xs text-textMuted">Bắt đầu lúc: {new Date(selectedSession.startTime).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="chat-log-messages">
                                        {selectedSession.messages.map(msg => (
                                            <ChatMessage key={msg.id} message={msg} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-textMuted">
                                    <p>Chọn một hội thoại để xem chi tiết.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLogView;