import { FiCheckCircle, FiUsers, FiCalendar, FiHeart } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 font-sans">
      {/* Navbar with Glass effect */}
      <nav className="backdrop-blur-md bg-white/30 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Little Stars</span>
            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-200 to-blue-200 text-blue-700 rounded-full text-xs font-semibold">Nursery</span>
          </div>
          <div>
            <a href="/login" className="text-blue-700 font-semibold hover:text-blue-600 transition">Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Welcome to <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Little Stars</span> Nursery
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
          A safe, nurturing, and fun environment for your child to learn, play, and grow in the heart of Algeria.
        </p>
        <a href="/register" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-blue-600 transition backdrop-blur-sm">Get Started</a>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/50 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-200 text-blue-600 mb-4">
              <FiCheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Licensed & Certified</h3>
            <p className="mt-2 text-gray-700">Fully licensed facility with certified staff</p>
          </div>
          <div className="backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/50 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-200 text-blue-600 mb-4">
              <FiUsers className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Small Class Sizes</h3>
            <p className="mt-2 text-gray-700">Personal attention for every child</p>
          </div>
          <div className="backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/50 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-200 text-blue-600 mb-4">
              <FiCalendar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Flexible Schedule</h3>
            <p className="mt-2 text-gray-700">Full-time and part-time options available</p>
          </div>
          <div className="backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/50 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-200 text-blue-600 mb-4">
              <FiHeart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Loving Environment</h3>
            <p className="mt-2 text-gray-700">Safe, nurturing, and fun atmosphere</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-20 backdrop-blur-md bg-gradient-to-r from-blue-300/40 to-blue-300/40 border border-white/60 rounded-3xl p-12 text-center mx-4 mb-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Join Our Family?
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Start your child's journey with us today. Application takes less than 5 minutes!
        </p>
        <a
          href="/apply"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:from-blue-700 hover:to-blue-600 transition inline-block"
        >
          Enroll Your Child Now
        </a>
      </section>

      {/* Testimonials & Ratings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What Algerian Parents Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:bg-white/50 transition">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Parent" className="w-20 h-20 rounded-2xl mb-4 border-4 border-blue-200" />
            <p className="text-lg text-gray-800 italic mb-4">"My daughter loves her teachers and friends here. The staff are caring and the environment is safe and joyful!"</p>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-xl">★</span>)}
            </div>
            <span className="font-semibold text-gray-900">Yacine B., Algiers</span>
          </div>
          {/* Testimonial 2 */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:bg-white/50 transition">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Parent" className="w-20 h-20 rounded-2xl mb-4 border-4 border-blue-200" />
            <p className="text-lg text-gray-800 italic mb-4">"L'école est très propre et l'équipe pédagogique est formidable. Je recommande à tous les parents à Alger."</p>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-xl">★</span>)}
            </div>
            <span className="font-semibold text-gray-900">Nadia K., Hydra</span>
          </div>
          {/* Testimonial 3 */}
          <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:bg-white/50 transition">
            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Parent" className="w-20 h-20 rounded-2xl mb-4 border-4 border-blue-200" />
            <p className="text-lg text-gray-800 italic mb-4">"أفضل حضانة في الجزائر العاصمة. طفلي سعيد جدًا ويتعلم أشياء جديدة كل يوم."</p>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-xl">★</span>)}
            </div>
            <span className="font-semibold text-gray-900">Mohamed L., Bir Mourad Raïs</span>
          </div>
        </div>

        {/* Ratings Summary */}
        <div className="mt-16 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Rated 4.9/5 by Algerian Families</h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-2xl">★</span>)}
            <span className="ml-2 text-lg text-gray-700">(128 reviews)</span>
          </div>
          <p className="text-gray-600">Trusted by families in Algiers, Oran, Constantine, and beyond.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-gradient-to-b from-blue-900/40 to-blue-900/40 border-t border-white/60 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-white/80">© 2025 Little Stars Nursery. All rights reserved.</p>
            <p className="text-white/80 mt-2">Contact: info@littlestars.com | +213 21 123 456</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
