import { FiClock, FiCalendar } from 'react-icons/fi';
import Card from '../../components/common/Card';

const DailyReportView = ({ report }) => {
  if (!report) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No daily report available for this date</p>
        </div>
      </Card>
    );
  }

  const getMealIcon = (consumed) => {
    switch (consumed) {
      case 'all': return '✅ Ate All';
      case 'most': return '👍 Ate Most';
      case 'some': return '🤏 Ate Some';
      case 'none': return '❌ Didn\'t Eat';
      default: return 'N/A';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'content': return '😌';
      case 'fussy': return '😣';
      case 'cranky': return '😤';
      case 'sleepy': return '😴';
      case 'energetic': return '⚡';
      default: return '😐';
    }
  };

  const calculateNapDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Daily Report - {report.child?.firstName} {report.child?.lastName}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <FiCalendar className="mr-1" />
                {new Date(report.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {report.completedAt && (
                <span className="flex items-center">
                  <FiClock className="mr-1" />
                  Completed at {new Date(report.completedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            report.status === 'sent' ? 'bg-green-100 text-green-800' :
            report.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </div>
        </div>
      </Card>

      {/* Attendance */}
      {report.attendance && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📍 Attendance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <p className="font-medium capitalize">{report.attendance.status}</p>
            </div>
            {report.attendance.checkIn && (
              <div>
                <span className="text-sm text-gray-600">Check-in:</span>
                <p className="font-medium">
                  {new Date(report.attendance.checkIn).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
            {report.attendance.checkOut && (
              <div>
                <span className="text-sm text-gray-600">Check-out:</span>
                <p className="font-medium">
                  {new Date(report.attendance.checkOut).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Meals */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Meals</h4>
        <div className="space-y-3">
          {['breakfast', 'lunch', 'snacks'].map((mealType) => (
            <div key={mealType} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium capitalize text-gray-900">{mealType}</p>
                <p className="text-sm text-gray-600">
                  {getMealIcon(report.meals?.[mealType]?.consumed)}
                </p>
                {report.meals?.[mealType]?.notes && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    {report.meals[mealType].notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Naps */}
      {report.naps && report.naps.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">😴 Naps</h4>
          <div className="space-y-3">
            {report.naps.map((nap, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {nap.startTime} - {nap.endTime}
                  </span>
                  <span className="text-sm text-gray-600">
                    {calculateNapDuration(nap.startTime, nap.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">Quality: {nap.quality}</span>
                </div>
                {nap.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{nap.notes}</p>
                )}
              </div>
            ))}
            <div className="text-sm text-gray-600 bg-blue-100 p-2 rounded">
              <strong>Total nap time:</strong> {report.totalNapDuration ? 
                `${Math.floor(report.totalNapDuration / 60)}h ${report.totalNapDuration % 60}m` : 
                'N/A'}
            </div>
          </div>
        </Card>
      )}

      {/* Diaper Changes */}
      {report.diaperChanges && report.diaperChanges.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🍼 Diaper Changes</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {report.diaperChanges.map((change, index) => (
              <div key={index} className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="font-medium text-gray-900">{change.time}</p>
                <p className="text-sm text-gray-600 capitalize">{change.type}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <strong>Total changes:</strong> {report.diaperChanges.length}
          </p>
        </Card>
      )}

      {/* Mood & Behavior */}
      {report.mood && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">😊 Mood & Behavior</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {report.mood.morning && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl mb-2">{getMoodEmoji(report.mood.morning)}</p>
                <p className="text-sm text-gray-600">Morning</p>
                <p className="font-medium capitalize">{report.mood.morning}</p>
              </div>
            )}
            {report.mood.afternoon && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl mb-2">{getMoodEmoji(report.mood.afternoon)}</p>
                <p className="text-sm text-gray-600">Afternoon</p>
                <p className="font-medium capitalize">{report.mood.afternoon}</p>
              </div>
            )}
            {report.mood.overall && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overall Day</p>
                <p className="font-bold text-lg capitalize">{report.mood.overall}</p>
              </div>
            )}
          </div>
          {report.mood.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{report.mood.notes}</p>
            </div>
          )}
        </Card>
      )}

      {/* Activities */}
      {report.activities && report.activities.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🎨 Activities</h4>
          <div className="space-y-2">
            {report.activities.map((activity) => (
              <div key={activity._id} className="p-3 bg-indigo-50 rounded-lg">
                <p className="font-medium text-gray-900">{activity.title}</p>
                {activity.description && (
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Incidents */}
      {report.incidents && report.incidents.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Incidents</h4>
          <div className="space-y-3">
            {report.incidents.map((incident, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                incident.severity === 'serious' ? 'bg-red-50 border-red-500' :
                incident.severity === 'moderate' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{incident.time}</span>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    incident.severity === 'serious' ? 'bg-red-200 text-red-800' :
                    incident.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                {incident.actionTaken && (
                  <p className="text-sm text-gray-600 italic">
                    <strong>Action taken:</strong> {incident.actionTaken}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* General Notes */}
      {report.notes && (
        <Card>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 Teacher's Notes</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
          </div>
        </Card>
      )}

      {/* Created By */}
      {report.createdBy && (
        <div className="text-sm text-gray-500 text-center">
          Report created by {report.createdBy.user?.firstName} {report.createdBy.user?.lastName}
          {report.sentAt && (
            <> • Sent to parents on {new Date(report.sentAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyReportView;
