import React from 'react';
import { FaHome, FaMusic, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ setActiveSection }) => {
  return (
    <aside className="w-1/5 bg-black p-6 flex flex-col">
      {/* Logo */}
      <div className="text-3xl font-bold mb-6">
        <img
          src="https://github.com/krm-aadil/GIT-IMAGES/blob/main/Black%20and%20Turquoise%20Circle%20Music%20Logo.png?raw=true"
          alt="DreamStreamer Logo"
          className="w-16 h-16"
        />
      </div>
      <ul className="space-y-8">
        <li className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer" onClick={() => setActiveSection('home')}>
          <FaHome className="text-xl" />
          <span>Home</span>
        </li>
        <li className="flex items-center space-x-4 text-white cursor-pointer">
          <FaMusic className="text-xl" />
          <span onClick={() => setActiveSection('albums')}>View All Albums</span>
        </li>
        <li className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer">
          <FaMusic className="text-xl" />
          <span onClick={() => setActiveSection('artists')}>View All Artists</span>
        </li>
        <li className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer">
          <FaMusic className="text-xl" />
          <span onClick={() => setActiveSection('genres')}>View All Genres</span>
        </li>
        <li className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer">
          <FaSignOutAlt className="text-xl" />
          <span>Sign Out</span>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
