import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecommendedInfluencer } from '../../shared/types';
import { useAuth } from '../../context/AuthContext';

const RecommendedInfluencers: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

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

  const handleViewProfile = (influencerId: string) => {
    navigate(`/profile/${influencerId}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => navigate('/brand/dashboard')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/brand/campaign/${campaignId}`)}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Campaign
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Recommended Influencers</h1>
        <p className="text-gray-600 mt-2">
          Based on your campaign requirements, here are the top matches:
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No influencers match your campaign criteria</p>
          <button
            onClick={() => navigate('/brand/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Ranking Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {rec.profile.niche} Influencer
                    </h3>
                    <p className="text-sm text-gray-500">Match Score: {(rec.score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {(rec.score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Niche Match</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {rec.matchDetails.nicheMatch ? '✓' : '✗'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Budget Match</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {rec.matchDetails.budgetMatch ? '✓' : '✗'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Engagement</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {(rec.matchDetails.engagementScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Completeness</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {(rec.matchDetails.completenessScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Reviews</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {(rec.matchDetails.reviewScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Influencer Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform</p>
                  <p className="text-gray-900 font-semibold mt-1">{rec.profile.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Followers</p>
                  <p className="text-gray-900 font-semibold mt-1">
                    {rec.profile.followerCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-gray-900 font-semibold mt-1">
                    {(rec.profile.engagementRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Bio */}
              {rec.profile.bio && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600">Bio</p>
                  <p className="text-gray-900 mt-2 text-sm">{rec.profile.bio}</p>
                </div>
              )}

              {/* Location and Motto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                {rec.profile.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900 mt-1">{rec.profile.location}</p>
                  </div>
                )}
                {rec.profile.motto && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Motto</p>
                    <p className="text-gray-900 mt-1 italic">{rec.profile.motto}</p>
                  </div>
                )}
              </div>

              {/* Portfolio Items */}
              {rec.profile.portfolioItems && rec.profile.portfolioItems.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Portfolio</p>
                  <div className="space-y-2">
                    {rec.profile.portfolioItems.slice(0, 3).map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-700 truncate"
                      >
                        {item.description} →
                      </a>
                    ))}
                    {rec.profile.portfolioItems.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{rec.profile.portfolioItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewProfile(rec.id)}
                  className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => {
                    /* Will navigate to apply flow */
                    navigate('/brand/dashboard');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {appliedIds.has(rec.id) ? 'Applied' : 'Interest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedInfluencers;
