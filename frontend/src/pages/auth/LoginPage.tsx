import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const normalizeLoginIdentifier = (value: string): string => {
    const normalized = value.trim().toLowerCase();

    if (normalized.includes('@')) {
      return normalized;
    }

    if (normalized === 'brand') {
      return 'brand@demo.com';
    }

    if (normalized === 'influencer' || normalized === 'creator') {
      return 'influencer@demo.com';
    }

    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normalizedEmail = normalizeLoginIdentifier(email);
      const loggedInUser = await login(normalizedEmail, password, 'brand');

      if (loggedInUser.role === 'INFLUENCER') {
        navigate('/influencer/dashboard');
      } else if (loggedInUser.role === 'BRAND') {
        navigate('/brand/dashboard');
      } else if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/messages');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email/username or password');
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
        {/* Logo/Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-ramp-purple-600 to-ramp-blue-500 mb-6">
            <span className="text-white font-bold text-xl">IH</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">InfluencerHub</h1>
          <p className="text-ramp-gray-400 text-sm">Connect brands with influencers. Collaborate at scale.</p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Email Input */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com or influencer"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white placeholder-ramp-gray-600"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-white font-medium text-sm mb-2.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field bg-ramp-gray-900 border-ramp-gray-800 text-white placeholder-ramp-gray-600"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full bg-ramp-purple-600 hover:bg-ramp-purple-700 font-medium py-3 text-white rounded-lg
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-ramp-lg
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ramp-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-ramp-black text-ramp-gray-500 font-medium">New to InfluencerHub?</span>
          </div>
        </div>

        {/* Registration Links */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/register/brand"
            className="btn-secondary bg-ramp-gray-900 border-ramp-gray-800 text-white hover:bg-ramp-gray-800 
                       py-2.5 rounded-lg font-medium text-center transition-all duration-200"
          >
            Join as Brand
          </Link>
          <Link
            to="/register/influencer"
            className="btn-secondary bg-ramp-gray-900 border-ramp-gray-800 text-white hover:bg-ramp-gray-800 
                       py-2.5 rounded-lg font-medium text-center transition-all duration-200"
          >
            Join as Creator
          </Link>
        </div>

        {/* Demo Credentials - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-ramp-gray-900 rounded-lg border border-ramp-gray-800 text-center">
            <p className="text-ramp-gray-500 text-xs font-medium mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-xs">
              <p className="text-ramp-gray-400">
                <span className="text-ramp-purple-400 font-medium">Brand:</span> brand@demo.com
              </p>
              <p className="text-ramp-gray-400">
                <span className="text-ramp-teal-400 font-medium">Creator:</span> influencer@demo.com
              </p>
              <p className="text-ramp-gray-500">Password: <span className="font-mono">password123</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
