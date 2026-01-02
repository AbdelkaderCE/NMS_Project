import DocsLayout from '../../components/docs/DocsLayout';

const DocsIntroduction = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Introduction</h1>

        {/* Context */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Context</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Modern nurseries and early childhood education centers face numerous challenges in managing
            their daily operations efficiently. Traditional paper-based systems or disparate digital
            tools often lead to communication gaps, administrative overhead, and difficulties in
            tracking child development and attendance.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The Nursery Management System (NMS) addresses these challenges by providing a centralized,
            integrated platform that streamlines all aspects of nursery management, from enrollment
            to daily reporting and parent communication.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Many nurseries struggle with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Inefficient manual record-keeping and data management</li>
            <li>Lack of real-time communication between staff and parents</li>
            <li>Difficulty tracking attendance, payments, and child activities</li>
            <li>Time-consuming administrative tasks that could be automated</li>
            <li>Limited visibility into operational metrics and performance</li>
            <li>Compliance challenges with regulatory requirements</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            These challenges result in increased workload for staff, reduced parent satisfaction,
            and potential compliance issues.
          </p>
        </div>

        {/* Proposed Solution */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Proposed Solution</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The NMS provides a comprehensive web-based solution that:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">For Administrators</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Complete oversight of operations</li>
                <li>• Staff and resource management</li>
                <li>• Financial tracking and reporting</li>
                <li>• System configuration and security</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">For Staff</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Easy attendance marking</li>
                <li>• Daily activity reporting</li>
                <li>• Parent communication tools</li>
                <li>• Activity planning and scheduling</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">For Parents</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Real-time child activity updates</li>
                <li>• Attendance and payment tracking</li>
                <li>• Direct messaging with staff</li>
                <li>• Online enrollment and forms</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">System Features</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Real-time notifications</li>
                <li>• Role-based access control</li>
                <li>• Audit logging and compliance</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Scope</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">In Scope</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>User authentication and authorization</li>
                <li>Child enrollment and profile management</li>
                <li>Staff management with position-based permissions</li>
                <li>Attendance tracking and daily reports</li>
                <li>Payment processing and tracking</li>
                <li>Activity planning and calendar</li>
                <li>Real-time messaging and notifications</li>
                <li>Audit logging for compliance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Out of Scope</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Payment gateway integration (simulated only)</li>
                <li>Mobile native applications</li>
                <li>Advanced analytics and reporting dashboards</li>
                <li>Multi-language support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsIntroduction;
