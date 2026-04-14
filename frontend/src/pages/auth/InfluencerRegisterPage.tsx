import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InfluencerRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    niche: '',
    platform: 'Instagram',
    followerCount: '',
    engagementRate: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registerInfluencer } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerInfluencer(
        formData.email,
        formData.password,
        formData.niche,
        formData.platform,
        parseInt(formData.followerCount) || 0,
        parseFloat(formData.engagementRate) || 0
      );
      navigate('/influencer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Influencer Registration</h1>
        <p className="text-gray-600 mb-6">Create your influencer profile</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

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

          <div>
            <label className="block text-gray-700 font-medium mb-2">Follower Count</label>
            <input
              type="number"
              name="followerCount"
              value={formData.followerCount}
              onChange={handleChange}
              placeholder="10000"
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
              placeholder="3.5"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Registering...' : 'Register as Influencer'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default InfluencerRegisterPage;
