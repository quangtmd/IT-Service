
import React, { useState, useEffect, useCallback } from 'react';
import { ChatLogSession, ChatMessage } from '../../types';
import { getChatLogSessions, deleteChatLogSession } from '../../services/localDataService';
import Button from '../ui/Button';

const ChatLogView: React.FC = () => {
    const [chatLogs, setChatLogs] = useState<ChatLogSession[]>([]);
    const [selectedLog, setSelectedLog] = useState<ChatLogSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const logs = await getChatLogSessions();
            setChatLogs(logs);
        } catch (error) {
            console.error("Failed to load chat logs:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa lịch sử chat này?')) {
            await deleteChatLogSession(id);
            loadLogs();
            if (selectedLog?.id === id) {
                setSelectedLog(null);
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Lịch sử Chatbot ({chatLogs.length})</h3>
            </div>
            <div className="admin-card-body">
                {isLoading ? (
                    <p>Đang tải lịch sử chat...</p>
                ) : chatLogs.length === 0 ? (
                    <p>Không có lịch sử chat nào.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 h-96 overflow-y-auto border rounded-md p-2">
                            {chatLogs.map(log => (
                                <div
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className={`p-3 rounded-md cursor-pointer mb-2 ${selectedLog?.id === log.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <p className="font-semibold">{log.userName}</p>
                                    <p className="text-xs">{new Date(log.startTime).toLocaleString('vi-VN')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="md:col-span-2">
                            {selectedLog ? (
                                <div className="bg-white p-4 border rounded-md h-96 flex flex-col">
                                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                                        <div>
                                            <h4 className="font-bold">{selectedLog.userName}</h4>
                                            <p className="text-sm text-gray-500">{selectedLog.userPhone}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(selectedLog.id)}>
                                            <i className="fas fa-trash mr-1"></i> Xóa
                                        </Button>
                                    </div>
                                    <div className="flex-grow overflow-y-auto space-y-3 p-2 bg-gray-50 rounded">
                                        {selectedLog.messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-2 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                    <p>{msg.text}</p>
                                                    {msg.imageUrl && <img src={msg.imageUrl} alt="upload" className="mt-2 rounded" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-md border">
                                    <p className="text-gray-500">Chọn một cuộc hội thoại để xem chi tiết.</p>
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
