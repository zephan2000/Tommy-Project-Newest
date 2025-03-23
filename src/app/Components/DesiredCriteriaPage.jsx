import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGreenmark } from "./GreenmarkContext";
import MetricBar from "./MetricBar";
import { Step } from "./GreenmarkApp"; // Import the Step component from GreenmarkApp
// Import the TimelineStep component
import TimelineStep from "./TimelineStep"; // Add this import
import Timeline from "./Timeline"; // Add this import
import StyledDropdown from "./StyledDropdown"; // Add this import

function DesiredCriteriaPage({ onNavigate, direction = "forward" }) {
  const {
    currentStep,
    setCurrentStep,
    metricConfig,
    criteria,
    handleSliderChange,
    isCurrentStepCompleted,
    goToNextStep,
    goToPreviousStep,
    loading,
    searchResults,
  } = useGreenmark();

  const [metricAvailability, setMetricAvailability] = useState({});

 // First, modify the useEffect hook that handles step setting to not override navigation
useEffect(() => {
  // Only set to step 6 when first mounting the component, not on every render
  if (currentStep < 6) {
    setCurrentStep(6);
  }
}, [setCurrentStep]); // Remove currentStep from dependencies

  // If step moves beyond 9, navigate to next page
  useEffect(() => {
    console.log(currentStep + "step");
    if (currentStep >= 9) {
      onNavigate("building-search");
    }
  }, [currentStep, onNavigate]);

  // Get current metric type based on step
  const getCurrentMetricType = () => {
    switch (currentStep) {
      case 6:
        return "EUI";
      case 7:
        return "ASE";
      case 8:
        return "ETTV";
      case 9:
        return "ACMVTSE";
      default:
        return "EUI";
    }
  };

  const metricType = getCurrentMetricType();
  const config = metricConfig[metricType];

  // Check if the current metric is available based on search results
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      // Check availability for each metric type
      const availability = {};

      Object.keys(metricConfig).forEach((type) => {
        const fieldName = metricConfig[type].field;
        const isNotAvailable = searchResults.every(
          (building) =>
            !building[fieldName] ||
            building[fieldName] === "Not Eligible" ||
            building[fieldName] === "NA"
        );

        availability[type] = !isNotAvailable;
      });

      setMetricAvailability(availability);
    }
  }, [searchResults, metricConfig]);

  // Check if current step's metric is available
  const isCurrentMetricAvailable = metricAvailability[metricType] !== false;

  // Allow moving to next step even if metric is not available
  const handleNextWithCheck = () => {
    if (!isCurrentMetricAvailable) {
      // If metric is not available, still proceed
      goToNextStep();
    } else if (criteria[`current${metricType}`]) {
      // If metric is available and has a value, proceed
      goToNextStep();
    } else {
    }
    // Otherwise, the button should be disabled
  };

  if (loading) {
    return <div className="p-8 text-center">Loading building data...</div>;
  }
  // Add these lines:
  const initialX = direction === "forward" ? "100%" : "-100%";
  const exitX = direction === "forward" ? "-100%" : "100%";

  return (
    <div className="page-container">
      <div className="page-content desired-criteria-page p-4 pt-12 max-w-6xl mx-auto overflow-auto">
      <h2 className="step-heading text-[#627E75] text-lg mb-6 pb-4 border-b border-gray-300 px-4">
        Set your desired efficiency values
      </h2>

      <div className="flex mt-8 px-4">
        {/* Left side with timeline */}
        <Timeline steps={[6, 7, 8, 9]} />

        {/* Right side - Content area */}
        <div className="w-3/5 pl-12">
          <div className="mb-8 text-[#627E75] text-sm">
            Step {currentStep}/9
          </div>

          <h1 className="text-2xl font-serif text-[#394843] mb-2">
            {config.title || `Select ${metricType} Value`}
          </h1>
          <p className="text-[#627E75] mb-8">
            {config.description || "This helps us calculate optimal solutions"}
          </p>

          {/* Show message if metric is not available */}
          {!isCurrentMetricAvailable ? (
            <div className="mb-12 p-4 bg-gray-100 border border-gray-300 rounded-md">
              <p className="text-gray-600">
                This metric is not applicable for your selected building
                criteria. You can proceed to the next step.
              </p>
            </div>
          ) : (
            /* Render metric bar for current step */
            <div className="mb-12">
              <MetricBar
                metricType={metricType}
                options={{
                  showSlider: true,
                  height: "2.5rem",
                  showVerticalMarkers: true,
                  showLabels: true,
                  showTooltips: true,
                }}
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              className="px-8 py-2 bg-gray-200 text-[#627E75] rounded-full font-medium"
              onClick={() => {
                if (currentStep > 6) {
                  goToPreviousStep();
                } else {
                  onNavigate("building-design"); // Go to previous page only if at first step
                }
              }}
            >
              {currentStep > 6 ? "Previous Step" : "Previous Page"}
            </button>
            <button
              className={`px-8 py-2 rounded-full font-medium ${
                isCurrentMetricAvailable && !criteria[`current${metricType}`]
                  ? "bg-gray-200 text-[#A4A8A2] cursor-not-allowed"
                  : "bg-[#32C685] text-white hover:bg-[#28A06A]"
              }`}
              onClick={handleNextWithCheck}
              disabled={
                isCurrentMetricAvailable && !criteria[`current${metricType}`]
              }
            >
              {currentStep === 9 ? "Search Buildings" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default DesiredCriteriaPage;
