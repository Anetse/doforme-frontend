import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, MessageCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { formatLocation, formatDistance } from '../utils/locationHelpers';
import ReportModal from '../components/ReportModal';

// Force refresh
const Feed = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleReportSubmit = async (data) => {
    // TODO: Implement report submission
    console.log('Report submitted:', data);
    setReportModalOpen(false);
  };

  const loadTasks = async () => {
    try {
      const data = await fetchWrapper('/api/tasks/nearby');
      setTasks(data);
      setLocationError(false);
    } catch (err) {
      console.error(err);
      if (err.code === 'NO_LOCATION') {
        setLocationError(true);
      }
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
    setAcceptLoading(true);
    try {
      await fetchWrapper(`/api/tasks/${taskId}/accept`, { method: 'POST' });
      alert("Task accepted! You can message the poster from your Inbox.");
      loadTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setAcceptLoading(false);
      setConfirmTask(null);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading tasks...</div>;

  if (locationError) {
    return (
      <div className="p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mb-6">
          <MapPin className="mx-auto text-yellow-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Location Required</h2>
          <p className="text-yellow-700 mb-6">
            We need your location to show tasks near you.
          </p>
          <button 
            onClick={() => navigate('/profile')} // Assuming profile page allows editing location, or navigate to login/onboarding if needed
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition w-full"
          >
            Set Location
          </button>
        </div>
      </div>
    );
  }

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
        <h2 className="text-lg font-bold">
          Tasks near {user?.location?.label || formatLocation(user?.area) || 'you'}
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No tasks found within 5km.</p>
          <p className="text-gray-400 text-sm">Try increasing your range or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    ₦{task.reward || task.budget}
                  </span>
                  {task.distance !== undefined && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {formatDistance(task.distance)} away
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{task.location?.label || formatLocation(task.area) || 'Nearby'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Payment Status Badge (Visible to participants) */}
              {((task.poster._id === user._id) || (task.runner === user._id)) && task.paymentStatus && task.paymentStatus !== 'NOT_PAID' && (
                <div className="mb-4">
                     <span className={`text-xs font-bold px-2 py-1 rounded ${
                        task.paymentStatus === 'MARKED_PAID' ? 'bg-yellow-100 text-yellow-800' :
                        task.paymentStatus === 'DISPUTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                     }`}>
                        Payment: {task.paymentStatus.replace('_', ' ')}
                     </span>
                </div>
              )}

              {/* 1. Open Task (I can accept) */}
              {task.status === 'open' && task.poster._id !== user._id && (
                <button
                  onClick={() => setConfirmTask(task)}
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

      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={false}
      />

      {confirmTask && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 p-4 pb-24 md:pb-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm acceptance</h3>
            <p className="text-sm text-gray-600 mb-4">
              You’re agreeing to do this task for <span className="font-semibold">₦{confirmTask.reward || confirmTask.budget}</span>. Proceed?
            </p>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="font-semibold text-gray-900 line-clamp-1">{confirmTask.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatLocation(confirmTask.area)} • {new Date(confirmTask.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTask(null)}
                disabled={acceptLoading}
                className={`flex-1 py-2 rounded-lg font-medium border ${
                  acceptLoading ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Decline
              </button>
              <button
                onClick={() => handleAccept(confirmTask._id)}
                disabled={acceptLoading}
                className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                  acceptLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {acceptLoading ? 'Accepting…' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
