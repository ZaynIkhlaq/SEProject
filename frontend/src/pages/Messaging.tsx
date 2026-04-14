import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
}

const Messaging: React.FC = () => {
  const { api, user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch inbox on mount and poll for updates
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await api.get('/messages/inbox');
        setThreads(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load inbox');
        setIsLoading(false);
      }
    };

    fetchInbox();

    // Poll every 10 seconds
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [api]);

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

  const handleSelectThread = async (campaignId: string, otherUserId: string) => {
    setSelectedThread(campaignId);
    try {
      const response = await api.get(`/messages/thread/${campaignId}/${otherUserId}`);
      setMessages(response.data.data);
    } catch (err) {
      console.error('Failed to load thread');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newMessage.trim()) return;

    const thread = threads.find(t => t.campaignId === selectedThread);
    if (!thread) return;

    setIsSending(true);
    try {
      await api.post('/messages', {
        campaignId: selectedThread,
        receiverId: thread.otherPartyId,
        text: newMessage
      });
      setNewMessage('');
      // Refresh messages
      const response = await api.get(`/messages/thread/${selectedThread}/${thread.otherPartyId}`);
      setMessages(response.data.data);
    } catch (err) {
      console.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Threads List */}
      <div className="w-full md:w-1/3 bg-white shadow overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-blue-600 font-semibold">{unreadCount} unread</p>
          )}
        </div>

        {threads.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">No messages yet</div>
        ) : (
          <div>
            {threads.map(thread => (
              <button
                key={thread.campaignId}
                onClick={() => handleSelectThread(thread.campaignId, thread.otherPartyId)}
                className={`w-full p-4 border-b text-left hover:bg-gray-50 ${
                  selectedThread === thread.campaignId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{thread.otherPartyName}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {thread.lastMessage?.text || 'No messages'}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages View */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedThread ? (
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Send Message */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
