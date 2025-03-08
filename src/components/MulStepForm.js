"use client"
import React, { useState } from 'react';
import { Box, Container, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';
import PersonalDetails from './PersonalDetails';
import NomineeDetails from './NomineeDetails'; // This will be implemented next
import PreviewForm from './PreviewForm'; // This will be implemented next
import AssetDistribution from './AssetDistribution';

const MulStepForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: null,
    nomineeDetails: null,
    assetDetails: null
    // Add more form sections as needed
  });

  // Navigate to the next step
const nextStep = () => {
    setActiveStep((prevActiveStep) => {
        console.log("prev step was " + prevActiveStep);
        return prevActiveStep + 1;
    });
};

  // Navigate to the previous step
  const prevStep = () => {
    setActiveStep((prevActiveStep) => {
        console.log("next step is " + prevActiveStep);
        return prevActiveStep - 1;
    });
  };

  // Update form data
  const updateFormData = (section, data) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: data
    }));
  };

  // Render the current step
  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <PersonalDetails 
            formData={formData} 
            nextStep={nextStep} 
            updateFormData={updateFormData} 
          />
        );
      case 2:
        return (
          <NomineeDetails 
            formData={formData} 
            nextStep={nextStep} 
            prevStep={prevStep}
            updateFormData={updateFormData} 
          />
        );
      // Add more cases for additional steps
      case 3:
        return(
        <AssetDistribution 
            formData={formData}
            nextStep={nextStep}
            prevStep={prevStep}
            updateFormData={updateFormData}
        />);
      case 4:
        return (
        <PreviewForm 
            formData={formData} 
            nextStep={nextStep} 
            prevStep={prevStep}
            updateFormData={updateFormData}
        />);
      
      default:
        return (
          <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
            <Typography variant="h5">Form Completed</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Thank you for submitting your information.
            </Typography>
            {/* You can display a summary of the form data here */}
          </Paper>
        );
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ width: '100%', mt: 4 }}>
        {renderStep()}
      </Box>
    </Container>
  );
};

export default MulStepForm;