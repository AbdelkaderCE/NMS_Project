# Bulk Actions Implementation Guide

## ✅ Completed: Pagination Fixes

All list pages now request `limit: 100` to show more data:

### Frontend Pages Updated:
- ✅ **ChildrenList.jsx** - `childrenAPI.getAll({ limit: 100 })`
- ✅ **AttendanceList.jsx** - `params = { date, limit: 100 }`
- ✅ **StaffList.jsx** - `staffAPI.getAll({ limit: 100 })`
- ✅ **PaymentList.jsx** - `paymentAPI.getAll({ limit: 100 })` + children
- ✅ **ActivityList.jsx** - All APIs with `limit: 100`
- ✅ **ClassList.jsx** - `classAPI.getAll({ limit: 100 })`
- ✅ **GroupList.jsx** - All APIs with `limit: 100`
- ✅ **ParentList.jsx** - `userAPI.getByRole('parent', { limit: 100 })`
- ✅ **EnrollmentRequestList.jsx** - `params = { limit: 100, ... }`
- ✅ **MessageList.jsx** - `getInbox/getSent/getArchived({ limit: 100 })`

---

## 🎯 Next Steps: Bulk Actions Implementation

### Phase 1: Reusable Components (Created ✅)

#### 1. **Pagination Component** 
`client/src/components/common/Pagination.jsx`
- Previous/Next buttons
- Page numbers with ellipsis (1 ... 4 5 6 ... 10)
- "Showing X-Y of Z items"
- Mobile responsive

**Usage:**
```jsx
<Pagination
  currentPage={1}
  totalPages={10}
  totalItems={100}
  itemsPerPage={10}
  onPageChange={(page) => setCurrentPage(page)}
/>
```

#### 2. **BulkActionsToolbar Component**
`client/src/components/common/BulkActionsToolbar.jsx`
- Fixed bottom toolbar (appears when items selected)
- Selection count display
- Configurable action buttons
- Clear selection button

**Usage:**
```jsx
import BulkActionsToolbar, { commonBulkActions } from './BulkActionsToolbar';

<BulkActionsToolbar
  selectedCount={selectedItems.length}
  onClearSelection={() => setSelectedItems([])}
  actions={[
    commonBulkActions.delete(() => handleBulkDelete()),
    commonBulkActions.export(() => handleBulkExport()),
    {
      label: 'Assign Class',
      icon: FiFolder,
      variant: 'primary',
      onClick: () => setShowBulkAssignModal(true)
    }
  ]}
/>
```

---

### Phase 2: Frontend Integration (Per Page)

#### Step-by-Step for Each List Page:

**1. Add State Management:**
```jsx
const [selectedItems, setSelectedItems] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(20);
```

**2. Add Selection Handlers:**
```jsx
const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedItems(filteredItems.map(item => item._id));
  } else {
    setSelectedItems([]);
  }
};

const handleSelectOne = (id) => {
  if (selectedItems.includes(id)) {
    setSelectedItems(selectedItems.filter(itemId => itemId !== id));
  } else {
    setSelectedItems([...selectedItems, id]);
  }
};
```

**3. Add Bulk Action Handlers:**
```jsx
const handleBulkDelete = async () => {
  if (!window.confirm(`Delete ${selectedItems.length} items?`)) return;
  
  try {
    await childrenAPI.bulkDelete({ ids: selectedItems });
    showAlert('success', `${selectedItems.length} items deleted`);
    setSelectedItems([]);
    fetchChildren();
  } catch (error) {
    showAlert('error', 'Failed to delete items');
  }
};

const handleBulkExport = () => {
  const itemsToExport = children.filter(c => selectedItems.includes(c._id));
  const csv = convertToCSV(itemsToExport);
  downloadCSV(csv, 'children-export.csv');
};
```

**4. Update UI with Checkboxes:**

**For Card Layout:**
```jsx
<Card key={item._id} className="relative">
  {/* Checkbox overlay */}
  <div className="absolute top-4 left-4">
    <input
      type="checkbox"
      checked={selectedItems.includes(item._id)}
      onChange={() => handleSelectOne(item._id)}
      className="h-4 w-4 text-blue-600 rounded"
    />
  </div>
  
  {/* Rest of card content */}
</Card>
```

**For Table Layout:**
```jsx
<thead>
  <tr>
    <th className="px-4 py-2">
      <input
        type="checkbox"
        checked={selectedItems.length === filteredItems.length}
        onChange={handleSelectAll}
        className="h-4 w-4 text-blue-600 rounded"
      />
    </th>
    <th>Name</th>
    <th>Email</th>
    {/* ... */}
  </tr>
</thead>
<tbody>
  {filteredItems.map(item => (
    <tr key={item._id}>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={selectedItems.includes(item._id)}
          onChange={() => handleSelectOne(item._id)}
          className="h-4 w-4 text-blue-600 rounded"
        />
      </td>
      <td>{item.name}</td>
      {/* ... */}
    </tr>
  ))}
</tbody>
```

**5. Add BulkActionsToolbar:**
```jsx
<BulkActionsToolbar
  selectedCount={selectedItems.length}
  onClearSelection={() => setSelectedItems([])}
  actions={[
    commonBulkActions.delete(handleBulkDelete),
    commonBulkActions.export(handleBulkExport),
    // Custom actions...
  ]}
/>
```

**6. Add Pagination:**
```jsx
// Calculate pagination
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

// Render pagination
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredItems.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
```

---

### Phase 3: Backend Bulk Endpoints

#### Create Backend Endpoints for Each Resource:

**Example: Children Bulk Delete**

**Route:** `server/routes/children.js`
```javascript
router.post('/bulk-delete', auth, roleAuth(['admin', 'manager']), childrenController.bulkDelete);
```

**Controller:** `server/controllers/childrenController.js`
```javascript
export const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }
    
    // Validate all IDs
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    // Delete all children
    const result = await Child.deleteMany({ _id: { $in: validIds } });
    
    res.json({ 
      message: `${result.deletedCount} children deleted`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### Bulk Endpoints Needed:

**Children:**
- `POST /api/children/bulk-delete` - Delete multiple children
- `POST /api/children/bulk-assign-class` - Assign multiple to class
- `POST /api/children/bulk-export` - Export to CSV

**Staff:**
- `POST /api/staff/bulk-delete`
- `POST /api/staff/bulk-deactivate`
- `POST /api/staff/bulk-export`

**Payments:**
- `POST /api/payments/bulk-delete`
- `POST /api/payments/bulk-export`
- `POST /api/payments/bulk-mark-paid`

**Activities:**
- `POST /api/activities/bulk-delete`
- `POST /api/activities/bulk-cancel`
- `POST /api/activities/bulk-notify` - Send reminder to parents

**Messages:**
- `POST /api/messages/bulk-delete`
- `POST /api/messages/bulk-archive`
- `POST /api/messages/bulk-mark-read`

**Attendance:**
- `POST /api/attendance/bulk-export` - Export date range
- `POST /api/attendance/bulk-mark-present` - Mass attendance

---

### Phase 4: CSV Export Utility

**Create:** `client/src/utils/csvExport.js`

```javascript
/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data, columns = null) => {
  if (!data || data.length === 0) return '';
  
  // Auto-detect columns if not provided
  if (!columns) {
    columns = Object.keys(data[0]);
  }
  
  // CSV header
  const header = columns.join(',');
  
  // CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col];
      
      // Handle nested objects (e.g., assignedClass.name)
      if (col.includes('.')) {
        const parts = col.split('.');
        let val = item;
        for (const part of parts) {
          val = val?.[part];
        }
        return escapeCSVValue(val);
      }
      
      return escapeCSVValue(value);
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export children to CSV
 */
export const exportChildrenToCSV = (children) => {
  const columns = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'assignedClass.name',
    'assignedGroup.name',
    'allergies',
    'medicalInfo',
    'emergencyContact.name',
    'emergencyContact.phone'
  ];
  
  const csv = convertToCSV(children, columns);
  downloadCSV(csv, `children-export-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export staff to CSV
 */
export const exportStaffToCSV = (staff) => {
  const columns = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'position',
    'department',
    'hireDate',
    'isActive'
  ];
  
  const csv = convertToCSV(staff, columns);
  downloadCSV(csv, `staff-export-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export payments to CSV
 */
export const exportPaymentsToCSV = (payments) => {
  const data = payments.map(p => ({
    date: new Date(p.paymentDate).toLocaleDateString(),
    child: `${p.child?.firstName} ${p.child?.lastName}`,
    amount: p.amount,
    type: p.type,
    method: p.paymentMethod,
    status: p.status,
    transactionId: p.transactionId || 'N/A'
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
};
```

---

### Phase 5: Priority Implementation Order

**High Priority (Core Features):**
1. ✅ Pagination fixes (DONE)
2. 🔄 Children bulk delete + export
3. 🔄 Attendance bulk export
4. 🔄 Staff bulk delete + export

**Medium Priority:**
5. Payments bulk operations
6. Activities bulk operations
7. Messages bulk operations

**Low Priority (Advanced):**
8. Bulk assign class/group
9. Bulk send notifications
10. Advanced filtering before bulk action

---

## 📝 Implementation Checklist

### Per Page Checklist:

- [ ] Add selectedItems state
- [ ] Add pagination state (currentPage, itemsPerPage)
- [ ] Implement handleSelectAll
- [ ] Implement handleSelectOne
- [ ] Add checkboxes to UI (header + rows/cards)
- [ ] Implement handleBulkDelete
- [ ] Implement handleBulkExport
- [ ] Add BulkActionsToolbar component
- [ ] Add Pagination component
- [ ] Create backend bulk-delete endpoint
- [ ] Create backend bulk-export endpoint (optional)
- [ ] Add CSV export utility
- [ ] Test with multiple items
- [ ] Test pagination navigation
- [ ] Test select all / deselect all

---

## 🎨 UI/UX Considerations

### Selection State Visual Feedback:
```jsx
<Card className={`
  ${selectedItems.includes(item._id) 
    ? 'ring-2 ring-blue-500 bg-blue-50' 
    : ''
  }
`}>
```

### Bulk Action Confirmation:
```javascript
const handleBulkDelete = async () => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedItems.length} items?\n\n` +
    `This action cannot be undone.`
  );
  
  if (!confirmed) return;
  
  // Proceed with deletion...
};
```

### Loading State During Bulk Operations:
```jsx
const [bulkActionLoading, setBulkActionLoading] = useState(false);

const handleBulkDelete = async () => {
  setBulkActionLoading(true);
  try {
    // ... bulk delete logic
  } finally {
    setBulkActionLoading(false);
  }
};
```

---

## 🚀 Quick Start: Children Page Example

To implement bulk actions on the Children page right now:

**1. Install imports:**
```jsx
import BulkActionsToolbar, { commonBulkActions } from '../../components/common/BulkActionsToolbar';
import Pagination from '../../components/common/Pagination';
import { exportChildrenToCSV } from '../../utils/csvExport';
```

**2. Add state (after existing useState):**
```jsx
const [selectedChildren, setSelectedChildren] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(20);
```

**3. Add handlers (after existing functions):**
```jsx
const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedChildren(filteredChildren.map(c => c._id));
  } else {
    setSelectedChildren([]);
  }
};

const handleSelectOne = (id) => {
  if (selectedChildren.includes(id)) {
    setSelectedChildren(selectedChildren.filter(cid => cid !== id));
  } else {
    setSelectedChildren([...selectedChildren, id]);
  }
};

const handleBulkDelete = async () => {
  if (!window.confirm(`Delete ${selectedChildren.length} children?`)) return;
  
  try {
    // For now, delete one by one (later add bulk endpoint)
    await Promise.all(selectedChildren.map(id => childrenAPI.delete(id)));
    showAlert('success', `${selectedChildren.length} children deleted`);
    setSelectedChildren([]);
    fetchChildren();
  } catch (error) {
    showAlert('error', 'Failed to delete children');
  }
};

const handleBulkExport = () => {
  const childrenToExport = children.filter(c => selectedChildren.includes(c._id));
  exportChildrenToCSV(childrenToExport);
  showAlert('success', `${selectedChildren.length} children exported`);
};
```

**4. Update card to include checkbox (inside map):**
```jsx
<Card key={child._id} className={`
  relative hover:shadow-lg transition-shadow
  ${selectedChildren.includes(child._id) ? 'ring-2 ring-blue-500' : ''}
`}>
  <div className="absolute top-4 left-4 z-10">
    <input
      type="checkbox"
      checked={selectedChildren.includes(child._id)}
      onChange={() => handleSelectOne(child._id)}
      className="h-4 w-4 text-blue-600 rounded cursor-pointer"
    />
  </div>
  
  {/* Existing card content - add ml-8 to first div for spacing */}
  <div className="flex items-start justify-between mb-4 ml-8">
    {/* ... */}
  </div>
</Card>
```

**5. Add toolbar and pagination (before closing Layout tag):**
```jsx
<BulkActionsToolbar
  selectedCount={selectedChildren.length}
  onClearSelection={() => setSelectedChildren([])}
  actions={[
    commonBulkActions.delete(handleBulkDelete),
    commonBulkActions.export(handleBulkExport),
  ]}
/>

{filteredChildren.length > itemsPerPage && (
  <Pagination
    currentPage={currentPage}
    totalPages={Math.ceil(filteredChildren.length / itemsPerPage)}
    totalItems={filteredChildren.length}
    itemsPerPage={itemsPerPage}
    onPageChange={setCurrentPage}
  />
)}
```

---

## 🔧 Testing

**Test Cases:**
1. Select single item → toolbar appears
2. Select all → all items selected
3. Deselect all → toolbar disappears
4. Bulk delete → confirmation → items deleted → list refreshes
5. Bulk export → CSV file downloads
6. Pagination → navigate pages → selection persists/clears
7. Filter/search → selection updates correctly

---

## 📊 Progress Summary

| Feature | Status |
|---------|--------|
| Pagination fixes (all pages) | ✅ DONE |
| Pagination component | ✅ Created |
| BulkActionsToolbar component | ✅ Created |
| CSV export utility | 📝 Documented |
| Children bulk actions | ⏳ Ready to implement |
| Staff bulk actions | ⏳ Pending |
| Payments bulk actions | ⏳ Pending |
| Activities bulk actions | ⏳ Pending |
| Backend bulk endpoints | ⏳ Pending |

---

**Next Immediate Step:** Implement bulk actions on Children page following the Quick Start guide above.
