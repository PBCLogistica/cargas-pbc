import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { analyzeLoads } from '../services/geminiService';
import { Load } from '../types';
import ReactMarkdown from 'react-markdown'; // Assuming we can use standard markdown rendering or just text

interface AIAssistantProps {
  loads: Load[];
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ loads }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Olá! Sou o assistente inteligente da Cargas PBC. Posso analisar seus dados de logística, identificar atrasos, sugerir otimizações ou responder dúvidas sobre suas cargas. Como posso ajudar hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // We pass the loads context to the AI for analysis
      const responseText = await analyzeLoads(loads, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, tive um problema ao processar sua solicitação." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Assistente PBC</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Powered by Gemini 2.5
            </p>
          </div>
        </div>
        <button 
            onClick={() => setMessages([messages[0]])}
            className="text-xs text-slate-400 hover:text-red-500 font-medium px-3 py-1 rounded-full hover:bg-slate-200 transition-colors"
        >
            Limpar Conversa
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}
            `}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-indigo-100 text-indigo-600">
               <Bot size={16} />
             </div>
             <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
               <Loader2 size={16} className="animate-spin text-indigo-500" />
               <span className="text-sm text-slate-500">Analisando dados...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre suas cargas (ex: 'Quais cargas estão atrasadas?')"
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-800 resize-none max-h-32 min-h-[44px] py-3 px-2"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              p-3 rounded-lg flex-shrink-0 transition-all
              ${input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
            A IA pode cometer erros. Verifique as informações importantes.
        </p>
      </div>
    </div>
  );
};