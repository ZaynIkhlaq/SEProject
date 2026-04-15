import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InfluencerRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    niche: '',
    platform: 'Instagram',
    followerCount: 1000,
    engagementRate: 5.0,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registerInfluencer } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'followerCount' || name === 'engagementRate' ? parseFloat(value) : value
    }));
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
        formData.followerCount,
        formData.engagementRate
      );
      navigate('/influencer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ramp-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-ramp-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-ramp-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ramp-purple-600 to-ramp-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">IH</span>
            </div>
            <span className="font-bold text-lg text-white">InfluencerHub</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Creator Account</h1>
          <p className="text-ramp-gray-400 text-sm">Join thousands of creators earning with brands</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-slide-up">
            <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-3 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-ramp-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-ramp-red-300 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Email */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="creator@email.com"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white placeholder-ramp-gray-600"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white placeholder-ramp-gray-600"
              required
            />
          </div>

          {/* Niche */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Your Niche</label>
            <select
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
              required
            >
              <option value="">Select your niche</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Tech">Technology</option>
              <option value="Fitness">Fitness</option>
              <option value="Food">Food & Beverage</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Gaming">Gaming</option>
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
            >
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter/X</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>

          {/* Followers */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Follower Count</label>
            <input
              type="number"
              name="followerCount"
              value={formData.followerCount}
              onChange={handleChange}
              min="100"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
              required
            />
          </div>

          {/* Engagement Rate */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Engagement Rate (%)</label>
            <input
              type="number"
              name="engagementRate"
              value={formData.engagementRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
              required
            />
            <p className="text-xs text-ramp-gray-500 mt-2">Your average engagement rate (e.g., likes + comments / followers)</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full bg-ramp-teal-500 hover:bg-ramp-teal-600 font-medium py-3 text-white rounded-lg disabled:opacity-60 shadow-lg hover:shadow-ramp-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Creating...</span>
              </>
            ) : (
              'Create Creator Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-ramp-gray-400 text-sm mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-ramp-purple-400 hover:text-ramp-purple-300 font-semibold">
              Sign in
            </Link>
          </p>
          <p className="text-ramp-gray-500 text-xs">
            Looking to register as a brand?{' '}
            <Link to="/register/brand" className="text-ramp-purple-400 hover:text-ramp-purple-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfluencerRegisterPage;
