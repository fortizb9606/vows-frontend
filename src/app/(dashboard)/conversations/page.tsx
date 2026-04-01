'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from '@/components/conversations/message-bubble';
import { MessageCircle, Mail, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
        return <MessageCircle size={16} className="text-green-600" />;
      case 'WEB_CHAT':
        return <MessageCircle size={16} className="text-blue-600" />;
      case 'EMAIL':
        return <Mail size={16} className="text-purple-600" />;
      default:
        return <MessageCircle size={16} className="text-gray-600" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4F72' }}>
            Conversaciones
          </h1>
          <p className="text-gray-600 mt-2">Gestiona las conversaciones con los clientes</p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Conversation List */}
          <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col">
            {/* Channel Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  onClick={() => setChannelFilter('all')}
                  variant={channelFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  style={channelFilter === 'all' ? { backgroundColor: '#1B4F72' } : {}}
                  className="whitespace-nowrap"
                >
                  Todas
                </Button>
                <Button
                  onClick={() => setChannelFilter('WHATSAPP')}
                  variant={channelFilter === 'WHATSAPP' ? 'default' : 'outline'}
                  size="sm"
                  style={channelFilter === 'WHATSAPP' ? { backgroundColor: '#1B4F72' } : {}}
                  className="whitespace-nowrap"
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={() => setChannelFilter('WEB_CHAT')}
                  variant={channelFilter === 'WEB_CHAT' ? 'default' : 'outline'}
                  size="sm"
                  style={channelFilter === 'WEB_CHAT' ? { backgroundColor: '#1B4F72' } : {}}
                  className="whitespace-nowrap"
                >
                  Web Chat
                </Button>
                <Button
                  onClick={() => setChannelFilter('EMAIL')}
                  variant={channelFilter === 'EMAIL' ? 'default' : 'outline'}
                  size="sm"
                  style={channelFilter === 'EMAIL' ? { backgroundColor: '#1B4F72' } : {}}
                  className="whitespace-nowrap"
                >
                  Email
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-600">Cargando conversaciones...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No hay conversaciones</div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(conversation.channel)}
                        <h3 className="font-semibold text-gray-900">
                          {conversation.leads?.name || 'Cliente Desconocido'}
                        </h3>
                      </div>
                      {conversation.has_unread && (
                        <Badge
                          style={{ backgroundColor: '#3498DB' }}
                          className="text-white"
                        >
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                      {conversation.last_message_preview || 'Sin mensajes'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Messages */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    {getChannelIcon(selectedConversation.channel)}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedConversation.leads?.name || 'Cliente'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {getChannelLabel(selectedConversation.channel)}
                        {selectedConversation.leads?.email && ` • ${selectedConversation.leads.email}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600">
                      <p>Sin mensajes aún</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isAgent={message.sender_type === 'AGENT'}
                      />
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-white border-t border-gray-200 p-6"
                >
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={sendingMessage || !messageInput.trim()}
                      style={{ backgroundColor: '#2E75B6' }}
                      className="px-6 flex items-center gap-2"
                    >
                      <Send size={16} />
                      Enviar
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                <p>Selecciona una conversación para ver los mensajes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
