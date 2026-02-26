import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { sendChatMessage, analyzeWallet, hasGroqKey } from '../../modules/llm';
import { buildWalletSnapshot } from '../../modules/analytics';
import type { ParsedAddress, ChatMessage } from '../../types';

interface ChatPanelProps {
  walletId: string;
  parsedData: ParsedAddress | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ChatPanel({ walletId, parsedData }: ChatPanelProps) {
  const { chatHistories, addChatMessage, clearChatHistory } = useWalletStore();
  const history = chatHistories[walletId] || [];
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiLoading]);

  const hasKey = hasGroqKey();

  const addMsg = (msg: ChatMessage) => addChatMessage(walletId, msg);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isAiLoading || !parsedData) return;
    setInput('');
    setError('');

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMsg(userMsg);
    setIsAiLoading(true);

    try {
      const snapshot = buildWalletSnapshot(parsedData);
      const response = await sendChatMessage(snapshot, [...history, userMsg], text);
      addMsg({
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (isAiLoading || !parsedData) return;
    setError('');
    setIsAiLoading(true);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: '🔍 Analyze my wallet comprehensively',
      timestamp: new Date().toISOString(),
    };
    addMsg(userMsg);

    try {
      const snapshot = buildWalletSnapshot(parsedData);
      const response = await analyzeWallet(snapshot);
      addMsg({
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAnalyze}
          disabled={isAiLoading || !parsedData || !hasKey}
          title={!hasKey ? 'Set VITE_GROQ_API_KEY to enable AI' : !parsedData ? 'Load wallet data first' : ''}
        >
          <Sparkles size={13} />
          Analyze Wallet
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => clearChatHistory(walletId)}
          disabled={history.length === 0}
        >
          <Trash2 size={13} /> Clear chat
        </button>
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Bot size={11} />
          Llama 3 · Groq
        </div>
      </div>

      {/* API key warning */}
      {!hasKey && (
        <div className="alert alert-warning" style={{ marginBottom: '12px' }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>Set <code style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: '3px' }}>VITE_GROQ_API_KEY</code> in your <code style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: '3px' }}>.env</code> file to enable AI chat.</span>
        </div>
      )}

      {/* No wallet data warning */}
      {!parsedData && (
        <div className="alert alert-info" style={{ marginBottom: '12px' }}>
          <Bot size={14} style={{ flexShrink: 0 }} />
          <span>Load wallet data first to enable AI analysis.</span>
        </div>
      )}

      {/* Chat area */}
      <div className="chat-panel">
        <div className="chat-messages">
          {history.length === 0 && !isAiLoading && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
              <p>Click <strong style={{ color: 'var(--accent)' }}>Analyze Wallet</strong> for a full AI analysis,<br />or ask any question about this wallet.</p>
            </div>
          )}

          {history.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                  {msg.content}
                </div>
                <div className="chat-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="chat-message assistant">
              <div className="chat-avatar ai-avatar">🤖</div>
              <div>
                <div className="chat-bubble ai-bubble">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ margin: '0 12px 8px', borderRadius: '8px' }}>
            <AlertTriangle size={13} />
            <span style={{ fontSize: '12px' }}>{error}</span>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={hasKey && parsedData ? 'Ask about this wallet... (Enter to send)' : 'Configure GROQ key and load wallet data first'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiLoading || !hasKey || !parsedData}
            rows={1}
          />
          <button
            className="btn btn-primary btn-icon"
            onClick={handleSend}
            disabled={!input.trim() || isAiLoading || !hasKey || !parsedData}
          >
            {isAiLoading ? <div className="spinner" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        ⚠️ AI responses are informational only and do not constitute financial advice. •
        Wallet address and transaction data are sent to Groq's API for analysis.
      </div>
    </div>
  );
}
