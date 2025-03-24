import React, { useState, useRef, useEffect } from "react";
import { useGreenmark } from "./GreenmarkContext";

const MetricBar = ({ 
  metricType, 
  options = {
    showSlider: false,
    height: "2.5rem",
    showVerticalMarkers: true,
    showLabels: true,
    showTooltips: true,
    barStyle: "default",
    allowManualInput: false,
  }
}) => {
  const {
    criteria,
    searchResults,
    sliderRanges,
    metricConfig,
    parseMetricValue,
    getMarkerPosition,
    getFormattedValue,
    handleSliderChange,
    setCriteria
  } = useGreenmark();

  // Use state for tooltip visibility and manual input
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const inputRef = useRef(null);
  
  // References for marker positions to check for overlaps
  const markerPositionsRef = useRef([]);

  const {
    showSlider = false,
    height = "2.5rem",
    showVerticalMarkers = true,
    showLabels = true,
    showTooltips = true,
    barStyle = "default",
    allowManualInput = false,
  } = options;

  const config = metricConfig[metricType];

  // Check if all buildings are not eligible for this metric
  const allNotEligible =
    !config.isSimpleNumeric &&
    searchResults &&
    searchResults.length > 0 &&
    searchResults.every(
      (building) =>
        building[config.field] === "Not Eligible" ||
        building[config.field] === "NA"
    );

  if (allNotEligible) {
    return (
      <div className="mt-2">
        {showSlider && (
          <label className="font-medium block mb-2">
            {config.label}: Not Eligible
          </label>
        )}
        <div className="p-2 border border-gray-300 rounded text-center text-sm">
          This metric is not eligible for the selected buildings
        </div>
      </div>
    );
  }

  let currentValue = criteria[`current${metricType}`];
  let min = sliderRanges[metricType]?.min || 0;
  let max = sliderRanges[metricType]?.max * 1.2 || 100;

  // Sort buildings by metric value
  const sortedBuildings = searchResults
    ? [...searchResults].sort(
        (a, b) =>
          parseMetricValue(a, metricType) - parseMetricValue(b, metricType)
      )
    : [];

  // Calculate positions for color bands
  let goldPlusPosition = 0;
  let platinumPosition = 0;
  let slePosition = 0;

  if (sortedBuildings.length > 0) {
    goldPlusPosition = getMarkerPosition(
      parseMetricValue(sortedBuildings[0], metricType),
      min,
      max
    );
  }

  if (sortedBuildings.length > 1) {
    platinumPosition = getMarkerPosition(
      parseMetricValue(sortedBuildings[1], metricType),
      min,
      max
    );
  }

  if (sortedBuildings.length > 2) {
    slePosition = getMarkerPosition(
      parseMetricValue(sortedBuildings[2], metricType),
      min,
      max
    );
  }

  // Calculate widths
  const goldPlusWidth = goldPlusPosition;
  const platinumWidth = platinumPosition - goldPlusPosition;
  const sleWidth = slePosition - platinumPosition;
  const aboveSleWidth = 100 - slePosition;

  const getTooltipLabels = () => {
    switch (metricType) {
      case "EUI":
        return {
          goldPlus: "SLE",
          platinum: "Platinum",
          sle: "GoldPlus",
          aboveSle: "Does Not Qualify",
        };
      default:
        return {
          goldPlus: "Qualify",
          platinum: "Better",
          sle: "Good",
          aboveSle: "Does Not Qualify",
        };
    }
  };

  const tooltipLabels = getTooltipLabels();
  const checkCurrentValue = (value) => {
    return value == null || isNaN(value) ? max / 2 : value;
  };
  
  const sliderCurrentValue = checkCurrentValue(parseFloat(currentValue || 0));
  const currentPosition = getMarkerPosition(sliderCurrentValue, min, max);

  // Function to handle manual input
  const handleManualInputChange = (e) => {
    setManualValue(e.target.value);
  };

  const handleManualInputBlur = () => {
    const parsedValue = parseFloat(manualValue);
    
    if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
      // Update the criteria with the new value
      setCriteria(prev => ({
        ...prev,
        [`current${metricType}`]: parsedValue
      }));
      
      // Also call the slider change handler to ensure consistency
      handleSliderChange(parsedValue, metricType);
    }
    
    setIsEditing(false);
  };

  const handleManualInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setManualValue("");
    }
  };

  const startEditing = () => {
    if (allowManualInput) {
      setManualValue(currentValue || "");
      setIsEditing(true);
      // Focus the input after render
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Detect marker overlaps and adjust positioning
  useEffect(() => {
    if (!searchResults || !showVerticalMarkers) return;
    
    // Reset the positions array
    markerPositionsRef.current = searchResults.map((building, index) => {
      const value = parseMetricValue(building, metricType);
      const position = getMarkerPosition(value, min, max);
      return { position, index, value };
    }).filter(item => item.position >= 0);

    // No need to sort here as we'll handle this in the getMarkerLabelPosition function
  }, [searchResults, metricType, min, max, showVerticalMarkers]);
  
  // Force update marker labels on window resize to handle responsive adjustments
  useEffect(() => {
    if (!searchResults || !showVerticalMarkers) return;
    
    const handleResize = () => {
      // Force a re-render when window size changes to recalculate positions
      const markers = document.querySelectorAll('[data-marker-index]');
      markers.forEach(marker => {
        const index = parseInt(marker.getAttribute('data-marker-index'));
        const position = markerPositionsRef.current.find(p => p.index === index)?.position || 0;
        marker.setAttribute('data-position', getMarkerLabelPosition(position, index));
        
        if (getMarkerLabelPosition(position, index) === "top") {
          marker.classList.remove("top-12");
          marker.classList.add("-top-6");
        } else {
          marker.classList.remove("-top-6");
          marker.classList.add("top-12");
        }
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [searchResults, showVerticalMarkers]);

  // Function to determine marker label position (top or bottom)
  const getMarkerLabelPosition = (position, index) => {
    if (markerPositionsRef.current.length <= 1) return "bottom";
    
    // Sort buildings by position for more accurate overlap detection
    const positionsSorted = [...markerPositionsRef.current].sort((a, b) => a.position - b.position);
    
    // Find where this marker is in the sorted array
    const currentIdx = positionsSorted.findIndex(p => p.index === index);
    if (currentIdx === -1) return "bottom";
    
    const OVERLAP_THRESHOLD = 14; // percentage points that would cause overlap
    
    // Alternating pattern for dense clusters:
    // For evenly spaced markers that would all overlap, alternate top/bottom
    // Odd indices go to top, even indices go to bottom
    if (positionsSorted.length >= 3) {
      if (currentIdx > 0 && currentIdx < positionsSorted.length - 1) {
        const leftDiff = Math.abs(position - positionsSorted[currentIdx - 1].position);
        const rightDiff = Math.abs(positionsSorted[currentIdx + 1].position - position);
        
        if (leftDiff < OVERLAP_THRESHOLD && rightDiff < OVERLAP_THRESHOLD) {
          return currentIdx % 2 === 0 ? "bottom" : "top";
        }
      }
    }
    
    // Check individual overlaps with neighbors
    const hasLeftNeighborOverlap = currentIdx > 0 && 
      (Math.abs(position - positionsSorted[currentIdx - 1].position) < OVERLAP_THRESHOLD);
    
    const hasRightNeighborOverlap = currentIdx < positionsSorted.length - 1 && 
      (Math.abs(position - positionsSorted[currentIdx + 1].position) < OVERLAP_THRESHOLD);
    
    // If has overlap, see what position nearby markers have
    if (hasLeftNeighborOverlap || hasRightNeighborOverlap) {
      // Check if nearby markers are already at top
      const nearbyMarkersAtTop = [];
      
      if (hasLeftNeighborOverlap && currentIdx > 0) {
        const leftMarkerIndex = positionsSorted[currentIdx - 1].index;
        const leftMarkerPos = document.querySelector(`[data-marker-index="${leftMarkerIndex}"]`)?.getAttribute('data-position');
        if (leftMarkerPos === "top") nearbyMarkersAtTop.push(leftMarkerIndex);
      }
      
      if (hasRightNeighborOverlap && currentIdx < positionsSorted.length - 1) {
        const rightMarkerIndex = positionsSorted[currentIdx + 1].index;
        const rightMarkerPos = document.querySelector(`[data-marker-index="${rightMarkerIndex}"]`)?.getAttribute('data-position');
        if (rightMarkerPos === "top") nearbyMarkersAtTop.push(rightMarkerIndex);
      }
      
      // If nearby markers are already at top, put this one at bottom
      if (nearbyMarkersAtTop.length > 0) {
        return "bottom";
      }
      
      return "top";
    }
    
    return "bottom";
  };

  return (
    <div className={showSlider ? "mt-6" : "mt-2"}>
      {showSlider && (
        <label className="font-medium block mb-4">
          {config.label}: {" "}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={manualValue}
              onChange={handleManualInputChange}
              onBlur={handleManualInputBlur}
              onKeyDown={handleManualInputKeyDown}
              className="w-20 px-2 py-0.5 border border-gray-300 rounded"
            />
          ) : (
                          <span 
              onClick={startEditing}
              className={allowManualInput ? "cursor-pointer hover:underline relative group" : ""}
              title={allowManualInput ? "Click to edit value" : ""}
            >
              {currentValue || "-"}
              {config.unit && ` ${config.unit}`}
              {allowManualInput && (
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Click to edit value
                </span>
              )}
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Min and max values display */}
        {showLabels && (
          <div className="flex justify-between text-xs mt-1 px-1 pb-2">
            <span>
              Min: {min}
              {config.unit && ` ${config.unit}`}
            </span>
            <span>
              Max: {max.toFixed(2)}
              {config.unit && ` ${config.unit}`}
            </span>
          </div>
        )}

        <div className="relative" style={{ height: height, width: "100%" }}>
          {/* Vertical line markers for building values */}
          {showVerticalMarkers &&
            searchResults &&
            searchResults.map((building, index) => {
              const value = parseMetricValue(building, metricType);
              const position = getMarkerPosition(value, min, max);
              if (position < 0) return null;
              
              
              return (
                <div
                  key={index}
                  className="absolute top-0 w-0.5 h-10 bg-purple-600"
                  style={{ left: `${position}%` }}
                >
                  <div 
                    data-marker-index={index}
                    data-position={getMarkerLabelPosition(position, index)}
                    className={`absolute -left-14 w-28 text-center text-xs ${
                      getMarkerLabelPosition(position, index) === "top" ? "-top-6" : "top-12"
                    }`}
                  >
                    {getFormattedValue(building, metricType)}
                  </div>
                </div>
              );
            })}

          {/* Colored bar segments */}
          <div
            className="absolute top-0 h-6 rounded-l-2xl hover:brightness-90 transition-all"
            style={{
              backgroundColor: "#CD7F32", // Bronze/Gold color
              width: `${goldPlusWidth}%`,
              transition: "width 0.3s ease",
            }}
            onMouseEnter={() => showTooltips && setActiveTooltip("goldPlus")}
            onMouseLeave={() => showTooltips && setActiveTooltip(null)}
          >
            {showTooltips && activeTooltip === "goldPlus" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                {tooltipLabels.goldPlus}
              </div>
            )}
          </div>

          <div
            className="absolute top-0 h-6 hover:brightness-90 transition-all"
            style={{
              backgroundColor: "#C0C0C0", // Silver color
              left: `${goldPlusWidth}%`,
              width: `${platinumWidth}%`,
              transition: "left 0.3s ease, width 0.3s ease",
            }}
            onMouseEnter={() => showTooltips && setActiveTooltip("platinum")}
            onMouseLeave={() => showTooltips && setActiveTooltip(null)}
          >
            {showTooltips && activeTooltip === "platinum" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                {tooltipLabels.platinum}
              </div>
            )}
          </div>

          <div
            className="absolute top-0 h-6 hover:brightness-90 transition-all"
            style={{
              backgroundColor: "#FFD700", // Gold color
              left: `${goldPlusWidth + platinumWidth}%`,
              width: `${sleWidth}%`,
              transition: "left 0.3s ease, width 0.3s ease",
            }}
            onMouseEnter={() => showTooltips && setActiveTooltip("sle")}
            onMouseLeave={() => showTooltips && setActiveTooltip(null)}
          >
            {showTooltips && activeTooltip === "sle" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                {tooltipLabels.sle}
              </div>
            )}
          </div>

          {/* Add the above SLE segment */}
          <div
            className="absolute top-0 h-6 rounded-r-2xl hover:brightness-90 transition-all"
            style={{
              backgroundColor: "#FF0000", // Red color
              left: `${goldPlusWidth + platinumWidth + sleWidth}%`,
              width: `${aboveSleWidth}%`,
              transition: "left 0.3s ease, width 0.3s ease",
            }}
            onMouseEnter={() => showTooltips && setActiveTooltip("aboveSle")}
            onMouseLeave={() => showTooltips && setActiveTooltip(null)}
          >
            {showTooltips && activeTooltip === "aboveSle" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                {tooltipLabels.aboveSle}
              </div>
            )}
          </div>

          {/* Slider input (conditionally rendered) */}
          {showSlider && (
            <input
              type="range"
              min={min}
              max={max}
              step="0.01"
              value={sliderCurrentValue}
              onChange={(e) => handleSliderChange(e.target.value, metricType)}
              className="w-full h-2 mt-1 appearance-none bg-transparent cursor-pointer relative"
              style={{
                "--thumb-appearance": "none",
                "--thumb-width": "4px",
                "--thumb-height": "16px",
                "--thumb-color": "black",
              }}
            />
          )}

          {/* Current value display */}
          <div
            className="absolute w-px h-8 bg-blue-700 pointer-events-none"
            style={{
              left: `${currentPosition}%`,
              top: "-3px",
            }}
          >
            <div className="absolute -left-10 -top-6 w-20 text-center bg-blue-100 text-blue-700 rounded px-2 text-xs font-bold">
              {checkCurrentValue(currentValue)}
              {config.unit && ` ${config.unit}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricBar;