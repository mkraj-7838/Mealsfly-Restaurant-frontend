import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaMapMarkerAlt, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RestaurantDetailsModal from './RestaurantDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import { BASE_API_URL } from './config'

function RestaurantTable({ token }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [error, setError] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [actionRestaurantId, setActionRestaurantId] = useState(null);
  const [mapUrl, setMapUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('Failed to get location. Using default coordinates.');
          setLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      setError('Geolocation not supported. Using default coordinates.');
      setLocation({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  useEffect(() => {
    if (location) {
      const fetchRestaurants = async () => {
        try {
          const response = await fetch(
            `${BASE_API_URL}/user/restaurants?lat=${location.lat}&lng=${location.lng}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch restaurants');
          }
          const data = await response.json();
          setRestaurants(data);
          setFilteredRestaurants(data);
        } catch (err) {
          setError('Error fetching restaurants');
          toast.error('Error fetching restaurants');
        }
      };
      fetchRestaurants();
    }
  }, [location, token]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredRestaurants(
      restaurants.filter(
        restaurant =>
          restaurant.name?.toLowerCase().includes(lowercasedQuery) ||
          restaurant.phone?.toLowerCase().includes(lowercasedQuery) ||
          restaurant.address?.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, restaurants]);

  const handleAssign = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/user/tasks/assign/${actionRestaurantId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setRestaurants(restaurants.filter(restaurant => restaurant._id !== actionRestaurantId));
        setFilteredRestaurants(filteredRestaurants.filter(restaurant => restaurant._id !== actionRestaurantId));
        toast.success('Task assigned successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to assign task');
        toast.error(data.error || 'Failed to assign task');
      }
    } catch (err) {
      setError('Server error');
      toast.error('Server error');
    }
    setIsAssignModalOpen(false);
    setActionRestaurantId(null);
  };

  const handleMapRedirect = () => {
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
    setIsMapModalOpen(false);
    setMapUrl('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-4">Available Restaurants</h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
        <input
          type="text"
          placeholder="Search by name, phone, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/10 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRestaurants.map(restaurant => (
              <motion.tr
                key={restaurant._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-white/5"
              >
                <td className="p-3 truncate">{restaurant.name}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setMapUrl(`https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]}`);
                      setIsMapModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg"
                    title="View on Google Maps"
                  >
                    <FaMapMarkerAlt />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedRestaurantId(restaurant._id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg"
                    title="View Details"
                  >
                    <FaEye />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setActionRestaurantId(restaurant._id);
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-lg"
                    title="Assign Task"
                  >
                    <FaPlus />
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
      <ConfirmationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleMapRedirect}
        title="Redirect to Google Maps"
        message="Are you sure you want to be redirected to Google Maps?"
      />
      <ConfirmationModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleAssign}
        title="Confirm Task Assignment"
        message="Are you sure you want to assign this restaurant task?"
      />
    </div>
  );
}

export default RestaurantTable;


