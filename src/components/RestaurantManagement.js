import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaSearch, FaEye, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RestaurantDetailsModal from './RestaurantDetailsModal';

function RestaurantManagement({ token }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMapConfirmation, setShowMapConfirmation] = useState(false);
  const [selectedRestaurantLocation, setSelectedRestaurantLocation] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/restaurants', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        toast.error('Failed to load restaurants');
      }
    };
    fetchRestaurants();
  }, [token]);

  useEffect(() => {
    let filtered = restaurants;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(query) ||
        restaurant.address?.toLowerCase().includes(query) ||
        restaurant.phone?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.reviewStatus === statusFilter);
    }
    setFilteredRestaurants(filtered);
  }, [searchQuery, statusFilter, restaurants]);

  const handleMapIconClick = (restaurant) => {
    setSelectedRestaurantLocation(restaurant.location?.coordinates);
    setShowMapConfirmation(true);
  };

  const handleConfirmMapRedirect = () => {
    if (selectedRestaurantLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${selectedRestaurantLocation[1]},${selectedRestaurantLocation[0]}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
    setShowMapConfirmation(false);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Restaurant Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 pl-10 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none"
              >
                <option value="all" className="bg-gray-800">All Statuses</option>
                <option value="not_started" className="bg-gray-800">Not Started</option>
                <option value="pending" className="bg-gray-800">Pending</option>
                <option value="completed" className="bg-gray-800">Completed</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>
        </motion.div>

        {/* Restaurant List */}
        <div className="w-full overflow-hidden">
          <div className="grid gap-2">
            {filteredRestaurants.map(restaurant => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-white truncate">{restaurant.name}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        restaurant.reviewStatus === 'completed' ? 'bg-green-500' :
                        restaurant.reviewStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-white/70 text-xs capitalize">
                        {restaurant.reviewStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMapIconClick(restaurant)}
                      className="p-2 bg-blue-600 rounded-lg"
                      title="View on Map"
                    >
                      <FaMapMarkerAlt className="text-white text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedRestaurantId(restaurant._id)}
                      className="p-2 bg-amber-500 rounded-lg"
                      title="View Details"
                    >
                      <FaEye className="text-white text-sm" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-white/50"
          >
            No restaurants found
          </motion.div>
        )}
      </div>

      {/* Restaurant Details Modal */}
      <RestaurantDetailsModal
        isOpen={!!selectedRestaurantId}
        setIsOpen={() => setSelectedRestaurantId(null)}
        restaurantId={selectedRestaurantId}
        token={token}
        setRestaurants={setRestaurants}
      />

      {/* Map Confirmation Modal */}
      <AnimatePresence>
        {showMapConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg max-w-sm w-full border border-purple-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Confirm Navigation</h3>
              <p className="text-gray-300 mb-6">
                You are about to leave this site and open Google Maps. Do you want to continue?
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMapConfirmation(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmMapRedirect}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Maps
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RestaurantManagement;