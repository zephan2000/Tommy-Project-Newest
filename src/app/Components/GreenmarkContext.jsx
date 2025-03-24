import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { fetchSheetData } from "./googleSheetService";

// Create the context
const GreenmarkContext = createContext();

// Custom hook to use the context
export const useGreenmark = () => useContext(GreenmarkContext);

// Provider component
export const GreenmarkProvider = ({ children }) => {
  // Data state
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueValues, setUniqueValues] = useState({
    Types_of_building: [],
    Pathway: [],
    Does_the_design_have_DCS_OR_DDC_OR_CCS: [],
    buildingStatus: ["New", "Existing"],
    ETTV_Criteria: ["NRBE01-1", "NRB01-1"],
  });

  // Search criteria state
  const [criteria, setCriteria] = useState({
    Types_of_building: "",
    Pathway: "",
    Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
    buildingStatus: "New",
    ETTV_Criteria: "NRBE01-1",
    currentEUI: "",
    currentASE: "",
    currentETTV: "",
    currentACMVTSE: "",
  });

  // Use a ref to keep track of current criteria for effect dependencies
  const criteriaRef = useRef(criteria);

  // Search results state
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Slider ranges state
  const [sliderRanges, setSliderRanges] = useState({
    EUI: { min: 0, max: 999 },
    ASE: { min: 0, max: 2 },
    ETTV: { min: 0, max: 999 },
    ACMVTSE: { min: 0, max: 2 },
  });

  // Navigation and UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(10); // Building type, Pathway, DCS, Building Status, ETTV Criteria, EUI, ASE, ETTV, ACMVTSE
  const [stepsCompleted, setStepsCompleted] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [visibleSolutions, setVisibleSolutions] = useState({});

  // Configuration for each metric
  const metricConfig = useMemo(
    () => ({
      EUI: {
        label: "Current EUI Value",
        field: "Energy_Use_Intensity",
        unit: "kWh/m²/yr",
        isSimpleNumeric: false,
        simpleKey: "≤",
        step: 6,
        title: "Energy Use Intensity",
        description: "To Track Energy Use Intensity",
      },
      ASE: {
        label: "Current Air Side Efficiency Value",
        field: "AIR_SIDE_EFFICIENCY",
        unit: "kW/RT",
        newKey: "New_≤",
        isSimpleNumeric: false,
        existingKey: "Existing_≤",
        simpleKey: "≤",
        step: 7,
        title: "Air Side Efficiency",
        description: "Measure of HVAC system efficiency",
      },
      ETTV: {
        label: "Current ETTV Value",
        field: "ETTV_OR_RETV",
        unit: "W/m²",
        newKey: "NRBE01-1_ ≤",
        existingKey: "NRB01-1_ ≤",
        simpleKey: "≤",
        isSimpleNumeric: false,
        newConditionKey: "NRBE01-1",
        existingConditionKey: "NRB01-1",
        conditionField: "ETTV_Criteria",
        step: 8,
        title: "ETTV Value",
        description: "Envelope Thermal Transfer Value",
      },
      ACMVTSE: {
        label: "Current ACMV TSE Value",
        field: "ACMV_TSE__OR__No_of_ticks",
        unit: "kW/RT",
        newKey: "New_≤",
        isSimpleNumeric: false,
        existingKey: "Existing_≤",
        simpleKey: "≤",
        step: 9,
        title: "ACMV TSE Value",
        description:
          "Air Conditioning & Mechanical Ventilation System Efficiency",
      },
    }),
    []
  );

  // Mapping of steps to criteria
  const stepCriteriaMap = {
    1: {
      field: "Types_of_building",
      title: "Building Type",
      description: "Select the type of your building",
    },
    2: {
      field: "Pathway",
      title: "Pathway",
      description: "Choose the certification pathway",
    },
    3: {
      field: "Does_the_design_have_DCS_OR_DDC_OR_CCS",
      title: "DCS/DDC/CCS",
      description: "Specify if your design has DCS, DDC or CCS",
    },
    4: {
      field: "buildingStatus",
      title: "Building Status",
      description: "Is this a new or existing building?",
    },
    5: {
      field: "ETTV_Criteria",
      title: "ETTV Criteria",
      description: "Select the appropriate ETTV criteria",
    },
    6: metricConfig.EUI,
    7: metricConfig.ASE,
    8: metricConfig.ETTV,
    9: metricConfig.ACMVTSE,
  };

  // Reset all search state
  const resetSearchState = () => {
    // Reset criteria to initial state
    setCriteria({
      Types_of_building: "",
      Pathway: "",
      Does_the_design_have_DCS_OR_DDC_OR_CCS: "",
      buildingStatus: "New",
      ETTV_Criteria: "NRBE01-1",
      currentEUI: "",
      currentASE: "",
      currentETTV: "",
      currentACMVTSE: "",
    });

    // Reset search results
    setSearchResults([]);

    // Reset steps completed
    setStepsCompleted({});

    // Reset active tab
    setActiveTab(0);

    // Reset visible solutions
    setVisibleSolutions({});

    // Reset show results flag
    setShowResults(false);
  };
  // Generalized function to parse values for any metric
  const parseMetricValue = useCallback(
    (building, metricType) => {
      const config = metricConfig[metricType];
      const value = building[config.field];

      if (!value || value === "NA" || value === "Not Eligible") return null;

      // Handle simple numeric values
      if (config.isSimpleNumeric) {
        return parseFloat(value) || null;
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
                parts[1]
                  .replace(config.existingKey, "")
                  .replace(config.unit, "")
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
                parts[1]
                  .replace(config.existingKey, "")
                  .replace(config.unit, "")
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
    },
    [metricConfig, criteria]
  ); // Add dependencies

  // Load data from Google Sheets
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

      // Use functional update pattern to avoid dependency on uniqueValues
      setUniqueValues((prevValues) => ({
        ...prevValues, // This preserves existing values like buildingStatus and ETTV_Criteria
        Types_of_building: extractUniqueValues("Types_of_building"),
        Pathway: extractUniqueValues("Pathway"),
        Does_the_design_have_DCS_OR_DDC_OR_CCS: extractUniqueValues(
          "Does_the_design_have_DCS_OR_DDC_OR_CCS"
        ),
      }));
    }
  }, [csvData]);

  // Update criteriaRef when criteria changes
  useEffect(() => {
    criteriaRef.current = criteria;
  }, [criteria]);

  // Continuous search function
  useEffect(() => {
    if (csvData && csvData.length > 0) {
      // Perform search with current criteria
      const currentCriteria = criteriaRef.current;

      // Find all buildings that match the selected criteria
      const foundBuildings = csvData.filter(
        (item) =>
          (currentCriteria.Types_of_building === "" ||
            item.Types_of_building === currentCriteria.Types_of_building) &&
          (currentCriteria.Pathway === "" ||
            item.Pathway === currentCriteria.Pathway) &&
          (currentCriteria.Does_the_design_have_DCS_OR_DDC_OR_CCS === "" ||
            item.Does_the_design_have_DCS_OR_DDC_OR_CCS ===
              currentCriteria.Does_the_design_have_DCS_OR_DDC_OR_CCS)
      );

      console.log("Auto-updated search results:", foundBuildings);
      setSearchResults(foundBuildings);
    }
  }, [
    csvData,
    criteria.Types_of_building,
    criteria.Pathway,
    criteria.Does_the_design_have_DCS_OR_DDC_OR_CCS,
  ]);

  // Update slider ranges based on search results
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      const calculateRange = (values) => {
        const filteredValues = values.filter((v) => v !== null);
        if (filteredValues.length === 0) return { min: 1, max: 999 };

        const min = Math.max(1, Math.floor(Math.min(...filteredValues) * 0.8));
        const max = Math.ceil(Math.max(...filteredValues) * 1.2);
        return { min, max };
      };

      // Use a functional update to avoid dependency on sliderRanges
      setSliderRanges((prevRanges) => {
        const newRanges = {};

        // Calculate ranges for all metrics
        Object.keys(metricConfig).forEach((metricType) => {
          const values = searchResults.map((building) =>
            parseMetricValue(building, metricType)
          );
          newRanges[metricType] = calculateRange(values);
        });

        // Check if anything changed
        const hasChanged = Object.keys(newRanges).some(
          (key) =>
            !prevRanges[key] ||
            newRanges[key].min !== prevRanges[key].min ||
            newRanges[key].max !== prevRanges[key].max
        );

        // Only update if something changed
        return hasChanged ? newRanges : prevRanges;
      });
    }
  }, [
    searchResults,
    criteria.buildingStatus,
    criteria.ETTV_Criteria,
    metricConfig,
    parseMetricValue,
  ]);

  // Function to get marker position for sliders
  const getMarkerPosition = (value, min, max) => {
    // Convert values to numbers to ensure consistent math
    const numValue = parseFloat(value);
    const numMin = parseFloat(min);
    const numMax = parseFloat(max);

    if (isNaN(numValue) || numValue === null) return -1;

    const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;
    return Math.max(0, Math.min(100, percentage));
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

  // Handle criteria changes
  const handleCriteriaChange = (field, value) => {
    setCriteria((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Mark this step as completed
    const stepNumber = Object.entries(stepCriteriaMap).find(
      ([_, config]) => config.field === field
    )?.[0];
    if (stepNumber) {
      setStepsCompleted((prev) => ({
        ...prev,
        [stepNumber]: true,
      }));
    }
  };

  // Move to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to previous step
  const goToPreviousStep = () => {
    if (currentStep > 9) {
      setCurrentStep(9);
    } else if (currentStep > 6) {
      setCurrentStep(5);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step is completed
  const isCurrentStepCompleted = () => {
    const config = stepCriteriaMap[currentStep];
    if (!config) return false;

    const field = config.field;
    return !!criteria[field]; // Return true if the value is not empty
  };

  // Handle slider changes
  const handleSliderChange = (value, metricType) => {
    setCriteria((prev) => ({
      ...prev,
      [`current${metricType}`]: value,
    }));

    // Mark this step as completed
    const stepNumber = metricConfig[metricType]?.step;
    if (stepNumber) {
      setStepsCompleted((prev) => ({
        ...prev,
        [stepNumber]: true,
      }));
    }
  };

  // Export all the values and functions
  const value = {
    // Data
    csvData,
    loading,
    uniqueValues,
    criteria,
    searchResults,
    showResults,
    sliderRanges,
    metricConfig,
    stepCriteriaMap,

    // Navigation state
    currentStep,
    totalSteps,
    stepsCompleted,
    activeTab,
    visibleSolutions,

    // Functions
    setCriteria,
    setCurrentStep,
    setActiveTab,
    setVisibleSolutions,
    setShowResults,
    setSearchResults,
    setStepsCompleted,
    handleCriteriaChange,
    goToNextStep,
    goToPreviousStep,
    isCurrentStepCompleted,
    parseMetricValue,
    getMarkerPosition,
    getFormattedValue,
    handleSliderChange,
    resetSearchState,
  };

  return (
    <GreenmarkContext.Provider value={value}>
      {children}
    </GreenmarkContext.Provider>
  );
};

export default GreenmarkContext;
