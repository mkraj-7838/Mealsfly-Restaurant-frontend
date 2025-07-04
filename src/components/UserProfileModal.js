import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';

function UserProfileModal({ isOpen, setIsOpen, username, name, handleLogout, navigate }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6 rounded-lg w-full max-w-xs border border-purple-500 shadow-2xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-purple-400">Profile</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-purple-400 transition-colors"
                aria-label="Close profile modal"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">Name</h3>
                <p className="text-purple-200 text-sm sm:text-base mt-1">{name || 'User'}</p>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">Username</h3>
                <p className="text-purple-200 text-sm sm:text-base mt-1">{username || 'User'}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleLogout();
                  navigate('/');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 w-full transition-all duration-300 mt-6"
              >
                <FaSignOutAlt className="text-sm" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UserProfileModal;