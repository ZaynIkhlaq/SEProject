import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrandProfile, InfluencerProfile, PortfolioItem } from '../shared/types';

interface PublicInfluencerProfileWithPortfolio extends InfluencerProfile {
  portfolioItems?: PortfolioItem[];
}

type ProfileType = BrandProfile | PublicInfluencerProfileWithPortfolio;

const PublicProfile: React.FC = () => {
  const { userId, type } = useParams<{ userId: string; type?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileType, setProfileType] = useState<'brand' | 'influencer'>(
    type === 'brand' ? 'brand' : type === 'influencer' ? 'influencer' : 'influencer'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [userId, profileType]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = profileType === 'brand'
        ? `/api/profiles/public/brand/${userId}`
        : `/api/profiles/public/influencer/${userId}`;

      const res = await axios.get(endpoint);
      setProfile(res.data.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404 && profileType === 'brand') {
        // Try influencer profile if brand not found
        try {
          const res = await axios.get(`/api/profiles/public/influencer/${userId}`);
          setProfile(res.data.data);
          setProfileType('influencer');
        } catch {
          setError('Profile not found');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Profile not found'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Type guard and rendering
  const isBrand = (p: any): p is BrandProfile => 'companyName' in p;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          Go Back
        </button>
      </div>

      {isBrand(profile) ? (
        // Brand Profile
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900">{profile.companyName}</h1>
            <p className="text-gray-600 mt-1">{profile.industry}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Tier</p>
                <p className="text-gray-900 font-semibold mt-2">
                  {profile.budgetTier === 'TIER_10K_50K' ? '$10K - $50K' :
                   profile.budgetTier === 'TIER_50K_200K' ? '$50K - $200K' :
                   '$200K+'}
                </p>
              </div>
              {profile.targetInfluencerType && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Target Influencer Type</p>
                  <p className="text-gray-900 font-semibold mt-2">{profile.targetInfluencerType}</p>
                </div>
              )}
              {profile.website && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold mt-2 break-all"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600">About</p>
                <p className="text-gray-900 mt-2">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Influencer Profile
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.niche} Influencer</h1>
                {profile.motto && (
                  <p className="text-gray-600 italic mt-2">"{profile.motto}"</p>
                )}
                {profile.location && (
                  <p className="text-gray-600 mt-2">Location: {profile.location}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600">Platform</p>
                <p className="text-lg font-bold text-blue-600 mt-2">{profile.platform}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600">Followers</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {profile.followerCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600">Engagement Rate</p>
                <p className="text-lg font-bold text-purple-600 mt-2">
                  {(profile.engagementRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600">Niche</p>
                <p className="text-lg font-bold text-orange-600 mt-2">{profile.niche}</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600">About</p>
                <p className="text-gray-900 mt-2">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Portfolio Items */}
          {profile.portfolioItems && profile.portfolioItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio</h2>
              <div className="space-y-3">
                {profile.portfolioItems.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.description}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm mt-2 break-all"
                        >
                          {item.url}
                        </a>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Photo */}
          {profile.profilePhoto && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
              <img
                src={profile.profilePhoto}
                alt="Profile"
                className="w-full max-w-sm rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
