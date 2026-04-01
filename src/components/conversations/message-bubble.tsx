import { Database } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bot } from 'lucide-react';

type Message = Database['public']['Tables']['messages']['Row'];

interface MessageBubbleProps {
  message: Message;
  isAgent: boolean;
}

export function MessageBubble({ message, isAgent }: MessageBubbleProps) {
  const isBot = message.sender_type === 'AI_BOT';

  const getBgColor = () => {
    if (isAgent) {
      return 'bg-blue-500 text-white';
    } else if (isBot) {
      return 'bg-purple-100 text-gray-900';
    } else {
      return 'bg-gray-200 text-gray-900';
    }
  };

  const getAlignment = () => {
    if (isAgent) {
      return 'ml-auto';
    } else {
      return 'mr-auto';
    }
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${getAlignment()}`}>
        <div className={`flex ${isAgent ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
          {isBot && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                <Bot size={16} className="text-purple-700" />
              </div>
            </div>
          )}
          <div>
            <div className={`rounded-lg px-4 py-2 ${getBgColor()}`}>
              <p className="text-sm">{message.content}</p>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isAgent ? 'text-right' : 'text-left'}`}>
              {formatTime(message.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
