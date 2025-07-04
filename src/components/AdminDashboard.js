import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUtensils, FaUserCircle, FaSignOutAlt, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import RestaurantManagement from './RestaurantManagement';
import ProfileModal from './ProfileModal';
import PasswordUpdateForm from './PasswordUpdateForm';


function AdminDashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="w-full p-4 flex justify-between items-center"
      >
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsProfileModalOpen(true)}
            className="text-white"
            title="Profile"
          >
            <FaUserCircle className="text-xl" />
          </motion.button>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="w-full px-4">
        <div className="flex space-x-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <FaUsers className="inline mr-1" /> Users
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm ${
              activeTab === 'restaurants'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <FaUtensils className="inline mr-1" /> Restaurants
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {activeTab === 'users' && <UserManagement token={user.token} />}
        {activeTab === 'restaurants' && <RestaurantManagement token={user.token} />}
        {activeTab === 'password' && <PasswordUpdateForm token={user.token} />}
      </motion.div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        setIsOpen={setIsProfileModalOpen}
        username={user.username}
        handleLogout={handleLogout}
        navigate={navigate}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default AdminDashboard;


