import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'backdrop-blur-sm bg-green-50/70',
      border: 'border-green-200/40',
      text: 'text-green-800',
      icon: FiCheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'backdrop-blur-sm bg-red-50/70',
      border: 'border-red-200/40',
      text: 'text-red-800',
      icon: FiAlertCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'backdrop-blur-sm bg-amber-50/70',
      border: 'border-amber-200/40',
      text: 'text-amber-800',
      icon: FiAlertCircle,
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'backdrop-blur-sm bg-blue-50/70',
      border: 'border-blue-200/40',
      text: 'text-blue-800',
      icon: FiInfo,
      iconColor: 'text-blue-600',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${config.bg} ${config.border}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
        <div className="ml-3 flex-1">
          <p className={`text-sm ${config.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${config.text} hover:opacity-75`}
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
