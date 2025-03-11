import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Define ItemTypes at the module level (outside of components)
const ItemTypes = {
  DRAGGABLE_ITEM: "draggable-item",
  FIELD: "field",
};

// Drop target component for the right panel
const DropTarget = ({ children, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.DRAGGABLE_ITEM,
    drop: (item) => {
      onDrop(item.field);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  return (
    <div 
      ref={drop} 
      className={`h-full w-full ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' : ''}`}
      style={{ minHeight: '100%' }}
    >
      {children}
    </div>
  );
};

// Helper function to extract the correct display value
const getDisplayValue = (key, value, activeTab, criteria) => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return "";
    }
  
    // Convert value to string to ensure we can work with it
    let stringValue = String(value);
  
    // For building details keys
    const buildingDetailKeys = [
      "AIR_SIDE_EFFICIENCY",
      "OCCUPANCY_RATE_FOR_EUI",
      "ACMV_TSE__OR__No_of_ticks",
    ];
  
    if (buildingDetailKeys.includes(key)) {
      // Example value: "New_≤ 0.8kW/RT@Existing_≤ 0.9kW/RT"
      console.log(`Processing key: ${key} with value: ${stringValue}`);
      // Example value: "New_≤ 0.8kW/RT@Existing_≤ 0.9kW/RT"
      const parts = stringValue.split("@");
      console.log("Split parts:", parts);
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.buildingStatus (e.g., "New" or "Existing")
        if (part.startsWith(criteria.buildingStatus)) {
          const underscoreIndex = part.indexOf("_");
          console.log("Found match for parts:", part, parts);
          if (underscoreIndex !== -1) {
            const result = part.substring(underscoreIndex + 1).trim();
            return formatNewLines(result); // Apply new line formatting to the result
          }
        }
      }
    }
  
    // For the ETTV_OR_RETV key
    if (key === "ETTV_OR_RETV") {
      // Example value: "NRBE01-1_≤ 40W/m² @NRB01-1_≤ 45W/m²"
      const parts = stringValue.split("@");
      for (let part of parts) {
        part = part.trim();
        // Check if the part starts with the criteria.ETTV_Criteria (e.g., "NRBE01-1" or "NRB01-1")
        if (part.startsWith(criteria.ETTV_Criteria)) {
          const underscoreIndex = part.indexOf("_");
          if (underscoreIndex !== -1) {
            const result = part.substring(underscoreIndex + 1).trim();
            return formatNewLines(result); // Apply new line formatting to the result
          }
        }
      }
    }
  
    // Apply new line formatting to the original value if no conditions match
    return formatNewLines(stringValue);
  };
  
  // Helper function to convert \n to React line breaks
  const formatNewLines = (text) => {
    if (!text) return text;
    
    // Split by \n and join with React line breaks
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



// Main wrapper component for the fullscreen building details
const EnhancedBuildingDetailsFullscreen = ({
  title,
  onClose,
  buildingData,
  activeTab,
  criteria,
}) => {
  // State for the ordered and organized data fields
  const [orderedFields, setOrderedFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [hoveredField, setHoveredField] = useState(null);
  const [isDraggingField, setIsDraggingField] = useState(null);

  // Initialize ordered fields from building data
  useEffect(() => {
    if (buildingData) {
      const fields = Object.entries(buildingData)
        .filter(
          ([key]) =>
            !key.includes("_LOW_COST") &&
            !key.includes("_AVG_COST") &&
            !key.includes("_HIGH_COST")
        )
        .map(([key, value], index) => ({
          id: key,
          key,
          value,
          order: index,
          hasOverflow: false,
        }));

      setOrderedFields(fields);
    }
  }, [buildingData]);

  // Check if fields have overflow content
  useEffect(() => {
    const checkOverflow = () => {
      const updatedFields = [...orderedFields];
      let hasChanges = false;

      updatedFields.forEach((field, index) => {
        const element = document.getElementById(`field-content-${field.id}`);
        if (element) {
          const hasOverflow =
            element.scrollHeight > element.clientHeight ||
            element.scrollWidth > element.clientWidth;

          if (hasOverflow !== field.hasOverflow) {
            updatedFields[index] = {
              ...updatedFields[index],
              hasOverflow,
            };
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setOrderedFields(updatedFields);
      }
    };

    // Run the check after a short delay to ensure DOM has updated
    const timer = setTimeout(checkOverflow, 200);
    return () => clearTimeout(timer);
  }, [orderedFields]);

  // Add a useEffect to handle resizing the divider
  useEffect(() => {
    const leftPanel = document.getElementById("left-panel");
    const rightPanel = document.getElementById("right-panel");
    const divider = document.getElementById("resizable-divider");

    if (!leftPanel || !rightPanel || !divider) return;

    let isResizing = false;
    let startX = 0;
    let initialLeftWidth = 0;

    const startResize = (e) => {
      isResizing = true;
      startX = e.clientX || e.touches?.[0]?.clientX;
      initialLeftWidth = leftPanel.offsetWidth;
      document.body.classList.add("cursor-col-resize");
      divider.classList.add("active");
    };

    const endResize = () => {
      isResizing = false;
      document.body.classList.remove("cursor-col-resize");
      divider.classList.remove("active");
    };

    const resize = (e) => {
      if (!isResizing) return;

      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const delta = clientX - startX;
      const containerWidth = divider.parentNode.offsetWidth;

      let newLeftWidth = initialLeftWidth + delta;

      // Set min and max constraints
      const minWidth = 200;
      const maxWidth = containerWidth - 200;

      newLeftWidth = Math.max(minWidth, Math.min(newLeftWidth, maxWidth));

      const leftPercentage = (newLeftWidth / containerWidth) * 100;

      leftPanel.style.width = `${leftPercentage}%`;
      rightPanel.style.width = `${100 - leftPercentage}%`;
    };

    divider.addEventListener("mousedown", startResize);
    divider.addEventListener("touchstart", startResize);

    document.addEventListener("mousemove", resize);
    document.addEventListener("touchmove", resize);

    document.addEventListener("mouseup", endResize);
    document.addEventListener("touchend", endResize);

    return () => {
      divider.removeEventListener("mousedown", startResize);
      divider.removeEventListener("touchstart", startResize);

      document.removeEventListener("mousemove", resize);
      document.removeEventListener("touchmove", resize);

      document.removeEventListener("mouseup", endResize);
      document.removeEventListener("touchend", endResize);
    };
  }, []);

  // Function to handle selecting a field
  const handleSelectField = (field) => {
    // Check if the field is already selected
    if (selectedFields.some((selectedField) => selectedField.id === field.id)) {
      // If it is, remove it
      setSelectedFields(
        selectedFields.filter((selectedField) => selectedField.id !== field.id)
      );
    } else {
      // If it's not, add it
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Function to handle field drop in the right panel
  const handleFieldDrop = (field) => {
    // Check if the field is already in selected fields to avoid duplicates
    if (
      !selectedFields.some((selectedField) => selectedField.id === field.id)
    ) {
      setSelectedFields([...selectedFields, field]);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white z-20">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Exit Fullscreen
        </button>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none z-10"></div>

      {/* Split panel layout with resizable divider */}
      <div className="flex-grow flex overflow-hidden position-relative">
        <DndProvider backend={HTML5Backend}>
          {/* Left panel - Grid of fields - Fixed at 2 columns */}
          <div
            className="w-1/2 p-4 overflow-auto resizable-panel"
            id="left-panel"
          >
            <div className="grid grid-cols-2 gap-4">
              {orderedFields.map((field, index) => (
                <DraggableField
                  key={field.id}
                  index={index}
                  field={field}
                  moveField={(dragIndex, hoverIndex) => {
                    const newFields = [...orderedFields];
                    const [movedField] = newFields.splice(dragIndex, 1);
                    newFields.splice(hoverIndex, 0, movedField);
                    
                    // Adjust the order property to maintain consistent ordering
                    newFields.forEach((field, index) => {
                      field.order = index;
                    });
                  
                    setOrderedFields(newFields);
                  }}
                  isSelected={selectedFields.some(
                    (selectedField) => selectedField.id === field.id
                  )}
                  onSelect={() => handleSelectField(field)}
                  buildingData={buildingData}
                  activeTab={activeTab}
                  criteria={criteria}
                  onHover={(isHovered) =>
                    setHoveredField(isHovered ? field.id : null)
                  }
                  isHovered={hoveredField === field.id}
                  isDragging={isDraggingField === field.id}
                  onDragStart={() => setIsDraggingField(field.id)}
                  onDragEnd={() => setIsDraggingField(null)}
                />
              ))}
            </div>
          </div>

          {/* Resizable divider */}
          <div
            id="resizable-divider"
            className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize h-full active:bg-blue-500"
          ></div>

          {/* Right panel - Always present but shows content only when fields are selected */}
          <div className="flex-1 p-4 overflow-auto" id="right-panel">
            <DropTarget onDrop={handleFieldDrop}>
              {selectedFields.length > 0 ? (
                selectedFields.map((field) => (
                  <div
                    key={field.id}
                    className="mb-6 p-4 border rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {field.key.replace(/_/g, " ")}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectField(field);
                        }}
                        className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        Close
                      </button>
                    </div>
                    <div className="detailed-view max-h-[calc(100vh-250px)]">
                      {getDisplayValue(
                        field.key,
                        field.value,
                        activeTab,
                        criteria
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="mb-3 text-2xl">👉</div>
                    Drag any box to read in detail
                  </div>
                </div>
              )}
            </DropTarget>
          </div>
        </DndProvider>
      </div>
    </div>
  );
};

// Draggable field component
const DraggableField = ({
  field,
  index,
  moveField,
  buildingData,
  activeTab,
  criteria,
  isSelected,
  onSelect,
  onHover,
  isHovered,
  isDragging,
  onDragStart,
  onDragEnd,
}) => {
    const ref = useRef(null);
    const dragRef = useRef(null);
    const dropRef = useRef(null);
    const panelDragRef = useRef(null);

  // Drag functionality for dragging to the right panel
  const [{ isDraggingToPanel }, dragToPanel] = useDrag({
    type: ItemTypes.DRAGGABLE_ITEM,
    item: () => {
      return { field };
    },
    collect: (monitor) => ({
      isDraggingToPanel: monitor.isDragging(),
    }),
    // End drag function to get drop result
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.dropped) {
        // Drop was successful - no need to do anything here
        // The handleFieldDrop function in the parent will handle it
      }
    },
  });

  // Drag functionality using React DnD for reordering within the left panel grid
  const [{ isDragging: dndIsDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      onDragStart();
      return { index };
    },
    end: () => {
      onDragEnd();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Prevent drag if clicking on buttons inside the card
    canDrag: (monitor) => {
      const targetElement = document.activeElement;
      return !(targetElement && targetElement.tagName === "BUTTON");
    },
  });

 const [, drop] = useDrop({
  accept: ItemTypes.FIELD,
  hover(item, monitor) {
    if (!ref.current) {
      return;
    }

    const dragIndex = item.index;
    const hoverIndex = index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ref.current.getBoundingClientRect();

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Calculate grid dimensions (assuming 2 columns)
    const gridColumns = 2;
    const dragRow = Math.floor(dragIndex / gridColumns);
    const hoverRow = Math.floor(hoverIndex / gridColumns);
    const dragCol = dragIndex % gridColumns;
    const hoverCol = hoverIndex % gridColumns;

    // Determine if we should move
    const shouldMove = 
      (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) ||
      (dragIndex > hoverIndex && hoverClientY < hoverMiddleY);

    if (shouldMove) {
      // Perform the move
      moveField(dragIndex, hoverIndex);

      // Mutate the item 
      item.index = hoverIndex;
    }
  },
});

  const connectDragRef = (el) => {
    dragRef.current = el;
    drag(el);
  };
  
  const connectDropRef = (el) => {
    dropRef.current = el;
    drop(el);
  };
  
  const connectPanelDragRef = (el) => {
    panelDragRef.current = el;
    dragToPanel(el);
  };
  
  // Use a callback ref to connect both references
  const combineRefs = (node) => {
    ref.current = node;
    if (node) {
      connectDropRef(node);
      connectDragRef(node);
      connectPanelDragRef(node);
    }
  };    
  // Define animation classes and styles
  const animationClass = dndIsDragging || isDragging || isDraggingToPanel ? "animate-wiggle" : "";
  const transitionClass = "transition-all duration-300 ease-in-out";
  const selectedClass = isSelected ? "ring-2 ring-blue-500" : "";

  return (
    <div
      ref={combineRefs}
      className={`transform ${transitionClass} ${animationClass}`}
      onClick={(e) => {
        // Only trigger select if not dragging
        if (!dndIsDragging && !isDragging && !isDraggingToPanel) {
          onSelect();
        }
      }}
    >
      <div
        className={`border rounded p-4 bg-white shadow-sm hover:shadow-md cursor-grab uniform-card ${transitionClass} ${selectedClass}`}
        style={{
          opacity: dndIsDragging || isDraggingToPanel ? 0.4 : 1,
          transform:
            dndIsDragging || isDragging || isDraggingToPanel
              ? "scale(1.05)"
              : "scale(1)",
          height: "150px",
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <div className="flex flex-col h-full">
          <div className="font-medium mb-2 text-blue-600">
            {field.key.replace(/_/g, " ")}
          </div>
          <div className="relative flex-grow overflow-hidden">
            <div
              id={`field-content-${field.id}`}
              className="truncate h-full line-clamp-4"
            >
              {getDisplayValue(field.key, field.value, activeTab, criteria)}
            </div>
            {field.hasOverflow && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}
          </div>
          {field.hasOverflow && (
            <div className="mt-2 text-xs text-gray-500">
              {isSelected ? "Viewing in detail" : "Click to view details"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBuildingDetailsFullscreen;