import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationToast from '../common/NotificationToast';

export const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
        <NotificationToast />
      </div>
    </div>
  );
};

export default Layout;
