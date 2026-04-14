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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, 'brand');
      navigate('/brand/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      try {
        await login(email, password, 'influencer');
        navigate('/influencer/dashboard');
      } catch {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">InfluencerHub</h1>
        <p className="text-gray-600 mb-6">Brand & Influencer Collaboration Platform</p>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="text-gray-600 text-center mb-4">Don't have an account?</p>
          <div className="space-y-2">
            <Link
              to="/register/brand"
              className="block w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 text-center transition"
            >
              Register as Brand
            </Link>
            <Link
              to="/register/influencer"
              className="block w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 text-center transition"
            >
              Register as Influencer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
