import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUpload, FaEdit, FaSignOutAlt, FaUser, FaChartBar, FaPlusCircle } from 'react-icons/fa';

const Sidebar = ({ signOut, requestAnalyticsReport }) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      </div>
      <nav className="flex-grow">
        {/* Dashboard Link */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaTachometerAlt className="mr-2" />
          Dashboard
        </NavLink>

        {/* Upload Album */}
        <NavLink
          to="/admin/upload"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaUpload className="mr-2" />
          Upload Album
        </NavLink>

        {/* Edit Albums */}
        <NavLink
          to="/admin/edit"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaEdit className="mr-2" />
          Edit Albums
        </NavLink>

        {/* Manage Artists */}
        <NavLink
          to="/admin/artists/view"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaUser className="mr-2" />
          View Artists
        </NavLink>

        <NavLink
          to="/admin/artists/upload"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaPlusCircle className="mr-2" />
          Upload Artist
        </NavLink>

        <NavLink
          to="/admin/artists/edit"
          className={({ isActive }) => 'flex items-center py-2 px-4 hover:bg-gray-700 ' + (isActive ? 'bg-gray-700' : '')}
        >
          <FaEdit className="mr-2" />
          Edit Artists
        </NavLink>
      </nav>

      <div className="p-4">
        {/* Analytics Button */}
        <button
          onClick={requestAnalyticsReport}
          className="w-full py-2 px-4 bg-blue-500 rounded hover:bg-blue-600 mb-2 flex items-center justify-center"
        >
          <FaChartBar className="mr-2" />
          Get Analytics Report
        </button>

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="w-full py-2 px-4 bg-red-500 rounded hover:bg-red-600 flex items-center justify-center"
        >
          <FaSignOutAlt className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
