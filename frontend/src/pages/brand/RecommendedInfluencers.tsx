import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecommendedInfluencer } from '../../shared/types';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const RecommendedInfluencers: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, [campaignId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recommendations/${campaignId}`);
      setRecommendations(res.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (influencerId: string, influencerEmail: string) => {
    try {
      setActionLoading(influencerId);
      await api.post(`/recommendations/${campaignId}/interest/${influencerId}`);
      setInterestedIds(new Set([...interestedIds, influencerId]));
      // Show toast notification
      console.log(`Interest sent to ${influencerEmail}`);
    } catch (err: any) {
      console.error('Error expressing interest:', err);
    } finally {
      setActionLoading(null);
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

  if (error) {
    return (
      <Layout>
        <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4">
          <p className="text-ramp-red-700 dark:text-ramp-red-300">{error}</p>
          <button
            onClick={() => navigate('/brand/dashboard')}
            className="mt-4 px-4 py-2 bg-ramp-gray-600 text-white rounded-lg hover:bg-ramp-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(`/brand/campaign/${campaignId}`)}
            className="text-ramp-purple-600 hover:text-ramp-purple-700 dark:text-ramp-purple-400 dark:hover:text-ramp-purple-300 font-medium mb-4 hover:underline"
          >
            ← Back to Campaign
          </button>
          <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">Recommended Influencers</h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            Based on your campaign requirements, here are the top matches:
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="card border-2 border-dashed border-ramp-gray-300 dark:border-ramp-gray-700 text-center py-16">
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mb-4">
              No influencers match your campaign criteria
            </p>
            <button
              onClick={() => navigate('/brand/dashboard')}
              className="px-4 py-2 bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="card">
              {/* Ranking Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-ramp-purple-500 to-ramp-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ramp-black dark:text-white">
                      {rec.profile.niche} Influencer
                    </h3>
                    <p className="text-sm text-ramp-gray-500 dark:text-ramp-gray-400">Match Score: {(rec.score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-ramp-purple-50 dark:bg-ramp-purple-900 rounded-full">
                    <p className="text-2xl font-bold bg-gradient-to-r from-ramp-purple-600 to-ramp-blue-600 bg-clip-text text-transparent">
                      {(rec.score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-ramp-gray-50 dark:bg-ramp-gray-700 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Niche Match</p>
                  <p className="text-sm font-bold text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">
                    {rec.matchDetails.nicheMatch ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Budget Match</p>
                  <p className="text-sm font-bold text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">
                    {rec.matchDetails.budgetMatch ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Engagement</p>
                  <p className="text-sm font-bold text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">
                    {(rec.matchDetails.engagementScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Completeness</p>
                  <p className="text-sm font-bold text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">
                    {(rec.matchDetails.completenessScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Reviews</p>
                  <p className="text-sm font-bold text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">
                    {(rec.matchDetails.reviewScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Influencer Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-ramp-gray-200 dark:border-ramp-gray-700">
                <div>
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Platform</p>
                  <p className="text-ramp-gray-900 dark:text-ramp-gray-100 font-semibold mt-1">{rec.profile.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Followers</p>
                  <p className="text-ramp-gray-900 dark:text-ramp-gray-100 font-semibold mt-1">
                    {rec.profile.followerCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Engagement Rate</p>
                  <p className="text-ramp-gray-900 dark:text-ramp-gray-100 font-semibold mt-1">
                    {(rec.profile.engagementRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Bio */}
              {rec.profile.bio && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Bio</p>
                  <p className="text-ramp-gray-900 dark:text-ramp-gray-100 mt-2 text-sm">{rec.profile.bio}</p>
                </div>
              )}

              {/* Location and Motto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-ramp-gray-200 dark:border-ramp-gray-700">
                {rec.profile.location && (
                  <div>
                    <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Location</p>
                    <p className="text-ramp-gray-900 dark:text-ramp-gray-100 mt-1">{rec.profile.location}</p>
                  </div>
                )}
                {rec.profile.motto && (
                  <div>
                    <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Motto</p>
                    <p className="text-ramp-gray-900 dark:text-ramp-gray-100 mt-1 italic">{rec.profile.motto}</p>
                  </div>
                )}
              </div>

              {/* Portfolio Items */}
              {rec.profile.portfolioItems && rec.profile.portfolioItems.length > 0 && (
                <div className="mb-4 pb-4 border-b border-ramp-gray-200 dark:border-ramp-gray-700">
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400 mb-2">Portfolio</p>
                  <div className="space-y-2">
                    {rec.profile.portfolioItems.slice(0, 3).map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-ramp-purple-600 dark:text-ramp-purple-400 hover:text-ramp-purple-700 dark:hover:text-ramp-purple-300 truncate"
                      >
                        {item.description}
                      </a>
                    ))}
                    {rec.profile.portfolioItems.length > 3 && (
                      <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-400">
                        +{rec.profile.portfolioItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExpressInterest(rec.id, rec.profile.userId)}
                  disabled={actionLoading === rec.id || interestedIds.has(rec.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                    interestedIds.has(rec.id)
                      ? 'bg-ramp-green-600 text-white cursor-not-allowed'
                      : 'bg-ramp-purple-600 text-white hover:bg-ramp-purple-700'
                  }`}
                >
                  {actionLoading === rec.id ? (
                    <span>Sending...</span>
                  ) : interestedIds.has(rec.id) ? (
                    'Interest Sent'
                  ) : (
                    'Express Interest'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </Layout>
  );
};

export default RecommendedInfluencers;
