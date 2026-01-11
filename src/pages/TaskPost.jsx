import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWrapper } from '../utils/fetchWrapper';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, MapPin } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const TaskPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [timeWindow, setTimeWindow] = useState('Now');
  const [loading, setLoading] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);

  // Initialize location from user profile if available
  const [location, setLocation] = useState(() => {
    if (user?.location?.coordinates) {
      return {
        lat: user.location.coordinates[1],
        lng: user.location.coordinates[0],
        label: user.location.label || ''
      };
    }
    // Fallback for old data structure or direct login
    if (user?.location?.lat && user?.location?.lng) {
      return user.location;
    }
    return null;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !budget) return;
    if (!location) {
      alert('Please select a location for the task');
      return;
    }

    setLoading(true);
    try {
      await fetchWrapper('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          budget: Number(budget),
          reward: Number(budget),
          timeWindow,
          location: {
            lat: location.lat,
            lng: location.lng,
            label: location.label
          }
        })
      });
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Post a Task</h2>
      <p className="text-gray-500 mb-6">Post any safe, everyday task you need help with.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Help moving a generator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
            placeholder="Describe what needs to be done..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Example: pick up something, wait in line, help with a small errand.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <LocationPicker 
              initialLocation={location}
              onLocationSelect={setLocation}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">When do you need this?</label>
          <div className="flex gap-2">
            {['Now', 'Today', 'Flexible'].map((option) => (
              <label key={option} className={`
                flex-1 border rounded-lg px-4 py-2 text-center cursor-pointer transition text-sm font-medium
                ${timeWindow === option ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  name="timeWindow"
                  value={option}
                  checked={timeWindow === option}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="hidden"
                />
                {option}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">This helps people decide quickly.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₦)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="5000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
           <div className="flex gap-2 items-start">
               <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
               <div>
                   <h4 className="font-medium text-yellow-800 text-sm">Safety First</h4>
                   <p className="text-xs text-yellow-700 mt-1">
                       Meet in public places when possible. Do not share financial info outside the app.
                   </p>
               </div>
           </div>
           <label className="flex items-center gap-2 mt-3 cursor-pointer">
               <input 
                   type="checkbox" 
                   className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                   checked={agreedToSafety}
                   onChange={(e) => setAgreedToSafety(e.target.checked)}
               />
               <span className="text-sm text-yellow-800 font-medium">This task is safe and legal</span>
           </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToSafety}
          className={`w-full py-3 rounded-lg font-semibold text-white transition
            ${loading || !agreedToSafety ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {loading ? 'Posting...' : 'Post Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskPost;
