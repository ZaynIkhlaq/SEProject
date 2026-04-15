import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BrandRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: '',
    budgetTier: 'TIER_10K_50K'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registerBrand } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerBrand(
        formData.email,
        formData.password,
        formData.companyName,
        formData.industry,
        formData.budgetTier
      );
      navigate('/brand/dashboard');
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ramp-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ramp-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
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
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Brand Account</h1>
          <p className="text-ramp-gray-400 text-sm">Start collaborating with creators today</p>
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
              placeholder="company@email.com"
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
            <div className="mt-2 p-3 bg-ramp-gray-900 rounded-lg border border-ramp-gray-800">
              <p className="text-xs text-ramp-gray-400 font-medium mb-2">Password must contain:</p>
              <ul className="text-xs text-ramp-gray-500 space-y-1">
                <li>- At least 8 characters</li>
                <li>- One uppercase letter (A-Z)</li>
                <li>- One lowercase letter (a-z)</li>
                <li>- One number (0-9)</li>
                <li>- One special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your company name"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white placeholder-ramp-gray-600"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
              required
            >
              <option value="">Select industry</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Tech">Technology</option>
              <option value="Food">Food & Beverage</option>
              <option value="Travel">Travel</option>
              <option value="Fitness">Fitness</option>
            </select>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Budget Tier</label>
            <select
              name="budgetTier"
              value={formData.budgetTier}
              onChange={handleChange}
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white"
            >
              <option value="TIER_10K_50K">PKR 10k–50k</option>
              <option value="TIER_50K_200K">PKR 50k–200k</option>
              <option value="TIER_200K_PLUS">PKR 200k+</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full bg-ramp-purple-600 hover:bg-ramp-purple-700 font-medium py-3 text-white rounded-lg disabled:opacity-60 shadow-lg hover:shadow-ramp-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Creating...</span>
              </>
            ) : (
              'Create Brand Account'
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
            Looking to join as a creator?{' '}
            <Link to="/register/influencer" className="text-ramp-teal-400 hover:text-ramp-teal-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandRegisterPage;
