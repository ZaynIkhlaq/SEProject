import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrandProfile, InfluencerProfile, PortfolioItem } from '../shared/types';
import Layout from '../components/Layout';

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
        ? `/api/v1/profiles/public/brand/${userId}`
        : `/api/v1/profiles/public/influencer/${userId}`;

      const res = await axios.get(endpoint);
      setProfile(res.data.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404 && profileType === 'brand') {
        // Try influencer profile if brand not found
        try {
          const res = await axios.get(`/api/v1/profiles/public/influencer/${userId}`);
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
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block loading-spinner mb-4"></div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4">
            <p className="text-ramp-red-700 dark:text-ramp-red-300">{error || 'Profile not found'}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-ramp-gray-600 hover:bg-ramp-gray-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // Type guard and rendering
  const isBrand = (p: any): p is BrandProfile => 'companyName' in p;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">

      {isBrand(profile) ? (
        // Brand Profile
        <div className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-ramp-purple-600 hover:text-ramp-purple-700 mb-4 font-medium"
          >
            ← Go Back
          </button>
          <div className="bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 shadow-md p-6">
            <h1 className="text-3xl font-bold text-ramp-black dark:text-white">{profile.companyName}</h1>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mt-1">{profile.industry}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Budget Tier</p>
                <p className="text-ramp-black dark:text-white font-semibold mt-2">
                  {profile.budgetTier === 'TIER_10K_50K' ? '$10K - $50K' :
                   profile.budgetTier === 'TIER_50K_200K' ? '$50K - $200K' :
                   '$200K+'}
                </p>
              </div>
              {profile.targetInfluencerType && (
                <div>
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Target Influencer Type</p>
                  <p className="text-ramp-black dark:text-white font-semibold mt-2">{profile.targetInfluencerType}</p>
                </div>
              )}
              {profile.website && (
                <div>
                  <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ramp-purple-600 hover:text-ramp-purple-700 font-semibold mt-2 break-all"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-ramp-gray-200 dark:border-ramp-gray-700">
                <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">About</p>
                <p className="text-ramp-black dark:text-white mt-2">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Influencer Profile
        <div className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-ramp-purple-600 hover:text-ramp-purple-700 mb-4 font-medium"
          >
            ← Go Back
          </button>
          {/* Profile Header */}
          <div className="bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ramp-black dark:text-white">{profile.niche} Influencer</h1>
                {profile.motto && (
                  <p className="text-ramp-gray-600 dark:text-ramp-gray-400 italic mt-2">"{profile.motto}"</p>
                )}
                {profile.location && (
                  <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mt-2">Location: {profile.location}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-ramp-blue-50 dark:bg-ramp-blue-900 dark:bg-opacity-20 rounded-lg p-4">
                <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Platform</p>
                <p className="text-lg font-bold text-ramp-blue-600 dark:text-ramp-blue-400 mt-2">{profile.platform}</p>
              </div>
              <div className="bg-ramp-green-50 dark:bg-ramp-green-900 dark:bg-opacity-20 rounded-lg p-4">
                <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Followers</p>
                <p className="text-lg font-bold text-ramp-green-600 dark:text-ramp-green-400 mt-2">
                  {profile.followerCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-ramp-purple-50 dark:bg-ramp-purple-900 dark:bg-opacity-20 rounded-lg p-4">
                <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Engagement Rate</p>
                <p className="text-lg font-bold text-ramp-purple-600 dark:text-ramp-purple-400 mt-2">
                  {(profile.engagementRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-ramp-orange-50 dark:bg-ramp-orange-900 dark:bg-opacity-20 rounded-lg p-4">
                <p className="text-xs font-medium text-ramp-gray-600 dark:text-ramp-gray-400">Niche</p>
                <p className="text-lg font-bold text-ramp-orange-600 dark:text-ramp-orange-400 mt-2">{profile.niche}</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-ramp-gray-200 dark:border-ramp-gray-700">
                <p className="text-sm font-medium text-ramp-gray-600 dark:text-ramp-gray-400">About</p>
                <p className="text-ramp-black dark:text-white mt-2">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Portfolio Items */}
          {profile.portfolioItems && profile.portfolioItems.length > 0 && (
            <div className="bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 shadow-md p-6">
              <h2 className="text-xl font-bold text-ramp-black dark:text-white mb-4">Portfolio</h2>
              <div className="space-y-3">
                {profile.portfolioItems.map((item, idx) => (
                  <div key={idx} className="border border-ramp-gray-200 dark:border-ramp-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-ramp-black dark:text-white">{item.description}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ramp-purple-600 hover:text-ramp-purple-700 text-sm mt-2 break-all"
                        >
                          {item.url}
                        </a>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white rounded-lg text-sm whitespace-nowrap transition-colors"
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
            <div className="bg-white dark:bg-ramp-gray-800 rounded-lg border border-ramp-gray-200 dark:border-ramp-gray-700 shadow-md p-6">
              <h2 className="text-xl font-bold text-ramp-black dark:text-white mb-4">Profile Photo</h2>
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
    </Layout>
  );
};

export default PublicProfile;
