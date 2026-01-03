import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, MessageCircle, AlertCircle } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      const data = await fetchWrapper('/api/tasks/nearby');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000); // Polling for now
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (taskId) => {
    try {
      await fetchWrapper(`/api/tasks/${taskId}/accept`, { method: 'POST' });
      navigate(`/chat/${taskId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading tasks...</div>;

  return (
    <div>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-blue-900">How e dey work</h2>
            <Link to="/guide" className="text-xs text-blue-700 font-medium underline whitespace-nowrap ml-2">
              See Guide
            </Link>
          </div>
          <p className="text-sm text-blue-800 mt-1">
            <strong>Posters</strong> need help. <strong>Runners</strong> do the work.
            Chat safely inside the app. Check the guide so you no go lost!
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Tasks near {user?.area}</h2>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No tasks found in your area yet.</p>
          <p className="text-gray-400 text-sm">Make sure your area name matches others nearby.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  ₦{task.reward || task.budget}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{task.area || 'Nearby'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* 1. Open Task (I can accept) */}
              {task.status === 'open' && task.poster._id !== user._id && (
                <button
                  onClick={() => handleAccept(task._id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Accept Task
                </button>
              )}

              {/* 2. My Open Task (Waiting) */}
              {task.status === 'open' && task.poster._id === user._id && (
                 <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-center font-medium">
                    You posted this task
                 </div>
              )}

              {/* 3. My Task - Accepted (Chat!) */}
              {task.status === 'accepted' && task.poster._id === user._id && (
                <button
                  onClick={() => navigate(`/chat/${task._id}`)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Chat with Runner
                </button>
              )}

              {/* 4. Task I Accepted (Chat!) */}
              {task.status === 'accepted' && task.runner === user._id && (
                <button
                  onClick={() => navigate(`/chat/${task._id}`)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Open Chat
                </button>
              )}
              
              {/* 5. Task Taken by someone else */}
              {task.status !== 'open' && task.poster._id !== user._id && task.runner !== user._id && (
                 <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-center font-medium">
                    Task already taken
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
