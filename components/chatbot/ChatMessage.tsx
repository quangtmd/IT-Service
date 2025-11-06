import React from 'react';
import { Link } from 'react-router-dom';
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
        className={`max-w-xs lg:max-w-md rounded-xl shadow overflow-hidden ${
          isUser ? 'bg-primary text-white rounded-br-none' : 
          isBot ? 'bg-gray-700 text-white rounded-bl-none' : 
          'bg-warning-bg text-warning-text text-sm italic text-center w-full border border-warning-border' 
        }`}
      >
        {isUser && message.imageUrl && (
            <img src={message.imageUrl} alt="User upload" className="max-h-48 w-full object-cover" />
        )}
        
        {(message.text || isSystem || (isBot && groundingChunks && groundingChunks.length > 0)) && (
          <div className="px-4 py-2">
            {isSystem ? (
              message.text
            ) : (
              <Markdown
                components={{
                  p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                  a: ({ node, href, ...props }) => {
                    // Check if it's an internal hash link for our SPA
                    if (href && href.includes(window.location.origin) && href.includes('#/')) {
                      const path = href.substring(href.indexOf('#') + 1); // Get the path after the '#'
                      return <Link to={path} {...props} className="text-primary hover:underline" />;
                    }
                    // Default to external link behavior
                    return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                  },
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
        )}
      </div>
    </div>
  );
};

export default ChatMessage;