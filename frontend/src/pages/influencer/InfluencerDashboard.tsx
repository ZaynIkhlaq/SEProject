import React from 'react';
import { useAuth } from '../../context/AuthContext';

const InfluencerDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">InfluencerHub</h1>
          <div className="flex gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Influencer Dashboard</h2>
        <p>Dashboard content coming soon...</p>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
