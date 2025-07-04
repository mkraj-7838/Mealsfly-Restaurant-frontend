import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';
import { BASE_API_URL } from './config'

function RestaurantDetailsModal({ isOpen, setIsOpen, restaurantId, token, setRestaurants }) {
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isOpen) return;

    if (!restaurantId || !token) {
      setRestaurant(null);
      setError('');
      setNewStatus('');
      return;
    }

    const fetchRestaurant = async () => {
      try {
        const endpoint = isAdmin
          ? `${BASE_API_URL}/admin/restaurants/${restaurantId}`
          : `${BASE_API_URL}/user/restaurants/${restaurantId}`;

        if (!isAdmin && endpoint.includes('/admin/')) return;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch restaurant');
        }

        const data = await response.json();
        setRestaurant(data);
        setNewStatus(data.reviewStatus || '');
        setError('');
      } catch (err) {
        setError(`Failed to load details: ${err.message}`);
        toast.error(`Failed to load details: ${err.message}`);
      }
    };

    fetchRestaurant();
  }, [isOpen, restaurantId, token, isAdmin]);

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRestaurants(prev =>
          prev.map(r => (r._id === restaurantId ? { ...r, reviewStatus: newStatus } : r))
        );
        setRestaurant(prev => ({ ...prev, reviewStatus: newStatus }));
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Server error');
    }

    setIsStatusModalOpen(false);
    setNewStatus(restaurant?.reviewStatus || '');
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
        toast.success('Restaurant deleted');
        setIsOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Delete failed');
      }
    } catch (err) {
      toast.error('Error deleting restaurant');
    }

    setIsDeleteModalOpen(false);
  };

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
              <h2 className="text-xl font-bold text-white">Restaurant Details</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {error ? (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              ) : restaurant ? (
                <div className="space-y-4">
                  <Detail label="Name" value={restaurant.name} />
                  <Detail label="Phone" value={restaurant.phone} />
                  <Detail label="Address" value={restaurant.address} />
                  <Detail
                    label="Location"
                    value={
                      restaurant.location?.coordinates ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline"
                        >
                          View on Map
                        </a>
                      ) : 'N/A'
                    }
                  />
                  <Detail 
                    label="Status" 
                    value={
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        restaurant.reviewStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                        restaurant.reviewStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {restaurant.reviewStatus?.replace('_', ' ') || 'N/A'}
                      </span>
                    } 
                  />
                  <Detail label="Reviewed By" value={restaurant.reviewedBy?.username || 'Not Reviewed'} />

                  {isAdmin && (
                    <div className="pt-4 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="">Select Status</option>
                          <option value="not_started">Not Started</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (newStatus && newStatus !== restaurant.reviewStatus) {
                              setIsStatusModalOpen(true);
                            } else {
                              toast.error(newStatus ? 'No status change detected' : 'Please select a status');
                            }
                          }}
                          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <FaEdit /> Update
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </div>
                  )}

                  <div className="pt-4">
                    <h3 className="font-semibold text-white mb-2">Images</h3>
                    <div className="space-y-2">
                      {restaurant.images?.fssai && <ImageLink label="FSSAI Image" url={restaurant.images.fssai} />}
                      {restaurant.images?.menu && <ImageLink label="Menu Image" url={restaurant.images.menu} />}
                      {restaurant.images?.banner && <ImageLink label="Banner Image" url={restaurant.images.banner} />}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/50">Loading details...</p>
              )}
            </div>
          </motion.div>

          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Confirm Deletion"
            message="Are you sure you want to delete this restaurant?"
          />
          <ConfirmationModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            onConfirm={handleStatusChange}
            title="Confirm Status Change"
            message={`Change restaurant status to "${newStatus.replace('_', ' ')}"?`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="font-medium text-white/80">{label}</p>
    <div className="text-white mt-1">{value || 'N/A'}</div>
  </div>
);

const ImageLink = ({ label, url }) => (
  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-lg">
    <span className="text-white/90 truncate">{label}</span>
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-amber-400 hover:text-amber-300 flex items-center gap-2"
    >
      <FaEye /> View
    </a>
  </div>
);

export default RestaurantDetailsModal;


