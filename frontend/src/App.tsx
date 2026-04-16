import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from './components/ToastContainer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import BrandRegisterPage from './pages/auth/BrandRegisterPage';
import InfluencerRegisterPage from './pages/auth/InfluencerRegisterPage';

// Brand Pages
import BrandDashboard from './pages/brand/BrandDashboard';
import CreateCampaign from './pages/brand/CreateCampaign';
import CampaignDetails from './pages/brand/CampaignDetails';
import RecommendedInfluencers from './pages/brand/RecommendedInfluencers';
import BrandProfile from './pages/brand/BrandProfile';

// Influencer Pages
import InfluencerDashboard from './pages/influencer/InfluencerDashboard';
import BrowseCampaigns from './pages/influencer/BrowseCampaigns';
import InfluencerCampaignDetails from './pages/influencer/InfluencerCampaignDetails';
import InfluencerProfile from './pages/influencer/InfluencerProfile';

// Shared Pages
import Messaging from './pages/Messaging';
import PublicProfile from './pages/PublicProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ToastContainer />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/brand" element={<BrandRegisterPage />} />
          <Route path="/register/influencer" element={<InfluencerRegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Brand Routes */}
          <Route
            path="/brand/dashboard"
            element={<ProtectedRoute requiredRole="BRAND"><BrandDashboard /></ProtectedRoute>}
          />
          <Route
            path="/brand/profile"
            element={<ProtectedRoute requiredRole="BRAND"><BrandProfile /></ProtectedRoute>}
          />
          <Route
            path="/brand/campaign/create"
            element={<ProtectedRoute requiredRole="BRAND"><CreateCampaign /></ProtectedRoute>}
          />
          <Route
            path="/brand/campaign/:campaignId"
            element={<ProtectedRoute requiredRole="BRAND"><CampaignDetails /></ProtectedRoute>}
          />
          <Route
            path="/brand/campaign/:campaignId/recommendations"
            element={<ProtectedRoute requiredRole="BRAND"><RecommendedInfluencers /></ProtectedRoute>}
          />

          {/* Influencer Routes */}
          <Route
            path="/influencer/dashboard"
            element={<ProtectedRoute requiredRole="INFLUENCER"><InfluencerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/influencer/profile"
            element={<ProtectedRoute requiredRole="INFLUENCER"><InfluencerProfile /></ProtectedRoute>}
          />
          <Route
            path="/influencer/campaigns"
            element={<ProtectedRoute requiredRole="INFLUENCER"><BrowseCampaigns /></ProtectedRoute>}
          />
          <Route
            path="/influencer/campaigns/:campaignId"
            element={<ProtectedRoute requiredRole="INFLUENCER"><InfluencerCampaignDetails /></ProtectedRoute>}
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>}
          />

          {/* Shared Routes */}
          <Route
            path="/messages"
            element={<ProtectedRoute><Messaging /></ProtectedRoute>}
          />
          <Route
            path="/profile/:userId"
            element={<ProtectedRoute><PublicProfile /></ProtectedRoute>}
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
