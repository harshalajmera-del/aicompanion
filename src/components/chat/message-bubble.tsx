'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { AriaAvatar } from '@/components/ui/avatar';
import { TypingIndicator } from '@/components/ui/spinner';
import type { ChatMessage, QuickReply } from '@/types/conversation';

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReply?: (reply: QuickReply) => void;
}

export function MessageBubble({ message, onQuickReply }: MessageBubbleProps) {
  const isAria = message.role === 'assistant';
  const isUser = message.role === 'user';

  if (message.type === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-2"
      >
        <AriaAvatar size="sm" />
        <TypingIndicator />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex items-end gap-2', isUser && 'flex-row-reverse')}
      data-testid="message-bubble"
    >
      {isAria && <AriaAvatar size="sm" className="mb-1 flex-shrink-0" />}

      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start', 'max-w-[82%]')}>
        <div className={cn(isUser ? 'message-user' : 'message-aria')}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.isStreaming ? (
              <>
                {message.content}
                <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse-soft align-middle" />
              </>
            ) : message.content}
          </p>
        </div>

        {/* Quick replies — only shown on last aria message */}
        {isAria && message.quickReplies && message.quickReplies.length > 0 && !message.isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mt-1 ml-1"
          >
            {message.quickReplies.map(reply => (
              <button
                key={reply.id}
                onClick={() => onQuickReply?.(reply)}
                className="chip-outline text-xs py-1.5 px-3 rounded-full border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
              >
                {reply.label}
              </button>
            ))}
          </motion.div>
        )}

        <span className="text-[10px] text-slate-400 px-1">
          {formatDate(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </motion.div>
  );
}
