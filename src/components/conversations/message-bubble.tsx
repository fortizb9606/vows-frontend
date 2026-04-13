'use client';

import type { Database } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bot, CheckCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = Database['public']['Tables']['messages']['Row'];

interface MessageBubbleProps {
  message: Message;
  isAgent: boolean;
}

export function MessageBubble({ message, isAgent }: MessageBubbleProps) {
  const isBot = message.sender_type === 'AI_BOT';

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  return (
    <div className={cn('flex mb-3', isAgent ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex items-end gap-2.5 max-w-xs lg:max-w-lg', isAgent ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar for lead/bot messages */}
        {!isAgent && (
          <div className="flex-shrink-0">
            {isBot ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                <Bot size={16} className="text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-white">L</span>
              </div>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'rounded-xl px-4 py-3 shadow-sm transition-all',
              isAgent
                ? 'bg-blue-600 text-white rounded-br-none'
                : isBot
                  ? 'bg-purple-100 text-gray-900 rounded-bl-none border border-purple-200'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
            )}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>

          {/* Time and Status */}
          <div className={cn('flex items-center gap-1.5 px-2', isAgent ? 'justify-end' : 'justify-start')}>
            <p className="text-xs text-gray-500">{formatTime(message.created_at)}</p>
            {isAgent && (
              <CheckCheck size={14} className="text-blue-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
