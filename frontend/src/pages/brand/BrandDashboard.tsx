import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Campaign, BrandProfile, CampaignApplication } from '../../shared/types';
import Layout from '../../components/Layout';

interface CampaignWithApplications extends Campaign {
  acceptedApplications?: any[];
}

const BrandDashboard: React.FC = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignWithApplications[]>([]);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvedInfluencers, setApprovedInfluencers] = useState<any[]>([]);

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

      const campaignsData = campaignsRes.data.data;
      setProfile(profileRes.data.data);

      // Fetch approved applications for each campaign
      const campaignsWithApprovals = await Promise.all(
        campaignsData.map(async (campaign: Campaign) => {
          try {
            const appsRes = await api.get(`/applications/campaign/${campaign.id}`);
            const applications = appsRes.data.data || [];
            return { 
              ...campaign, 
              applicationsCount: applications.length,
              acceptedCount: applications.filter((a: any) => a.status === 'ACCEPTED').length,
              pendingCount: applications.filter((a: any) => a.status === 'PENDING').length
            };
          } catch (err) {
            console.error(`Failed to fetch applications for campaign ${campaign.id}`, err);
            return campaign;
          }
        })
      );

      setCampaigns(campaignsWithApprovals);

      // Get approved influencers from inbox endpoint (which includes conversation opportunities)
      try {
        const inboxRes = await api.get('/messages/inbox');
        const allApprovedInfluencers = (inboxRes.data.data || []).slice(0, 10);
        setApprovedInfluencers(allApprovedInfluencers);
      } catch (err) {
        console.error('Failed to fetch approved influencers from inbox', err);
        setApprovedInfluencers([]);
      }
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
    approvedInfluencers: approvedInfluencers.length,
  };

  const handleMessageInfluencer = (campaignId: string, influencerId: string) => {
    navigate(`/messaging?campaign=${campaignId}&influencer=${influencerId}`);
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
            Create Campaign
          </Link>
          <Link
            to="/brand/profile"
            className="btn-secondary bg-ramp-gray-100 dark:bg-ramp-gray-800 text-ramp-black dark:text-white font-medium py-3 px-6 rounded-lg border border-ramp-gray-300 dark:border-ramp-gray-700 hover:bg-ramp-gray-200 dark:hover:bg-ramp-gray-700 transition-all"
          >
            Edit Profile
          </Link>
          <Link
            to="/messaging"
            className="btn-secondary bg-ramp-green-100 dark:bg-ramp-green-900 text-ramp-green-700 dark:text-ramp-green-300 font-medium py-3 px-6 rounded-lg border border-ramp-green-300 dark:border-ramp-green-700 hover:bg-ramp-green-200 dark:hover:bg-ramp-green-800 transition-all"
          >
            View Conversations
          </Link>
        </div>

        {/* Approved Influencers Section */}
        {approvedInfluencers.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-ramp-black dark:text-white mb-2">Approved Influencers</h2>
              <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Your active collaborations. Click to message them!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedInfluencers.map((thread) => (
                <div
                  key={`${thread.campaignId}-${thread.otherPartyId}`}
                  className="card hover:shadow-ramp-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-ramp-green-600 dark:text-ramp-green-400">
                        Connected
                      </h3>
                      <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400 mt-1">
                        {thread.otherPartyName}
                      </p>
                    </div>
                  </div>
                  
                  {thread.lastMessage && (
                    <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mb-4 truncate">
                      Last: {thread.lastMessage.text.substring(0, 40)}...
                    </p>
                  )}

                  <button
                    onClick={() => handleMessageInfluencer(thread.campaignId, thread.otherPartyId)}
                    className="w-full px-4 py-2 bg-ramp-green-600 hover:bg-ramp-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/brand/campaign/create"
            className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-ramp-lg transition-all"
          >
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
                        Niche: {campaign.requiredNiche}
                      </span>
                      <span className="text-ramp-gray-500 dark:text-ramp-gray-500">
                        Needed: {campaign.influencersNeeded}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-ramp-purple-600 dark:text-ramp-purple-400">Details</div>
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
