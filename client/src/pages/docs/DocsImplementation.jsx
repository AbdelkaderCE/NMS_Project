import DocsLayout from '../../components/docs/DocsLayout';

const DocsImplementation = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Implementation</h1>

        {/* Development Process */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Development Process</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The project was developed using an iterative approach with continuous integration
            and regular testing. Development was divided into clear phases with specific
            deliverables for each iteration.
          </p>
        </div>

        {/* Project Structure */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Structure</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend Structure</h3>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Common components (Button, Card, etc.)
│   │   ├── layout/      # Layout components (Sidebar, Navbar)
│   │   └── docs/        # Documentation components
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── children/    # Child management pages
│   │   ├── attendance/  # Attendance pages
│   │   ├── docs/        # Documentation pages
│   │   └── ...
│   ├── context/         # React Context providers
│   ├── api/             # API service layer
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main app component
├── public/              # Static assets
└── package.json         # Dependencies`}</pre>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend Structure</h3>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`server/
├── src/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── tests/               # Test files
└── server.js            # Entry point`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Implementation */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features Implementation</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Authentication System</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>JWT token generation and validation middleware</li>
                <li>Password hashing with bcrypt (10 salt rounds)</li>
                <li>Protected routes using PrivateRoute component</li>
                <li>AuthContext for global authentication state</li>
                <li>Automatic token refresh on expiration</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Real-time Communication</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Socket.IO integration for bidirectional communication</li>
                <li>Real-time notifications on user actions</li>
                <li>Live chat messaging with read receipts</li>
                <li>SocketContext for managing WebSocket connections</li>
                <li>Event-based notification broadcasting</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Role-Based Access Control</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Three user roles: Admin, Staff, Parent</li>
                <li>Position-based permissions for staff members</li>
                <li>Route-level access control with PrivateRoute wrapper</li>
                <li>API endpoint authorization middleware</li>
                <li>Dynamic sidebar menu based on user permissions</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Search Functionality</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Universal search modal (Ctrl+K / Cmd+K)</li>
                <li>Search across multiple resources (children, staff, parents)</li>
                <li>Real-time search results with debouncing</li>
                <li>Keyboard navigation support</li>
                <li>Quick access to frequently used items</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Responsive Design</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Mobile-first Tailwind CSS approach</li>
                <li>Collapsible sidebar for mobile devices</li>
                <li>Responsive tables with horizontal scroll</li>
                <li>Touch-friendly interface elements</li>
                <li>Adaptive layouts for different screen sizes</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Data Validation</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Frontend form validation with real-time feedback</li>
                <li>Backend validation using express-validator</li>
                <li>Mongoose schema validation</li>
                <li>Custom validation rules for business logic</li>
                <li>Detailed error messages for users</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Quality Practices */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Code Quality Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Code Organization</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Component-based architecture</li>
                <li>• Separation of concerns</li>
                <li>• Modular code structure</li>
                <li>• Clear file naming conventions</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• DRY principle (Don't Repeat Yourself)</li>
                <li>• Error handling and logging</li>
                <li>• Code comments for complex logic</li>
                <li>• Consistent code formatting</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Version Control</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Git for source control</li>
                <li>• Meaningful commit messages</li>
                <li>• Feature branch workflow</li>
                <li>• Regular commits and pushes</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Code Review</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• ESLint for code linting</li>
                <li>• TypeScript for type safety</li>
                <li>• Regular code reviews</li>
                <li>• Refactoring when needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Challenges */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Development Challenges & Solutions</h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Challenge: Real-time notification delivery
              </h3>
              <p className="text-xs text-gray-700 mb-1">
                <strong>Problem:</strong> Ensuring notifications reach users instantly without page refresh
              </p>
              <p className="text-xs text-gray-700">
                <strong>Solution:</strong> Implemented Socket.IO for real-time bidirectional communication,
                with fallback to polling for connection issues
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Challenge: Complex role-based permissions
              </h3>
              <p className="text-xs text-gray-700 mb-1">
                <strong>Problem:</strong> Different staff positions need different access levels
              </p>
              <p className="text-xs text-gray-700">
                <strong>Solution:</strong> Created flexible middleware that checks both role and position,
                with granular permission checks on both frontend and backend
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Challenge: Responsive data tables
              </h3>
              <p className="text-xs text-gray-700 mb-1">
                <strong>Problem:</strong> Tables with many columns difficult to view on mobile
              </p>
              <p className="text-xs text-gray-700">
                <strong>Solution:</strong> Implemented horizontal scroll for tables on mobile with
                sticky columns for key information
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Challenge: State management complexity
              </h3>
              <p className="text-xs text-gray-700 mb-1">
                <strong>Problem:</strong> Managing global state across components
              </p>
              <p className="text-xs text-gray-700">
                <strong>Solution:</strong> Used React Context API for authentication and socket state,
                avoiding unnecessary complexity of Redux
              </p>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsImplementation;
