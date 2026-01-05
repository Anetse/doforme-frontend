import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { normalizeLocation, formatLocation } from '../utils/locationHelpers';
import { User, MapPin, Camera } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(formatLocation(user?.city) || '');
  const [area, setArea] = useState(formatLocation(user?.area) || '');

  const handleSave = async () => {
    try {
      const updatedUser = await fetchWrapper('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ 
          name, 
          city: normalizeLocation(city), 
          area: normalizeLocation(area) 
        })
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
            {isEditing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer">
                    <Camera className="text-white" size={24} />
                </div>
            )}
          </div>
          
          <h3 className="text-xl font-semibold">{user?.phone}</h3>
          <div className="flex items-center gap-1 text-gray-500 mt-1">
             <MapPin size={16}/>
             <span>{formatLocation(user?.city)}, {formatLocation(user?.area)}</span>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-500 mb-6 italic">
            Your profile helps people nearby know who they’re working with.
        </p>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{user?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Location</span>
              <span className="font-medium">{user?.city}, {user?.area}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Tasks Completed</span>
              <span className="font-medium">{user?.completedTasks || 0}</span>
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-gray-700"
            >
              Edit Profile
            </button>
            
             <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-400">More profile features coming later.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
