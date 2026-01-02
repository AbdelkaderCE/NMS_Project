import DocsLayout from '../../components/docs/DocsLayout';

const DocsObjectives = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Project Objectives</h1>

        {/* Main Objective */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Main Objective</h2>
          <p className="text-gray-700 leading-relaxed">
            To develop a comprehensive, user-friendly web-based Nursery Management System that
            automates administrative tasks, improves communication between stakeholders, and
            enhances the overall operational efficiency of nursery facilities.
          </p>
        </div>

        {/* Specific Objectives */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specific Objectives</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Streamline Administrative Operations</h3>
              <p className="text-gray-700 mb-2">
                Reduce manual paperwork and automate routine administrative tasks including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Child enrollment and registration processes</li>
                <li>Staff onboarding and management</li>
                <li>Class and group organization</li>
                <li>Document management and storage</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Improve Attendance Tracking</h3>
              <p className="text-gray-700 mb-2">
                Implement a reliable system for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Daily attendance marking and recording</li>
                <li>Tracking absence patterns and trends</li>
                <li>Managing absence excuses and justifications</li>
                <li>Generating attendance reports for parents and administrators</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Enhance Parent Communication</h3>
              <p className="text-gray-700 mb-2">
                Facilitate effective communication through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Real-time notifications and updates</li>
                <li>Direct messaging between parents and staff</li>
                <li>Daily activity reports and child progress updates</li>
                <li>Event and activity announcements</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Financial Management</h3>
              <p className="text-gray-700 mb-2">
                Provide transparent financial tracking:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Payment recording and tracking</li>
                <li>Fee management and invoicing</li>
                <li>Payment history and receipts</li>
                <li>Financial reporting for administrators</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Activity Planning and Management</h3>
              <p className="text-gray-700 mb-2">
                Enable efficient activity coordination:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Activity scheduling and calendar management</li>
                <li>Resource allocation and planning</li>
                <li>Activity tracking and documentation</li>
                <li>Coordination between staff members</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Ensure Security and Compliance</h3>
              <p className="text-gray-700 mb-2">
                Implement robust security measures:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Role-based access control</li>
                <li>Data encryption and secure storage</li>
                <li>Audit logging for accountability</li>
                <li>Compliance with data protection regulations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Criteria */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Success Criteria</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The project will be considered successful if it achieves the following:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Functional Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ All core features implemented</li>
                <li>✓ User roles function correctly</li>
                <li>✓ Data persistence and integrity</li>
                <li>✓ Real-time updates working</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Non-Functional Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Responsive on all devices</li>
                <li>✓ Secure authentication system</li>
                <li>✓ Intuitive user interface</li>
                <li>✓ Good performance and load times</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">User Experience</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Easy navigation and workflow</li>
                <li>✓ Clear error messages</li>
                <li>✓ Consistent design system</li>
                <li>✓ Accessible to all users</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Complete technical documentation</li>
                <li>✓ User guides available</li>
                <li>✓ Code well-commented</li>
                <li>✓ Deployment instructions clear</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Expected Outcomes */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Expected Outcomes</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900">Improved Efficiency</h3>
                <p className="text-sm text-gray-700">Reduction in administrative workload by automating routine tasks</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <h3 className="font-semibold text-gray-900">Better Communication</h3>
                <p className="text-sm text-gray-700">Enhanced parent-staff interaction and information sharing</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900">Enhanced Security</h3>
                <p className="text-sm text-gray-700">Secure data storage and controlled access to sensitive information</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📈</span>
              <div>
                <h3 className="font-semibold text-gray-900">Better Insights</h3>
                <p className="text-sm text-gray-700">Actionable data and reports for informed decision-making</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">😊</span>
              <div>
                <h3 className="font-semibold text-gray-900">Increased Satisfaction</h3>
                <p className="text-sm text-gray-700">Higher satisfaction for parents, staff, and administrators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsObjectives;
