import DocsLayout from '../../components/docs/DocsLayout';

const DocsDesign = ({ onSearchClick }) => {
  return (
    <DocsLayout onSearchClick={onSearchClick}>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">System Design</h1>

        {/* Architecture Overview */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Architecture</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The NMS follows a three-tier client-server architecture pattern with clear separation
            of concerns between presentation, business logic, and data layers.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700 text-center font-mono">
              React Frontend ↔ Express API ↔ MongoDB Database
            </p>
          </div>
        </div>

        {/* Database Design */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Database Design</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            MongoDB document-based schema design with the following main collections:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Users Collection</h3>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'staff', 'parent'],
  phone: String,
  address: String,
  staffInfo: {
    position: Enum ['teacher', 'assistant', 'manager', 'nurse', 'receptionist'],
    hireDate: Date,
    salary: Number
  },
  parentInfo: {
    occupation: String,
    emergencyContact: String
  },
  createdAt: Date,
  updatedAt: Date
}`}</pre>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Children Collection</h3>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`{
  _id: ObjectId,
  name: String,
  dateOfBirth: Date,
  gender: Enum ['male', 'female'],
  parent: ObjectId (ref: Users),
  class: ObjectId (ref: Classes),
  group: ObjectId (ref: Groups),
  medicalInfo: {
    allergies: [String],
    medications: [String],
    specialNeeds: String
  },
  enrollmentDate: Date,
  status: Enum ['active', 'inactive'],
  createdAt: Date,
  updatedAt: Date
}`}</pre>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Collection</h3>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`{
  _id: ObjectId,
  child: ObjectId (ref: Children),
  date: Date,
  status: Enum ['present', 'absent', 'late', 'excused'],
  checkInTime: Date,
  checkOutTime: Date,
  markedBy: ObjectId (ref: Users),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}`}</pre>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Other Collections</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Classes:</strong> Class definitions with teacher assignments</li>
                <li><strong>Groups:</strong> Group definitions within classes</li>
                <li><strong>Payments:</strong> Payment transactions and history</li>
                <li><strong>Activities:</strong> Scheduled activities and events</li>
                <li><strong>DailyReports:</strong> Daily child activity reports</li>
                <li><strong>Messages:</strong> User-to-user messages</li>
                <li><strong>Notifications:</strong> System notifications</li>
                <li><strong>AuditLogs:</strong> System action audit trail</li>
                <li><strong>AbsenceExcuses:</strong> Absence excuse submissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Design */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Design</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            RESTful API endpoints organized by resource with consistent response formats:
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Authentication Endpoints</h3>
              <div className="text-xs font-mono space-y-1">
                <div><span className="text-blue-600">POST</span> /api/auth/register</div>
                <div><span className="text-blue-600">POST</span> /api/auth/login</div>
                <div><span className="text-green-600">GET</span> /api/auth/me</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Resource Endpoints (Pattern)</h3>
              <div className="text-xs font-mono space-y-1">
                <div><span className="text-green-600">GET</span> /api/[resource] - List all</div>
                <div><span className="text-green-600">GET</span> /api/[resource]/:id - Get one</div>
                <div><span className="text-blue-600">POST</span> /api/[resource] - Create new</div>
                <div><span className="text-yellow-600">PUT</span> /api/[resource]/:id - Update</div>
                <div><span className="text-red-600">DELETE</span> /api/[resource]/:id - Delete</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Example Resources</h3>
              <div className="text-xs text-gray-700 space-y-1">
                <div>• /api/children - Child management</div>
                <div>• /api/attendance - Attendance records</div>
                <div>• /api/payments - Payment transactions</div>
                <div>• /api/activities - Activity scheduling</div>
                <div>• /api/daily-reports - Daily reports</div>
                <div>• /api/messages - Messaging system</div>
              </div>
            </div>
          </div>
        </div>

        {/* UI/UX Design */}
        <div className="card mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">UI/UX Design</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design System</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Color Scheme:</strong> Blue-based glassmorphism theme with gradient backgrounds</li>
                <li><strong>Typography:</strong> Inter font family for clean, modern look</li>
                <li><strong>Components:</strong> Reusable component library (buttons, cards, inputs, modals)</li>
                <li><strong>Layout:</strong> Responsive grid system with mobile-first approach</li>
                <li><strong>Icons:</strong> React Icons (Feather Icons) for consistency</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Structure</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Sidebar:</strong> Main navigation menu with role-based filtering</li>
                <li><strong>Navbar:</strong> Search, notifications, and user profile</li>
                <li><strong>Breadcrumbs:</strong> Context-aware navigation trail (where applicable)</li>
                <li><strong>Mobile Menu:</strong> Collapsible sidebar for small screens</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key UI Patterns</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>List Views:</strong> Tabular data with search, filter, and pagination</li>
                <li><strong>Forms:</strong> Multi-step forms with validation and error handling</li>
                <li><strong>Modals:</strong> Context-focused actions without page navigation</li>
                <li><strong>Cards:</strong> Glassmorphism cards for information display</li>
                <li><strong>Notifications:</strong> Toast notifications and notification center</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Design */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Design</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• JWT token-based auth</li>
                <li>• Password hashing with bcrypt</li>
                <li>• Secure token storage</li>
                <li>• Token expiration handling</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-2">Authorization</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Role-based access control</li>
                <li>• Position-based permissions</li>
                <li>• Protected routes and endpoints</li>
                <li>• Resource ownership checks</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Input validation and sanitization</li>
                <li>• SQL injection prevention</li>
                <li>• XSS protection</li>
                <li>• CORS configuration</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-2">Audit & Compliance</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Action logging system</li>
                <li>• User activity tracking</li>
                <li>• Change history records</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
};

export default DocsDesign;
