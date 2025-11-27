import { Child, Staff, User, Class, Group, Payment, Activity, Attendance } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ROLES } from '../utils/constants.js';

/**
 * Fuzzy match helper - simple substring scoring
 */
const fuzzyScore = (str, query) => {
  if (!str || !query) return 0;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  
  // Exact match gets highest score
  if (s === q) return 1000;
  
  // Starts with query gets high score
  if (s.startsWith(q)) return 500;
  
  // Contains query gets medium score
  if (s.includes(q)) return 100;
  
  // Check for partial matches (each word)
  const words = s.split(' ');
  for (const word of words) {
    if (word.startsWith(q)) return 200;
  }
  
  // Character-by-character fuzzy match
  let score = 0;
  let queryIndex = 0;
  for (let i = 0; i < s.length && queryIndex < q.length; i++) {
    if (s[i] === q[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }
  
  return queryIndex === q.length ? score : 0;
};

/**
 * @desc    Universal search across all entities
 * @route   GET /api/search?q=query&limit=10
 * @access  Private
 */
export const universalSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return sendSuccess(res, 200, 'Search query too short', { results: [] });
    }
    
    const query = q.trim();
    const maxPerCategory = parseInt(limit);
    const results = {
      pages: [],
      children: [],
      parents: [],
      staff: [],
      classes: [],
      groups: [],
      payments: [],
      activities: [],
      attendance: [],
    };

    // Role-based access control
    const isAdmin = req.user.role === ROLES.ADMIN;
    const isStaff = req.user.role === ROLES.STAFF;
    const isParent = req.user.role === ROLES.PARENT;

    // Search App Pages/Navigation
    const allPages = [
      { name: 'Dashboard', route: '/dashboard', roles: ['admin', 'staff', 'parent'], icon: 'home', keywords: ['home', 'overview', 'summary'] },
      { name: 'Children Management', route: '/children', roles: ['admin', 'staff', 'parent'], icon: 'users', keywords: ['kids', 'students', 'child'] },
      { name: 'Staff Management', route: '/staff', roles: ['admin'], icon: 'briefcase', keywords: ['employees', 'teachers', 'workers'] },
      { name: 'Parents', route: '/parents', roles: ['admin', 'staff'], icon: 'users', keywords: ['guardians', 'families'] },
      { name: 'Attendance', route: '/attendance', roles: ['admin', 'staff'], icon: 'calendar', keywords: ['check-in', 'check-out', 'presence'] },
      { name: 'Payments', route: '/payments', roles: ['admin', 'parent'], icon: 'dollar-sign', keywords: ['invoices', 'billing', 'fees', 'tuition'] },
      { name: 'Activities', route: '/activities', roles: ['admin', 'staff'], icon: 'activity', keywords: ['events', 'schedule', 'tasks'] },
      { name: 'Activity Calendar', route: '/activities/calendar', roles: ['admin', 'staff'], icon: 'calendar', keywords: ['events calendar', 'schedule view'] },
      { name: 'Classes', route: '/classes', roles: ['admin', 'staff'], icon: 'book', keywords: ['rooms', 'age groups'] },
      { name: 'Groups', route: '/groups', roles: ['admin', 'staff'], icon: 'grid', keywords: ['teams', 'cohorts'] },
      { name: 'Messages', route: '/messages', roles: ['admin', 'staff', 'parent'], icon: 'mail', keywords: ['inbox', 'communication', 'notifications'] },
      { name: 'Real-Time Chat', route: '/chat', roles: ['admin', 'staff', 'parent'], icon: 'message-circle', keywords: ['messaging', 'live chat', 'conversation'] },
      { name: 'Enrollment Requests', route: '/enrollment/requests', roles: ['admin', 'staff'], icon: 'user-plus', keywords: ['applications', 'new students', 'registrations'] },
      { name: 'Audit Logs', route: '/audit-logs', roles: ['admin'], icon: 'list', keywords: ['history', 'changes', 'activity log', 'tracking'] }
    ];

    // Filter pages by role and score them
    results.pages = allPages
      .filter(page => page.roles.includes(req.user.role))
      .map(page => {
        // Calculate score based on name and keywords
        let score = fuzzyScore(page.name, query);
        page.keywords.forEach(keyword => {
          const keywordScore = fuzzyScore(keyword, query);
          if (keywordScore > score) score = keywordScore;
        });
        
        return {
          _id: page.route,
          _score: score,
          type: 'page',
          label: page.name,
          subtitle: 'Navigate to page',
          route: page.route,
          icon: page.icon
        };
      })
      .filter(page => page._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, maxPerCategory);

    // Search Children
    if (isAdmin || isStaff || isParent) {
      let childQuery = {
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
      };
      
      // Parents can only see their children
      if (isParent) {
        childQuery['parents.parent'] = req.user.id;
      }
      
      const children = await Child.find(childQuery)
        .populate('assignedClass', 'name')
        .populate('assignedGroup', 'name')
        .limit(maxPerCategory * 2)
        .lean();
      
      results.children = children
        .map(child => ({
          ...child,
          _score: fuzzyScore(`${child.firstName} ${child.lastName}`, query),
          type: 'child',
          label: `${child.firstName} ${child.lastName}`,
          subtitle: child.assignedClass?.name || 'No class',
          route: `/children`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Parents (Admin/Staff only)
    if (isAdmin || isStaff) {
      const parents = await User.find({
        role: ROLES.PARENT,
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(maxPerCategory * 2)
        .lean();
      
      results.parents = parents
        .map(parent => ({
          ...parent,
          _score: fuzzyScore(`${parent.firstName} ${parent.lastName} ${parent.email}`, query),
          type: 'parent',
          label: `${parent.firstName} ${parent.lastName}`,
          subtitle: parent.email,
          route: `/parents`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Staff (Admin only)
    if (isAdmin) {
      const staff = await Staff.find({})
        .populate('user', 'firstName lastName email')
        .limit(maxPerCategory * 2)
        .lean();
      
      results.staff = staff
        .filter(s => {
          const searchStr = `${s.user?.firstName} ${s.user?.lastName} ${s.position}`;
          return fuzzyScore(searchStr, query) > 0;
        })
        .map(s => ({
          ...s,
          _score: fuzzyScore(`${s.user?.firstName} ${s.user?.lastName} ${s.position}`, query),
          type: 'staff',
          label: `${s.user?.firstName} ${s.user?.lastName}`,
          subtitle: s.position,
          route: `/staff`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Classes
    if (isAdmin || isStaff) {
      const classes = await Class.find({
        name: { $regex: query, $options: 'i' },
      })
        .limit(maxPerCategory * 2)
        .lean();
      
      results.classes = classes
        .map(cls => ({
          ...cls,
          _score: fuzzyScore(cls.name, query),
          type: 'class',
          label: cls.name,
          subtitle: `${cls.ageRange?.minMonths}-${cls.ageRange?.maxMonths} months`,
          route: `/classes`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Groups
    if (isAdmin || isStaff) {
      const groups = await Group.find({
        name: { $regex: query, $options: 'i' },
      })
        .populate('class', 'name')
        .limit(maxPerCategory * 2)
        .lean();
      
      results.groups = groups
        .map(group => ({
          ...group,
          _score: fuzzyScore(group.name, query),
          type: 'group',
          label: group.name,
          subtitle: group.class?.name || 'No class',
          route: `/groups`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Payments
    if (isAdmin || isParent) {
      let paymentQuery = {
        $or: [
          { invoiceNumber: { $regex: query, $options: 'i' } },
        ],
      };
      
      if (isParent) {
        paymentQuery.parent = req.user.id;
      }
      
      const payments = await Payment.find(paymentQuery)
        .populate('child', 'firstName lastName')
        .limit(maxPerCategory * 2)
        .lean();
      
      results.payments = payments
        .map(payment => ({
          ...payment,
          _score: fuzzyScore(payment.invoiceNumber, query),
          type: 'payment',
          label: payment.invoiceNumber,
          subtitle: `$${payment.finalAmount || payment.amount} - ${payment.status}`,
          route: `/payments`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Search Activities
    if (isAdmin || isStaff) {
      const activities = await Activity.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(maxPerCategory * 2)
        .lean();
      
      results.activities = activities
        .map(activity => ({
          ...activity,
          _score: fuzzyScore(`${activity.title} ${activity.type}`, query),
          type: 'activity',
          label: activity.title,
          subtitle: activity.type,
          route: `/activities`,
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, maxPerCategory);
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    sendSuccess(res, 200, 'Search completed', {
      query,
      totalResults,
      results,
    });
  } catch (error) {
    next(error);
  }
};
