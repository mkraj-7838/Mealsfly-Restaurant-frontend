import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaUserShield, FaUtensils, FaEye, FaEyeSlash, } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignupModal from "./SignupModal";
import { BASE_API_URL } from './config' // Adjust the import based on your project structure

function AuthPage({ setUser }) {
  const [isUserLogin, setIsUserLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // Generate background particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: formData.username,
          password: formData.password,
          role: isUserLogin ? 'user' : 'admin' 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setUser({ token: data.token, role: data.role });
        toast.success(`Welcome back, ${data.role}!`);
      } else {
        setError(data.error || 'Login failed. Please try again.');
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful! You can now login.');
        setIsSignupOpen(false);
        setFormData(prev => ({ ...prev, name: ''}));
      } else {
        setError(data.error || 'Registration failed. Please try again.');
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: `${particle.x}%`, 
              y: `${particle.y}%`,
              opacity: 0 
            }}
            animate={{
              y: [`${particle.y}%`, `${particle.y - 100}%`],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear"
            }}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-2xl"
            >
              <FaUtensils className="text-white text-3xl" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight"
            >
              Meals<span className="text-amber-400">Fly</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-white/80 mb-1 max-w-lg mx-auto lg:mx-0"
            >
              Review restaurants and guide others to the best bites in town.
            </motion.p>
          </motion.div>

          {/* Right side - Auth form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Role Toggle */}
              <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    isUserLogin 
                      ? 'bg-white text-gray-800 shadow-lg' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <FaUser className="inline mr-2" />
                  Reviewer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    !isUserLogin 
                      ? 'bg-white text-gray-800 shadow-lg' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <FaUserShield className="inline mr-2" />
                  Admin
                </motion.button>
              </div>

              <motion.h2
                key={isUserLogin ? 'user' : 'admin'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-white text-center mb-6"
              >
                {isUserLogin ? 'Welcome Back, Restaurant Explorer!' : 'Restaurant Dashboard Access'}
              </motion.h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 text-center backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <motion.input
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div className="relative">
                  <motion.input
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <>
                      {isUserLogin ? <FaUser className="inline mr-2" /> : <FaUserShield className="inline mr-2" />}
                      Sign In
                    </>
                  )}
                </motion.button>
              </form>

              {isUserLogin && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSignupOpen(true)}
                  className="w-full mt-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  <FaUser className="inline mr-2" />
                  New to Mealsfly? Join Now
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <SignupModal isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
    </div>
  );
}

export default AuthPage;


