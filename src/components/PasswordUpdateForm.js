import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { BASE_API_URL } from './config'

function PasswordUpdateForm({ token }) {
  const [formData, setFormData] = useState({ 
    oldPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/auth/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password updated successfully');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-xl p-6 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-white mb-4">Update Password</h2>
        
        {message && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4"
          >
            {message}
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Old Password"
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <FaLock /> Update Password
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default PasswordUpdateForm;


