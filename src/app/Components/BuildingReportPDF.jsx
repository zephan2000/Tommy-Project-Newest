import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Replace your Font registrations and styles with these:

// Remove all Font.register statements - we'll use built-in fonts

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'Helvetica', // Default font for the page
  },
  
  // Header styles with Times-Roman (serif font similar to Libre Baskerville)
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#394843',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
  
  projectName: {
    fontSize: 18,
    marginBottom: 20,
    color: '#32C685',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 25,
    color: '#394843',
    padding: 8,
    backgroundColor: '#F4F1ED',
    borderRadius: 4,
    fontFamily: 'Helvetica-Bold',
  },
  
  solutionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#32C685',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D9',
    fontFamily: 'Helvetica-Bold',
  },
  
  // Body text styles with Helvetica
  content: {
    fontSize: 12,
    marginBottom: 10,
    color: '#627E75',
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
  },
  
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D9',
    paddingVertical: 8,
  },
  
  label: {
    width: '40%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#394843',
    fontFamily: 'Helvetica-Bold',
  },
  
  value: {
    width: '60%',
    fontSize: 12,
    color: '#627E75',
    fontFamily: 'Helvetica',
  },
  
  userInputValue: {
    width: '60%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#394843',
    fontFamily: 'Helvetica-Bold',
  },
  
  solutionContent: {
    fontSize: 12,
    marginBottom: 20,
    color: '#627E75',
    lineHeight: 1.5,
    paddingLeft: 10,
    paddingBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E0D9',
    fontFamily: 'Helvetica',
  },
  
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D9',
    marginVertical: 15,
  },
  
  costCategoryHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#28A06A',
    fontFamily: 'Helvetica-Bold',
  },
  
  metricContainer: {
    marginVertical: 15,
  },
  
  metricRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  
  metricLabel: {
    width: '40%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#394843',
    fontFamily: 'Helvetica-Bold',
  },
  
  metricBar: {
    width: '50%',
    height: 16,
    backgroundColor: '#E8F4F0',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  metricFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#32C685',
  },
  
  metricValue: {
    width: '10%',
    fontSize: 11,
    color: '#394843',
    fontWeight: 'bold',
    paddingLeft: 5,
    textAlign: 'left',
    fontFamily: 'Helvetica-Bold',
  },
  
  userValueHighlight: {
    backgroundColor: '#E8F4F0',
    padding: 8,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#32C685',
  },
  
  userValueSection: {
    marginBottom: 20,
  },
  
  userValueHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#394843',
    fontFamily: 'Helvetica-Bold',
  },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#627E75',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#627E75',
    fontFamily: 'Helvetica',
  },
  
  ineligibleNote: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    fontFamily: 'Helvetica', // Try using Times-Italic instead
  },
  
  solutionSection: {
    marginBottom: 30, // Extra margin to ensure space between solution categories
  }
});

// Helper function to clean up field names
const formatFieldName = (key) => {
  // Convert underscore to spaces and capitalize each word
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/Eui/g, 'EUI')
    .replace(/Ettv/g, 'ETTV')
    .replace(/Acmv/g, 'ACMV')
    .replace(/Tse/g, 'TSE');
};

// Helper function adapted from BuildingSearchPage
const getDisplayValue = (key, value, criteria) => {
  // Hide building_Id field
  if (key === "Building_ID") return null;

  // Handle null or undefined values
  if (value === null || value === undefined) {
    return "N/A";
  }

  // Convert value to string to ensure we can work with it
  let stringValue = String(value);
  
  // Replace dollar signs with commas for better readability
  stringValue = stringValue.replace("$", ",");

  // For building details keys
  const buildingDetailKeys = [
    "AIR_SIDE_EFFICIENCY",
    "OCCUPANCY_RATE_FOR_EUI",
    "ACMV_TSE__OR__No_of_ticks",
  ];

  if (buildingDetailKeys.includes(key)) {
    const parts = stringValue.split("@");
    for (let part of parts) {
      part = part.trim();
      // Check if the part starts with the criteria.buildingStatus
      if (part.startsWith(criteria.buildingStatus)) {
        const underscoreIndex = part.indexOf("_");
        if (underscoreIndex !== -1) {
          return part.substring(underscoreIndex + 1).trim();
        }
      }
    }
  }

  // For the ETTV_OR_RETV key
  if (key === "ETTV_OR_RETV") {
    const parts = stringValue.split("@");
    for (let part of parts) {
      part = part.trim();
      // Check if the part starts with the criteria.ETTV_Criteria
      if (part.startsWith(criteria.ETTV_Criteria)) {
        const underscoreIndex = part.indexOf("_");
        if (underscoreIndex !== -1) {
          return part.substring(underscoreIndex + 1).trim();
        }
      }
    }
  }

  // Handle newlines in PDF context
  return stringValue.replace(/\\n/g, '\n');
};

// Determine if a solution category is eligible
const isCategoryEligible = (buildingData, category, criteria) => {
  if (!buildingData) return false;
  
  const metricValue = buildingData[
    category.id === "eui" ? "EUI" : 
    category.id === "airside" ? "AIR_SIDE_EFFICIENCY" : 
    category.id === "ettv" ? "ETTV_OR_RETV" : 
    "ACMV_TSE__OR__No_of_ticks"
  ];
  
  // If the field doesn't exist or has "Not Eligible" value, return false
  if (!metricValue || 
      getDisplayValue(category.id, metricValue, criteria) === "Not Eligible" ||
      getDisplayValue(category.id, metricValue, criteria) === "NA") {
    return false;
  }
  
  // Check if any solution exists
  return (
    buildingData[category.lowKey] || 
    buildingData[category.avgKey] || 
    buildingData[category.highKey]
  );
};

// Determine if a field is user input
const isUserInput = (key) => {
  const userInputFields = [
    'GROSS_FLOOR_AREA',
    'AIR_CONDITIONED_AREA',
    'BUILDING_HEIGHT',
    'BUILDING_TYPE',
    'NO_OF_FLOORS',
    'SITE_AREA',
    'COOLING_LOAD_DENSITY',
    'currentEUI',
    'currentETTV',
    'currentAirSide',
    'currentACMV'
  ];
  
  return userInputFields.some(field => 
    key.toLowerCase().includes(field.toLowerCase()));
};

const BuildingReportPDF = ({ projectName, buildingData, criteria }) => {
  const solutionCategories = [
    {
      id: "eui",
      name: "EUI Solutions",
      label: "Energy Usage Intensity",
      field: "EUI",
      unit: "kWh/m²/year",
      lowKey: "EUI_Solution_LOW_COST",
      avgKey: "EUI_Solution_AVG_COST",
      highKey: "EUI_Solution_HIGH_COST",
    },
    {
      id: "airside",
      name: "Air Side Efficiency Solutions",
      label: "Air Side Efficiency",
      field: "AIR_SIDE_EFFICIENCY",
      unit: "",
      lowKey: "Air_Side_Efficiency_Solution_LOW_COST",
      avgKey: "Air_Side_Efficiency_Solution_AVG_COST",
      highKey: "Air_Side_Efficiency_Solution_HIGH_COST",
    },
    {
      id: "ettv",
      name: "ETTV/RETV Solutions",
      label: "ETTV/RETV",
      field: "ETTV_OR_RETV",
      unit: "W/m²",
      lowKey: "ETTV_Solution_LOW_COST",
      avgKey: "ETTV_Solution_AVG_COST",
      highKey: "ETTV_Solution_HIGH_COST",
    },
    {
      id: "acmv",
      name: "ACMV TSE Solutions",
      label: "ACMV System Efficiency",
      field: "ACMV_TSE__OR__No_of_ticks",
      unit: "",
      lowKey: "ACMV_TSE_Solutions_LOW_COST",
      avgKey: "ACMV_TSE_Solutions_AVG_COST",
      highKey: "ACMV_TSE_Solutions_HIGH_COST",
    },
  ];

  // Group user input values to display them separately
  const userInputValues = {};
  const buildingDetailValues = {};

  if (buildingData) {
    Object.entries(buildingData)
      .filter(([key]) => 
        !key.includes("_LOW_COST") && 
        !key.includes("_AVG_COST") && 
        !key.includes("_HIGH_COST") &&
        key !== "Building_ID"
      )
      .forEach(([key, value]) => {
        if (isUserInput(key)) {
          userInputValues[key] = value;
        } else {
          buildingDetailValues[key] = value;
        }
      });
  }

  // Add current values from criteria to user inputs
  if (criteria) {
    if (criteria.currentEUI) userInputValues['currentEUI'] = criteria.currentEUI;
    if (criteria.currentETTV) userInputValues['currentETTV'] = criteria.currentETTV;
    if (criteria.currentAirSide) userInputValues['currentAirSide'] = criteria.currentAirSide;
    if (criteria.currentACMV) userInputValues['currentACMV'] = criteria.currentACMV;
  }

  const eligibleCategories = solutionCategories.filter(category => 
    isCategoryEligible(buildingData, category, criteria)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Greenmark Building Report</Text>
          <Text style={styles.projectName}>{projectName || "Building Analysis"}</Text>
          
          {/* User Input Values Section */}
          <Text style={styles.subHeader}>Your Building Specifications</Text>
          <View style={styles.userValueSection}>
            {Object.entries(userInputValues).map(([key, value], index) => (
              <View style={styles.row} key={`user-${index}`}>
                <Text style={styles.label}>{formatFieldName(key)}:</Text>
                <Text style={styles.userInputValue}>
                  {key.toLowerCase().includes('current') 
                    ? value 
                    : getDisplayValue(key, value, criteria)}
                  {key.toLowerCase().includes('eui') ? ' kWh/m²/year' : 
                   key.toLowerCase().includes('ettv') ? ' W/m²' : 
                   key.toLowerCase().includes('area') ? ' m²' : ''}
                </Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.subHeader}>Building Details</Text>
          {Object.entries(buildingDetailValues).map(([key, value], index) => {
            const displayValue = getDisplayValue(key, value, criteria);
            if (displayValue === null) return null;
            
            return (
              <View style={styles.row} key={`building-${index}`}>
                <Text style={styles.label}>{formatFieldName(key)}:</Text>
                <Text style={styles.value}>{displayValue}</Text>
              </View>
            );
          })}
          
          <Text style={styles.subHeader}>Performance Metrics</Text>
          <View style={styles.metricContainer}>
            {solutionCategories.map((category, index) => {
              const fieldValue = buildingData?.[category.field];
              const isEligible = fieldValue && 
                getDisplayValue(category.field, fieldValue, criteria) !== "Not Eligible" &&
                getDisplayValue(category.field, fieldValue, criteria) !== "NA";
                
              return (
                <View key={`metric-${index}`} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{category.label}:</Text>
                  {isEligible ? (
                    <>
                      <View style={styles.metricBar}>
                        <View style={{...styles.metricFill, width: '60%'}} />
                      </View>
                      <Text style={styles.metricValue}>
                        {getDisplayValue(category.field, fieldValue, criteria)} {category.unit}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.ineligibleNote}>Not eligible for this building</Text>
                  )}
                </View>
              );
            })}
          </View>
          
          <Text style={styles.subHeader}>Recommended Solutions</Text>
          
          {eligibleCategories.length > 0 ? (
            eligibleCategories.map((category, index) => (
              <View key={`solution-${index}`} style={styles.solutionSection}>
                <Text style={styles.solutionHeader}>{category.name}</Text>
                
                {buildingData[category.lowKey] && (
                  <>
                    <Text style={{...styles.costCategoryHeader, color: '#28A06A'}}>
                      Low Cost Solution (Less than 5 years ROI):
                    </Text>
                    <Text style={styles.solutionContent}>
                      {getDisplayValue(category.lowKey, buildingData[category.lowKey], criteria)}
                    </Text>
                  </>
                )}
                
                {buildingData[category.avgKey] && (
                  <>
                    <Text style={{...styles.costCategoryHeader, color: '#D9A50D'}}>
                      Average Cost Solution (Less than 10 years ROI):
                    </Text>
                    <Text style={styles.solutionContent}>
                      {getDisplayValue(category.avgKey, buildingData[category.avgKey], criteria)}
                    </Text>
                  </>
                )}
                
                {buildingData[category.highKey] && (
                  <>
                    <Text style={{...styles.costCategoryHeader, color: '#E06D44'}}>
                      High Cost Solution (Less than 20 years ROI):
                    </Text>
                    <Text style={styles.solutionContent}>
                      {getDisplayValue(category.highKey, buildingData[category.highKey], criteria)}
                    </Text>
                  </>
                )}
                
                {index < eligibleCategories.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.ineligibleNote}>
              No eligible solutions found for this building configuration.
            </Text>
          )}
        </View>
        
        <Text style={styles.footer}>Generated by Greenmark Certification Dashboard</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export default BuildingReportPDF;