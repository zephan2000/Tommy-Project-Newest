import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#394843',
    textAlign: 'center',
  },
  projectName: {
    fontSize: 16,
    marginBottom: 10,
    color: '#627E75',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#394843',
    padding: 5,
    backgroundColor: '#F4F1ED',
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    color: '#627E75',
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
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#627E75',
  },
  solutionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#394843',
  },
  costCategoryHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#28A06A',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 350,
    height: 200,
  },
  metricBar: {
    height: 20,
    backgroundColor: '#E8F4F0',
    marginVertical: 10,
    position: 'relative',
  },
  metricValue: {
    position: 'absolute',
    right: 10,
    top: 3,
    fontSize: 10,
    color: '#394843',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#627E75',
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#627E75',
  },
});

// Helper function to clean up field names
const formatFieldName = (key) => {
  return key.replace(/_/g, ' ');
};

// Helper function to handle special display values
const getDisplayValue = (key, value, criteria) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  let stringValue = String(value);
  stringValue = stringValue.replace("$", ",");
  
  // Handle special fields with @ notation
  if (key === "AIR_SIDE_EFFICIENCY" || 
      key === "OCCUPANCY_RATE_FOR_EUI" || 
      key === "ACMV_TSE__OR__No_of_ticks") {
    const parts = stringValue.split("@");
    for (let part of parts) {
      part = part.trim();
      if (part.startsWith(criteria.buildingStatus)) {
        const underscoreIndex = part.indexOf("_");
        if (underscoreIndex !== -1) {
          return part.substring(underscoreIndex + 1).trim();
        }
      }
    }
  }
  
  if (key === "ETTV_OR_RETV") {
    const parts = stringValue.split("@");
    for (let part of parts) {
      part = part.trim();
      if (part.startsWith(criteria.ETTV_Criteria)) {
        const underscoreIndex = part.indexOf("_");
        if (underscoreIndex !== -1) {
          return part.substring(underscoreIndex + 1).trim();
        }
      }
    }
  }
  
  return stringValue.replace(/\\n/g, '\n');
};

const BuildingReportPDF = ({ projectName, buildingData, criteria }) => {
  const solutionCategories = [
    {
      id: "eui",
      name: "EUI Solution",
      lowKey: "EUI_Solution_LOW_COST",
      avgKey: "EUI_Solution_AVG_COST",
      highKey: "EUI_Solution_HIGH_COST",
    },
    {
      id: "airside",
      name: "Air Side Efficiency Solution",
      lowKey: "Air_Side_Efficiency_Solution_LOW_COST",
      avgKey: "Air_Side_Efficiency_Solution_AVG_COST",
      highKey: "Air_Side_Efficiency_Solution_HIGH_COST",
    },
    {
      id: "ettv",
      name: "ETTV Solution",
      lowKey: "ETTV_Solution_LOW_COST",
      avgKey: "ETTV_Solution_AVG_COST",
      highKey: "ETTV_Solution_HIGH_COST",
    },
    {
      id: "acmv",
      name: "ACMV TSE Solutions",
      lowKey: "ACMV_TSE_Solutions_LOW_COST",
      avgKey: "ACMV_TSE_Solutions_AVG_COST",
      highKey: "ACMV_TSE_Solutions_HIGH_COST",
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Greenmark Building Report</Text>
          <Text style={styles.projectName}>{projectName}</Text>
          
          {/* Image Placeholder - In a real implementation, you'd use a capture of the 3D model */}
          <View style={styles.imageContainer}>
            <Text style={styles.content}>3D Building Model Visualization</Text>
          </View>
          
          <Text style={styles.subHeader}>Building Details</Text>
          
          {buildingData && Object.entries(buildingData)
            .filter(([key]) => 
              !key.includes("_LOW_COST") && 
              !key.includes("_AVG_COST") && 
              !key.includes("_HIGH_COST") &&
              key !== "building_Id"
            )
            .map(([key, value], index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.label}>{formatFieldName(key)}:</Text>
                <Text style={styles.value}>{getDisplayValue(key, value, criteria)}</Text>
              </View>
            ))
          }
          
          <Text style={styles.subHeader}>Efficiency Solutions</Text>
          
          {solutionCategories.map((category, index) => (
            <View key={index}>
              <Text style={styles.solutionHeader}>{category.name}</Text>
              
              {/* Metric bar representation - simplified for PDF */}
              <View style={styles.metricBar}>
                <Text style={styles.metricValue}>
                  {buildingData[category.id === "eui" ? "EUI" : 
                               category.id === "airside" ? "AIR_SIDE_EFFICIENCY" : 
                               category.id === "ettv" ? "ETTV_OR_RETV" : 
                               "ACMV_TSE__OR__No_of_ticks"] || "N/A"}
                </Text>
              </View>
              
              <Text style={{...styles.costCategoryHeader, color: '#28A06A'}}>Low Cost Solution:</Text>
              <Text style={styles.content}>
                {getDisplayValue(category.lowKey, buildingData[category.lowKey], criteria) || "N/A"}
              </Text>
              
              <Text style={{...styles.costCategoryHeader, color: '#D9A50D'}}>Average Cost Solution:</Text>
              <Text style={styles.content}>
                {getDisplayValue(category.avgKey, buildingData[category.avgKey], criteria) || "N/A"}
              </Text>
              
              <Text style={{...styles.costCategoryHeader, color: '#E06D44'}}>High Cost Solution:</Text>
              <Text style={styles.content}>
                {getDisplayValue(category.highKey, buildingData[category.highKey], criteria) || "N/A"}
              </Text>
            </View>
          ))}
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