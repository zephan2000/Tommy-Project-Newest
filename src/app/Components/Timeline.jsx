import React from "react";
import TimelineStep from "./TimelineStep";

function Timeline({ steps }) {
  return (
    <div className="relative w-2/5 pr-6">
      <div className="relative h-full">
        <div className="relative h-full">
          {/* Vertical line */}
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-300 h-full"></div>
          
          {/* Timeline dots/steps */}
          <div className="relative">
            {steps.map(stepNum => (
              <TimelineStep key={stepNum} stepNumber={stepNum} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timeline;