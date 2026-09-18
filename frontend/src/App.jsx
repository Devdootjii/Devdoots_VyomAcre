import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { UIProvider } from './context/UIContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GeminiChatbot from './components/GeminiChatbot';

import VyomLanding from './components/VyomLanding';
import Login from './components/Login';
import SignUp from './components/Signup';
import OwnerForm from './components/OwnerForm';
import OwnerInbox from './components/OwnerInbox';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';
import MapDashboard from './components/MapDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SeekerDashboard from './components/SeekerDashboard';

const PlaceholderPage = ({ title, message }) => (
  <div className="min-h-screen bg-slate-950 px-6 py-20 text-white">
    <div className="mx-auto max-w-5xl text-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-slate-400">{message}</p>
    </div>
  </div>
);

const NotFound = () => (
  <PlaceholderPage
    title="404 - Page Not Found"
    message="The page you are looking for does not exist."
  />
);

const App = () => {
  return (
    <BrowserRouter>
      <UIProvider>
        <div className="min-h-screen bg-slate-950 text-white">
          <Navbar />

          <main>
            <Routes>

              {/* Home */}
              <Route path="/" element={<VyomLanding />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Keep register URL connected to signup */}
              <Route path="/register" element={<SignUp />} />

              {/* Owner */}
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute>
                    <OwnerStatusDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner-inbox"
                element={
                  <ProtectedRoute>
                    <OwnerInbox />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <OwnerForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner/new-roof"
                element={<OwnerForm />}
              />

              {/* Properties */}
              <Route
                path="/properties"
                element={<MapDashboard />}
              />

              <Route
                path="/property/:id"
                element={
                  <PlaceholderPage
                    title="Property Details"
                    message="Property details page is being integrated."
                  />
                }
              />

              {/* Seeker */}
              <Route
                path="/seeker-dashboard"
                element={
                  <ProtectedRoute>
                    <SeekerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <PlaceholderPage
                    title="Admin Dashboard"
                    message="Admin dashboard is being integrated."
                  />
                }
              />

              {/* Agreement */}
              <Route
                path="/agreement/:id"
                element={
                  <PlaceholderPage
                    title="Agreement"
                    message="Agreement page is being integrated."
                  />
                }
              />

              {/* Other Pages */}
              <Route
                path="/about"
                element={
                  <PlaceholderPage
                    title="About VyomAcre"
                    message="Learn more about the VyomAcre platform."
                  />
                }
              />

              <Route
                path="/help"
                element={
                  <PlaceholderPage
                    title="Help & Support"
                    message="Help and support section is being integrated."
                  />
                }
              />

              <Route
                path="/legacy"
                element={
                  <PlaceholderPage
                    title="Legacy"
                    message="Legacy page."
                  />
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </main>

          <Footer />
          <GeminiChatbot />
        </div>
      </UIProvider>
    </BrowserRouter>
  );
};

export default App;