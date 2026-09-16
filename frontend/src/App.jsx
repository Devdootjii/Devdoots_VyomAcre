import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import VyomLanding from './components/VyomLanding';
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import OwnerInbox from './components/OwnerInbox';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';
import MapDashboard from './components/MapDashboard';

import { UIProvider } from './context/UIContext';


// ============================================================
// PLACEHOLDER PAGE
// ============================================================

function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen bg-slate-100 px-6 pt-32 pb-12">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-sky-600">
          VyomAcre
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          {title}
        </h1>

        <p className="mt-4 text-slate-600">
          {description}
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}


// ============================================================
// PROPERTY DETAILS PAGE
// ============================================================

function PropertyDetails() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title={`Property Details #${id}`}
      description="Property details page is ready for the property module."
    />
  );
}


// ============================================================
// AGREEMENT DETAILS PAGE
// ============================================================

function AgreementDetails() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title={`Agreement #${id}`}
      description="Agreement page is ready for the agreement module."
    />
  );
}


// ============================================================
// 404 PAGE
// ============================================================

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 pt-32 pb-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <p className="text-7xl font-black text-slate-900">
          404
        </p>

        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}


// ============================================================
// MAIN APP
// ============================================================

export default function App() {

  // ----------------------------------------------------------
  // OWNER DATA
  // ----------------------------------------------------------

  const [ownerData, setOwnerData] = useState(() => {
    try {
      const savedOwnerData =
        localStorage.getItem('vyomacre_owner_data');

      if (savedOwnerData) {
        return JSON.parse(savedOwnerData);
      }

      return null;
    } catch (error) {
      console.error(
        'Failed to load owner data from localStorage:',
        error
      );

      return null;
    }
  });


  // ----------------------------------------------------------
  // SAVE OWNER DATA
  // ----------------------------------------------------------

  useEffect(() => {
    if (ownerData) {
      localStorage.setItem(
        'vyomacre_owner_data',
        JSON.stringify(ownerData)
      );
    }
  }, [ownerData]);


  // ----------------------------------------------------------
  // OWNER FORM SUCCESS
  // ----------------------------------------------------------

  const handleOwnerSubmitSuccess = (submittedData) => {
    setOwnerData({
      ...submittedData,
      status: 'Pending',
    });
  };


  // ----------------------------------------------------------
  // APP UI
  // ----------------------------------------------------------

  return (
    <UIProvider>

      <BrowserRouter>

        <div className="min-h-screen bg-slate-950 font-sans">

          <Navbar />

          <Routes>

            {/* ==================================================
                HOME
            ================================================== */}

            <Route
              path="/"
              element={<VyomLanding />}
            />


            {/* ==================================================
                LOGIN
            ================================================== */}

            <Route
              path="/login"
              element={
                <PlaceholderPage
                  title="Login"
                  description="Login module will be connected to the authentication API."
                />
              }
            />


            {/* ==================================================
                OWNER REGISTRATION
            ================================================== */}

            <Route
              path="/register"
              element={
                <div className="min-h-screen bg-slate-100 px-6 pt-28 pb-12">

                  <div className="mx-auto flex max-w-3xl flex-col gap-8">

                    <h2 className="text-center text-3xl font-extrabold text-slate-800">
                      Registration Portal
                    </h2>

                    <OwnerForm
                      onSubmitSuccess={handleOwnerSubmitSuccess}
                    />

                    <OwnerStatusDashboard
                      ownerData={ownerData}
                    />

                  </div>

                </div>
              }
            />


            {/* ==================================================
                OWNER DASHBOARD
            ================================================== */}

            <Route
              path="/owner-dashboard"
              element={
                <div className="min-h-screen bg-slate-100 px-6 pt-28 pb-12">

                  <div className="mx-auto max-w-7xl">

                    <OwnerStatusDashboard
                      ownerData={ownerData}
                    />

                  </div>

                </div>
              }
            />


            {/* ==================================================
                OWNER INBOX
            ================================================== */}

            <Route
              path="/owner-inbox"
              element={
                <div className="min-h-screen bg-slate-100 px-4 pt-28 pb-12 text-slate-900 sm:px-6">

                  <div className="mx-auto max-w-3xl">

                    <OwnerInbox />

                  </div>

                </div>
              }
            />


            {/* ==================================================
                SEEKER DASHBOARD
            ================================================== */}

            <Route
              path="/seeker-dashboard"
              element={
                <PlaceholderPage
                  title="Seeker Dashboard"
                  description="Seeker dashboard will be connected to the marketplace and lease-request modules."
                />
              }
            />


            {/* ==================================================
                ADMIN DASHBOARD
            ================================================== */}

            <Route
              path="/admin"
              element={
                <PlaceholderPage
                  title="Admin Dashboard"
                  description="Admin dashboard is reserved for the administration module."
                />
              }
            />


            {/* ==================================================
                COMPANY MARKETPLACE
            ================================================== */}

            <Route
              path="/properties"
              element={
                <div className="min-h-screen bg-slate-100 px-6 pt-28 pb-12">

                  <div className="mx-auto max-w-7xl">

                    <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-800">
                      Company Marketplace
                    </h2>

                    <MapDashboard />

                  </div>

                </div>
              }
            />


            {/* ==================================================
                PROPERTY DETAILS
            ================================================== */}

            <Route
              path="/property/:id"
              element={<PropertyDetails />}
            />


            {/* ==================================================
                AGREEMENT
            ================================================== */}

            <Route
              path="/agreement/:id"
              element={<AgreementDetails />}
            />


            {/* ==================================================
                LEGACY / BACKUP VIEW
            ================================================== */}

            <Route
              path="/legacy"
              element={
                <div className="min-h-screen bg-slate-100 pt-24">

                  <LandingPage />

                  <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">

                    <section
                      id="owner-form"
                      className="flex flex-col gap-8"
                    >

                      <OwnerForm
                        onSubmitSuccess={handleOwnerSubmitSuccess}
                      />

                      <OwnerStatusDashboard
                        ownerData={ownerData}
                      />

                    </section>

                    <MapDashboard />

                  </main>

                </div>
              }
            />


            {/* ==================================================
                ABOUT
            ================================================== */}

            <Route
              path="/about"
              element={
                <PlaceholderPage
                  title="About VyomAcre"
                  description="About VyomAcre page is coming soon."
                />
              }
            />


            {/* ==================================================
                HELP
            ================================================== */}

            <Route
              path="/help"
              element={
                <PlaceholderPage
                  title="Help Center"
                  description="VyomAcre Help Center is coming soon."
                />
              }
            />


            {/* ==================================================
                404
            ================================================== */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </div>

      </BrowserRouter>

    </UIProvider>
  );
} 