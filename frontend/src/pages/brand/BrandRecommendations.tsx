import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Campaign } from '../../shared/types';
import Layout from '../../components/Layout';

const BrandRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/campaigns');
      // Filter to only OPEN campaigns that may have recommendations
      const activeCampaigns = response.data.data.filter((c: Campaign) => c.status === 'OPEN');
      setCampaigns(activeCampaigns);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block loading-spinner mb-4"></div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading recommendations...</p>
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
            Influencer Recommendations
          </h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            View recommended influencers for your campaigns
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

        {/* Campaign Recommendations */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
              No active campaigns with available recommendations. Create or open a campaign first!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-ramp-black dark:text-white mb-1">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">
                      {campaign.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      campaign.status === 'OPEN'
                        ? 'bg-ramp-green-100 text-ramp-green-700 dark:bg-ramp-green-900 dark:text-ramp-green-300'
                        : 'bg-ramp-gray-100 text-ramp-gray-700 dark:bg-ramp-gray-700 dark:text-ramp-gray-300'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-ramp-gray-600 dark:text-ramp-gray-400 uppercase tracking-wide mb-1">
                      Budget Tier
                    </p>
                    <p className="text-lg font-bold text-ramp-black dark:text-white">
                      {campaign.budgetTier}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ramp-gray-600 dark:text-ramp-gray-400 uppercase tracking-wide mb-1">
                      Deadline
                    </p>
                    <p className="text-sm font-semibold text-ramp-gray-700 dark:text-ramp-gray-300">
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ramp-gray-600 dark:text-ramp-gray-400 uppercase tracking-wide mb-1">
                      Required Niche
                    </p>
                    <p className="text-sm font-semibold text-ramp-gray-700 dark:text-ramp-gray-300">
                      {campaign.requiredNiche}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/brand/campaign/${campaign.id}/recommendations`}
                      className="px-4 py-2 bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View Recommendations
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrandRecommendations;
