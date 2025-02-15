// BuildingTypeData.jsx
import React, { useState, useEffect } from 'react';

// csvJSON function that converts CSV text to an array of objects (dictionary)
export function csvJSON(csv) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",").map(header => header.trim());
  const result = [];

  // Process each subsequent line.
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines.
    if (!lines[i].trim()) continue;
    const currentLine = lines[i].split(",").map(value => value.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = currentLine[index];
    });
    result.push(obj);
  }

  // Return the array of objects instead of a JSON string.
  return result;
}
