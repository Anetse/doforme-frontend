import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWrapper } from '../utils/fetchWrapper';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, User, CheckCircle, Clock } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await fetchWrapper('/api/chats/my-chats');
        setChats(data);
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading messages...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 px-4">Messages</h1>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm mx-4">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Chats will appear here when you accept a task or someone accepts yours.</p>
        </div>
      ) : (
        <div className="space-y-2 px-4 pb-20">
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(p => p._id !== user._id) || { name: 'Unknown User' };
            const isTaskDone = chat.task?.status === 'done';
            
            return (
              <Link 
                key={chat._id} 
                to={`/chat/${chat.task?._id}`}
                className="block bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{chat.task?.title || 'Untitled Task'}</h3>
                  {isTaskDone && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} /> Completed
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User size={14} className="text-gray-400" />
                  <span>{otherParticipant.name}</span>
                </div>

                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-500 line-clamp-1 flex-1 pr-4">
                    {chat.lastMessage ? chat.lastMessage : <span className="italic opacity-50">No messages yet</span>}
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
