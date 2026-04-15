import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CampaignApplication, InfluencerProfile } from '../../shared/types';
import Layout from '../../components/Layout';

const InfluencerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, profileRes] = await Promise.all([
        axios.get('/api/v1/applications/influencer/my-applications'),
        axios.get('/api/v1/profiles/influencer')
      ]);

      setApplications(appsRes.data.data || []);
      setProfile(profileRes.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalApplications: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block loading-spinner mb-4"></div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-ramp-black dark:text-white mb-2">
            Welcome back, {profile?.niche || 'Creator'}
          </h1>
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400">
            Track your applications, manage collaborations, and grow your presence
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-ramp-red-500 bg-opacity-10 border border-ramp-red-500 border-opacity-30 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-ramp-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-ramp-red-700 dark:text-ramp-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Applications */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-ramp-purple-100 dark:bg-ramp-purple-900 flex items-center justify-center group-hover:bg-ramp-purple-200 dark:group-hover:bg-ramp-purple-800 transition-colors">
                <span className="text-xs font-semibold text-ramp-purple-700 dark:text-ramp-purple-300">APP</span>
              </div>
              <span className="text-xs font-medium bg-ramp-purple-100 dark:bg-ramp-purple-900 text-ramp-purple-700 dark:text-ramp-purple-300 px-2 py-1 rounded">
                Total
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Applications</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.totalApplications}</p>
          </div>

          {/* Pending */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors">
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">PND</span>
              </div>
              <span className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                Waiting
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.pending}</p>
          </div>

          {/* Accepted */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">ACC</span>
              </div>
              <span className="text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                Success
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Accepted</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.accepted}</p>
          </div>

          {/* Rejected */}
          <div className="card hover:shadow-ramp-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-ramp-red-100 dark:bg-ramp-red-900 flex items-center justify-center group-hover:bg-ramp-red-200 dark:group-hover:bg-ramp-red-800 transition-colors">
                <span className="text-xs font-semibold text-ramp-red-700 dark:text-ramp-red-300">REJ</span>
              </div>
              <span className="text-xs font-medium bg-ramp-red-100 dark:bg-ramp-red-900 text-ramp-red-700 dark:text-ramp-red-300 px-2 py-1 rounded">
                Declined
              </span>
            </div>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm mb-2">Rejected</p>
            <p className="text-3xl font-bold text-ramp-black dark:text-white">{stats.rejected}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/influencer/campaigns"
            className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-ramp-lg transition-all"
          >
            Browse Campaigns
          </Link>
          <Link
            to="/influencer/profile"
            className="btn-secondary bg-ramp-gray-100 dark:bg-ramp-gray-800 text-ramp-black dark:text-white font-medium py-3 px-6 rounded-lg border border-ramp-gray-300 dark:border-ramp-gray-700 hover:bg-ramp-gray-200 dark:hover:bg-ramp-gray-700 transition-all"
          >
            Edit Profile
          </Link>
        </div>

        {/* Applications Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-ramp-black dark:text-white mb-2">Recent Applications</h2>
            <p className="text-ramp-gray-600 dark:text-ramp-gray-400">Track the status of your campaign applications</p>
          </div>

          {applications.length === 0 ? (
            <div className="card border-2 border-dashed border-ramp-gray-300 dark:border-ramp-gray-700 text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ramp-gray-100 dark:bg-ramp-gray-800 text-xs font-semibold text-ramp-gray-600 dark:text-ramp-gray-300 mb-3">APPS</div>
              <h3 className="text-lg font-semibold text-ramp-black dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-ramp-gray-600 dark:text-ramp-gray-400 mb-6">
                Start by browsing available campaigns that match your niche
              </p>
              <Link
                to="/influencer/campaigns"
                className="btn-primary bg-ramp-purple-600 hover:bg-ramp-purple-700 inline-block"
              >
                Browse Campaigns
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="card-hover group p-6 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-ramp-black dark:text-white">
                        Campaign Application
                      </h3>
                      <span className={`badge text-xs font-medium ${
                        app.status === 'PENDING' 
                          ? 'badge-warning' 
                          : app.status === 'ACCEPTED'
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-ramp-gray-600 dark:text-ramp-gray-400">
                      Campaign ID: {app.campaignId}
                    </p>
                    <p className="text-xs text-ramp-gray-500 dark:text-ramp-gray-500 mt-2">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-ramp-gray-500 dark:text-ramp-gray-400">Details</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InfluencerDashboard;
