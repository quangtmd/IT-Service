import React from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk } from '../../types';
import Markdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
  groundingChunks?: GroundingChunk[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, groundingChunks }) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${
          isUser ? 'bg-primary text-white rounded-br-none' : 
          isBot ? 'bg-bgMuted text-textBase rounded-bl-none border border-borderDefault' : 
          'bg-warning-bg text-warning-text text-sm italic text-center w-full border border-warning-border' 
        }`}
      >
        {isSystem ? (
          message.text
        ) : (
          <Markdown
            components={{
              p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
              a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          >
            {message.text}
          </Markdown>
        )}
        {isBot && groundingChunks && groundingChunks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-borderDefault">
            <p className="text-xs text-textMuted mb-1">Nguồn thông tin:</p>
            <ul className="list-disc list-inside">
              {groundingChunks.map((chunk, index) => (
                <li key={index} className="text-xs">
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;