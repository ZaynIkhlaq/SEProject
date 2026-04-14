import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Campaign, CampaignApplication, InfluencerProfile } from '../../shared/types';

interface ApplicationWithProfile extends CampaignApplication {
  influencerProfile?: InfluencerProfile;
  influencerName?: string;
}

const CampaignDetails: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const [campaignRes, applicationsRes] = await Promise.all([
        axios.get(`/api/campaigns/${campaignId}`),
        axios.get(`/api/applications/campaign/${campaignId}`)
      ]);

      setCampaign(campaignRes.data.data);
      
      // Fetch influencer profiles for each application
      const appsWithProfiles = await Promise.all(
        applicationsRes.data.data.map(async (app: any) => {
          try {
            const profileRes = await axios.get(`/api/profiles/influencer/${app.influencerId}`);
            return {
              ...app,
              influencerProfile: profileRes.data.data
            };
          } catch {
            return app;
          }
        })
      );

      setApplications(appsWithProfiles);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      setActionLoading(true);
      await axios.patch(`/api/applications/${applicationId}/accept`);
      
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: 'ACCEPTED' } : app
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setActionLoading(true);
      await axios.patch(`/api/applications/${applicationId}/reject`);
      
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: 'REJECTED' } : app
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCampaign = async () => {
    if (!window.confirm('Are you sure you want to close this campaign?')) return;

    try {
      setActionLoading(true);
      await axios.post(`/api/campaigns/${campaignId}/close`);
      setCampaign(prev => prev ? { ...prev, status: 'CLOSED' } : null);
      alert('Campaign closed successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading campaign details...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Campaign not found'}</p>
        </div>
        <button
          onClick={() => navigate('/brand')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const acceptedCount = applications.filter(app => app.status === 'ACCEPTED').length;
  const pendingCount = applications.filter(app => app.status === 'PENDING').length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/brand')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
        <p className="text-gray-600 mt-2">Campaign ID: {campaign.id}</p>
      </div>

      {/* Campaign Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Product/Service</p>
            <p className="text-lg text-gray-900 mt-1">{campaign.productService}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Required Niche</p>
            <p className="text-lg text-gray-900 mt-1">{campaign.requiredNiche}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Budget Tier</p>
            <p className="text-lg text-gray-900 mt-1">{campaign.budgetTier}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Influencers Needed</p>
            <p className="text-lg text-gray-900 mt-1">{campaign.influencersNeeded}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Deadline</p>
            <p className="text-lg text-gray-900 mt-1">{new Date(campaign.deadline).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`text-lg font-medium mt-1 ${
              campaign.status === 'OPEN' ? 'text-green-600' :
              campaign.status === 'CLOSED' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {campaign.status}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-gray-900 mt-2">{campaign.description}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
            </div>
            <div className="bg-yellow-50 rounded p-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        {campaign.status === 'OPEN' && (
          <button
            onClick={handleCloseCampaign}
            disabled={actionLoading}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
          >
            {actionLoading ? 'Closing...' : 'Close Campaign'}
          </button>
        )}
      </div>

      {/* Applications Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Applications ({applications.length})</h2>
        
        {applications.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Influencer Application</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {app.influencerProfile?.userId || 'Influencer Profile'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.influencerProfile && (
                  <div className="bg-gray-50 rounded p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Niche</p>
                        <p className="text-gray-900">{app.influencerProfile.niche}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Platform</p>
                        <p className="text-gray-900">{app.influencerProfile.platform}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Followers</p>
                        <p className="text-gray-900">{app.influencerProfile.followerCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Engagement Rate</p>
                        <p className="text-gray-900">{(app.influencerProfile.engagementRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    {app.influencerProfile.bio && (
                      <p className="text-gray-700 mt-3 text-sm">{app.influencerProfile.bio}</p>
                    )}
                  </div>
                )}

                {app.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptApplication(app.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
