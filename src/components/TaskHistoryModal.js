import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { BASE_API_URL } from './config'

function TaskHistoryModal({ isOpen, setIsOpen, userId, token }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (userId) {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`${BASE_API_URL}/admin/tasks/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setTasks(data);
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
      };
      fetchTasks();
    }
  }, [userId, token]);

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
            className="w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Task History</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No task history found
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium truncate">
                            {task.restaurantId?.name || 'Unnamed Restaurant'}
                          </h3>
                          <p className="text-white/70 text-sm mt-1">
                            {task.reviewDate ? new Date(task.reviewDate).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskHistoryModal;


