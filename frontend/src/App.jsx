import React from 'react';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-sky-700">VyomAcre Platform</h1>
        <p className="text-slate-600">Day 2 Sprint: Validations & Map Integration</p>
      </header>
      
      {/* 3 Column Grid Layout: Form (1 part) + Map (2 parts) */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OwnerForm />
        </div>
        <div className="lg:col-span-2">
          <MapDashboard />
        </div>
      </main>
    </div>
  );
}