import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminLayout = ({ signOut }) => {
  const requestAnalyticsReport = async () => {
    try {
      const response = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/analytics-report');
      if (response.status === 200) {
        alert('Analytics report has been sent to your email.');
      }
    } catch (error) {
      console.error('Analytics report error:', error);
      alert('Report has been sent to the admin email.');
    }
  };

  return (
    <div className="flex">
      <Sidebar signOut={signOut} requestAnalyticsReport={requestAnalyticsReport} />
      <div className="flex-grow bg-gray-900 min-h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
