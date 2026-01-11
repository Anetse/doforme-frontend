import React, { useState } from 'react';
import { BookOpen, Shield, DollarSign, Send, CheckCircle } from 'lucide-react';

const Guide = () => {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="pb-20 md:pb-0">
      <h2 className="text-2xl font-bold mb-6">User Guide</h2>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('getting-started')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 'getting-started' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Getting Started
        </button>
        <button
          onClick={() => setActiveTab('posting')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 'posting' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Posting Tasks
        </button>
        <button
          onClick={() => setActiveTab('earning')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 'earning' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Earning
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 'safety' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Safety First
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {activeTab === 'getting-started' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold">Welcome to DoForMe!</h3>
            </div>
            <p className="text-gray-600">
              DoForMe connects you with people in your area (like Lagos, Abuja, PH) who can help you get things done, or who need your help.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Quick Steps:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                  <span><strong>Verify your phone:</strong> We use OTP to keep things real.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                  <span><strong>Set your Area:</strong> See tasks near you instantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                  <span><strong>No Wahala:</strong> Chat safely inside the app before sharing details.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'posting' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Send className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold">How to Post a Task</h3>
            </div>
            <p className="text-gray-600">
              Need help moving a generator, cleaning your flat, or delivering a package?
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mt-2">
              <li>Tap the <strong>Post</strong> button.</li>
              <li>Describe what you need clearly. (e.g., "Need help carrying a heavy sofa to the 2nd floor").</li>
              <li>Set your <strong>Budget (₦)</strong>. Be fair to attract good Runners.</li>
              <li>Wait for someone to accept! You'll chat to agree on time and details.</li>
            </ol>
          </div>
        )}

        {activeTab === 'earning' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-600" size={24} />
              <h3 className="text-xl font-semibold">Making Money</h3>
            </div>
            <p className="text-gray-600">
              Turn your free time into cash. Look for tasks in your area.
            </p>
            <ul className="space-y-3 text-gray-700 mt-2">
              <li className="flex gap-2">
                <span className="bg-green-100 text-green-800 font-bold px-2 rounded text-sm h-fit">1</span>
                <span>Check the <strong>Feed</strong> for tasks near you.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-green-100 text-green-800 font-bold px-2 rounded text-sm h-fit">2</span>
                <span>Review the description and budget (₦).</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-green-100 text-green-800 font-bold px-2 rounded text-sm h-fit">3</span>
                <span>Click <strong>Accept</strong> if you can do it.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-green-100 text-green-800 font-bold px-2 rounded text-sm h-fit">4</span>
                <span>Chat with the Poster to arrange the meetup.</span>
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-red-600" size={24} />
              <h3 className="text-xl font-semibold">Safety First (Shine Your Eyes)</h3>
            </div>
            <p className="text-gray-600">
              Your safety is our priority. Please follow these rules:
            </p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <ul className="space-y-3 text-red-800 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-lg">🚫</span>
                  <span><strong>Don't pay outside the app:</strong> (Coming soon) For now, only pay cash <strong>AFTER</strong> the job is done and you are satisfied.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🏢</span>
                  <span><strong>Meet in Public:</strong> Always meet in open, busy places.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">📱</span>
                  <span><strong>Keep it in the Chat:</strong> Don't share your personal phone number until you trust the person.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🚩</span>
                  <span><strong>Report Suspicious Activity:</strong> If something feels off, cancel the task and report it.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guide;
