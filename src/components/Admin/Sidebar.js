import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUpload, FaEdit, FaSignOutAlt, FaUser, FaMusic, FaRecordVinyl, FaFileAlt } from 'react-icons/fa';

const Sidebar = ({ signOut }) => {
  return (
    <div className="w-64 bg-cyan-600 text-white h-screen sticky top-0 flex flex-col rounded-r-lg shadow-lg">
      <div className="p-6 flex flex-col items-center">
        {/* Admin Avatar */}
        <img
          src="https://cdn3d.iconscout.com/3d/premium/thumb/administrator-3d-icon-download-in-png-blend-fbx-gltf-file-formats--male-management-employee-supervisor-administration-avatar-pack-people-icons-4741054.png"
          alt="Admin Avatar"
          className="w-24 h-24 rounded-full mb-4 border-4 border-white"
        />
        <h2 className="text-2xl font-bold text-center">Admin Dashboard</h2>
      </div>

      <nav className="flex-grow">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaTachometerAlt className="mr-2" />
          Dashboard
        </NavLink>

        {/* Album Management */}
        <NavLink
          to="/admin/albums/view"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaRecordVinyl className="mr-2" />
          View Albums
        </NavLink>
        <NavLink
          to="/admin/albums/upload"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaUpload className="mr-2" />
          Upload Album
        </NavLink>
        <NavLink
          to="/admin/albums/edit"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaEdit className="mr-2" />
          Edit Albums
        </NavLink>

        {/* Artist Management */}
        <NavLink
          to="/admin/artists/view"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaUser className="mr-2" />
          View Artists
        </NavLink>
        <NavLink
          to="/admin/artists/upload"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaUpload className="mr-2" />
          Upload Artist
        </NavLink>
        <NavLink
          to="/admin/artists/edit"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaEdit className="mr-2" />
          Edit Artists
        </NavLink>

        {/* Genre Management */}
        <NavLink
          to="/admin/genres/view"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaMusic className="mr-2" />
          View Genres
        </NavLink>
        <NavLink
          to="/admin/genres/upload"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaUpload className="mr-2" />
          Upload Genre
        </NavLink>
        <NavLink
          to="/admin/genres/edit"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaEdit className="mr-2" />
          Edit Genres
        </NavLink>

        {/* Inventory Reports */}
        <NavLink
          to="/admin/inventory"
          className={({ isActive }) => 'flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg ' + (isActive ? 'bg-cyan-500' : '')}
        >
          <FaFileAlt className="mr-2" />
          Inventory Reports
        </NavLink>
      </nav>

      <div className="p-4">
        <button
          onClick={signOut}
          className="w-full py-3 px-4 bg-red-500 rounded-lg hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <FaSignOutAlt className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
