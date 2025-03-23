import React, { useState } from "react";
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
    handleSliderChange
  } = useGreenmark();

  // Use state for tooltip visibility
  const [activeTooltip, setActiveTooltip] = useState(null);

  const {
    showSlider = false,
    height = "2.5rem",
    showVerticalMarkers = true,
    showLabels = true,
    showTooltips = true,
    barStyle = "default",
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

  return (
    <div className={showSlider ? "mt-6" : "mt-2"}>
      {showSlider && (
        <label className="font-medium block mb-4">
          {config.label}: {currentValue || "-"}
          {config.unit && ` ${config.unit}`}
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
                  <div className="absolute -left-14 top-12 w-28 text-center text-xs">
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