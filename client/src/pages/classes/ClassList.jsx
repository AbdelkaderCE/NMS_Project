import { useState, useEffect } from 'react';
import { classAPI, groupAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiDollarSign } from 'react-icons/fi';

const ClassList = ({ onSearchClick }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageRange: {
      minMonths: '',
      maxMonths: '',
    },
    monthlyFee: '',
    color: '#3B82F6',
    isActive: true,
  });

  const [groupFormData, setGroupFormData] = useState({
    class: '',
    name: '',
    maxCapacity: '',
    room: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
    },
    instructors: [],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, groupsRes] = await Promise.all([
        classAPI.getAll({ limit: 100 }),
        groupAPI.getAll({ limit: 100 }),
      ]);
      setClasses(classesRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load classes' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const classData = {
        ...formData,
        ageRange: {
          minMonths: parseInt(formData.ageRange.minMonths),
          maxMonths: parseInt(formData.ageRange.maxMonths),
        },
        monthlyFee: parseFloat(formData.monthlyFee),
      };

      if (isEditing && selectedClass) {
        await classAPI.update(selectedClass._id, classData);
        setAlert({ type: 'success', message: 'Class updated successfully!' });
      } else {
        await classAPI.create(classData);
        setAlert({ type: 'success', message: 'Class created successfully!' });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving class:', error);
      const errorData = error.response?.data || error;
      const errorMessage = errorData.errors?.map(e => e.message || e.msg).join(', ') || errorData.message || 'Failed to save class';
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      ageRange: {
        minMonths: classItem.ageRange?.minMonths || '',
        maxMonths: classItem.ageRange?.maxMonths || '',
      },
      monthlyFee: classItem.monthlyFee || '',
      color: classItem.color || '#3B82F6',
      isActive: classItem.isActive !== false,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      await classAPI.delete(id);
      setAlert({ type: 'success', message: 'Class deleted successfully!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting class:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete class';
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageRange: {
        minMonths: '',
        maxMonths: '',
      },
      monthlyFee: '',
      color: '#3B82F6',
      isActive: true,
    });
    setSelectedClass(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const getClassGroups = (classId) => {
    return groups.filter(g => g.class?._id === classId);
  };

  const formatAgeRange = (ageRange) => {
    if (!ageRange) return 'N/A';
    const minYears = Math.floor(ageRange.minMonths / 12);
    const minRemaining = ageRange.minMonths % 12;
    const maxYears = Math.floor(ageRange.maxMonths / 12);
    const maxRemaining = ageRange.maxMonths % 12;

    const formatAge = (years, months) => {
      if (years === 0) return `${months}mo`;
      if (months === 0) return `${years}y`;
      return `${years}y ${months}mo`;
    };

    return `${formatAge(minYears, minRemaining)} - ${formatAge(maxYears, maxRemaining)}`;
  };

  if (loading) return (
    <Layout onSearchClick={onSearchClick}>
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    </Layout>
  );

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="space-y-6">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">Organize children by age groups</p>
          </div>
        {(user?.role === 'admin') && (
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem._id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: classItem.color }}
                >
                  {classItem.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                  <p className="text-sm text-gray-500">{formatAgeRange(classItem.ageRange)}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">ID: {classItem._id}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {classItem.description && (
              <p className="text-gray-600 text-sm mb-4">{classItem.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FiUsers size={18} />
                <span className="text-sm">{classItem.childrenCount || 0} children</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign size={18} />
                <span className="text-sm">${classItem.monthlyFee}/mo</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                {getClassGroups(classItem._id).length} Groups
              </p>
              <div className="flex flex-wrap gap-2">
                {getClassGroups(classItem._id).map((group) => (
                  <span
                    key={group._id}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {group.name} ({group.childrenCount}/{group.maxCapacity})
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Class Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={isEditing ? 'Edit Class' : 'Add New Class'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Class Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Toddlers, Pre-K"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Class description..."
                maxLength="500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Age (months) *"
                type="number"
                min="0"
                value={formData.ageRange.minMonths}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ageRange: { ...formData.ageRange, minMonths: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Max Age (months) *"
                type="number"
                min="0"
                value={formData.ageRange.maxMonths}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ageRange: { ...formData.ageRange, maxMonths: e.target.value },
                  })
                }
                required
              />
            </div>

            <Input
              label="Monthly Fee *"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
              placeholder="0.00"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Class' : 'Create Class'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default ClassList;
