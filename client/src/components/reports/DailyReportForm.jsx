import { useState, useEffect } from 'react';
import { FiSave, FiSend, FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { dailyReportAPI } from '../../api';

const DailyReportForm = ({ child, date, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  
  const [formData, setFormData] = useState({
    meals: {
      breakfast: { consumed: 'not_applicable', notes: '' },
      lunch: { consumed: 'not_applicable', notes: '' },
      snacks: { consumed: 'not_applicable', notes: '' },
    },
    naps: [],
    diaperChanges: [],
    mood: {
      morning: '',
      afternoon: '',
      overall: '',
      notes: '',
    },
    incidents: [],
    notes: '',
  });

  useEffect(() => {
    if (child && date) {
      fetchTodayReport();
    }
  }, [child, date]);

  const fetchTodayReport = async () => {
    try {
      setLoading(true);
      const response = await dailyReportAPI.getTodayReport(child._id);
      const report = response.data?.data || response.data;
      
      if (report) {
        setExistingReport(report);
        setFormData({
          meals: report.meals || formData.meals,
          naps: report.naps || [],
          diaperChanges: report.diaperChanges || [],
          mood: report.mood || formData.mood,
          incidents: report.incidents || [],
          notes: report.notes || '',
        });
      }
    } catch (error) {
      console.log('No existing report, starting fresh');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleMealChange = (mealType, field, value) => {
    setFormData({
      ...formData,
      meals: {
        ...formData.meals,
        [mealType]: {
          ...formData.meals[mealType],
          [field]: value,
        },
      },
    });
  };

  const addNap = () => {
    setFormData({
      ...formData,
      naps: [...formData.naps, { startTime: '', endTime: '', quality: 'good', notes: '' }],
    });
  };

  const updateNap = (index, field, value) => {
    const updatedNaps = [...formData.naps];
    updatedNaps[index][field] = value;
    setFormData({ ...formData, naps: updatedNaps });
  };

  const removeNap = (index) => {
    setFormData({
      ...formData,
      naps: formData.naps.filter((_, i) => i !== index),
    });
  };

  const addDiaperChange = () => {
    setFormData({
      ...formData,
      diaperChanges: [...formData.diaperChanges, { time: '', type: 'wet' }],
    });
  };

  const updateDiaperChange = (index, field, value) => {
    const updated = [...formData.diaperChanges];
    updated[index][field] = value;
    setFormData({ ...formData, diaperChanges: updated });
  };

  const removeDiaperChange = (index) => {
    setFormData({
      ...formData,
      diaperChanges: formData.diaperChanges.filter((_, i) => i !== index),
    });
  };

  const addIncident = () => {
    setFormData({
      ...formData,
      incidents: [...formData.incidents, { time: '', description: '', actionTaken: '', severity: 'minor' }],
    });
  };

  const updateIncident = (index, field, value) => {
    const updated = [...formData.incidents];
    updated[index][field] = value;
    setFormData({ ...formData, incidents: updated });
  };

  const removeIncident = (index) => {
    setFormData({
      ...formData,
      incidents: formData.incidents.filter((_, i) => i !== index),
    });
  };

  const handleSave = async (status = 'draft') => {
    try {
      setLoading(true);
      
      await dailyReportAPI.createOrUpdate({
        child: child._id,
        date: date,
        ...formData,
        status,
      });

      showAlert('success', 'Daily report saved successfully');
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save report:', error);
      showAlert('error', error.response?.data?.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      const response = await dailyReportAPI.createOrUpdate({
        child: child._id,
        date: date,
        ...formData,
      });

      const reportId = response.data?.data?._id || existingReport?._id;
      
      if (reportId) {
        await dailyReportAPI.complete(reportId);
        showAlert('success', 'Report completed and ready to send');
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Failed to complete report:', error);
      showAlert('error', error.response?.data?.message || 'Failed to complete report');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      
      const response = await dailyReportAPI.createOrUpdate({
        child: child._id,
        date: date,
        ...formData,
      });

      const reportId = response.data?.data?._id || existingReport?._id;
      
      if (reportId) {
        await dailyReportAPI.complete(reportId);
        await dailyReportAPI.send(reportId);
        showAlert('success', 'Report sent to parents!');
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Failed to send report:', error);
      showAlert('error', error.response?.data?.message || 'Failed to send report');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !existingReport) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Report for {child.firstName} {child.lastName}
        </h3>
        <p className="text-sm text-gray-600">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </Card>

      {/* Meals Section */}
      <Card>
        <h4 className="text-md font-semibold text-gray-900 mb-4">🍽️ Meals</h4>
        
        {['breakfast', 'lunch', 'snacks'].map((mealType) => (
          <div key={mealType} className="mb-4 pb-4 border-b last:border-b-0">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {mealType}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.meals[mealType].consumed}
                onChange={(e) => handleMealChange(mealType, 'consumed', e.target.value)}
                className="input-field"
              >
                <option value="not_applicable">Not Applicable</option>
                <option value="all">Ate All</option>
                <option value="most">Ate Most</option>
                <option value="some">Ate Some</option>
                <option value="none">Didn't Eat</option>
              </select>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={formData.meals[mealType].notes}
                onChange={(e) => handleMealChange(mealType, 'notes', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Naps Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">😴 Naps</h4>
          <Button size="sm" variant="secondary" icon={FiPlus} onClick={addNap}>
            Add Nap
          </Button>
        </div>

        {formData.naps.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No naps recorded</p>
        ) : (
          <div className="space-y-4">
            {formData.naps.map((nap, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeNap(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={nap.startTime}
                      onChange={(e) => updateNap(index, 'startTime', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={nap.endTime}
                      onChange={(e) => updateNap(index, 'endTime', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Quality</label>
                    <select
                      value={nap.quality}
                      onChange={(e) => updateNap(index, 'quality', e.target.value)}
                      className="input-field"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="restless">Restless</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={nap.notes || ''}
                  onChange={(e) => updateNap(index, 'notes', e.target.value)}
                  className="input-field mt-2"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Diaper Changes Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">🍼 Diaper Changes</h4>
          <Button size="sm" variant="secondary" icon={FiPlus} onClick={addDiaperChange}>
            Add Change
          </Button>
        </div>

        {formData.diaperChanges.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No diaper changes recorded</p>
        ) : (
          <div className="space-y-2">
            {formData.diaperChanges.map((change, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <input
                  type="time"
                  value={change.time}
                  onChange={(e) => updateDiaperChange(index, 'time', e.target.value)}
                  className="input-field flex-1"
                />
                <select
                  value={change.type}
                  onChange={(e) => updateDiaperChange(index, 'type', e.target.value)}
                  className="input-field flex-1"
                >
                  <option value="wet">Wet</option>
                  <option value="soiled">Soiled</option>
                  <option value="dry">Dry</option>
                </select>
                <button
                  onClick={() => removeDiaperChange(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mood Section */}
      <Card>
        <h4 className="text-md font-semibold text-gray-900 mb-4">😊 Mood & Behavior</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Morning</label>
            <select
              value={formData.mood.morning}
              onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, morning: e.target.value } })}
              className="input-field"
            >
              <option value="">Select mood...</option>
              <option value="happy">😊 Happy</option>
              <option value="content">😌 Content</option>
              <option value="fussy">😣 Fussy</option>
              <option value="cranky">😤 Cranky</option>
              <option value="sleepy">😴 Sleepy</option>
              <option value="energetic">⚡ Energetic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Afternoon</label>
            <select
              value={formData.mood.afternoon}
              onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, afternoon: e.target.value } })}
              className="input-field"
            >
              <option value="">Select mood...</option>
              <option value="happy">😊 Happy</option>
              <option value="content">😌 Content</option>
              <option value="fussy">😣 Fussy</option>
              <option value="cranky">😤 Cranky</option>
              <option value="sleepy">😴 Sleepy</option>
              <option value="energetic">⚡ Energetic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overall</label>
            <select
              value={formData.mood.overall}
              onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, overall: e.target.value } })}
              className="input-field"
            >
              <option value="">Select overall...</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        </div>
        
        <textarea
          placeholder="Mood notes (optional)"
          value={formData.mood.notes}
          onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, notes: e.target.value } })}
          className="input-field"
          rows={2}
        />
      </Card>

      {/* Incidents Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">⚠️ Incidents</h4>
          <Button size="sm" variant="secondary" icon={FiPlus} onClick={addIncident}>
            Add Incident
          </Button>
        </div>

        {formData.incidents.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No incidents recorded</p>
        ) : (
          <div className="space-y-4">
            {formData.incidents.map((incident, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeIncident(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <input
                    type="time"
                    value={incident.time}
                    onChange={(e) => updateIncident(index, 'time', e.target.value)}
                    className="input-field"
                    placeholder="Time"
                  />
                  <select
                    value={incident.severity}
                    onChange={(e) => updateIncident(index, 'severity', e.target.value)}
                    className="input-field"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="serious">Serious</option>
                  </select>
                </div>
                <textarea
                  placeholder="Description"
                  value={incident.description}
                  onChange={(e) => updateIncident(index, 'description', e.target.value)}
                  className="input-field mb-2"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Action taken"
                  value={incident.actionTaken}
                  onChange={(e) => updateIncident(index, 'actionTaken', e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* General Notes */}
      <Card>
        <h4 className="text-md font-semibold text-gray-900 mb-4">📝 General Notes</h4>
        <textarea
          placeholder="Any additional notes about the child's day..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input-field"
          rows={4}
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="secondary" icon={FiSave} onClick={() => handleSave('draft')} disabled={loading}>
          Save Draft
        </Button>
        <Button variant="secondary" icon={FiClock} onClick={handleComplete} disabled={loading}>
          Mark Complete
        </Button>
        <Button icon={FiSend} onClick={handleSend} disabled={loading}>
          Send to Parents
        </Button>
      </div>
    </div>
  );
};

export default DailyReportForm;
