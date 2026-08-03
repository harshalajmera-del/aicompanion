'use client';
import * as React from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Message Aria…', className }: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  return (
    <div className={cn('flex items-end gap-2 p-3 bg-white border-t border-slate-100', className)}>
      <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          style={{ minHeight: '44px', maxHeight: '140px' }}
          aria-label="Message input"
        />
      </div>
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="rounded-2xl h-11 w-11 flex-shrink-0 shadow-md"
        aria-label="Send message"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
