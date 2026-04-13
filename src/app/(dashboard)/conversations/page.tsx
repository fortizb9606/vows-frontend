'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from '@/components/conversations/message-bubble';
import { MessageCircle, Mail, Send, Menu, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Conversation = Database['public']['Tables']['conversations']['Row'] & {
  leads?: Database['public']['Tables']['leads']['Row'];
};

type Message = Database['public']['Tables']['messages']['Row'];

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [channelFilter]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from('conversations')
        .select('*, leads(id, name, email, phone)')
        .order('updated_at', { ascending: false });

      if (channelFilter !== 'all') {
        query = query.eq('channel', channelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setConversations(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);

      await markAsRead(selectedConversation.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ has_unread: false })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_type: 'AGENT',
        content: messageInput,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessageInput('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WHATSAPP':
        return <MessageCircle size={16} className="text-green-500" />;
      case 'WEB_CHAT':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'EMAIL':
        return <Mail size={16} className="text-purple-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'WEB_CHAT':
        return 'Web Chat';
      case 'EMAIL':
        return 'Email';
      default:
        return channel;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'WHATSAPP':
        return 'bg-green-50 border-green-200';
      case 'WEB_CHAT':
        return 'bg-blue-50 border-blue-200';
      case 'EMAIL':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-gray-50">
      {/* Left Panel - Conversation List */}
      <div
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          'md:w-80 md:relative absolute inset-y-0 left-0 z-40',
          sidebarOpen ? 'w-80' : 'w-0 -translate-x-full md:translate-x-0'
        )}
      >
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Channel Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setChannelFilter('all')}
              variant={channelFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap rounded-lg font-medium transition-all',
                channelFilter === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Todas
            </Button>
            <Button
              onClick={() => setChannelFilter('WHATSAPP')}
              variant={channelFilter === 'WHATSAPP' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap rounded-lg font-medium transition-all flex items-center gap-2',
                channelFilter === 'WHATSAPP'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <MessageCircle size={14} />
              WhatsApp
            </Button>
            <Button
              onClick={() => setChannelFilter('WEB_CHAT')}
              variant={channelFilter === 'WEB_CHAT' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap rounded-lg font-medium transition-all flex items-center gap-2',
                channelFilter === 'WEB_CHAT'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <MessageCircle size={14} />
              Web Chat
            </Button>
            <Button
              onClick={() => setChannelFilter('EMAIL')}
              variant={channelFilter === 'EMAIL' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap rounded-lg font-medium transition-all flex items-center gap-2',
                channelFilter === 'EMAIL'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Mail size={14} />
              Email
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-600">Cargando conversaciones...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-600">No hay conversaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full p-4 text-left transition-all hover:bg-gray-50',
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'border-l-4 border-transparent'
                  )}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
                        getChannelColor(conversation.channel)
                      )}>
                        {getChannelIcon(conversation.channel)}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {conversation.leads?.name || 'Cliente Desconocido'}
                        </h3>
                        {conversation.has_unread && (
                          <Badge className="bg-blue-600 text-white text-xs ml-auto flex-shrink-0">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {conversation.leads?.email || conversation.leads?.phone || 'Sin contacto'}
                      </p>
                    </div>
                  </div>

                  {/* Last Message */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-1 pl-15">
                    {conversation.last_message_preview || 'Sin mensajes'}
                  </p>

                  {/* Time */}
                  <p className="text-xs text-gray-500 pl-15">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Messages */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile menu toggle */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu size={20} />
                  </button>

                  {/* Avatar */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
                    getChannelColor(selectedConversation.channel)
                  )}>
                    {getChannelIcon(selectedConversation.channel)}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.leads?.name || 'Cliente'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        {getChannelLabel(selectedConversation.channel)}
                      </span>
                      {selectedConversation.leads?.email && (
                        <span className="text-gray-400"> • {selectedConversation.leads.email}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-600">Inicia una conversación</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isAgent={message.sender_type === 'AGENT'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white border-t border-gray-200 p-4 shadow-lg"
            >
              <div className="flex gap-3 items-end">
                <Input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={sendingMessage}
                  className="flex-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  disabled={sendingMessage || !messageInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-10 flex items-center gap-2 transition-all shadow-sm"
                >
                  {sendingMessage ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-600 text-lg">Selecciona una conversación para empezar</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
