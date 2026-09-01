import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Key,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Zap,
  CheckSquare,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectGeminiApiKey, setGeminiApiKey } from '@/store/slices/settingsSlice';
import { sendGeminiPrompt, type GeminiMessage } from '@/services/geminiService';
import { showToast } from './Toast.utils';
import { Button } from '../primitives/Button';
import { FormattedChatMessage } from './FormattedChatMessage';

interface GeminiAiDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: Zap,
    label: 'Summarize ERP Operations',
    prompt: 'Give me a brief overview of key features and modules available in AetherERP.',
  },
  {
    icon: CheckSquare,
    label: 'Task Checklist Strategy',
    prompt:
      'How can I efficiently structure task management and team assignments in the Tasks module?',
  },
  {
    icon: CreditCard,
    label: 'Financial Insights',
    prompt: 'What financial reports and invoice metrics can I manage in AetherERP Finance?',
  },
  {
    icon: SettingsIcon,
    label: 'Settings & Theming Help',
    prompt:
      'How do I customize accent colors, dark mode, display density, and session timeouts in Settings?',
  },
];

export const GeminiAiDrawer: React.FC<GeminiAiDrawerProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const storedApiKey = useAppSelector(selectGeminiApiKey);

  const [apiKeyInput, setApiKeyInput] = useState(storedApiKey);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Hello! I am **Aether Copilot**, your Gemini AI Assistant. How can I assist you with your workspace operations, tasks, or system settings today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiKeyInput(storedApiKey);
  }, [storedApiKey]);

  useEffect(() => {
    if (visible) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, visible]);

  const handleSaveApiKey = () => {
    dispatch(setGeminiApiKey(apiKeyInput.trim()));
    setShowKeyInput(false);
    showToast({
      severity: 'success',
      summary: 'Gemini API Key Saved',
      detail: 'Your custom API Key has been stored safely.',
    });
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const effectiveKey = storedApiKey || apiKeyInput.trim();

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    // Format chat history for Gemini API
    const history: GeminiMessage[] = messages
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    try {
      const responseText = await sendGeminiPrompt(textToSend, history, effectiveKey);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errText =
        err?.message ||
        'Failed to communicate with Gemini API. Please check your API key and connection.';
      if (errText.includes('API Key') || errText.includes('authorization')) {
        setShowKeyInput(true);
      }
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ **Error**: ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. How can I help you next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-surface-elevated border-l border-border-subtle shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-foreground tracking-tight">
                      Aether Copilot
                    </h2>
                    {/* <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                            Gemini 2.5
                                        </span> */}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Agentic AI Assistant for Enterprise ERP
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Toggle API Key Settings"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    showKeyInput
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                  }`}
                >
                  <Key size={18} />
                </button>

                <button
                  type="button"
                  title="Clear Chat History"
                  onClick={handleClearHistory}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  type="button"
                  title="Close Copilot"
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Collapsible API Key Ribbon */}
            <AnimatePresence>
              {showKeyInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-border-subtle bg-surface-subtle p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Key size={14} className="text-primary" />
                      Google Gemini API Key
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Get Free Key ↗
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-1 h-9 px-3 text-xs rounded-lg bg-surface border border-border-strong text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
                    />
                    <Button
                      variant="primary"
                      onClick={handleSaveApiKey}
                      className="h-9 px-4 text-xs font-bold rounded-lg! bg-primary! text-white!"
                    >
                      Save Key
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-subtle/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                      msg.sender === 'user'
                        ? 'bg-primary shadow-xs'
                        : 'bg-surface border border-border-strong text-primary shadow-xs'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  {/* Message Card */}
                  <div
                    className={`group relative max-w-[86%] p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white font-medium rounded-tr-none shadow-md shadow-primary/10'
                        : 'bg-surface border border-border-subtle text-foreground rounded-tl-none shadow-soft backdrop-blur-md'
                    }`}
                  >
                    <FormattedChatMessage content={msg.text} isUser={msg.sender === 'user'} />

                    <div
                      className={`flex items-center justify-between gap-4 mt-2.5 pt-2 border-t text-[10px] ${
                        msg.sender === 'user'
                          ? 'border-white/20 text-white/80'
                          : 'border-border-subtle text-muted-foreground'
                      }`}
                    >
                      <span className="font-mono text-[9px]">{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border-strong flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                  <div className="bg-surface border border-border-strong p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 border-t border-border-subtle bg-surface flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => {
                const IconComp = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(qp.prompt)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle hover:border-primary/50 text-[11px] font-semibold text-foreground whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <IconComp size={13} className="text-primary" />
                    {qp.label}
                  </button>
                );
              })}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask Aether Copilot anything about your ERP..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={loading}
                  className="flex-1 h-11 px-4 text-xs rounded-xl bg-surface-subtle border border-border-strong text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !inputPrompt.trim()}
                  className="h-11 px-4 rounded-xl! bg-primary! text-white! cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
