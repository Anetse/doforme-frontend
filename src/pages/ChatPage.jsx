import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { Send, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import ReportModal from '../components/ReportModal';

const ChatPage = () => {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [task, setTask] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
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

  const handleMarkPaid = async () => {
    if (!confirm('Are you sure you have paid the runner outside the app?')) return;
    try {
        await fetchWrapper(`/api/tasks/${taskId}/payment/mark-paid`, { method: 'PUT' });
        loadData();
    } catch (err) { alert(err.message); }
  };

  const handleConfirmPayment = async () => {
    try {
        await fetchWrapper(`/api/tasks/${taskId}/payment/confirm`, { method: 'PUT' });
        loadData();
    } catch (err) { alert(err.message); }
  };

  const handleDisputePayment = async () => {
    if (!confirm('Are you sure you want to dispute this payment? This will freeze the task.')) return;
    try {
        await fetchWrapper(`/api/tasks/${taskId}/payment/dispute`, { method: 'PUT' });
        alert('Payment disputed. Task is under review.');
        loadData();
    } catch (err) { alert(err.message); }
  };

  const handleMarkCompleted = async () => {
    if (!confirm('Are you sure the task is done?')) return;
    try {
      await fetchWrapper(`/api/tasks/${taskId}/completion/mark-completed`, { method: 'PUT' });
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleConfirmCompletion = async () => {
    if (!confirm('Are you sure the task is completed satisfactorily? This will close the task.')) return;
    try {
      await fetchWrapper(`/api/tasks/${taskId}/completion/confirm`, { method: 'PUT' });
      alert('Task closed successfully!');
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleDisputeCompletion = async () => {
    if (!confirm('Are you sure you want to dispute this completion? This will freeze the task.')) return;
    try {
      await fetchWrapper(`/api/tasks/${taskId}/completion/dispute`, { method: 'PUT' });
      alert('Completion disputed. Task is under review.');
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleReportSubmit = async ({ reason, details }) => {
    setIsReporting(true);
    try {
      // Determine reported user (the other party)
      const reportedUserId = task.poster._id === user._id ? task.runner._id : task.poster._id;
      
      await fetchWrapper('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          taskId: task._id,
          reportedUserId,
          reason,
          details
        })
      });
      
      alert('Report submitted. This task is now under review.');
      setIsReportModalOpen(false);
      loadData(); // Refresh to show disputed state
    } catch (err) {
      alert(err.message);
    } finally {
      setIsReporting(false);
    }
  };

  const getRole = (senderId) => {
    if (!task) return '';
    if (task.poster && (task.poster._id === senderId || task.poster === senderId)) return 'Poster';
    if (task.runner && (task.runner._id === senderId || task.runner === senderId)) return 'Runner';
    return '';
  };

  const isTaskClosed = task?.status === 'done';
  const isTaskDisputed = task?.status === 'disputed';
  const amIPoster = task?.poster?._id === user?._id || task?.poster === user?._id;
  const amIRunner = task?.runner?._id === user?._id || task?.runner === user?._id;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="bg-white p-4 border-b shadow-sm mb-4 flex justify-between items-center">
        <div className="min-w-0 flex-1 mr-4">
          <h2 className="font-bold text-lg truncate">{task?.title || 'Chat'}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
             {task?.status === 'done' ? (
                 <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={14}/> Completed</span>
             ) : task?.status === 'disputed' ? (
                 <span className="text-red-600 flex items-center gap-1 font-medium"><ShieldAlert size={14}/> Under Review</span>
             ) : (
                 <span className="text-blue-600 font-medium">Active</span>
             )}
             <span>•</span>
             <span>Budget: ₦{task?.reward || task?.budget}</span>
          </div>
        </div>
        
        {/* Report Button */}
        {!isTaskDisputed && !isTaskClosed && (
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
            title="Report Issue"
          >
            <AlertTriangle size={20} />
          </button>
        )}
      </div>

      {/* Payment Signals Section */}
      {task && !isTaskClosed && !isTaskDisputed && (task.status === 'accepted' || task.status === 'open') && (
        <div className="bg-yellow-50 p-3 border-b border-yellow-100 mb-2">
            <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                Payment: {task.paymentStatus?.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-gray-500 italic">
                Payment handled outside app
            </span>
            </div>

            <div className="flex gap-2 mt-2">
            {/* Poster Controls */}
            {amIPoster && task.paymentStatus === 'NOT_PAID' && (
                <div className="flex flex-col w-full">
                    <button 
                        onClick={handleMarkPaid}
                        className="w-full bg-green-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                        Mark as Paid
                    </button>
                    <span className="text-[10px] text-gray-500 text-center mt-1">
                        Confirm once you’ve paid the runner outside.
                    </span>
                </div>
            )}
            
            {amIPoster && task.paymentStatus === 'MARKED_PAID' && (
                <div className="w-full text-center text-sm text-gray-600 font-medium bg-white py-2 rounded border border-gray-200">
                    Waiting for runner to confirm
                </div>
            )}

            {/* Runner Controls */}
            {amIRunner && task.paymentStatus === 'NOT_PAID' && (
                <div className="w-full text-center text-sm text-gray-600 font-medium bg-white py-2 rounded border border-gray-200">
                    Awaiting payment
                </div>
            )}

            {amIRunner && task.paymentStatus === 'MARKED_PAID' && (
                <div className="flex gap-2 w-full">
                    <button 
                        onClick={handleConfirmPayment}
                        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                        Confirm Payment
                    </button>
                    <button 
                        onClick={handleDisputePayment}
                        className="flex-1 bg-red-100 text-red-700 text-sm py-2 rounded-lg font-medium hover:bg-red-200"
                    >
                        Dispute
                    </button>
                </div>
            )}
            </div>
        </div>
      )}

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
         ) : isTaskDisputed ? (
             <div className="text-center p-3 bg-red-50 text-red-800 rounded-lg text-sm flex items-center justify-center gap-2 border border-red-100">
                 <ShieldAlert size={16}/> This chat is locked due to a reported issue.
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

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={isReporting}
      />
    </div>
  );
};

export default ChatPage;
