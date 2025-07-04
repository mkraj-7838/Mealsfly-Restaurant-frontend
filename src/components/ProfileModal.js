import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSignOutAlt, FaLock } from 'react-icons/fa';

function ProfileModal({ isOpen, setIsOpen, username, handleLogout, navigate, setActiveTab }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-xl w-full max-w-xs shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Profile</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-white/80 text-sm">Username</h3>
                <p className="text-white text-lg font-medium">{username || 'Admin'}</p>
              </div>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveTab('password');
                    setIsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaLock /> Update Password
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleLogout();
                    navigate('/');
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt /> Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProfileModal;


