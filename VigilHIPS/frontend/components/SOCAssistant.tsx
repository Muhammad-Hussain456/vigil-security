import React, { useState, useRef, useEffect } from 'react';
import { Alert, ChatMessage } from '../types.ts';
import { queryCopilot } from '../services/geminiService.ts';
import { MessageSquare, Send, X, Bot, Sparkles, Minimize2, Maximize2 } from 'lucide-react';

interface SOCAssistantProps {
  alerts: Alert[];
  endpointsCount: number;
}

export const SOCAssistant: React.FC<SOCAssistantProps> = ({ alerts, endpointsCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello. I am VIGIL Copilot (Gemini 3 Pro). I'm monitoring the live telemetry. How can I assist you?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = {
      alerts: alerts,
      systemStats: {
        totalEndpoints: endpointsCount,
        compromised: alerts.filter(a => a.severity === 'CRITICAL').length > 0 ? 'DETECTED' : 'NONE'
      }
    };

    const responseText = await queryCopilot([...messages, userMsg], context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group border border-white/20 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
          <Sparkles className="w-6 h-6 text-white" />
          {/* Badge removed as requested */}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] md:w-[450px] h-[80vh] md:h-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">VIGIL Copilot</h3>
                <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 space-x-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span>Gemini 3 Pro Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded hover:bg-black/5 dark:hover:bg-white/10">
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className={`text-[9px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-bl-none flex items-center space-x-2 shadow-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about active threats, campaigns, or policies..."
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-400 flex items-center justify-center">
                 <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                 Powered by Gemini 3 Pro • Context Window: 1M Tokens
               </span>
            </div>
          </form>

        </div>
      )}
    </>
  );
};