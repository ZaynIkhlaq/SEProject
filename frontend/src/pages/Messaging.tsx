import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';

interface MessageThread {
  campaignId: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessage?: Message;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
  campaignId: string;
}

const Messaging: React.FC = () => {
  const { api, user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSelectThread = async (campaignId: string, otherUserId: string) => {
    setSelectedThread(campaignId);
    setSelectedUserId(otherUserId);
    try {
      const response = await api.get(`/messages/thread/${campaignId}/${otherUserId}`);
      setMessages(response.data.data || []);
    } catch (err) {
      console.error('Failed to load thread');
      setMessages([]);
    }
  };

  // Fetch inbox on mount and poll for updates
  useEffect(() => {
    if (authLoading || !user) return; // Wait for auth to be ready

    const fetchInbox = async () => {
      try {
        const response = await api.get('/messages/inbox');
        setThreads(response.data.data || []);
        setIsLoading(false);

        // Auto-select thread if campaign and influencer params provided
        const campaignParam = searchParams.get('campaign');
        const influencerParam = searchParams.get('influencer');
        
        if (campaignParam && influencerParam && response.data.data && response.data.data.length > 0) {
          const matchingThread = response.data.data.find(
            (t: MessageThread) => t.campaignId === campaignParam && t.otherPartyId === influencerParam
          );
          if (matchingThread) {
            handleSelectThread(matchingThread.campaignId, matchingThread.otherPartyId);
          } else if (campaignParam && influencerParam) {
            // If no thread exists yet, still select it for the first message
            handleSelectThread(campaignParam, influencerParam);
          }
        }
      } catch (err) {
        console.error('Failed to load inbox', err);
        setIsLoading(false);
      }
    };

    fetchInbox();
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [api, searchParams, authLoading, user]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/messages/unread/count');
        setUnreadCount(response.data.data.unreadCount);
      } catch (err) {
        console.error('Failed to get unread count');
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [api]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !selectedUserId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await api.post('/messages', {
        campaignId: selectedThread,
        receiverId: selectedUserId,
        text: newMessage
      });
      setNewMessage('');
      // Refresh messages
      const response = await api.get(`/messages/thread/${selectedThread}/${selectedUserId}`);
      setMessages(response.data.data);
    } catch (err) {
      console.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">Messages</h1>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-ramp-red-500"></span>
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </span>
              )}
              {unreadCount === 0 && 'All caught up!'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block loading-spinner mb-4"></div>
              <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Threads List */}
            <div className="card flex flex-col overflow-hidden bg-white dark:bg-ramp-gray-900 border border-ramp-gray-200 dark:border-ramp-gray-800">
              <div className="p-4 border-b border-ramp-gray-200 dark:border-ramp-gray-800">
                <h2 className="font-semibold text-ramp-black dark:text-white">Conversations</h2>
                <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-1">
                  {threads.length} thread{threads.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 p-2">
                {threads.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-ramp-gray-500 dark:text-ramp-gray-500 text-sm">No conversations yet</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={`${thread.campaignId}-${thread.otherPartyId}`}
                      onClick={() => handleSelectThread(thread.campaignId, thread.otherPartyId)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedThread === thread.campaignId
                          ? 'bg-ramp-purple-100 dark:bg-ramp-purple-900'
                          : 'hover:bg-ramp-gray-100 dark:hover:bg-ramp-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm text-ramp-black dark:text-white truncate">
                          {thread.otherPartyName}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-ramp-purple-600 text-white text-xs flex items-center justify-center font-bold">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-xs text-ramp-gray-600 dark:text-ramp-gray-400 truncate">
                          {thread.lastMessage.text}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 card flex flex-col overflow-hidden bg-white dark:bg-ramp-gray-900 border border-ramp-gray-200 dark:border-ramp-gray-800">
              {selectedThread ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-ramp-gray-50 dark:from-ramp-gray-900 to-ramp-gray-100 dark:to-ramp-gray-800">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-ramp-gray-500 dark:text-ramp-gray-500 text-sm">Start the conversation</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-ramp-purple-600 rounded-br-none'
                                : 'bg-white dark:bg-ramp-gray-800 text-ramp-black dark:text-white border border-ramp-gray-200 dark:border-ramp-gray-700 rounded-bl-none'
                            }`}
                          >
                            <p className={`text-sm font-semibold ${
                              message.senderId === user?.id
                                ? 'text-white'
                                : 'text-ramp-black dark:text-white'
                            }`}>{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id
                                ? 'text-white opacity-80'
                                : 'text-ramp-gray-500 dark:text-ramp-gray-400'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Form */}
                  <div className="border-t border-ramp-gray-200 dark:border-ramp-gray-800 p-4 bg-white dark:bg-ramp-gray-900">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input-field flex-1 bg-ramp-gray-100 dark:bg-ramp-gray-800 border-ramp-gray-300 dark:border-ramp-gray-700 text-ramp-black dark:text-white placeholder-ramp-gray-500"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-60 transition-all"
                      >
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ramp-gray-100 dark:bg-ramp-gray-800 text-sm font-semibold text-ramp-gray-600 dark:text-ramp-gray-300 mb-4">CHAT</div>
                    <p className="text-ramp-gray-600 dark:text-ramp-gray-400 font-medium">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messaging;
