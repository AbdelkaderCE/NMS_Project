import React from 'react';
import { FiTrash2, FiDownload, FiSend, FiX } from 'react-icons/fi';
import Button from './Button';

const BulkActionsToolbar = ({
  selectedCount = 0,
  onClearSelection,
  actions = [],
  className = ''
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
        {/* Selection count */}
        <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
          <span className="text-sm font-semibold text-gray-900">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear selection"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Common bulk action configurations
export const commonBulkActions = {
  delete: (onDelete) => ({
    label: 'Delete',
    icon: FiTrash2,
    variant: 'danger',
    onClick: onDelete
  }),
  export: (onExport) => ({
    label: 'Export',
    icon: FiDownload,
    variant: 'secondary',
    onClick: onExport
  }),
  notify: (onNotify) => ({
    label: 'Send Notification',
    icon: FiSend,
    variant: 'primary',
    onClick: onNotify
  })
};

export default BulkActionsToolbar;
