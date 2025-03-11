import { Fan } from "./Fan";
import { Warehouse } from "./Warehouse";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Eye, EyeOff } from "lucide-react"; // Using lucide icons for visibility toggles
import { useState, useRef, useEffect } from "react";
import React from "react";
import { csvJSON } from "./BuildingTypeData"; // your CSV parsing function
import { DraggableScroll } from "./DraggableScroll";
import Papa from "papaparse";
import { Stars } from "./Stars";
import { TextureLoader } from "three";
import "react-resizable/css/styles.css";
import { ControlTips } from "./ControlTips";
// Import the Google Sheets service
import { fetchSheetData } from "./googleSheetService";
import EnhancedBuildingDetailsFullscreen from "./EnhancedBuildingDetailsFullscreen";

function StarsBackground() {
  const starTexture = useLoader(TextureLoader, "/assets/cyberpunkBG.png");
  // The texture will automatically be set as the background for the scene
  return <primitive attach="background" object={starTexture} />;
}

const CsvDataComponent = () => {
  // Use useState for tooltip visibility
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState({
    Types_of_building: [],
    Pathway: [],
    Does_the_design_have_DCS_OR_DDC_OR_CCS: [],
    buildingStatus: [],
    ETTV_Criteria: [],
  });

  const [criteria, setCriteria] = useState({
    Types_of_building: "",
    Pathway: "",
    Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
    buildingStatus: "", // new or existing
    ETTV_Criteria: "",
    currentEUI: "",
    currentASE: "",
    currentETTV: "",
    currentACMVTSE: "",
  });
  // Use a ref to keep track of current criteria for effect dependencies
  const criteriaRef = useRef(criteria);

  // Add this at the component level
  const initialValueSetRef = useRef({});
  // Initial slider ranges
  const [sliderRanges, setSliderRanges] = useState({
    EUI: { min: 1, max: 999 },
    ASE: { min: 1, max: 999 },
    ETTV: { min: 1, max: 999 },
    ACMVTSE: { min: 1, max: 999 },
  });

  // Configuration for each metric
  const metricConfig = {
    EUI: {
      label: "Current EUI Value",
      field: "Energy_Use_Intensity",
      unit: "kWh/m²/yr",
      isSimpleNumeric: false,
      simpleKey: "≤",
    },
    ASE: {
      label: "Current Air Side Efficiency Value",
      field: "AIR_SIDE_EFFICIENCY",
      unit: "kW/RT",
      newKey: "New_≤",
      existingKey: "Existing_≤",
      simpleKey: "≤",
    },
    ETTV: {
      label: "Current ETTV Value",
      field: "ETTV_OR_RETV",
      unit: "W/m²",
      newKey: "NRBE01-1_ ≤",
      existingKey: "NRB01-1_ ≤",
      simpleKey: "≤",
      newConditionKey: "NRBE01-1",
      existingConditionKey: "NRB01-1",
      conditionField: "ETTV_Criteria",
    },
    ACMVTSE: {
      label: "Current ACMV TSE Value",
      field: "ACMV_TSE__OR__No_of_ticks",
      unit: "kW/RT",
      newKey: "New_≤",
      existingKey: "Existing_≤",
      simpleKey: "≤",
    },
  };

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [visibleSolutions, setVisibleSolutions] = useState({});

  // State for fullscreen section management
  const [fullscreenSection, setFullscreenSection] = useState(null);

  // State for section height adjustment
  const [detailsSectionHeight, setDetailsSectionHeight] = useState(60); // percentage

  // Replace the CSV loading with Google Sheets API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const spreadsheetId = "1ZTdEcpzw6yik9xUFJpNpWhETJwSnjDRk24YcVy4MSOw";
        const gid = "0"; // Replace with your actual sheet gid
        const data = await fetchSheetData(spreadsheetId, gid);

        console.log("Sheet Data loaded:", data);
        setCsvData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading sheet data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process unique values when data loads
  useEffect(() => {
    if (csvData.length > 0) {
      // Extract unique values for each field
      const extractUniqueValues = (field) =>
        [...new Set(csvData.map((item) => item[field]))].filter(Boolean);

      const newUniqueValues = {
        Types_of_building: extractUniqueValues("Types_of_building"),
        Pathway: extractUniqueValues("Pathway"),
        Does_the_design_have_DCS_OR_DDC_OR_CCS: extractUniqueValues(
          "Does_the_design_have_DCS_OR_DDC_OR_CCS"
        ),
      };

      setUniqueValues(newUniqueValues);

      // Set initial criteria values
      setCriteria((prev) => ({
        ...prev,
        Types_of_building: newUniqueValues.Types_of_building[0] || "",
        Pathway: newUniqueValues.Pathway[0] || "",
        Does_the_design_have_DCS_OR_DDC_OR_CCS:
          newUniqueValues.Does_the_design_have_DCS_OR_DDC_OR_CCS[0] || "",
      }));
    }
  }, [csvData]);

  // Update criteriaRef when criteria changes
  useEffect(() => {
    criteriaRef.current = criteria;
  }, [criteria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Dropdown changed: ${name} = ${value}`);
    setCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Continuous search function that runs whenever relevant criteria changes
  useEffect(() => {
    if (csvData != null && csvData.length > 0) {
      // Perform search with current criteria
      const performSearch = () => {
        const currentCriteria = criteriaRef.current;

        // Find all buildings that match the selected criteria
        const foundBuildings = csvData.filter(
          (item) =>
            item.Types_of_building === currentCriteria.Types_of_building &&
            item.Pathway === currentCriteria.Pathway &&
            item.Does_the_design_have_DCS_OR_DDC_OR_CCS ===
              currentCriteria.Does_the_design_have_DCS_OR_DDC_OR_CCS
        );

        console.log("Auto-updated search results:", foundBuildings);
        setSearchResults(foundBuildings);
      };

      // Run search immediately
      performSearch();

      // Optional: Set up an interval for continuous updates
      // (if you need to poll for external data changes)
      // const intervalId = setInterval(performSearch, 1000); // Update every second
      // return () => clearInterval(intervalId);
    }
  }, [
    csvData,
    // Only include the criteria properties that should trigger a new search
    criteria.Types_of_building,
    criteria.Pathway,
    criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS,
  ]);
  // Update slider ranges based on search results
  useEffect(() => {
    // Don't return early within hook bodies - this can cause hooks ordering issues
    if (searchResults && searchResults.length > 0) {
      const calculateRange = (values) => {
        const filteredValues = values.filter((v) => v !== null);
        if (filteredValues.length === 0) return { min: 1, max: 999 };

        const min = Math.max(1, Math.floor(Math.min(...filteredValues) * 0.8));
        const max = Math.ceil(Math.max(...filteredValues) * 1.2);
        return { min, max };
      };

      const newRanges = {};

      // Calculate ranges for all metrics
      Object.keys(metricConfig).forEach((metricType) => {
        const values = searchResults.map((building) =>
          parseMetricValue(building, metricType)
        );
        newRanges[metricType] = calculateRange(values);
        console.log("this is values ", values, metricType);
      });

      setSliderRanges(newRanges);
    }
  }, [searchResults, criteria.buildingStatus, criteria.ETTV_Criteria]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search criteria:", criteria);

    // Find all buildings that match the selected criteria regardless of Targeted_Greenmark_rating
    const foundBuildings = csvData.filter(
      (item) =>
        item.Types_of_building === criteria.Types_of_building &&
        item.Pathway === criteria.Pathway &&
        item.Does_the_design_have_DCS_OR_DDC_OR_CCS ===
          criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS
    );

    console.log("Search results:", foundBuildings);
    setSearchResults(foundBuildings);
    setShowResults(true);
    setActiveTab(0); // Reset to first tab
    setVisibleSolutions({}); // Reset visible solutions
  };

  const toggleSolutionVisibility = (solutionType) => {
    setVisibleSolutions((prev) => ({
      ...prev,
      [solutionType]: !prev[solutionType],
    }));
  };

  const toggleFullscreen = (section) => {
    if (fullscreenSection === section) {
      setFullscreenSection(null);
    } else {
      setFullscreenSection(section);
    }
  };

  const adjustSectionHeight = (e) => {
    const newHeight = Math.max(20, Math.min(80, parseInt(e.target.value, 10)));
    setDetailsSectionHeight(newHeight);
  };

  // Generalized function to parse values for any metric
  const parseMetricValue = (building, metricType) => {
    const config = metricConfig[metricType];
    const value = building[config.field];

    if (!value || value === "NA" || value === "Not Eligible") return "Not";
    //console.log("parsing metric value", value);
    // Handle simple numeric values (like EUI)
    if (config.isSimpleNumeric) {
      return parseFloat(value) || null;
    }
    if (metricType == "ASE") {
      console.log("ASE value", value);
    }
    // Handle conditional formats with @ separator
    if (value.includes("@")) {
      const parts = value.split("@");

      // For ETTV which uses a different condition field
      if (config.conditionField) {
        const conditionValue = criteria[config.conditionField];
        if (conditionValue === config.newConditionKey) {
          return (
            parseFloat(
              parts[0].replace(config.newKey, "").replace(config.unit, "")
            ) || null
          );
        } else {
          return (
            parseFloat(
              parts[1].replace(config.existingKey, "").replace(config.unit, "")
            ) || null
          );
        }
      }
      // For ASE and ACMVTSE which use buildingStatus
      else {
        if (criteria.buildingStatus === "New") {
          return (
            parseFloat(
              parts[0].replace(config.newKey, "").replace(config.unit, "")
            ) || null
          );
        } else {
          return (
            parseFloat(
              parts[1].replace(config.existingKey, "").replace(config.unit, "")
            ) || null
          );
        }
      }
    }
    // Handle simple format with ≤
    else if (value.includes(config.simpleKey)) {
      return (
        parseFloat(
          value.replace(config.simpleKey, "").replace(config.unit, "")
        ) || null
      );
    }

    return null;
  };

  // Function to format display values
  const getFormattedValue = (building, metricType) => {
    const config = metricConfig[metricType];
    const value = building[config.field];

    if (!value || value === "Not Eligible") return "Not Eligible";

    // Handle conditional formats with @ separator
    if (value.includes("@")) {
      const parts = value.split("@");

      // For ETTV which uses a different condition field
      if (config.conditionField) {
        const conditionValue = criteria[config.conditionField];
        return conditionValue === config.newConditionKey
          ? parts[0].replace(config.newKey.split("_")[0] + "_", "")
          : parts[1].replace(config.existingKey.split("_")[0] + "_", "");
      }
      // For ASE and ACMVTSE which use buildingStatus
      else {
        return criteria.buildingStatus === "New"
          ? parts[0].replace("New_", "")
          : parts[1].replace("Existing_", "");
      }
    }

    return value;
  };

  const getSolutionCategories = () => {
    return [
      {
        id: "eui",
        name: "EUI Solution",
        lowKey: "EUI_Solution_LOW_COST",
        avgKey: "EUI_Solution_AVG_COST",
        highKey: "EUI_Solution_HIGH_COST",
      },
      {
        id: "airside",
        name: "Air Side Efficiency Solution",
        lowKey: "Air_Side_Efficiency_Solution_LOW_COST",
        avgKey: "Air_Side_Efficiency_Solution_AVG_COST",
        highKey: "Air_Side_Efficiency_Solution_HIGH_COST",
      },
      {
        id: "ettv",
        name: "ETTV Solution",
        lowKey: "ETTV_Solution_LOW_COST",
        avgKey: "ETTV_Solution_AVG_COST",
        highKey: "ETTV_Solution_HIGH_COST",
      },
      {
        id: "acmv",
        name: "ACMV TSE Solutions",
        lowKey: "ACMV_TSE_Solutions_LOW_COST",
        avgKey: "ACMV_TSE_Solutions_AVG_COST",
        highKey: "ACMV_TSE_Solutions_HIGH_COST",
      },
      {
        id: "ventilation",
        name: "Rooms Receiving Natural Ventilation",
        lowKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_LOW_COST",
        avgKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_AVG_COST",
        highKey: "Rooms_Receiving_Natural_Ventilation_in_a_unit_HIGH_COST",
      },
      {
        id: "lighting",
        name: "Lighting Solution",
        lowKey: "Lighting_LOW_COST",
        avgKey: "Lighting_AVG_COST",
        highKey: "Lighting_HIGH_COST",
      },
    ];
  };

  // Helper function to extract the correct display value
  const getDisplayValue = (key, value, activeTab, criteria) => {
    //console.log("getDisplayValue called", { key, value, activeTab, criteria });
    // Only process custom splitting if activeTab is 1 or 3
    // if (activeTab !== 1 && activeTab !== 3) {
    //   return value;
    // }

    // For building details keys
    const buildingDetailKeys = [
      "AIR_SIDE_EFFICIENCY",
      "OCCUPANCY_RATE_FOR_EUI",
      "ACMV_TSE__OR__No_of_ticks",
    ];

    if (buildingDetailKeys.includes(key)) {
      // Example value: "New_≤ 0.8kW/RT@Existing_≤ 0.9kW/RT"
      console.log(`Processing key: ${key} with value: ${value}`);
      // Example value: "New_≤ 0.8kW/RT@Existing_≤ 0.9kW/RT"
      const parts = value.split("@");
      console.log("Split parts:", parts);
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.buildingStatus (e.g., "New" or "Existing")
        if (part.startsWith(criteria.buildingStatus)) {
          const underscoreIndex = part.indexOf("_");
          console.log("Found match for parts:", part, parts);
          if (underscoreIndex !== -1) {
            const result = part.substring(underscoreIndex + 1).trim();
            return result; // This should exit the entire function with the result
          }
        }
      }
    }

    // For the ETTV_OR_RETV key
    if (key === "ETTV_OR_RETV") {
      // Example value: "NRBE01-1_≤ 40W/m² @NRB01-1_≤ 45W/m²"
      const parts = value.split("@");
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.ETTV_Criteria (e.g., "NRBE01-1" or "NRB01-1")
        if (part.startsWith(criteria.ETTV_Criteria)) {
          const underscoreIndex = part.indexOf("_");
          if (underscoreIndex !== -1) {
            return part.substring(underscoreIndex + 1).trim();
          }
        }
      }
    }

    // Return original value if no conditions match
    return value;
  };

  if (loading) {
    return <div className="p-4 text-lg">Loading CSV data...</div>;
  }

  // JSX for fullscreen overlays
  const FullscreenOverlay = ({ title, children, onClose }) => (
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
      <div className="flex-grow overflow-auto p-6">{children}</div>
    </div>
  );

  // Handle slider changes
  const handleSliderChange = (e, type) => {
    const value = Number(e.target.value);
    setCriteria((prev) => ({
      ...prev,
      [`current${type}`]: value,
    }));
  };

  // Updated function to enforce number conversion and add debugging
  const getMarkerPosition = (value, min, max) => {
    // Convert values to numbers to ensure consistent math
    const numValue = parseFloat(value);
    const numMin = parseFloat(min);
    const numMax = parseFloat(max);

    console.log("Marker calculation:", {
      value: numValue,
      min: numMin,
      max: numMax,
      percentage: ((numValue - numMin) / (numMax - numMin)) * 100,
    });

    if (isNaN(numValue) || numValue === null) return -1;

    const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  // Function to render a slider with vertical markers
  const renderSlider = (metricType) => {
    const config = metricConfig[metricType];

    const allNotEligible =
      !config.isSimpleNumeric &&
      searchResults &&
      searchResults.length > 0 &&
      searchResults.every(
        (building) =>
          building[config.field] === "Not Eligible" ||
          building[config.field] === "NA"
      );
    console.log("checking render slider", allNotEligible, searchResults);

    if (allNotEligible) {
      return (
        <div className="mt-6">
          <label className="font-medium block mb-4">
            {config.label}: Not Eligible
          </label>
          <div className="p-4 border border-gray-300 rounded text-center">
            This metric is not eligible for the selected buildings
          </div>
        </div>
      );
    }
    // Component to be called during iteration
    const processBarSegment = (building, index, searchResults) => {
      const value = parseMetricValue(building, metricType);
      const position = getMarkerPosition(value, min, max);

      // We're not correctly setting the widths because we're just storing
      // the absolute positions, not calculating the relative widths
      return position;
    };

    let currentValue = criteria[`current${metricType}`];
    // Adjust the min and max values as per requirements
    // Adjust the min and max values as per requirements
    let min = 0; // Min will always be 0

    // Sort the buildings by metric value to ensure consistent color bands
    const sortedBuildings = searchResults
      ? [...searchResults].sort(
          (a, b) =>
            parseMetricValue(a, metricType) - parseMetricValue(b, metricType)
        )
      : [];

    // Get the highest value (index 2 or last value if fewer)
    let highestValue = 0;
    if (sortedBuildings.length > 0) {
      const index = Math.min(2, sortedBuildings.length - 1);
      highestValue = parseMetricValue(sortedBuildings[index], metricType);
    }

    // Set max to 10% above the highest value
    const max = highestValue * 1.1;

    // Calculate positions for the color bands
    let greenPosition = 0;
    let yellowPosition = 0;
    let redPosition = 0;
    let bluePosition = 100; // Default to full width

    if (sortedBuildings.length > 0) {
      if (sortedBuildings.length > 0) {
        greenPosition = getMarkerPosition(
          parseMetricValue(sortedBuildings[0], metricType),
          min,
          max
        );
      }

      if (sortedBuildings.length > 1) {
        yellowPosition = getMarkerPosition(
          parseMetricValue(sortedBuildings[1], metricType),
          min,
          max
        );
      }

      if (sortedBuildings.length > 2) {
        redPosition = getMarkerPosition(
          parseMetricValue(sortedBuildings[2], metricType),
          min,
          max
        );
      }

      // Blue ends at 100%
    }

    // Calculate actual widths
    const greenWidth = greenPosition;
    const yellowWidth = yellowPosition - greenPosition;
    const redWidth = redPosition - yellowPosition;
    const blueWidth = 100 - redPosition;

    // Get tooltip labels based on metricType
    const getTooltipLabels = () => {
      switch (metricType) {
        case "EUI":
          return {
            green: "GoldPlus",
            yellow: "Platinum",
            red: "SLE",
            blue: "Above SLE",
          };
        case "WPR":
          return {
            green: "Excellent",
            yellow: "Good",
            red: "Average",
            blue: "Below Average",
          };
        // Add more cases for other metricTypes
        default:
          return {
            green: "Best",
            yellow: "Better",
            red: "Good",
            blue: "Standard",
          };
      }
    };

    const tooltipLabels = getTooltipLabels();
    const checkCurrentValue = (value) => {
      return value == null || isNaN(value) ? max / 2 : value;
    };
    // Then in your render function, ensure consistently formatted values
    const sliderCurrentValue = checkCurrentValue(parseFloat(currentValue));

    return (
      <div className="mt-6">
        <label className="font-medium block mb-4">
          {config.label}: {currentValue}
          {config.unit && ` ${config.unit}`}
        </label>
        <div className="relative">
          {/* Min and max values display */}
          <div className="flex justify-between text-xs mt-1 px-1 pb-2">
            <span>
              Min: {min}
              {config.unit && ` ${config.unit}`}
            </span>
            <span>
              Max: {max.toFixed(3)}
              {config.unit && ` ${config.unit}`}
            </span>
          </div>
          <div className="relative" style={{ height: "2.5rem", width: "100%" }}>
            {/* Vertical line markers for building values */}
            {searchResults &&
              searchResults.map((building, index) => {
                const position = processBarSegment(building, index);
                console.log("checking marker position" + building + index);
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

            {/* Colored bar segments with tooltips */}
            <div
              className="absolute top-0 h-2.5 rounded-l-2xl bg-brown-500 hover:brightness-90 cursor-pointer transition-all"
              style={{ backgroundColor: "#CD7F32", color: "#000", width: `${greenWidth}%`, transition: "width 0.3s ease" }}
              onMouseEnter={() => setActiveTooltip("green")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {activeTooltip === "green" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                  {tooltipLabels.green}
                </div>
              )}
            </div>

            <div
              className="absolute top-0 h-2.5 hover:brightness-90 cursor-pointer transition-all"
              style={{
                backgroundColor: "#C0C0C0", 
                color: "#000", 
                left: `${greenWidth}%`,
                width: `${yellowWidth}%`,
                transition: "left 0.3s ease, width 0.3s ease",
              }}
              onMouseEnter={() => setActiveTooltip("yellow")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {activeTooltip === "yellow" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                  {tooltipLabels.yellow}
                </div>
              )}
            </div>

            <div
              className="absolute top-0 h-2.5 bg-red-500 hover:brightness-90 cursor-pointer transition-all"
              style={{
                backgroundColor: "#FFD700", 
                color: "#000", 
                left: `${greenWidth + yellowWidth}%`,
                width: `${redWidth}%`,
                transition: "left 0.3s ease, width 0.3s ease",
              }}
              onMouseEnter={() => setActiveTooltip("red")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {activeTooltip === "red" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                  {tooltipLabels.red}
                </div>
              )}
            </div>

            <div
              className="absolute top-0 h-2.5 rounded-r-2xl bg-blue-500 hover:brightness-90 cursor-pointer transition-all"
              style={{
                backgroundColor: "#54D6AC",
                left: `${greenWidth + yellowWidth + redWidth}%`,
                width: `${blueWidth}%`,
                transition: "left 0.3s ease, width 0.3s ease",
              }}
              onMouseEnter={() => setActiveTooltip("blue")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {activeTooltip === "blue" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded p-2 text-xs z-10 whitespace-nowrap">
                  {tooltipLabels.blue}
                </div>
              )}
            </div>

            {/* Range input with custom line selector */}
            <input
              type="range"
              min={min}
              max={max}
              step="1"
              value={sliderCurrentValue}
              onChange={(e) => handleSliderChange(e, metricType)}
              className="w-full h-2 mt-1 appearance-none bg-transparent cursor-pointer relative"
              style={{
                // Custom styling for the line selector
                "--thumb-appearance": "none",
                "--thumb-width": "4px",
                "--thumb-height": "16px",
                "--thumb-color": "black",
              }}
            />

            {/* Current value display */}
            <div
              className="absolute w-px h-8 bg-blue-700 pointer-events-none"
              style={{
                left: `${getMarkerPosition(sliderCurrentValue, min, max)}%`,
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

  return (
    <div className="container mx-auto p-4">
      {/* Search Form Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Building Search</h2>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Type */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Types of building:</label>
              <select
                name="Types_of_building"
                value={criteria.Types_of_building}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Types_of_building.map((option, idx) => (
                  <option key={`building-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Pathway */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Pathway:</label>
              <select
                name="Pathway"
                value={criteria.Pathway}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Pathway.map((option, idx) => (
                  <option key={`pathway-${idx}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* DCS/DDC/CCS */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">
                Does the design have DCS OR DDC OR CCS?:
              </label>
              <select
                name="Does_the_design_have_DCS_OR_DDC_OR_CCS"
                value={criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                {uniqueValues.Does_the_design_have_DCS_OR_DDC_OR_CCS.map(
                  (option, idx) => (
                    <option key={`dcs-${idx}`} value={option}>
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* New/Existing Building */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">Building Status:</label>
              <select
                name="buildingStatus"
                value={criteria.buildingStatus}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                <option value="New">New Building</option>
                <option value="Existing">Existing Building</option>
              </select>
            </div>
            {/* Class */}
            <div className="flex flex-col">
              <label className="font-medium mb-2">ETTV Criteria:</label>
              <select
                name="buildingStatus"
                value={criteria.ETTV_Criteria}
                onChange={handleChange}
                className="p-2 border rounded-md bg-white"
              >
                <option value="NRBE01-1">NRBE01-1</option>
                <option value="NRB01-1">NRB01-1</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {Object.keys(metricConfig).map((metricType) =>
              renderSlider(metricType)
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Panel - Equal height sections layout */}
      {showResults && searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Building Results</h2>

          {/* Tabs for buildings */}
          <div className="flex border-b mb-6 overflow-x-auto">
            {searchResults.map((building, index) => (
              <button
                key={`tab-${index}`}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === index
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(index)}
              >
                Building {index + 1}
                <span className="ml-2 text-sm">
                  ({building.Targeted_Greenmark_rating})
                </span>
              </button>
            ))}
          </div>

          {/* Main content area with 3D model and details */}
          {searchResults[activeTab] && (
            <>
              {/* Fullscreen overlays */}
              {fullscreenSection === "3d-model" && (
                <FullscreenOverlay
                  title="3D Model View"
                  onClose={() => toggleFullscreen(null)}
                >
                  <div className="h-full flex items-center justify-center bg-black">
                    <SmallModel />
                  </div>
                </FullscreenOverlay>
              )}

              {fullscreenSection === "building-details" && (
                <EnhancedBuildingDetailsFullscreen
                  title="Building Details"
                  onClose={() => toggleFullscreen(null)}
                  buildingData={searchResults[activeTab]}
                  activeTab={activeTab}
                  criteria={criteria}
                />
              )}

              {fullscreenSection === "solutions" && (
                <FullscreenOverlay
                  title="Solutions & EUI Values"
                  onClose={() => toggleFullscreen(null)}
                >
                  <div className="space-y-8">
                    {/* Main EUI bars */}
                    <div className="mb-8">
                      <h4 className="text-xl font-bold mb-4">EUI Values</h4>
                      <div className="relative">
                        <div className="h-8 w-full flex">
                          <div className="h-8 flex-1 bg-green-500"></div>
                          <div className="h-8 flex-1 bg-yellow-500"></div>
                          <div className="h-8 flex-1 bg-red-500"></div>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>115</span>
                          <span>120</span>
                          <span>145</span>
                        </div>
                      </div>
                    </div>

                    {/* Solution category bars with toggleable solutions */}
                    <div className="space-y-12">
                      {getSolutionCategories().map((category) => (
                        <div key={category.id} className="border-t pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold">
                              {category.name}
                            </h4>
                            <button
                              onClick={() =>
                                toggleSolutionVisibility(category.id)
                              }
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {visibleSolutions[category.id]
                                ? "Hide Solutions"
                                : "Show Solutions"}
                            </button>
                          </div>

                          {/* Category bar */}
                          <div className="relative mb-4">
                            <div className="h-8 w-full flex">
                              <div className="h-8 flex-1 bg-green-500"></div>
                              <div className="h-8 flex-1 bg-yellow-500"></div>
                              <div className="h-8 flex-1 bg-red-500"></div>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span>115</span>
                              <span>120</span>
                              <span>145</span>
                            </div>
                          </div>

                          {/* Togglable solutions */}
                          {visibleSolutions[category.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-6">
                              <div className="bg-green-100 p-4 rounded-md">
                                <h5 className="font-medium text-green-800 mb-3">
                                  Low Cost
                                </h5>
                                <p>
                                  {searchResults[activeTab][category.lowKey] ||
                                    "N/A"}
                                </p>
                              </div>

                              <div className="bg-yellow-100 p-4 rounded-md">
                                <h5 className="font-medium text-yellow-800 mb-3">
                                  Average Cost
                                </h5>
                                <p>
                                  {searchResults[activeTab][category.avgKey] ||
                                    "N/A"}
                                </p>
                              </div>

                              <div className="bg-red-100 p-4 rounded-md">
                                <h5 className="font-medium text-red-800 mb-3">
                                  High Cost
                                </h5>
                                <p>
                                  {searchResults[activeTab][category.highKey] ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </FullscreenOverlay>
              )}

              {/* Regular display (non-fullscreen) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-screen max-h-screen">
                {/* Left section - 3D Model (2/5 width) - Full height */}
                <div className="lg:col-span-2 bg-black relative flex flex-col">
                  <div className="flex justify-end p-2 bg-gray-800">
                    <button
                      onClick={() => toggleFullscreen("3d-model")}
                      className="text-white bg-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Fullscreen
                    </button>
                  </div>
                  <div className="flex-grow">
                    <SmallModel />
                  </div>
                </div>

                {/* Right section - Building details and bars (3/5 width) */}
                <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                  {/* Section height adjuster */}
                  <div className="mb-4 flex items-center">
                    <label className="text-sm mr-2">Adjust sections:</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={detailsSectionHeight}
                      onChange={adjustSectionHeight}
                      className="w-32"
                    />
                  </div>

                  {/* Top section - Building details (resizable, scrollable) */}
                  <div
                    className="bg-gray-100 p-4 rounded-lg mb-4 overflow-y-auto flex flex-col"
                    style={{ height: `${detailsSectionHeight}%` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Building Details</h3>
                      <button
                        onClick={() => toggleFullscreen("building-details")}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Fullscreen
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
                      {Object.entries(searchResults[activeTab])
                        .filter(
                          ([key]) =>
                            !key.includes("_LOW_COST") &&
                            !key.includes("_AVG_COST") &&
                            !key.includes("_HIGH_COST")
                        )
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex border-b border-gray-200 py-2"
                          >
                            <div className="font-medium w-1/2">
                              {key.replace(/_/g, " ")}:
                            </div>
                            <div className="w-1/2">
                              {getDisplayValue(key, value, activeTab, criteria)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Bottom section - EUI bars and solutions (resizable, scrollable) */}
                  <div
                    className="bg-gray-100 p-4 rounded-lg flex-grow overflow-y-auto"
                    style={{ height: `${100 - detailsSectionHeight}%` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">
                        Building Efficiency Solutions
                      </h3>
                      <button
                        onClick={() => toggleFullscreen("solutions")}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Fullscreen
                      </button>
                    </div>

                    {/* Solution category bars with toggleable solutions */}
                    <div className="space-y-4">
                      {getSolutionCategories().map((category) => (
                        <div key={category.id} className="border-t pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{category.name}</h4>
                            <button
                              onClick={() =>
                                toggleSolutionVisibility(category.id)
                              }
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            >
                              {visibleSolutions[category.id]
                                ? "Hide Solutions"
                                : "Show Solutions"}
                            </button>
                          </div>

                          {/* Category bar */}
                          <div className="relative mb-2">
                            <div className="h-6 w-full flex">
                              <div className="h-6 flex-1 rounded-l-2xl bg-green-500"></div>
                              <div className="h-6 flex-1 bg-yellow-500"></div>
                              <div className="h-6 flex-1 rounded-r-2xl bg-red-500"></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>115</span>
                              <span>120</span>
                              <span>145</span>
                            </div>
                          </div>

                          {/* Togglable solutions */}
                          {visibleSolutions[category.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 mb-4">
                              <div className="bg-green-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-green-800 mb-1">
                                  Low Cost
                                </h5>
                                <p className="overflow-y-auto max-h-32">
                                  {searchResults[activeTab][category.lowKey] ||
                                    "N/A"}
                                </p>
                              </div>

                              <div className="bg-yellow-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-yellow-800 mb-1">
                                  Average Cost
                                </h5>
                                <p className="overflow-y-auto max-h-32">
                                  {searchResults[activeTab][category.avgKey] ||
                                    "N/A"}
                                </p>
                              </div>

                              <div className="bg-red-100 p-2 rounded-md text-sm">
                                <h5 className="font-medium text-red-800 mb-1">
                                  High Cost
                                </h5>
                                <p className="overflow-y-auto max-h-32">
                                  {searchResults[activeTab][category.highKey] ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showResults && searchResults.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No buildings found
            </h3>
            <p className="text-gray-500">
              No buildings match your selected criteria. Please try different
              search parameters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvDataComponent;

// Main Scene component
export function SceneProps(props) {
  // State for visibility (similar to public bool IsUIVisible { get; set; })
  const [isUIVisible, setIsUIVisible] = useState(true);

  // Toggle method (similar to private void ToggleUIVisibility())
  const toggleUIVisibility = () => setIsUIVisible(!isUIVisible);

  return (
    <div className="relative h-screen w-full">
      {/* 3D Scene Canvas (Background) */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
          {/* 2. Set background to black */}
          <color attach="background" args={["#000000"]} />

          {/* 3. Add some lights */}
          <ambientLight intensity={0.3} />
          <directionalLight intensity={2} position={[1, 2, 3]} />

          {/* 4. Grid helper & stars */}
          {/* <gridHelper args={[10, 10]} position={[0, -1, 0]} /> */}
          <Stars count={500} />

          {/* 5. The rotating warehouse model */}
          <ModelSpin />

          {/* 6. OrbitControls for camera rotation */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <ControlTips />
      {/* Toggle Button (Always visible) */}
      <button
        onClick={toggleUIVisibility}
        className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
      >
        {isUIVisible ? (
          <EyeOff className="w-6 h-6" />
        ) : (
          <Eye className="w-6 h-6" />
        )}
      </button>

      {/* Overlay Content (Toggleable) */}
      {isUIVisible && (
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white/90 rounded-lg shadow-lg overflow-auto">
          <div className="p-6">
            <CsvDataComponent />
          </div>
        </div>
      )}
    </div>
  );
}

// Component that spins the Warehouse model
export function ModelSpin(props) {
  const fanRef = useRef();

  useFrame(() => {
    if (fanRef.current) {
      fanRef.current.rotation.z += 0.005;
    }
  });

  return <Warehouse ref={fanRef} {...props} />;
}

// Main Scene component
export function SmallModel(props) {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
      {/* 2. Set background to black */}
      <color attach="background" args={["#000000"]} />

      {/* 3. Add some lights */}
      <ambientLight intensity={0.3} />
      <directionalLight intensity={2} position={[1, 2, 3]} />

      {/* 4. Grid helper & stars */}
      {/* <gridHelper args={[10, 10]} position={[0, -1, 0]} /> */}
      <Stars count={500} />

      {/* 5. The rotating warehouse model */}
      <ModelSpin />
      {/* 6. OrbitControls for camera rotation */}
      <OrbitControls enablePan={false} enableZoom={true} target={[0, 0, 0]} />
    </Canvas>
  );
}
