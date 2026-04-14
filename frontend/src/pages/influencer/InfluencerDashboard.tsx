import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { InfluencerProfile, CampaignApplication, Campaign } from '../../shared/types';

interface ApplicationWithCampaign extends CampaignApplication {
  campaign?: Campaign;
}

const InfluencerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, applicationsRes] = await Promise.all([
        axios.get('/api/profiles/influencer'),
        axios.get('/api/applications/influencer/my-applications')
      ]);

      setProfile(profileRes.data.data);

      // Fetch campaign details for each application
      const appsWithCampaigns = await Promise.all(
        applicationsRes.data.data.map(async (app: any) => {
          try {
            const campaignRes = await axios.get(`/api/campaigns/${app.campaignId}`);
            return { ...app, campaign: campaignRes.data.data };
          } catch {
            return app;
          }
        })
      );

      setApplications(appsWithCampaigns);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalApplications: applications.length,
    acceptedApplications: applications.filter(a => a.status === 'ACCEPTED').length,
    pendingApplications: applications.filter(a => a.status === 'PENDING').length,
    rejectedApplications: applications.filter(a => a.status === 'REJECTED').length
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Influencer Dashboard</h2>
          <p className="text-gray-600">Manage your profile and campaign applications</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/influencer/browse"
            className="bg-blue-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-blue-700 transition"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-xl font-bold">Browse Campaigns</h3>
            <p className="text-blue-100">Find campaigns to apply to</p>
          </Link>

          <Link
            to="/influencer/profile"
            className="bg-green-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-green-700 transition"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="text-xl font-bold">Edit Profile</h3>
            <p className="text-green-100">Manage your portfolio</p>
          </Link>

          <Link
            to="/messages"
            className="bg-purple-600 text-white p-6 rounded-lg shadow hover:shadow-lg hover:bg-purple-700 transition"
          >
            <div className="text-3xl mb-2">💬</div>
            <h3 className="text-xl font-bold">Messages</h3>
            <p className="text-purple-100">Chat with brands</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.acceptedApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xs font-medium text-gray-600">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejectedApplications}</p>
          </div>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Niche</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile.niche}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Platform</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{profile.platform}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Followers</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {profile.followerCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {(profile.engagementRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-700 mt-4">{profile.bio}</p>
            )}
            {profile.location && (
              <p className="text-gray-600 mt-2">📍 {profile.location}</p>
            )}
          </div>
        )}

        {/* Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">My Applications</h3>
            <Link to="/influencer/browse" className="text-blue-600 hover:text-blue-700 font-semibold">
              + Apply to Campaign
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No applications yet. Browse campaigns now!</p>
              <Link
                to="/influencer/browse"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
              >
                Browse Campaigns
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {app.campaign ? (
                        <>
                          <h4 className="text-lg font-semibold text-gray-900">{app.campaign.title}</h4>
                          <p className="text-gray-600">{app.campaign.productService}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-gray-600">Niche: <span className="font-semibold">{app.campaign.requiredNiche}</span></span>
                            <span className="text-gray-600">Budget: <span className="font-semibold">
                              {app.campaign.budgetTier === 'TIER_10K_50K' ? '$10K - $50K' :
                               app.campaign.budgetTier === 'TIER_50K_200K' ? '$50K - $200K' :
                               '$200K+'}
                            </span></span>
                            <span className="text-gray-600">Applied: <span className="font-semibold">{new Date(app.createdAt).toLocaleDateString()}</span></span>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-600">Campaign details unavailable</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
