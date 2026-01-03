import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';

const ChatPage = () => {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [task, setTask] = useState(null);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const loadData = async () => {
    try {
      // 1. Fetch Task Details
      const taskData = await fetchWrapper(`/api/tasks/${taskId}`);
      setTask(taskData);

      // 2. Fetch Chat ID (Task-scoped)
      const chatData = await fetchWrapper(`/api/chats/task/${taskId}`);
      setChatId(chatData._id);

      // 3. Fetch Messages using Chat ID
      const msgs = await fetchWrapper(`/api/chats/${chatData._id}/messages`);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      await fetchWrapper(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage })
      });
      setNewMessage('');
      loadData(); // Instant refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const getRole = (senderId) => {
    if (!task) return '';
    if (task.poster && (task.poster._id === senderId || task.poster === senderId)) return 'Poster';
    if (task.runner && (task.runner._id === senderId || task.runner === senderId)) return 'Runner';
    return '';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="bg-white p-4 border-b shadow-sm mb-4">
        <h2 className="font-bold text-lg truncate">{task?.title || 'Chat'}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
           {task?.status === 'done' ? (
               <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={14}/> Completed</span>
           ) : (
               <span className="text-blue-600 font-medium">Active</span>
           )}
           <span>•</span>
           <span>Budget: ${task?.budget}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Send size={48} className="mb-2 opacity-20"/>
                <p>Use chat to agree and coordinate the task.</p>
             </div>
        ) : (
            messages.map((msg) => {
            const isMe = msg.sender._id === user._id;
            const role = getRole(msg.sender._id);
            
            return (
                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs font-bold text-gray-700">{msg.sender.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        role === 'Poster' ? 'bg-blue-100 text-blue-700' : 
                        role === 'Runner' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {role}
                    </span>
                  </div>
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
            );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t mt-auto">
         {isTaskClosed ? (
             <div className="text-center p-2 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center justify-center gap-2">
                 <CheckCircle size={16}/> Task completed. Chat is now closed.
             </div>
         ) : (
            <div className="flex gap-2">
            <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
                <Send size={20} />
            </button>
            </div>
         )}
      </form>
    </div>
  );
};

export default ChatPage;
