import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={`input-field ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
