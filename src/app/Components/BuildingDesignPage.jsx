import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useGreenmark } from "./GreenmarkContext";
import { Step } from "./GreenmarkApp"; // Import the Step component from GreenmarkApp
// Import the TimelineStep component
import TimelineStep from "./TimelineStep"; // Add this import
import Timeline from './Timeline'; // Add this import 
import StyledDropdown from './StyledDropdown'; // Add this import 

function BuildingDesignPage({ onNavigate, direction = "forward" }) {
  const {
    currentStep,
    setCurrentStep,
    stepCriteriaMap,
    criteria,
    uniqueValues,
    handleCriteriaChange,
    isCurrentStepCompleted,
    goToNextStep,
    goToPreviousStep,
    loading,
  } = useGreenmark();


  // Get configuration for current step
  const currentStepConfig = stepCriteriaMap[currentStep] || {};
  const { field, title, description } = currentStepConfig;

  // Only show steps 1-5 on this page
  const isValidStep = currentStep >= 1 && currentStep <= 5;

  // If step moves beyond 5, navigate to next page
  useEffect(() => {
    if (currentStep > 5) {
      onNavigate("desired-criteria");
    }
  }, [currentStep, onNavigate]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    handleCriteriaChange(name, value);
  };

  const handleNextStep = () => {
    goToNextStep();
  };

  const renderInputForCurrentStep = () => {
    if (!isValidStep || loading) return null;

    // Get options for select field
    const options = uniqueValues[field] || [];

    return (
        <div className="mb-12">
          <StyledDropdown
            name={field}
            value={criteria[field] || ""}
            onChange={handleChange}
            options={options}
            title={title}
            placeholder={`Select ${title}`}
          />
        </div>
      );
    };

  if (loading) {
    return <div className="p-8 text-center">Loading building data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-content building-design-page p-4 pt-12 max-w-6xl mx-auto overflow-auto">
      <h2 className="step-heading text-[#627E75] text-lg mb-6 pb-4 border-b border-gray-300 px-4">
        Follow these steps to help us learn more about your building
      </h2>

      <div className="flex mt-8 px-4">
          {/* Left side with timeline */}
          <Timeline steps={[1, 2, 3, 4, 5]} />

{/* Right side - Content area */}
<div className="w-3/5 pl-12">
          <div className="mb-8 text-[#627E75] text-sm">
            Step {currentStep}/5
          </div>

          <h1 className="text-2xl font-serif text-[#394843] mb-2">
            {title || `Select Option for Step ${currentStep}`}
          </h1>
          <p className="text-[#627E75] mb-8">
            {description ||
              "This information helps us understand your building"}
          </p>

          {renderInputForCurrentStep()}

          <div className="flex justify-between">
            <button
              className="px-8 py-2 bg-gray-200 text-[#627E75] rounded-full font-medium"
              onClick={
                currentStep > 1 ? goToPreviousStep : () => onNavigate("home")
              }
            >
              {currentStep > 1 ? "Previous Step" : "Home"}
            </button>
            <button
              className={`px-8 py-2 rounded-full font-medium ${
                isCurrentStepCompleted()
                  ? "bg-[#32C685] text-white hover:bg-[#28A06A]"
                  : "bg-gray-200 text-[#A4A8A2] cursor-not-allowed"
              }`}
              onClick={handleNextStep}
              disabled={!isCurrentStepCompleted()}
            >
              {currentStep === 5 ? "Next Page" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

// Custom timeline step component that aligns with the vertical line
function StepWithCustomTimeline({ stepNumber }) {
  const { currentStep, stepCriteriaMap, criteria, stepsCompleted } =
    useGreenmark();
  const isActive = stepNumber === currentStep;
  const isCompleted = stepNumber < currentStep || stepsCompleted[stepNumber];

  const stepConfig = stepCriteriaMap[stepNumber] || {};
  const { title, description, field } = stepConfig;

  // Get the value for this step to display when completed
  const stepValue = field ? criteria[field] : "";

  return (
    <div
      className={`flex items-center mb-16 relative ${
        isActive ? "active" : isCompleted ? "completed" : "pending"
      }`}
    >
      {/* Text content - right aligned */}
      <div className="flex-grow text-right pr-4">
        <div
          className={`text-base ${
            isActive
              ? "text-[#627E75] font-medium"
              : isCompleted
              ? "text-[#32C685]"
              : "text-[#B5BEB6]"
          }`}
        >
          {title || `Step ${stepNumber}`}
          {isCompleted && stepValue && (
            <span className="ml-2 text-sm font-normal">({stepValue})</span>
          )}
        </div>
        <div
          className={`text-sm ${
            isActive ? "text-[#394843]" : "text-[#A4A8A2]"
          }`}
        >
          {description || "Complete this step"}
        </div>
      </div>

      {/* Circle with number - positioned to overlap the vertical line */}
      <div className="flex-shrink-0 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive
                ? "bg-[#32C685] text-white"
                : isCompleted
                ? "bg-[#32C685] text-white"
                : "bg-[#F4F1ED] text-[#B5BEB6]"
            }`}
          >
            {stepNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuildingDesignPage;
