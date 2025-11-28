import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { FiUser, FiCalendar, FiPhone, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/axios';

const ChildEnrollmentForm = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    child: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      medicalInfo: {
        bloodType: '',
        allergies: [],
        medications: [],
        conditions: [],
        doctorName: '',
        doctorPhone: '',
        insuranceProvider: '',
        insuranceNumber: ''
      },
      dietaryRestrictions: []
    },
    emergencyContacts: [
      {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    ],
    notes: ''
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [dietaryInput, setDietaryInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('child.')) {
      const childField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        child: { ...prev.child, [childField]: value }
      }));
    } else if (name.startsWith('medicalInfo.')) {
      const medicalField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        child: {
          ...prev.child,
          medicalInfo: { ...prev.child.medicalInfo, [medicalField]: value }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index][field] = value;
    setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phone: '', email: '' }
      ]
    }));
  };

  const removeEmergencyContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const addArrayItem = (field, value, setInput) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      child: {
        ...prev.child,
        medicalInfo: {
          ...prev.child.medicalInfo,
          [field]: [...prev.child.medicalInfo[field], value.trim()]
        }
      }
    }));
    setInput('');
  };

  const addDietaryRestriction = () => {
    if (!dietaryInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      child: {
        ...prev.child,
        dietaryRestrictions: [...prev.child.dietaryRestrictions, dietaryInput.trim()]
      }
    }));
    setDietaryInput('');
  };

  const removeArrayItem = (field, index, isDietary = false) => {
    if (isDietary) {
      setFormData(prev => ({
        ...prev,
        child: {
          ...prev.child,
          dietaryRestrictions: prev.child.dietaryRestrictions.filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        child: {
          ...prev.child,
          medicalInfo: {
            ...prev.child.medicalInfo,
            [field]: prev.child.medicalInfo[field].filter((_, i) => i !== index)
          }
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await api.post('/enrollment-requests', {
        requestType: 'parent',
        ...formData
      });

      setAlert({
        type: 'success',
        message: 'Enrollment request submitted successfully! Admin will review your request.'
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit enrollment request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout onSearchClick={onSearchClick}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Child</h1>
          <p className="text-gray-600 mt-1">Submit a request to register a new child. Admin will review and approve your request.</p>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`p-4 rounded-lg flex items-start space-x-3 ${
            alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {alert.type === 'success' ? (
              <FiCheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <FiAlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information */}
          <Card title="Child Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="child.firstName"
                  value={formData.child.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="child.lastName"
                  value={formData.child.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="child.dateOfBirth"
                  value={formData.child.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="child.gender"
                  value={formData.child.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card title="Medical Information">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    name="medicalInfo.bloodType"
                    value={formData.child.medicalInfo.bloodType}
                    onChange={handleChange}
                    placeholder="e.g., A+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    name="medicalInfo.doctorName"
                    value={formData.child.medicalInfo.doctorName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Phone
                  </label>
                  <input
                    type="tel"
                    name="medicalInfo.doctorPhone"
                    value={formData.child.medicalInfo.doctorPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="medicalInfo.insuranceProvider"
                    value={formData.child.medicalInfo.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Number
                  </label>
                  <input
                    type="text"
                    name="medicalInfo.insuranceNumber"
                    value={formData.child.medicalInfo.insuranceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', allergyInput, setAllergyInput))}
                    placeholder="Type allergy and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('allergies', allergyInput, setAllergyInput)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.child.medicalInfo.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('allergies', index)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medications', medicationInput, setMedicationInput))}
                    placeholder="Type medication and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('medications', medicationInput, setMedicationInput)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.child.medicalInfo.medications.map((med, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('medications', index)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('conditions', conditionInput, setConditionInput))}
                    placeholder="Type condition and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('conditions', conditionInput, setConditionInput)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.child.medicalInfo.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('conditions', index)}
                        className="hover:text-yellow-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dietaryInput}
                    onChange={(e) => setDietaryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDietaryRestriction())}
                    placeholder="Type dietary restriction and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addDietaryRestriction}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.child.dietaryRestrictions.map((restriction, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {restriction}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('dietaryRestrictions', index, true)}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contacts */}
          <Card title="Emergency Contacts">
            <div className="space-y-6">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                        required
                        placeholder="e.g., Aunt, Uncle, Friend"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addEmergencyContact}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                + Add Another Emergency Contact
              </button>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Additional Notes">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Any additional information you'd like to share..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChildEnrollmentForm;
