import { Fan } from "./Fan"; 
import { Warehouse } from "./Warehouse"; 
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { csvJSON } from "./BuildingTypeData"; // your CSV parsing function

// Custom hook to fetch CSV data and convert it into an array of objects
export function useCSVData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/assets/TommyProjSheet.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const jsonData = csvJSON(csvText);
        setData(jsonData);
      })
      .catch((error) => console.error("Error fetching CSV data:", error));
  }, []);

  return data;
}

// Component to render CSV data as an HTML table
export function ReturnDataArray() {
  const dataArray = useCSVData();

  if (!dataArray) {
    return <div>Loading CSV data...</div>;
  }

  const headers = [
    "BUILDINGID",
    "BUILDINGTYPE",
    "PATHWAY",
    "GOLD",
    "PLAT",
    "SLE",
    "FLOORS",
    "ISSOLARPANEL",
    "PATHWAY 1",
    "Pathway",
    "Targeted_Greenmark_rating",
    "Targeted_Greenmark_rating",
    "Targeted_Greenmark_rating",
    "Types_of_building"
  ];

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th
              key={idx}
              style={{
                border: '1px solid #ccc',
                padding: '8px',
                backgroundColor: '#f2f2f2'
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataArray.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((header, colIndex) => (
              <td
                key={colIndex}
                style={{ border: '1px solid #ccc', padding: '8px' }}
              >
                {item[header]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Component that spins the Warehouse model
export function ModelSpin(props) {
  const fanRef = useRef();
  
  useFrame(() => {
    if (fanRef.current) {
      fanRef.current.rotation.y += 0.005;
    }
  });
  
  return <Warehouse ref={fanRef} {...props} />;
}

// Main Scene component
export function SceneProps(props) {
  return (
    <div className="fixed inset-0">
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <directionalLight intensity={2} position={[1, 2, 3]} />
        <ModelSpin />
      </Canvas>
      {/* HTML Overlay */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <ReturnDataArray />
      </div>
    </div>
  );
}
