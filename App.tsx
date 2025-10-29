import React, { useState, useEffect } from 'react';
// FIX: The correct class name is GoogleGenAI, not GoogleGenerativeAI.
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import type { Message } from './types';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import { SYSTEM_INSTRUCTION, INITIAL_GREETING } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  // FIX: Removed extra '=' which caused a syntax error.
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY is not configured.");
        }
        // FIX: Use the correct class name GoogleGenAI for instantiation.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        setChat(chatSession);
        
        // Add initial greeting message from AI
        setMessages([
          {
            id: crypto.randomUUID(),
            text: INITIAL_GREETING,
            sender: 'ai',
          },
        ]);

      } catch (e: any) {
        console.error("Failed to initialize chat:", e);
        setError(`Failed to initialize AI Tutor. Please check your API key configuration. Error: ${e.message}`);
      }
    };
    initChat();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
    };

    const aiMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: aiMessageId, text: '', sender: 'ai' },
    ]);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponse += chunkText;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
      }
    } catch (e: any) {
      console.error("Error sending message to Gemini:", e);
      const errorMessageText = `Sorry, I encountered an error. Please try again. Details: ${e.message}`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: errorMessageText } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 shadow-2xl rounded-lg my-0 sm:my-4">
      <Header />
      {error && (
        <div className="p-4 m-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      <ChatInterface messages={messages} />
      <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
