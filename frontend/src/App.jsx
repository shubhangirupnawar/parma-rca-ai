import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvestigations } from './store/investigationSlice';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import NewInvestigationPage from './pages/NewInvestigationPage';
import RcaAnalysisPage from './pages/RcaAnalysisPage';
import InvestigationDetailsPage from './pages/InvestigationDetailsPage';
import CapaRecommendationsPage from './pages/CapaRecommendationsPage';

export function App() {
  const dispatch = useDispatch();
  const activePage = useSelector((state) => state.ui.activePage);

  useEffect(() => {
    dispatch(fetchInvestigations());
  }, [dispatch]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new-investigation':
        return <NewInvestigationPage />;
      case 'rca-analysis':
        return <RcaAnalysisPage />;
      case 'investigation-details':
        return <InvestigationDetailsPage />;
      case 'capa-recommendations':
        return <CapaRecommendationsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

export default App;
