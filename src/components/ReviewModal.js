import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { BASE_API_URL } from './config'

function ReviewModal({ isOpen, setIsOpen, taskId, token, onSuccess }) {
  const [formData, setFormData] = useState({
    fssaiImage: null,
    menuImage: null,
    bannerImage: null,
    fssaiFileName: null,
    menuFileName: null,
    bannerFileName: null,
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const currentUploadType = useRef(null); // ✅ Use ref instead of state

  useEffect(() => {
    if (isOpen) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'djro3m8gt',
          uploadPreset: 'restaurant_preset',
          folder: 'restaurant_reviews',
          sources: ['local', 'camera'],
          multiple: false,
          clientAllowedFormats: ['jpg', 'png'],
          maxImageFileSize: 10000000,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary widget error:', error);
            toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
            return;
          }
          if (result && result.event === 'success') {
            const { secure_url, original_filename } = result.info;
            const uploadType = currentUploadType.current || 'unknown'; // ✅ Use ref
            const fileName = original_filename || secure_url.split('/').pop().split('.')[0] || 'Uploaded Image';
            setFormData(prev => ({
              ...prev,
              [uploadType]: secure_url,
              [`${uploadType}FileName`]: fileName,
            }));
            toast.success(`${uploadType.replace('Image', '')} image uploaded: ${fileName}`);
            currentUploadType.current = null; // ✅ Reset
          }
        }
      );

      setFormData({
        fssaiImage: null,
        menuImage: null,
        bannerImage: null,
        fssaiFileName: null,
        menuFileName: null,
        bannerFileName: null,
      });

      window.cloudinaryWidget = widget;
    }

    return () => {
      window.cloudinaryWidget = null;
    };
  }, [isOpen]);

  const handleImageSelect = (type) => {
    if (window.cloudinaryWidget) {
      currentUploadType.current = type; // ✅ Set type before opening widget
      window.cloudinaryWidget.open();
    } else {
      toast.error('Cloudinary widget not loaded');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fssaiImage || !formData.menuImage || !formData.bannerImage) {
      setError('All images are required');
      toast.error('All images are required');
      return;
    }

    const img = new Image();
    img.src = formData.bannerImage;
    img.onload = async () => {
      if (img.width !== 1280 || img.height !== 720) {
        setError('Banner image must be 1280x720');
        toast.error('Banner image must be 1280x720');
        return;
      }

      setUploading(true);
      try {
        const response = await fetch(`${BASE_API_URL}/user/tasks/review/${taskId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fssaiImage: formData.fssaiImage,
            menuImage: formData.menuImage,
            bannerImage: formData.bannerImage,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          onSuccess();
          setIsOpen(false);
          toast.success('Review submitted successfully');
          setFormData({
            fssaiImage: null,
            menuImage: null,
            bannerImage: null,
            fssaiFileName: null,
            menuFileName: null,
            bannerFileName: null,
          });
        } else {
          setError(data.error || 'Failed to submit review');
          toast.error(data.error || 'Failed to submit review');
        }
      } catch (err) {
        setError(`Server error: ${err.message}`);
        toast.error(`Server error: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };

    img.onerror = () => {
      setError('Invalid banner image');
      toast.error('Invalid banner image');
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Submit Review</h2>
              <FaTimes className="cursor-pointer text-gray-600" onClick={() => setIsOpen(false)} />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FSSAI Image */}
              <div>
                <label className="block text-gray-700">FSSAI Image</label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleImageSelect('fssaiImage')}
                  className="bg-gray-200 text-gray-800 p-2 rounded-lg w-full"
                >
                  <FaUpload className="inline mr-2" /> {formData.fssaiImage ? 'Image Selected' : 'Upload FSSAI Image'}
                </motion.button>
                {formData.fssaiFileName && <p className="text-sm text-gray-600 mt-1 truncate">Uploaded: {formData.fssaiFileName}</p>}
                {formData.fssaiImage && (
                  <div className="mt-2">
                    <img src={formData.fssaiImage} alt="FSSAI Preview" className="w-full h-20 object-cover rounded" />
                  </div>
                )}
              </div>

              {/* Menu Image */}
              <div>
                <label className="block text-gray-700">Menu Image</label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleImageSelect('menuImage')}
                  className="bg-gray-200 text-gray-800 p-2 rounded-lg w-full"
                >
                  <FaUpload className="inline mr-2" /> {formData.menuImage ? 'Image Selected' : 'Upload Menu Image'}
                </motion.button>
                {formData.menuFileName && <p className="text-sm text-gray-600 mt-1 truncate">Uploaded: {formData.menuFileName}</p>}
                {formData.menuImage && (
                  <div className="mt-2">
                    <image src={formData.menuImage} alt="Menu Preview" className="w-full h-20 object-cover rounded" />
                  </div>
                )}
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-gray-700">Banner Image (1280x720)</label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleImageSelect('bannerImage')}
                  className="bg-gray-200 text-gray-800 p-2 rounded-lg w-full"
                >
                  <FaUpload className="inline mr-2" /> {formData.bannerImage ? 'Image Selected' : 'Upload Banner Image'}
                </motion.button>
                {formData.bannerFileName && <p className="text-sm text-gray-600 mt-1 truncate">Uploaded: {formData.bannerFileName}</p>}
                {formData.bannerImage && (
                  <div className="mt-2">
                    <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-20 object-cover rounded" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={uploading || !formData.fssaiImage || !formData.menuImage || !formData.bannerImage}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
                  uploading || !formData.fssaiImage || !formData.menuImage || !formData.bannerImage
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Submit Review
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReviewModal;



