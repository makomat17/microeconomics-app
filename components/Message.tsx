import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const containerClasses = `flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-xl p-4 rounded-2xl prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-pre:bg-gray-800 prose-pre:p-3 prose-pre:rounded-lg ${
    isUser
      ? 'bg-blue-500 text-white rounded-br-lg'
      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg shadow-sm'
  }`;

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          AI
        </div>
      )}
      <div className={bubbleClasses}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
        </ReactMarkdown>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          You
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
