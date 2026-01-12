import React, { useState, useEffect, useRef } from 'react';
import { NetworkManager } from '../game/managers/NetworkManager';

interface ChatMessage {
  userId: string;
  name: string;
  text: string;
  timestamp: number;
}

interface ChatOverlayProps {
  networkManager: NetworkManager;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ networkManager }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChat = (data: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), data]);
    };

    networkManager.on('chat', handleChat);

    return () => {
      networkManager.off('chat', handleChat);
    };
  }, [networkManager]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputText.trim() && inputText.length <= 500) {
      networkManager.sendChat(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 left-4 w-96 bg-slate-900/95 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <h3 className="text-white font-semibold">Chat</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  <span className="text-slate-500 text-xs">{formatTime(msg.timestamp)}</span>
                  <span className="text-blue-400 font-semibold ml-2">{msg.name}:</span>
                  <span className="text-white ml-1">{msg.text}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1 px-3 py-2 bg-slate-800 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{inputText.length}/500</p>
          </form>
        </>
      )}
    </div>
  );
};
