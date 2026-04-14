import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Campaign, BrandProfile } from '../../shared/types';

const BrandDashboard: React.FC = () => {
  const { user, logout } = useAuth();
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
        axios.get('/api/campaigns'),
        axios.get('/api/profiles/brand')
      ]);

      // Filter to only show campaigns created by this brand (in a real app, backend should do this)
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
    totalBudget: campaigns.reduce((sum, c) => {
      const budgetMap: { [key: string]: number } = {
        'TIER_10K_50K': 25000,
        'TIER_50K_200K': 125000,
        'TIER_200K_PLUS': 250000
      };
      return sum + (budgetMap[c.budgetTier] || 0);
    }, 0)
  };

  if (loading) {
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
        <div className="p-8">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">InfluencerHub</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Dashboard</h2>
          <p className="text-gray-600">Manage your campaigns and discover influencers</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/brand/campaign/create"
            className="bg-blue-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-blue-700 transition"
          >
            <div className="text-3xl mb-2">+</div>
            <h3 className="text-xl font-bold">Create Campaign</h3>
            <p className="text-blue-100">Post a new influencer campaign</p>
          </Link>

          <Link
            to="/brand/profile"
            className="bg-green-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-green-700 transition"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="text-xl font-bold">Edit Profile</h3>
            <p className="text-green-100">Update your brand information</p>
          </Link>

          <Link
            to="/brand/recommendations"
            className="bg-purple-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-purple-700 transition"
          >
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="text-xl font-bold">Find Influencers</h3>
            <p className="text-purple-100">Get AI-powered recommendations</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCampaigns}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Active Campaigns</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeCampaigns}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Completed Campaigns</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completedCampaigns}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Total Budget</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${(stats.totalBudget / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Brand Info */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Brand Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Company Name</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Industry</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile.industry}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Tier</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.budgetTier === 'TIER_10K_50K' ? '$10K - $50K' :
                   profile.budgetTier === 'TIER_50K_200K' ? '$50K - $200K' :
                   '$200K+'}
                </p>
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-700 mt-4">{profile.bio}</p>
            )}
          </div>
        )}

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Campaigns</h3>
            <Link to="/brand/campaign/create" className="text-blue-600 hover:text-blue-700 font-semibold">
              + New Campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No campaigns yet. Create your first campaign!</p>
              <Link
                to="/brand/campaign/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 10).map(campaign => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{campaign.title}</h4>
                      <p className="text-gray-600">{campaign.productService}</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">Niche: <span className="font-semibold">{campaign.requiredNiche}</span></span>
                        <span className="text-gray-600">Influencers: <span className="font-semibold">{campaign.influencersNeeded}</span></span>
                        <span className="text-gray-600">Deadline: <span className="font-semibold">{new Date(campaign.deadline).toLocaleDateString()}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'CLOSED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {campaign.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {campaigns.length > 10 && (
            <div className="text-center mt-6">
              <p className="text-gray-600 mb-3">Showing 10 of {campaigns.length} campaigns</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
