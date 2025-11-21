import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: FiCheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: FiAlertCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: FiAlertCircle,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: FiInfo,
      iconColor: 'text-blue-600',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bg} ${config.border} ${className}`}>
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
