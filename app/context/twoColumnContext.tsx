import { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | string;
  content: string;
  timestamp: string;
}

interface TwoColumnContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  summarizeChat: () => string;
  activeTab: string | null;
  setActiveTab: (tabId: string) => void;
}

const TwoColumnContext = createContext<TwoColumnContextType | undefined>(
  undefined
);

interface TwoColumnProviderProps {
  children: ReactNode;
}

export function TwoColumnProvider({ children }: TwoColumnProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const summarizeChat = () => {
    return (
      messages
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join('\n')
        .slice(0, 100) + '...'
    );
  };

  return (
    <TwoColumnContext.Provider
      value={{ messages, addMessage, summarizeChat, activeTab, setActiveTab }}
    >
      {children}
    </TwoColumnContext.Provider>
  );
}

export function useTwoColumnContext() {
  const context = useContext(TwoColumnContext);
  if (!context) {
    throw new Error(
      'useTwoColumnContext must be used within a TwoColumnProvider'
    );
  }
  return context;
}
