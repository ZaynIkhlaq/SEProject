import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Campaign } from '../../shared/types';
import Layout from '../../components/Layout';

const BrandCampaigns: React.FC = () => {
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
      setCampaigns(response.data.data);
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
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading campaigns...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">
              Your Campaigns
            </h1>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
              Manage and track all your active campaigns
            </p>
          </div>
          <Link
            to="/brand/campaign/create"
            className="px-4 py-2 bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Create Campaign
          </Link>
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

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mb-4">
              No campaigns yet. Create your first campaign to get started!
            </p>
            <Link
              to="/brand/campaign/create"
              className="inline-block px-4 py-2 bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/brand/campaign/${campaign.id}`}
                className="group bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 overflow-hidden hover:shadow-lg hover:border-ramp-purple-500 dark:hover:border-ramp-purple-500 transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-ramp-black dark:text-white group-hover:text-ramp-purple-600 dark:group-hover:text-ramp-purple-400 transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400 mt-1">
                        {campaign.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">Budget Tier</span>
                      <span className="font-semibold text-ramp-black dark:text-white">
                        {campaign.budgetTier}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">Deadline</span>
                      <span className="text-sm text-ramp-gray-700 dark:text-ramp-gray-300">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-ramp-gray-200 dark:border-ramp-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'OPEN'
                          ? 'bg-ramp-green-100 text-ramp-green-700 dark:bg-ramp-green-900 dark:text-ramp-green-300'
                          : campaign.status === 'COMPLETED'
                          ? 'bg-ramp-blue-100 text-ramp-blue-700 dark:bg-ramp-blue-900 dark:text-ramp-blue-300'
                          : 'bg-ramp-gray-100 text-ramp-gray-700 dark:bg-ramp-gray-700 dark:text-ramp-gray-300'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrandCampaigns;
