import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import RestaurantTable from './RestaurantTable';
import PendingTasksTable from './PendingTasksTable';
import CompletedTasksTable from './CompletedTasksTable';
import { BASE_API_URL } from './config'

function UserDashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [approved, setApproved] = useState(null);
  const [error, setError] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const currentUser = await response.json();
        setUsername(currentUser.username || 'User');
        setName(currentUser.name || 'User');
        setApproved(currentUser.approved || false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please try again.');
        setApproved(false);
      }
    };
    fetchUser();
  }, [user.token]);

  if (approved === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-purple-400 mb-4">Loading...</h2>
        </motion.div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">Not Approved</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            Your account is not approved yet. Please contact an admin.
          </p>
          {error && <p className="text-red-400 text-sm sm:text-base mb-4">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleLogout();
              navigate('/');
            }}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mx-auto"
          >
            <FaUserCircle className="mr-2" /> Logout
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.header
        className="text-white p-4 flex justify-between items-center shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-lg sm:text-2xl font-bold">User Dashboard</h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsProfileModalOpen(true)}
          className="text-white hover:text-purple-200 transition-colors"
          title="Profile"
        >
          <FaUserCircle className="text-2xl sm:text-3xl" />
        </motion.button>
      </motion.header>

      <div className="container mx-auto p-4 sm:p-6">
        {error && (
          <p className="text-red-400 text-sm sm:text-base mb-4 text-center">{error}</p>
        )}
        
        <div className="mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full sm:w-1/3 p-2 border border-purple-500 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="restaurants" className="bg-gray-800">All Restaurants</option>
            <option value="pending" className="bg-gray-800">Pending Tasks</option>
            <option value="completed" className="bg-gray-800">Completed Tasks</option>
          </select>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'restaurants' && <RestaurantTable token={user.token} />}
          {activeTab === 'pending' && <PendingTasksTable token={user.token} />}
          {activeTab === 'completed' && <CompletedTasksTable token={user.token} />}
        </motion.div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 rounded-lg w-full max-w-xs border border-purple-500"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Profile</h2>
                <FaTimes 
                  className="cursor-pointer text-gray-300 hover:text-purple-400 transition-colors" 
                  onClick={() => setIsProfileModalOpen(false)} 
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-300">Name</h3>
                  <p className="text-white text-sm sm:text-base">{name || 'User'}</p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-300">Username</h3>
                  <p className="text-white text-sm sm:text-base">{username || 'User'}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleLogout();
                    navigate('/');
                    setIsProfileModalOpen(false);
                  }}
                  className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full transition-colors"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDashboard;


