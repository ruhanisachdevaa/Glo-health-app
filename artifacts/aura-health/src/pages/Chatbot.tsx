import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetChatMessages, useSendChatMessage } from "@workspace/api-client-react";
import { Send, Bot, User, Sparkles, Globe } from "lucide-react";
import { format } from "date-fns";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useGetChatMessages();
  const sendMessage = useSendChatMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    sendMessage.mutate({
      data: {
        content: input,
        language
      }
    });
    setInput("");
  };

  const getGreeting = () => {
    return language === "en" 
      ? "Hi there! I'm Glo. Ask me anything about periods, cycles, or women's health. I'm here to bust myths and share facts."
      : "नमस्ते! मैं ऑरा हूँ। माहवारी, चक्र या महिलाओं के स्वास्थ्य के बारे में मुझसे कुछ भी पूछें। मैं यहाँ मिथकों को तोड़ने और तथ्य साझा करने के लिए हूँ।";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col pb-4 md:pb-0"
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-card border rounded-t-3xl p-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center relative">
            <Sparkles size={24} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-foreground leading-tight">Glo Guide</h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Health Myth-buster</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 rounded-full p-1">
          <Globe size={16} className="text-muted-foreground ml-2" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
            className="bg-transparent text-sm font-medium pr-2 border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="en">English (UK)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 bg-secondary/10 border-x overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* Welcome Message */}
        <div className="flex justify-start">
          <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm p-4 max-w-[85%] sm:max-w-[70%]">
            <p className="text-foreground leading-relaxed">{getGreeting()}</p>
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages?.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {["Can you swim on your period?", "Is it normal to skip a period?", "Does chocolate actually help cramps?"].map(q => (
              <button 
                key={q}
                onClick={() => setInput(q)}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-primary/20"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages?.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-auto hidden sm:flex">
                    <Sparkles size={14} />
                  </div>
                )}
                
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-tr-sm" 
                      : "bg-card border text-foreground rounded-tl-sm"
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className={`text-[10px] font-medium text-muted-foreground mt-1 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {sendMessage.isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm p-4 w-20 flex items-center justify-center gap-1.5 h-12">
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card border rounded-b-3xl p-4 shrink-0 shadow-sm z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === "en" ? "Type your question..." : "अपना प्रश्न टाइप करें..."}
            className="w-full bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background rounded-full pl-6 pr-14 py-4 outline-none transition-all shadow-inner"
            disabled={sendMessage.isPending}
          />
          <button 
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="absolute right-2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-wider font-bold">
          Glo provides guidance, not medical diagnosis.
        </p>
      </div>
    </motion.div>
  );
}
