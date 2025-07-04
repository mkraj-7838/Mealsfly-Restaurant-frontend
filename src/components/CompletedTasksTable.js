import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import RestaurantDetailsModal from './RestaurantDetailsModal';
import { toast } from 'react-toastify';

function CompletedTasksTable({ token }) {
  const [tasks, setTasks] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/tasks/completed', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        toast.error('Error fetching tasks');
      }
    };
    fetchTasks();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-4">Completed Tasks</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/10 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-left">Restaurant</th>
              <th className="p-3 text-left">Review Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {tasks.map(task => (
              <motion.tr
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-white/5"
              >
                <td className="p-3 truncate">{task.restaurantId?.name || 'N/A'}</td>
                <td className="p-3">{task.reviewDate ? new Date(task.reviewDate).toLocaleDateString() : 'N/A'}</td>
                <td className="p-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedRestaurantId(task.restaurantId?._id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg"
                    title="View Details"
                  >
                    <FaEye />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <RestaurantDetailsModal
        isOpen={!!selectedRestaurantId}
        setIsOpen={() => setSelectedRestaurantId(null)}
        restaurantId={selectedRestaurantId}
        token={token}
      />
    </div>
  );
}

export default CompletedTasksTable;