import DocsLayout from '../../components/docs/DocsLayout';

const DocsTesting = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Testing</h1>

        {/* Testing Strategy */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Testing Strategy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A comprehensive testing approach was employed to ensure system reliability, security,
            and proper functionality across all features and user scenarios.
          </p>
        </div>

        {/* Testing Types */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Testing Types</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Unit Testing</h3>
              <p className="text-gray-700 text-sm mb-2">
                Testing individual components and functions in isolation.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Backend API endpoint tests using Jest</li>
                <li>Mongoose model validation tests</li>
                <li>Utility function tests</li>
                <li>Middleware function tests</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <strong>Coverage:</strong> Core business logic and utility functions tested
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Integration Testing</h3>
              <p className="text-gray-700 text-sm mb-2">
                Testing interactions between different components and systems.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>API endpoint integration with database</li>
                <li>Authentication flow testing</li>
                <li>Frontend-backend communication</li>
                <li>Socket.IO real-time features</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <strong>Coverage:</strong> API routes, database operations, real-time features
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Functional Testing</h3>
              <p className="text-gray-700 text-sm mb-2">
                Testing complete user workflows and feature functionality.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>User registration and login</li>
                <li>Child enrollment workflow</li>
                <li>Attendance marking process</li>
                <li>Payment recording and tracking</li>
                <li>Messaging and notification delivery</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <strong>Coverage:</strong> All major user workflows and features
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. User Acceptance Testing</h3>
              <p className="text-gray-700 text-sm mb-2">
                Testing with actual users to validate usability and requirements.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Admin user testing scenarios</li>
                <li>Staff member workflow testing</li>
                <li>Parent interface usability testing</li>
                <li>Feedback collection and implementation</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <strong>Coverage:</strong> Real-world usage scenarios by target users
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Security Testing</h3>
              <p className="text-gray-700 text-sm mb-2">
                Testing security measures and vulnerability protection.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Authentication and authorization tests</li>
                <li>SQL injection prevention tests</li>
                <li>XSS attack prevention tests</li>
                <li>CORS configuration validation</li>
                <li>Password hashing verification</li>
              </ul>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <strong>Coverage:</strong> Security vulnerabilities and access control
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sample Test Cases</h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">TC-01: User Login</h3>
              <div className="text-xs space-y-1">
                <p><strong>Description:</strong> Test user authentication with valid credentials</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Navigate to login page</li>
                  <li>Enter valid email and password</li>
                  <li>Click login button</li>
                </ol>
                <p><strong>Expected Result:</strong> User redirected to dashboard with valid JWT token</p>
                <p className="text-green-600"><strong>Status:</strong> ✓ PASS</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">TC-02: Attendance Marking</h3>
              <div className="text-xs space-y-1">
                <p><strong>Description:</strong> Test attendance marking by staff member</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Login as staff (teacher role)</li>
                  <li>Navigate to attendance page</li>
                  <li>Select child and mark present/absent</li>
                  <li>Save attendance</li>
                </ol>
                <p><strong>Expected Result:</strong> Attendance saved, notification sent to parent</p>
                <p className="text-green-600"><strong>Status:</strong> ✓ PASS</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">TC-03: Unauthorized Access</h3>
              <div className="text-xs space-y-1">
                <p><strong>Description:</strong> Test protection of admin-only routes</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Login as parent user</li>
                  <li>Attempt to access /staff route</li>
                </ol>
                <p><strong>Expected Result:</strong> Access denied, redirected to dashboard</p>
                <p className="text-green-600"><strong>Status:</strong> ✓ PASS</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">TC-04: Real-time Notification</h3>
              <div className="text-xs space-y-1">
                <p><strong>Description:</strong> Test real-time notification delivery</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Login as parent in one browser</li>
                  <li>Login as teacher in another browser</li>
                  <li>Teacher creates daily report for parent's child</li>
                </ol>
                <p><strong>Expected Result:</strong> Parent receives notification instantly</p>
                <p className="text-green-600"><strong>Status:</strong> ✓ PASS</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">TC-05: Responsive Design</h3>
              <div className="text-xs space-y-1">
                <p><strong>Description:</strong> Test application on mobile device</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Open app on mobile device (or browser dev tools)</li>
                  <li>Test navigation, forms, and data display</li>
                  <li>Verify touch interactions work properly</li>
                </ol>
                <p><strong>Expected Result:</strong> All features accessible and usable on mobile</p>
                <p className="text-green-600"><strong>Status:</strong> ✓ PASS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Results Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Backend Tests</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Tests:</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <span className="font-semibold text-green-600">45</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-semibold text-red-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-semibold">~75%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Manual Tests</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Scenarios:</span>
                  <span className="font-semibold">30+</span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <span className="font-semibold text-green-600">30+</span>
                </div>
                <div className="flex justify-between">
                  <span>Issues Found:</span>
                  <span className="font-semibold text-yellow-600">Minor UI issues (fixed)</span>
                </div>
                <div className="flex justify-between">
                  <span>User Satisfaction:</span>
                  <span className="font-semibold">High</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Quality Metrics</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ All critical features tested and working</li>
              <li>✓ Security vulnerabilities addressed</li>
              <li>✓ Cross-browser compatibility verified (Chrome, Firefox, Safari)</li>
              <li>✓ Responsive design tested on multiple devices</li>
              <li>✓ Performance acceptable (page loads &lt; 3s)</li>
            </ul>
          </div>
        </div>

        {/* Known Issues */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Known Issues & Limitations</h2>
          
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 text-sm">Minor Issue: Calendar event overlaps</h3>
              <p className="text-xs text-gray-700 mt-1">
                Multiple events at same time can overlap in calendar view on small screens.
                Workaround: Use list view for better visibility.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm">Limitation: File uploads</h3>
              <p className="text-xs text-gray-700 mt-1">
                Maximum file size for photo uploads limited to 5MB. Large images should be compressed
                before upload.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm">Future Enhancement: Offline mode</h3>
              <p className="text-xs text-gray-700 mt-1">
                Currently requires internet connection. Progressive Web App (PWA) features could be
                added for offline functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsTesting;
