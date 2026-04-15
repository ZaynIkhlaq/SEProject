import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Campaign } from '../../shared/types';
import Layout from '../../components/Layout';

const BrowseCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, selectedNiche, selectedBudget, searchTerm]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/campaigns');
      const openCampaigns = response.data.data?.filter((c: Campaign) => c.status === 'OPEN') || [];
      setCampaigns(openCampaigns);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (selectedNiche) {
      filtered = filtered.filter(c => c.requiredNiche === selectedNiche);
    }
    if (selectedBudget) {
      filtered = filtered.filter(c => c.budgetTier === selectedBudget);
    }
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  };

  const niches = Array.from(new Set(campaigns.map(c => c.requiredNiche))).sort();
  const budgetTiers = Array.from(new Set(campaigns.map(c => c.budgetTier))).sort();

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">
            Discover Campaigns
          </h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            Find campaigns that match your niche and collaborate with top brands
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

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800 text-ramp-black dark:text-white placeholder-ramp-gray-500 pl-10"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ramp-gray-500">🔍</span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {/* Niche Filter */}
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800 text-ramp-black dark:text-white py-2 px-3 max-w-xs"
            >
              <option value="">All Niches</option>
              {niches.map(niche => (
                <option key={niche} value={niche}>{niche}</option>
              ))}
            </select>

            {/* Budget Filter */}
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800 text-ramp-black dark:text-white py-2 px-3 max-w-xs"
            >
              <option value="">All Budgets</option>
              {budgetTiers.map(tier => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>

            {/* Reset Button */}
            {(selectedNiche || selectedBudget || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedNiche('');
                  setSelectedBudget('');
                  setSearchTerm('');
                }}
                className="btn-secondary bg-ramp-gray-100 dark:bg-ramp-gray-800 text-ramp-black dark:text-white px-4 py-2 rounded-lg border border-ramp-gray-300 dark:border-ramp-gray-700"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">
            Found {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block loading-spinner mb-4"></div>
              <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading campaigns...</p>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && (
          <>
            {filteredCampaigns.length === 0 ? (
              <div className="card border-2 border-dashed border-ramp-gray-300 dark:border-ramp-gray-700 text-center py-20">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-ramp-black dark:text-white mb-2">
                  No campaigns found
                </h3>
                <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
                  Try adjusting your filters to see more campaigns
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/influencer/campaigns/${campaign.id}`}
                    className="card-hover group h-full flex flex-col hover:shadow-ramp-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="mb-4 pb-4 border-b border-ramp-gray-200 dark:border-ramp-gray-800">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-ramp-black dark:text-white group-hover:text-ramp-purple-600 dark:group-hover:text-ramp-purple-400 transition-colors line-clamp-2">
                          {campaign.title}
                        </h3>
                        <span className="badge-primary text-xs font-medium ml-2 flex-shrink-0">
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Description */}
                      <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400 line-clamp-2">
                        {campaign.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span className="text-ramp-gray-700 dark:text-ramp-gray-300 font-medium">{campaign.requiredNiche}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <span className="text-ramp-gray-700 dark:text-ramp-gray-300 font-medium">{campaign.budgetTier}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👥</span>
                          <span className="text-ramp-gray-700 dark:text-ramp-gray-300 font-medium">{campaign.influencersNeeded} needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⏰</span>
                          <span className="text-ramp-gray-700 dark:text-ramp-gray-300 font-medium">
                            {new Date(campaign.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 pt-4 border-t border-ramp-gray-200 dark:border-ramp-gray-800 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ramp-purple-600 dark:text-ramp-purple-400">
                        View Details
                      </span>
                      <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BrowseCampaigns;
