// Test file to help debug dropdown selection issues
// This file can be used to test the dropdown functionality

import React from 'react';
import { Select } from '@mantine/core';

// Test data
const TEST_SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Psychiatry',
  'Surgery'
];

const TEST_STATES = [
  'California',
  'New York',
  'Texas',
  'Florida',
  'Illinois'
];

// Simple test component to verify Select functionality
export const TestSelectComponent: React.FC = () => {
  const [selectedSpecialization, setSelectedSpecialization] = React.useState<string | null>(null);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Test Select Components</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <Select
          label="Test Specialization"
          placeholder="Select specialization"
          data={TEST_SPECIALIZATIONS}
          value={selectedSpecialization}
          onChange={(value) => {
            console.log('Test Specialization changed:', value);
            setSelectedSpecialization(value);
          }}
        />
        <p>Selected: {selectedSpecialization || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Select
          label="Test State"
          placeholder="Select state"
          data={TEST_STATES}
          value={selectedState}
          onChange={(value) => {
            console.log('Test State changed:', value);
            setSelectedState(value);
          }}
        />
        <p>Selected: {selectedState || 'None'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h4>Debugging Tips:</h4>
        <ul>
          <li>Open browser console to see onChange logs</li>
          <li>Check if dropdown opens when clicked</li>
          <li>Verify that clicking options updates the value</li>
          <li>Check for any CSS z-index issues</li>
          <li>Ensure no overlapping elements are blocking clicks</li>
        </ul>
      </div>
    </div>
  );
};

// Usage instructions
export const debuggingInstructions = `
To debug dropdown issues:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Try selecting options from dropdowns
4. Check for console logs showing onChange events
5. Look for any JavaScript errors
6. Check if dropdown options are visible and clickable
7. Verify that the Select component is receiving proper props

Common issues:
- Formik integration problems
- CSS z-index conflicts
- Overlapping elements
- Missing onChange handlers
- Incorrect data format
`; 