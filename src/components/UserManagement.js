import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTrash, FaHistory, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import TaskHistoryModal from './TaskHistoryModal';
import ConfirmationModal from './ConfirmationModal';
import { BASE_API_URL } from './config'

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const userRoleData = data.filter(user => user.role === 'user');
        setUsers(userRoleData);
        setFilteredUsers(userRoleData);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        user =>
          user.name?.toLowerCase().includes(lowercasedQuery) ||
          user.username?.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, users]);

  const handleApprove = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/approve/${actionUserId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(users.map(user => (user._id === actionUserId ? { ...user, approved: true } : user)));
        setFilteredUsers(
          filteredUsers.map(user => (user._id === actionUserId ? { ...user, approved: true } : user))
        );
        toast.success('User approved successfully');
      } else {
        toast.error('Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      toast.error('Error approving user');
    }
    setIsApproveModalOpen(false);
    setActionUserId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${actionUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(users.filter(user => user._id !== actionUserId));
        setFilteredUsers(filteredUsers.filter(user => user._id !== actionUserId));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Error deleting user');
    }
    setIsDeleteModalOpen(false);
    setActionUserId(null);
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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">User Management</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          </div>
        </motion.div>

        {/* User List */}
        <div className="w-full overflow-hidden">
          <div className="grid gap-2">
            {filteredUsers.map(user => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${user.approved ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="text-white truncate">{user.name || user.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    {!user.approved && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setActionUserId(user._id);
                          setIsApproveModalOpen(true);
                        }}
                        className="p-2 bg-green-600 rounded-lg"
                        title="Approve"
                      >
                        <FaCheck className="text-white text-sm" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActionUserId(user._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 bg-red-600 rounded-lg"
                      title="Delete"
                    >
                      <FaTrash className="text-white text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedUserId(user._id)}
                      className="p-2 bg-amber-500 rounded-lg"
                      title="History"
                    >
                      <FaHistory className="text-white text-sm" />
                    </motion.button>
                  </div>
                </div>
                {user.tasksCompleted !== undefined && (
                  <p className="text-white/70 text-sm mt-1">
                    Tasks: {user.tasksCompleted}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-white/50"
          >
            No users found
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <TaskHistoryModal
        isOpen={!!selectedUserId}
        setIsOpen={() => setSelectedUserId(null)}
        userId={selectedUserId}
        token={token}
      />
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Confirm Approval"
        message="Are you sure you want to approve this user?"
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}

export default UserManagement;

