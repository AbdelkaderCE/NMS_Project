import DocsLayout from '../../components/docs/DocsLayout';

const DocsOverview = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nursery Management System
          </h1>
          <p className="text-xl text-gray-600">
            Complete Documentation for NMS Project
          </p>
        </div>

        {/* Introduction Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This documentation provides a comprehensive overview of the Nursery Management System (NMS),
            a web-based application designed to streamline the management of nursery operations, including
            child enrollment, attendance tracking, staff management, payments, and parent communication.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The system is built as a university project to demonstrate modern web development practices
            and software engineering principles.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Documentation Sections</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">📖 Introduction</h3>
              <p className="text-sm text-gray-600">Project background, context, and problem statement</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Objectives</h3>
              <p className="text-sm text-gray-600">Goals and expected outcomes of the project</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">💻 Technologies</h3>
              <p className="text-sm text-gray-600">Technical stack and tools used in development</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Analysis</h3>
              <p className="text-sm text-gray-600">Requirements analysis and system specifications</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🎨 Design</h3>
              <p className="text-sm text-gray-600">Architecture, database, and UI/UX design</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Implementation</h3>
              <p className="text-sm text-gray-600">Development process and code organization</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">✅ Testing</h3>
              <p className="text-sm text-gray-600">Test strategies and quality assurance</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🏆 Conclusion</h3>
              <p className="text-sm text-gray-600">Results, achievements, and future work</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Project Type:</span>
              <span className="text-gray-600">University Academic Project</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Domain:</span>
              <span className="text-gray-600">Education Management System</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium text-gray-700">Target Users:</span>
              <span className="text-gray-600">Nursery Administrators, Staff, Parents</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Development Approach:</span>
              <span className="text-gray-600">Agile/Iterative</span>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsOverview;
