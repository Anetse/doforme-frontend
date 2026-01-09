import React from 'react';

const OnboardingExplainer = ({ onContinue }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h2 className="text-xl font-bold text-blue-900 mb-3">What DoForMe Does</h2>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>• Post a task you need done nearby.</li>
          <li>• Someone close accepts and agrees to do it.</li>
          <li>• You chat inside the app and get it done.</li>
        </ul>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Got it, continue
      </button>
    </div>
  );
};

export default OnboardingExplainer;

