import DocsLayout from '../../components/docs/DocsLayout';

const DocsAnalysis = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">System Analysis</h1>

        {/* Requirements Analysis */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Requirements Analysis</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A comprehensive requirements analysis was conducted to identify the needs of all stakeholders
            and define the system's functional and non-functional requirements.
          </p>
        </div>

        {/* Stakeholders */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Stakeholders</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">👨‍💼 Administrators</h3>
              <p className="text-sm text-gray-700">
                Nursery owners and managers who oversee operations, manage staff, and make strategic decisions
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">👩‍🏫 Staff Members</h3>
              <p className="text-sm text-gray-700">
                Teachers, assistants, nurses, and receptionists who interact with children and parents daily
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2">👨‍👩‍👧 Parents</h3>
              <p className="text-sm text-gray-700">
                Guardians who need to track their children's activities, attendance, and communicate with staff
              </p>
            </div>
          </div>
        </div>

        {/* Functional Requirements */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Functional Requirements</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. User Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>User registration and authentication</li>
                <li>Role-based access control (Admin, Staff, Parent)</li>
                <li>Position-based permissions for staff (Teacher, Assistant, Manager, Nurse, Receptionist)</li>
                <li>User profile management</li>
                <li>Password reset and account recovery</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Child Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Child enrollment and registration</li>
                <li>Child profile with personal information and medical details</li>
                <li>Parent-child relationship management</li>
                <li>Class and group assignment</li>
                <li>Enrollment request approval workflow</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Attendance Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Daily attendance marking</li>
                <li>Attendance history and reports</li>
                <li>Absence excuse submission and approval</li>
                <li>Late arrivals and early departures tracking</li>
                <li>Attendance statistics and analytics</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Daily Reports</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Daily activity reports creation</li>
                <li>Meal and nap time tracking</li>
                <li>Behavior and mood notes</li>
                <li>Photo attachments to reports</li>
                <li>Parent viewing of daily reports</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Payment Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Payment recording and tracking</li>
                <li>Payment history for parents</li>
                <li>Outstanding balance calculations</li>
                <li>Payment receipts and invoices</li>
                <li>Financial reporting for administrators</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Activity Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Activity creation and scheduling</li>
                <li>Calendar view of activities</li>
                <li>Activity assignment to classes/groups</li>
                <li>Activity status tracking</li>
                <li>Activity participation recording</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Communication</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Real-time messaging between users</li>
                <li>Notification system for important events</li>
                <li>Announcement broadcasting</li>
                <li>Chat conversations with message history</li>
                <li>Email-style messaging system</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Administrative Functions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Staff management and role assignment</li>
                <li>Class and group organization</li>
                <li>System audit logging</li>
                <li>Data export and reporting</li>
                <li>System configuration and settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Non-Functional Requirements */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Functional Requirements</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Page load time under 3 seconds</li>
                <li>• Support for 100+ concurrent users</li>
                <li>• Efficient database queries</li>
                <li>• Fast search and filtering</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Encrypted passwords with bcrypt</li>
                <li>• JWT-based authentication</li>
                <li>• Role-based access control</li>
                <li>• Input validation and sanitization</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Usability</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Intuitive user interface</li>
                <li>• Responsive design for all devices</li>
                <li>• Clear navigation and workflows</li>
                <li>• Helpful error messages</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Reliability</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 99% uptime availability</li>
                <li>• Data backup and recovery</li>
                <li>• Error handling and logging</li>
                <li>• Graceful degradation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Use Cases</h2>
          <p className="text-gray-700 mb-4">Main user interactions with the system:</p>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">UC-01: Parent enrolls a child</h3>
              <p className="text-xs text-gray-600">
                Parent submits enrollment request → Admin reviews → Admin approves → Child added to system
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">UC-02: Staff marks attendance</h3>
              <p className="text-xs text-gray-600">
                Teacher views class roster → Marks each child present/absent → Saves attendance → Notifications sent
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">UC-03: Teacher creates daily report</h3>
              <p className="text-xs text-gray-600">
                Teacher selects child → Fills report form → Adds notes/photos → Submits → Parent receives notification
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">UC-04: Admin schedules activity</h3>
              <p className="text-xs text-gray-600">
                Admin creates activity → Assigns to class → Sets date/time → Staff and parents notified
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">UC-05: Parent makes payment</h3>
              <p className="text-xs text-gray-600">
                Parent views balance → Makes payment → Receptionist records → Payment history updated
              </p>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsAnalysis;
