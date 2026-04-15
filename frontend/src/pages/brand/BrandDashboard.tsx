import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Campaign, BrandProfile } from '../../shared/types';
import Layout from '../../components/Layout';

const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, profileRes] = await Promise.all([
        axios.get('/api/v1/campaigns'),
        axios.get('/api/v1/profiles/brand')
      ]);

      setCampaigns(campaignsRes.data.data);
      setProfile(profileRes.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'OPEN').length,
    completedCampaigns: campaigns.filter(c => c.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block loading-spinner mb-4"></div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">
            Welcome back, {profile?.companyName || 'Brand'}
          </h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            Manage your campaigns, track applications, and connect with top creators
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-ramp-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-ramp-red-700 dark:text-ramp-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Campaigns */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-ramp-purple-100 dark:bg-ramp-purple-900 flex items-center justify-center group-hover:bg-ramp-purple-200 dark:group-hover:bg-ramp-purple-800 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs font-medium bg-ramp-purple-100 dark:bg-ramp-purple-900 text-ramp-purple-700 dark:text-ramp-purple-300 px-2 py-1 rounded">
                Active
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Total Campaigns</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.totalCampaigns}</p>
          </div>

          {/* Active Campaigns */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-ramp-teal-100 dark:bg-ramp-teal-900 flex items-center justify-center group-hover:bg-ramp-teal-200 dark:group-hover:bg-ramp-teal-800 transition-colors">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                Running
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Active Campaigns</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.activeCampaigns}</p>
          </div>

          {/* Completed Campaigns */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-ramp-blue-100 dark:bg-ramp-blue-900 flex items-center justify-center group-hover:bg-ramp-blue-200 dark:group-hover:bg-ramp-blue-800 transition-colors">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-xs font-medium bg-ramp-blue-100 dark:bg-ramp-blue-900 text-ramp-blue-600 dark:text-ramp-blue-300 px-2 py-1 rounded">
                Complete
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.completedCampaigns}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/brand/campaign/create"
            className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-ramp-lg transition-all"
          >
            <span>✨</span>
            Create Campaign
          </Link>
          <Link
            to="/brand/profile"
            className="btn-secondary bg-ramp-gray-100 dark:bg-ramp-gray-800 text-ramp-black dark:text-white font-medium py-3 px-6 rounded-lg border border-ramp-gray-300 dark:border-ramp-gray-700 hover:bg-ramp-gray-200 dark:hover:bg-ramp-gray-700 transition-all"
          >
            Edit Profile
          </Link>
        </div>

        {/* Campaigns Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-ramp-black dark:text-white mb-2">Recent Campaigns</h2>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Manage and track all your active campaigns</p>
          </div>

          {campaigns.length === 0 ? (
            <div className="card border-2 border-dashed border-ramp-gray-300 dark:border-ramp-gray-700 text-center py-16">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-lg font-semibold text-ramp-black dark:text-white mb-2">
                No campaigns yet
              </h3>
              <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mb-6">
                Create your first campaign to start connecting with influencers
              </p>
              <Link
                to="/brand/campaign/create"
                className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 inline-block"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/brand/campaign/${campaign.id}`}
                  className="card-hover group p-6 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-ramp-black dark:text-white group-hover:text-ramp-purple-600 dark:group-hover:text-ramp-purple-400 transition-colors">
                        {campaign.title}
                      </h3>
                      <span className={`badge text-xs font-medium ${
                        campaign.status === 'OPEN' 
                          ? 'badge-success' 
                          : campaign.status === 'COMPLETED'
                          ? 'badge-primary'
                          : 'badge-warning'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400 mb-3">
                      {campaign.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-ramp-gray-500 dark:text-ramp-gray-500">
                        📍 {campaign.requiredNiche}
                      </span>
                      <span className="text-ramp-gray-500 dark:text-ramp-gray-500">
                        👥 {campaign.influencersNeeded} needed
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BrandDashboard;
