import React from 'react';

// Energy Icon component for the Steps
export const EnergyIcon = ({ active = false }) => {
  const fillColor = active ? "#FFFFFF" : "#F4F1ED";
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3H11V13H13V3Z" fill={fillColor} />
      <path d="M17.83 5.17L16.41 6.59C17.99 7.86 19 9.81 19 12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12C5 9.81 6.01 7.86 7.58 6.59L6.17 5.17C4.23 6.82 3 9.26 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 9.26 19.77 6.82 17.83 5.17Z" fill={fillColor} />
      <path d="M12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12Z" fill={fillColor} />
    </svg>
  );
};

// Building Type Icon
export const BuildingIcon = ({ active = false }) => {
  const fillColor = active ? "#FFFFFF" : "#F4F1ED";
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill={fillColor} />
    </svg>
  );
};

// Criteria Icon
export const CriteriaIcon = ({ active = false }) => {
  const fillColor = active ? "#FFFFFF" : "#F4F1ED";
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill={fillColor} />
      <path d="M7 12H9V17H7V12Z" fill={fillColor} />
      <path d="M15 7H17V17H15V7Z" fill={fillColor} />
      <path d="M11 14H13V17H11V14Z" fill={fillColor} />
      <path d="M11 10H13V12H11V10Z" fill={fillColor} />
    </svg>
  );
};

// Search Icon
export const SearchIcon = ({ active = false }) => {
  const fillColor = active ? "#FFFFFF" : "#F4F1ED";
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill={fillColor} />
    </svg>
  );
};

// Result Icon
export const ResultIcon = ({ active = false }) => {
  const fillColor = active ? "#FFFFFF" : "#F4F1ED";
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill={fillColor} />
    </svg>
  );
};

// Dropdown Component with custom styling
export const Dropdown = ({ options, value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`dropdown-container ${className}`}>
      <select 
        value={value} 
        onChange={onChange}
        className="dropdown-field"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={typeof option === 'object' ? option.value : option}>
            {typeof option === 'object' ? option.label : option}
          </option>
        ))}
      </select>
      <div className="dropdown-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10L12 15L17 10H7Z" fill="#394843" />
        </svg>
      </div>
    </div>
  );
};

// Slider Component with colored segments
export const RangeSlider = ({ 
  min, 
  max, 
  value, 
  onChange,
  unit = "",
  segments = [
    { color: "#CD7F32", width: 25 }, // Bronze
    { color: "#C0C0C0", width: 25 }, // Silver
    { color: "#FFD700", width: 25 }, // Gold
    { color: "#FF0000", width: 25 }  // Red
  ]
}) => {
  return (
    <div className="slider-component">
      <div className="slider-labels">
        <span>Min: {min}{unit}</span>
        <span>Max: {max}{unit}</span>
      </div>
      
      <div className="color-scale">
        {segments.map((segment, index) => (
          <div 
            key={index}
            className="scale-segment"
            style={{ 
              backgroundColor: segment.color,
              width: `${segment.width}%` 
            }}
          />
        ))}
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 100}
        value={value}
        onChange={onChange}
        className="range-slider"
      />
      
      <div 
        className="slider-value-indicator"
        style={{ left: `${((value - min) / (max - min)) * 100}%` }}
      >
        {value}{unit}
      </div>
    </div>
  );
};

// Progress Steps component
export const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps-container">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;
        
        // Determine the icon component based on step type
        let IconComponent;
        switch (step.type) {
          case 'energy':
            IconComponent = EnergyIcon;
            break;
          case 'building':
            IconComponent = BuildingIcon;
            break;
          case 'criteria':
            IconComponent = CriteriaIcon;
            break;
          case 'search':
            IconComponent = SearchIcon;
            break;
          case 'result':
            IconComponent = ResultIcon;
            break;
          default:
            IconComponent = EnergyIcon;
        }
        
        return (
          <div 
            key={index} 
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-content">
              <div className="step-label">{step.label}</div>
              <p className="step-text">{step.text}</p>
            </div>
            <div className="step-icon-container">
              <div className="step-icon">
                <IconComponent active={isActive || isCompleted} />
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Button component with variants
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // primary, secondary, tertiary
  size = 'medium', // small, medium, large
  disabled = false,
  className = ''
}) => {
  const baseClass = 'button';
  const variantClass = `button-${variant}`;
  const sizeClass = `button-${size}`;
  const stateClass = disabled ? 'button-disabled' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${stateClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Card component for displaying information
export const Card = ({ 
  title, 
  children, 
  footer,
  className = '' 
}) => {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// Tooltip component
export const Tooltip = ({ 
  content, 
  position = 'top', 
  children 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

// Enhanced Building Details (Fullscreen component)
export const EnhancedBuildingDetailsFullscreen = ({ 
  title, 
  onClose, 
  buildingData,
  activeTab,
  criteria
}) => {
  // Helper function to format display values (from CsvDataComponent)
  const formatNewLines = (text) => {
    if (!text) return text;
    text = text.replace("$", ",");
    const parts = text.split("\\n");
    
    if (parts.length === 1) {
      return text; // No \n found, return the original text
    }
    
    // Return array of text parts with <br /> elements between them
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  const getDisplayValue = (key, value) => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return "";
    }
    
    // Convert value to string to ensure we can work with it
    let stringValue = String(value);
    
    // Apply specific formatting based on key if needed
    if (key.includes('AIR_SIDE_EFFICIENCY') || 
        key.includes('ACMV_TSE') || 
        key.includes('ETTV_OR_RETV')) {
      // Special handling for these fields
      // This is a simplified version - you'd typically have more complex logic here
      return formatNewLines(stringValue);
    }
    
    // Apply new line formatting to the original value
    return formatNewLines(stringValue);
  };
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Exit Fullscreen
        </button>
      </div>
      <div className="flex-grow overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(buildingData)
            .filter(([key]) => 
              !key.includes("_LOW_COST") && 
              !key.includes("_AVG_COST") && 
              !key.includes("_HIGH_COST")
            )
            .map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-200 py-3">
                <div className="font-medium w-1/2 text-gray-700">
                  {key.replace(/_/g, " ")}:
                </div>
                <div className="w-1/2">
                  {getDisplayValue(key, value)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};