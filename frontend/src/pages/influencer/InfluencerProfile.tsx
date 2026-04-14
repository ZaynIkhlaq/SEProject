import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PortfolioItem {
  id: string;
  url: string;
  description: string;
}

const InfluencerProfile: React.FC = () => {
  const { api, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const [formData, setFormData] = useState({
    motto: '',
    bio: '',
    niche: '',
    platform: 'Instagram',
    followerCount: 0,
    engagementRate: 0,
    location: '',
    profilePhoto: ''
  });

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    url: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileResponse = await api.get('/profiles/influencer');
        setFormData(profileResponse.data.data);
        setPortfolioItems(profileResponse.data.data.portfolioItems || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [api]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['followerCount', 'engagementRate'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPortfolioItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await api.put('/profiles/influencer', formData);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioItem.url || !newPortfolioItem.description) return;

    try {
      const response = await api.post('/profiles/portfolio', newPortfolioItem);
      setPortfolioItems([...portfolioItems, response.data.data]);
      setNewPortfolioItem({ url: '', description: '' });
      setSuccess('Portfolio item added!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add portfolio item');
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    try {
      await api.delete(`/profiles/portfolio/${itemId}`);
      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
      setSuccess('Portfolio item deleted!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete portfolio item');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Influencer Profile</h1>
          <p className="text-gray-600 mb-6">{user?.email}</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Motto</label>
              <input
                type="text"
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                placeholder="Your personal motto or tagline"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Niche</label>
                <input
                  type="text"
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  placeholder="e.g., Fashion, Tech, Fitness"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Platform</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Follower Count</label>
                <input
                  type="number"
                  name="followerCount"
                  value={formData.followerCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Engagement Rate (%)</label>
                <input
                  type="number"
                  name="engagementRate"
                  value={formData.engagementRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Portfolio Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Items ({portfolioItems.length}/10)</h2>

          {portfolioItems.length < 10 && (
            <form onSubmit={handleAddPortfolioItem} className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Add Portfolio Item</h3>
              <div>
                <label className="block text-gray-700 font-medium mb-2">URL</label>
                <input
                  type="url"
                  name="url"
                  value={newPortfolioItem.url}
                  onChange={handlePortfolioChange}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description (max 200 chars)</label>
                <textarea
                  name="description"
                  value={newPortfolioItem.description}
                  onChange={handlePortfolioChange}
                  placeholder="Describe this work..."
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Add Item
              </button>
            </form>
          )}

          <div className="space-y-4">
            {portfolioItems.map(item => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-start">
                <div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.url}
                  </a>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                </div>
                <button
                  onClick={() => handleDeletePortfolioItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;
