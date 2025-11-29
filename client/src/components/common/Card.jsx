const Card = ({ 
  title, 
  subtitle, 
  children, 
  footer,
  className = '',
  headerAction 
}) => {
  return (
    <div className={`backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-xl shadow-sm hover:shadow-md transition-all p-6 ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="mb-4 pb-4 border-b border-blue-200/20">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-blue-200/20">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
