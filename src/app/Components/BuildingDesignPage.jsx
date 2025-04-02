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
<div className="w-3/5 p-12">
          <div className="mb-2 text-[#627E75] text-sm">
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
          

          <div className="flex justify-end space-x-4 mt-8 px-4">
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
          <div>
            {currentStep === 2 && (
              <div className="mt-12 text-[#394843]">
                <h3 className="font-serif text-xl mb-4">Pathway 1:</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Energy Efficiency (EE) Performance-Based Approach</li>
                  <li>Focuses on improving overall building energy efficiency.</li>
                  <li>Requires compliance with Energy Use Intensity (EUI) benchmarks.</li>
                  <li>Encourages high-efficiency systems such as chillers, lighting, and ACMV.</li>
                  <li>Ideal for projects aiming for a direct and measurable reduction in energy consumption.</li>
                </ul>
                
                <h3 className="font-serif text-xl mb-4">Pathway 2:</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Prescriptive-Based Approach</li>
                  <li>Provides a checklist of specific energy-efficient design measures.</li>
                  <li>Includes requirements for External Thermal Transfer Value (ETTV), natural ventilation, and efficient ACMV systems.</li>
                  <li>Suitable for projects that may not meet EUI targets but can achieve sustainability through targeted design choices.</li>
                </ul>
                
                <h3 className="font-serif text-xl mb-4">Pathway 3:</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Outcome-Based Approach</li>
                  <li>Emphasizes real-world performance through measurement and verification.</li>
                  <li>Requires post-occupancy energy monitoring to ensure efficiency goals are met.</li>
                  <li>Allows for greater design flexibility as long as energy savings are proven.</li>
                  <li>Best for projects integrating innovative or non-standard energy efficiency solutions.</li>
                </ul>
              </div>
            )}
          </div>
     
        </div>
      </div>
    </div>
    </div>
  );
}


export default BuildingDesignPage;
