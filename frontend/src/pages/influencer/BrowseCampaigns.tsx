import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Campaign, BudgetTier } from '../../shared/types';

const BrowseCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    niche: '',
    budgetTier: '',
    platform: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/campaigns');
      setCampaigns(res.data.data);
      setFilteredCampaigns(res.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = campaigns;

    if (filters.niche) {
      filtered = filtered.filter(c =>
        c.requiredNiche.toLowerCase().includes(filters.niche.toLowerCase())
      );
    }

    if (filters.budgetTier) {
      filtered = filtered.filter(c => c.budgetTier === filters.budgetTier);
    }

    setFilteredCampaigns(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleApply = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await axios.post('/api/applications', { campaignId });
      setAppliedCampaigns(prev => new Set([...prev, campaignId]));
      alert('Application submitted successfully!');
    } catch (err: any) {
      if (err.response?.data?.error?.includes('already applied')) {
        alert('You have already applied to this campaign');
        setAppliedCampaigns(prev => new Set([...prev, campaignId]));
      } else {
        alert(err.response?.data?.error || 'Failed to apply to campaign');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  const budgetTiers: BudgetTier[] = ['TIER_10K_50K', 'TIER_50K_200K', 'TIER_200K_PLUS'];

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Campaigns</h1>
        <p className="text-gray-600 mt-2">
          Find campaigns that match your niche and expertise
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niche
            </label>
            <input
              type="text"
              placeholder="Enter niche (e.g., Fashion, Tech)"
              value={filters.niche}
              onChange={(e) => handleFilterChange('niche', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Tier
            </label>
            <select
              value={filters.budgetTier}
              onChange={(e) => handleFilterChange('budgetTier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Budget Tiers</option>
              {budgetTiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'TIER_10K_50K' ? '$10K - $50K' :
                   tier === 'TIER_50K_200K' ? '$50K - $200K' :
                   '$200K+'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ niche: '', budgetTier: '', platform: '' })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No campaigns match your filters</p>
          <button
            onClick={() => setFilters({ niche: '', budgetTier: '', platform: '' })}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Campaign Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{campaign.title}</h3>
                  <p className="text-gray-600 mt-1">{campaign.productService}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Niche Required</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{campaign.requiredNiche}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Budget Tier</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {campaign.budgetTier === 'TIER_10K_50K' ? '$10K - $50K' :
                         campaign.budgetTier === 'TIER_50K_200K' ? '$50K - $200K' :
                         '$200K+'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Influencers Needed</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{campaign.influencersNeeded}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Deadline</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mt-4 text-sm line-clamp-2">{campaign.description}</p>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'CLOSED' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {campaign.status}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(campaign.id)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleApply(campaign.id)}
                      disabled={actionLoading === campaign.id || appliedCampaigns.has(campaign.id) || campaign.status !== 'OPEN'}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium ${
                        appliedCampaigns.has(campaign.id)
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          : campaign.status !== 'OPEN'
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {actionLoading === campaign.id ? 'Applying...' :
                       appliedCampaigns.has(campaign.id) ? 'Applied' :
                       'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCampaigns;
