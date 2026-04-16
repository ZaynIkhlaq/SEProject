import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Campaign, CampaignApplication } from '../../shared/types';
import { useAuth } from '../../context/AuthContext';

const InfluencerCampaignDetails: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [myApplication, setMyApplication] = useState<CampaignApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);

        const [campaignResponse, applicationsResponse] = await Promise.all([
          api.get(`/campaigns/${campaignId}`),
          api.get('/applications/influencer/my-applications'),
        ]);

        setCampaign(campaignResponse.data.data);
        const applications = (applicationsResponse.data.data || []) as Array<CampaignApplication & { campaign?: { id: string } }>;
        const existingApplication = applications.find((application) => application.campaignId === campaignId) || null;
        setMyApplication(existingApplication);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [api, campaignId]);

  const handleApply = async () => {
    if (!campaignId) return;

    try {
      setActionLoading(true);
      const response = await api.post('/applications', { campaignId });
      setMyApplication(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply to campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block loading-spinner mb-4"></div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading campaign details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !campaign) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-12">
          <div className="card border border-ramp-red-500/30 bg-ramp-red-500/10">
            <p className="text-ramp-red-700 dark:text-ramp-red-300">{error || 'Campaign not found'}</p>
            <button
              onClick={() => navigate('/influencer/campaigns')}
              className="mt-4 btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const applicationStatus = myApplication?.status;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div>
            <button
              onClick={() => navigate('/influencer/campaigns')}
              className="text-ramp-purple-600 dark:text-ramp-purple-400 font-medium mb-4 hover:underline"
            >
              Back to Campaigns
            </button>
            <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">{campaign.title}</h1>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">{campaign.productService}</p>
          </div>

          <div className="card w-full sm:w-auto min-w-[220px]">
            <p className="text-xs uppercase tracking-wider text-ramp-gray-500 mb-1">Status</p>
            <p className="text-lg font-semibold text-ramp-black dark:text-white">{campaign.status}</p>
            <p className="text-xs text-ramp-gray-500 mt-2">Signed in as {user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4">
            <p className="text-ramp-red-700 dark:text-ramp-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-ramp-black dark:text-white mb-4">Campaign Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ramp-gray-500">Required Niche</p>
                  <p className="text-sm text-ramp-black dark:text-white mt-1">{campaign.requiredNiche}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ramp-gray-500">Budget Tier</p>
                  <p className="text-sm text-ramp-black dark:text-white mt-1">{campaign.budgetTier}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ramp-gray-500">Influencers Needed</p>
                  <p className="text-sm text-ramp-black dark:text-white mt-1">{campaign.influencersNeeded}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ramp-gray-500">Deadline</p>
                  <p className="text-sm text-ramp-black dark:text-white mt-1">{new Date(campaign.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-ramp-gray-200 dark:border-ramp-gray-800">
                <p className="text-xs uppercase tracking-wider text-ramp-gray-500 mb-2">Description</p>
                <p className="text-ramp-gray-700 dark:text-ramp-gray-300">{campaign.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <p className="text-xs uppercase tracking-wider text-ramp-gray-500 mb-2">Your Application</p>
              {myApplication ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-ramp-black dark:text-white">{applicationStatus}</p>
                  <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">You have already applied to this campaign.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">Submit your interest to apply for this campaign.</p>
                  <button
                    onClick={handleApply}
                    disabled={actionLoading || campaign.status !== 'OPEN'}
                    className="btn-primary w-full bg-ramp-purple-600 hover:bg-ramp-purple-700 disabled:opacity-60"
                  >
                    {actionLoading ? 'Applying...' : campaign.status === 'OPEN' ? 'Apply Now' : 'Campaign Closed'}
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <p className="text-xs uppercase tracking-wider text-ramp-gray-500 mb-2">Campaign ID</p>
              <p className="text-sm font-mono text-ramp-gray-700 dark:text-ramp-gray-300 break-all">{campaign.id}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InfluencerCampaignDetails;