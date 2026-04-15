import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    productService: '',
    requiredNiche: '',
    budgetTier: 'TIER_10K_50K',
    influencersNeeded: 1,
    deadline: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'influencersNeeded' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.post('/campaigns', formData);
      setSuccess('Campaign created successfully!');
      setTimeout(() => {
        navigate(`/brand/campaign/${response.data.data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">
            Create New Campaign
          </h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            Launch a campaign and connect with creators who match your requirements
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
            <div className="w-5 h-5 rounded-full bg-ramp-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-ramp-red-700 dark:text-ramp-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4 flex items-start gap-3 animate-slide-up">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
              Campaign Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Product Launch 2024"
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
              required
            />
            <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
              Give your campaign a clear, memorable title that will attract creators
            </p>
          </div>

          {/* Product/Service */}
          <div>
            <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
              Product or Service
            </label>
            <input
              type="text"
              name="productService"
              value={formData.productService}
              onChange={handleChange}
              placeholder="What are you promoting?"
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
              required
            />
            <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
              Describe the product or service being promoted
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
              Campaign Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your campaign, goals, and expectations..."
              className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800 min-h-32 resize-none"
              required
            />
            <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
              Provide details that will help creators understand your vision
            </p>
          </div>

          {/* Grid of Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Niche */}
            <div>
              <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
                Required Niche
              </label>
              <select
                name="requiredNiche"
                value={formData.requiredNiche}
                onChange={handleChange}
                className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
                required
              >
                <option value="">Select a niche</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Tech">Tech</option>
                <option value="Fitness">Fitness</option>
                <option value="Food">Food & Beverage</option>
                <option value="Travel">Travel</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            {/* Budget Tier */}
            <div>
              <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
                Budget Tier
              </label>
              <select
                name="budgetTier"
                value={formData.budgetTier}
                onChange={handleChange}
                className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
              >
                <option value="TIER_10K_50K">PKR 10k–50k</option>
                <option value="TIER_50K_200K">PKR 50k–200k</option>
                <option value="TIER_200K_PLUS">PKR 200k+</option>
              </select>
            </div>
          </div>

          {/* Grid of Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Influencers Needed */}
            <div>
              <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
                Number of Influencers
              </label>
              <input
                type="number"
                name="influencersNeeded"
                value={formData.influencersNeeded}
                onChange={handleChange}
                min="1"
                max="100"
                className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
                required
              />
              <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
                How many creators do you need?
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-ramp-black dark:text-white font-semibold text-sm mb-2.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input-field bg-white dark:bg-ramp-gray-900 border-ramp-gray-300 dark:border-ramp-gray-800"
                required
              />
              <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
                When should applications close?
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-ramp-gray-200 dark:border-ramp-gray-800">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-ramp-lg transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Create Campaign</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/brand/dashboard')}
              className="btn-secondary bg-ramp-gray-100 dark:bg-ramp-gray-800 text-ramp-black dark:text-white font-medium py-3 px-6 rounded-lg border border-ramp-gray-300 dark:border-ramp-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateCampaign;
