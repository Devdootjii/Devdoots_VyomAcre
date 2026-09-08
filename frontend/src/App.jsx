import React from 'react';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-sky-700">VyomAcre Platform</h1>
        <p className="text-slate-600">Day 1 Sprint: Supply & Demand Integration</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <OwnerForm />
        <MapDashboard />
      </main>
    </div>
  );
}