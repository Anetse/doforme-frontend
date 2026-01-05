import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, MessageCircle, BookOpen } from 'lucide-react'; // Using lucide-react for icons

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white shadow-sm sticky top-0 z-10 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">DoForMe</h1>
          <nav className="flex gap-6">
             <Link to="/" className={`font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Feed</Link>
             <Link to="/messages" className={`font-medium ${isActive('/messages') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Inbox</Link>
             <Link to="/post-task" className={`font-medium ${isActive('/post-task') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Post Task</Link>
             <Link to="/profile" className={`font-medium ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>Profile</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
        <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Feed</span>
        </Link>
        <Link to="/messages" className={`flex flex-col items-center p-2 ${isActive('/messages') ? 'text-blue-600' : 'text-gray-500'}`}>
          <MessageCircle size={24} />
          <span className="text-xs mt-1">Inbox</span>
        </Link>
        <Link to="/post-task" className={`flex flex-col items-center p-2 ${isActive('/post-task') ? 'text-blue-600' : 'text-gray-500'}`}>
          <PlusSquare size={24} />
          <span className="text-xs mt-1">Post</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500'}`}>
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
