import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchInvestigations } from '../store/investigationSlice';
import SystemStatusBanner from '../components/dashboard/SystemStatusBanner';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import RecentInvestigationsTable from '../components/dashboard/RecentInvestigationsTable';

export const DashboardPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInvestigations());
  }, [dispatch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quality Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Root Cause Analysis (RCA) & CAPA Decision Support for API Manufacturing
          </p>
        </div>
      </div>

      <SystemStatusBanner />
      <MetricsOverview />
      <RecentInvestigationsTable />
    </div>
  );
};

export default DashboardPage;
