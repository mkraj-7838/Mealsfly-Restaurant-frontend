import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPen, FaMapMarkerAlt, FaEye, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import ReviewModal from "./ReviewModal";
import RestaurantDetailsModal from "./RestaurantDetailsModal";
import ConfirmationModal from "./ConfirmationModal";
import { BASE_API_URL } from './config'

function PendingTasksTable({ token }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  
  

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/user/tasks/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Error fetching tasks");
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleOpenReviewModal = (taskId) => {
    setSelectedTaskId(taskId);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    toast.success("Review submitted, refreshing tasks");
    setReviewModalOpen(false);
    setSelectedTaskId(null);
    fetchTasks();
  };

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredTasks(
      tasks.filter((task) =>
        task.restaurantId?.name?.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, tasks]);

  const handleMapRedirect = () => {
    window.open(mapUrl, "_blank", "noopener,noreferrer");
    setIsMapModalOpen(false);
    setMapUrl("");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-4">Pending Tasks</h2>
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
        <input
          type="text"
          placeholder="Search by restaurant name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/10 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-left">Restaurant</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTasks.map((task) => (
              <motion.tr
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-white/5"
              >
                <td className="p-3 truncate">
                  {task.restaurantId?.name || "N/A"}
                </td>
                <td className="p-3 flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (task.restaurantId?.location?.coordinates) {
                        setMapUrl(
                          `https://www.google.com/maps/dir/?api=1&destination=${task.restaurantId.location.coordinates[1]},${task.restaurantId.location.coordinates[0]}`
                        );
                        setIsMapModalOpen(true);
                      } else {
                        toast.error("Restaurant location not available");
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg"
                    title="View on Google Maps"
                  >
                    <FaMapMarkerAlt />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (task.restaurantId?._id) {
                        setSelectedRestaurantId(task.restaurantId._id);
                      } else {
                        toast.error("Invalid restaurant ID");
                      }
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg"
                    title="View Details"
                  >
                    <FaEye />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleOpenReviewModal(task._id)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-lg"
                    title="Submit Review"
                  >
                    <FaPen />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReviewModal
        isOpen={reviewModalOpen}
        setIsOpen={setReviewModalOpen}
        taskId={selectedTaskId}
        token={token}
        onSuccess={handleReviewSuccess}
      />
      <RestaurantDetailsModal
        isOpen={!!selectedRestaurantId}
        setIsOpen={() => setSelectedRestaurantId(null)}
        restaurantId={selectedRestaurantId}
        token={token}
      />
      <ConfirmationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleMapRedirect}
        title="Redirect to Google Maps"
        message="Are you sure you want to be redirected to Google Maps?"
      />
    </div>
  );
}

export default PendingTasksTable;


