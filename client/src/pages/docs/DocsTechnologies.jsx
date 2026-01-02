import DocsLayout from '../../components/docs/DocsLayout';

const DocsTechnologies = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Technologies Used</h1>

        {/* Tech Stack Overview */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Nursery Management System is built using the MERN stack (MongoDB, Express, React, Node.js),
            a popular and powerful combination of technologies for building modern web applications.
          </p>
        </div>

        {/* Frontend Technologies */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frontend Technologies</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">React 19.2.0</h3>
              <p className="text-gray-700 mb-2">
                A JavaScript library for building user interfaces with component-based architecture.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Component reusability, virtual DOM for performance, large ecosystem
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">React Router 7.9.6</h3>
              <p className="text-gray-700 mb-2">
                Client-side routing library for navigation in single-page applications.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Declarative routing, nested routes support, browser history management
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tailwind CSS 3.4.18</h3>
              <p className="text-gray-700 mb-2">
                Utility-first CSS framework for rapidly building custom user interfaces.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Rapid development, consistent design, responsive utilities, small bundle size
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vite 7.2.4</h3>
              <p className="text-gray-700 mb-2">
                Next-generation frontend build tool providing fast development server and optimized builds.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Lightning-fast HMR, optimized builds, native ES modules support
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Frontend Libraries</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Axios:</strong> HTTP client for API requests</li>
                <li><strong>React Icons:</strong> Icon library with multiple icon sets</li>
                <li><strong>React Big Calendar:</strong> Calendar component for activity scheduling</li>
                <li><strong>Recharts:</strong> Charting library for data visualization</li>
                <li><strong>Socket.IO Client:</strong> Real-time bidirectional communication</li>
                <li><strong>date-fns:</strong> Modern date utility library</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backend Technologies */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Backend Technologies</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Node.js</h3>
              <p className="text-gray-700 mb-2">
                JavaScript runtime built on Chrome's V8 engine for server-side development.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Non-blocking I/O, JavaScript everywhere, large package ecosystem
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Express.js</h3>
              <p className="text-gray-700 mb-2">
                Fast, minimalist web framework for Node.js providing robust API development features.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Simple API, middleware support, routing capabilities, widely adopted
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MongoDB</h3>
              <p className="text-gray-700 mb-2">
                NoSQL document database for flexible, scalable data storage.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Schema flexibility, horizontal scaling, JSON-like documents
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mongoose</h3>
              <p className="text-gray-700 mb-2">
                MongoDB object modeling tool for Node.js with schema validation.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Why chosen:</strong> Schema validation, middleware support, query building, relationship modeling
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Backend Libraries</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>bcryptjs:</strong> Password hashing and encryption</li>
                <li><strong>jsonwebtoken:</strong> JWT token generation and verification</li>
                <li><strong>Socket.IO:</strong> Real-time communication server</li>
                <li><strong>cors:</strong> Cross-Origin Resource Sharing middleware</li>
                <li><strong>dotenv:</strong> Environment variable management</li>
                <li><strong>express-validator:</strong> Request validation middleware</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Development Tools</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-700">Type-safe JavaScript for better code quality and IDE support</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">ESLint</h3>
              <p className="text-sm text-gray-700">Code linting and quality enforcement</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Git</h3>
              <p className="text-sm text-gray-700">Version control system for code management</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Jest</h3>
              <p className="text-sm text-gray-700">Testing framework for backend unit tests</p>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Architecture</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Client-Server Architecture</h3>
              <p className="text-sm text-gray-700 mb-2">
                The application follows a three-tier architecture:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Presentation Layer:</strong> React frontend with Tailwind CSS</li>
                <li><strong>Application Layer:</strong> Express.js REST API with business logic</li>
                <li><strong>Data Layer:</strong> MongoDB database for persistent storage</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Communication Patterns</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>HTTP/REST:</strong> Traditional request-response for CRUD operations</li>
                <li><strong>WebSocket:</strong> Real-time bidirectional communication via Socket.IO</li>
                <li><strong>JWT:</strong> Stateless authentication with JSON Web Tokens</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsTechnologies;
