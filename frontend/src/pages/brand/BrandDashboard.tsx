import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const BrandDashboard: React.FC = () => {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Brand Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/brand/campaign/create" className="bg-blue-600 text-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="text-xl font-bold">Create Campaign</h3>
            <p className="text-blue-100">Post a new influencer campaign</p>
          </Link>

          <Link to="/brand/profile" className="bg-green-600 text-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="text-xl font-bold">Edit Profile</h3>
            <p className="text-green-100">Update your brand information</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-4">Your Campaigns</h3>
          <p className="text-gray-600">Campaign list coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
