import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiCalendar, FiHeart, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FiHeart className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Little Stars Nursery</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/apply')}
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                Apply Now
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Where Little Stars
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Shine Bright
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            A nurturing environment where your child can learn, grow, and thrive. 
            Join our loving community today!
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => navigate('/apply')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center"
            >
              Apply for Admission
              <FiArrowRight className="ml-2" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg border-2 border-gray-300"
            >
              Parent Login
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
              <FiCheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Licensed & Certified</h3>
            <p className="mt-2 text-gray-600">Fully licensed facility with certified educators</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-600 mb-4">
              <FiUsers className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Small Class Sizes</h3>
            <p className="mt-2 text-gray-600">Personal attention for every child</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <FiCalendar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Flexible Schedule</h3>
            <p className="mt-2 text-gray-600">Full-time and part-time options available</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <FiHeart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Loving Environment</h3>
            <p className="mt-2 text-gray-600">Safe, nurturing, and fun atmosphere</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Family?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start your child's journey with us today. Application takes less than 5 minutes!
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Apply Now - It's Free!
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">© 2025 Little Stars Nursery. All rights reserved.</p>
            <p className="text-gray-400 mt-2">Contact: info@littlestars.com | (555) 123-4567</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
