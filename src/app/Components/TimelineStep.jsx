import React from "react";
import { useGreenmark } from "./GreenmarkContext";

function TimelineStep({ stepNumber }) {
  const { currentStep, stepCriteriaMap, criteria, stepsCompleted } =
    useGreenmark();
  const isActive = stepNumber === currentStep;
  const isCompleted = stepNumber < currentStep || stepsCompleted[stepNumber];

  const stepConfig = stepCriteriaMap[stepNumber] || {};
  const { title, description, field } = stepConfig;

  // Get the value for this step to display when completed
  const stepValue = field ? criteria[field] : "";

  return (
    <div className="flex items-stretch mb-10 relative">
      {/* Align Icon - right aligned */}
      <div className="w-full flex flex-row mr-14">
        {/* Text content - right aligned */}
        <div className="w-full flex flex-col items-end mr-6">
          <div className="flex items-center">
            <div
              className={`text-l text-[#394843] font-medium text-right ${
                !isActive && !isCompleted && "text-[#B5BEB6]"
              }`}
            >
              {title || `Step ${stepNumber}`}
            </div>
               {/* Add larger icon next to step text */}
        {isActive && (
          <div className="ml-3 h-full aspect-square rounded-full bg-[#32C685] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </div>
        )}
          </div>

          <p
            className={`text-xl mt-1 text-[#627E75] text-right font-bold ${
              !isActive && !isCompleted && "text-[#A4A8A2]"
            }`}
          >
            {description || "Complete this step"}
          </p>
        </div>
     
      </div>
      {/* Circle indicator - on the right side of the timeline */}
      <div
        className={`absolute w-10 h-10 rounded-full z-10 flex items-center justify-center right-0 transform translate-x-1/2 ${
          isActive
            ? "bg-[#32C684]"
            : isCompleted
            ? "bg-[#32C684]"
            : "bg-[#F4F1ED]"
        }`}
      >
        <span
          className={`text-lg font-medium ${
            isActive || isCompleted ? "text-white" : "text-[#B5BEB6]"
          }`}
        >
          {stepNumber}
        </span>
      </div>
    </div>
  );
}

export default TimelineStep;
