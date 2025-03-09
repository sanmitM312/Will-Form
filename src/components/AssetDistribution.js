"use client";
import React, { useState, useEffect } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormHelperText,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Validation schema for asset distribution
const AssetDistributionSchema = Yup.object().shape({
  assetTypes: Yup.object().shape({
    deposits: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Asset name is required'),
        allocations: Yup.array().of(
          Yup.object().shape({
            nomineeId: Yup.string().required('Nominee is required'),
            share: Yup.number()
              .required('Share percentage is required')
              .min(1, 'Share must be at least 1%')
              .max(100, 'Share cannot exceed 100%')
          })
        ).test(
          'sum-equals-100',
          'Total allocation must be less than or equal to 100%',
          function(allocations) {
            if (!allocations || allocations.length === 0) return true;
            const sum = allocations.reduce((sum, allocation) => sum + (parseFloat(allocation.share) || 0), 0);
            return Math.round(sum) <= 100 && Math.round(sum) >= 1;
          }
        )
      })
    )
  })
});

const assetTypes = [
  { id: 'deposits', label: 'Deposits' },
];

const AssetDistribution = ({ formData, nextStep, prevStep, updateFormData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [nominees, setNominees] = useState([]);

  // Initialize nominees from formData when component mounts
  useEffect(() => {
    console.log("formData", JSON.stringify(formData, null, 2));
    if (formData.nomineeDetails && formData.nomineeDetails.nominees) {
      setNominees(formData.nomineeDetails.nominees.map((nominee, index) => ({
        id: `nominee-${index}`,
        name: nominee.name,
        relation: nominee.relation,
        // Track which assets this nominee has been allocated to
        allocatedTo: []
      })));
    }
  }, [formData.nomineeDetails]);

  // Generate initial values for Formik based on formData
  const generateInitialValues = () => {
    const initialAssetTypes = {};
    
    assetTypes.forEach(type => {
      initialAssetTypes[type.id] = formData.assetDistribution && 
        formData.assetDistribution.assetTypes && 
        formData.assetDistribution.assetTypes[type.id] ? 
        formData.assetDistribution.assetTypes[type.id] : [];
    });
    
    return {
      assetTypes: initialAssetTypes
    };
  };

  // Handle submission while preserving form data
  const handleSubmit = (values) => {
    updateFormData('assetDistribution', values);
    nextStep();
  };

  // Handle going back while preserving form data
  const handlePrevStep = (values) => {
    updateFormData('assetDistribution', values);
    prevStep();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate total allocation for an asset
  const calculateTotalAllocation = (allocations) => {
    if (!allocations || !allocations.length) return 0;
    return allocations.reduce((sum, allocation) => sum + (parseFloat(allocation.share) || 0), 0);
  };

  // Check if a nominee is already allocated to a specific asset
  const isNomineeAllocatedToAsset = (assetTypeId, assetIndex, nomineeId, values) => {
    const assetAllocations = values.assetTypes[assetTypeId][assetIndex].allocations || [];
    return assetAllocations.some(allocation => allocation.nomineeId === nomineeId);
  };

  // Get available nominees for a specific asset
  const getAvailableNomineesForAsset = (assetTypeId, assetIndex, values) => {
    // Get the allocations for this specific asset
    const currentAssetAllocations = values.assetTypes[assetTypeId][assetIndex].allocations || [];
    
    // Get IDs of nominees already allocated to this asset
    const allocatedNomineeIds = currentAssetAllocations.map(allocation => allocation.nomineeId);
    
    // Return nominees that aren't already allocated to this asset
    return nominees.filter(nominee => !allocatedNomineeIds.includes(nominee.id));
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Asset Distribution
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={3}>
        Step 3 of 7: Fill up Asset Distribution
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={2}>
          {Array.from({ length: 4 }, (_, i) => (
            <Step key={`step-${i}`}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {assetTypes.map((type, index) => (
          <Tab key={type.id} label={type.label} id={`asset-tab-${index}`} />
        ))}
      </Tabs>
      
      <Formik
        initialValues={generateInitialValues()}
        validationSchema={AssetDistributionSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikSubmit }) => {
          const currentAssetType = assetTypes[activeTab];
          const currentAssetValues = values.assetTypes[currentAssetType.id] || [];

          
          return (
            <Form>
              <div role="tabpanel" id={`asset-tabpanel-${activeTab}`}>
                <Typography variant="h6" gutterBottom>
                  {currentAssetType.label}
                </Typography>
                
                {nominees.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Please add nominees in the previous step before allocating assets.
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Total share cannot exceed 100% for each asset.
                    </Typography>
                    
                    <FieldArray name={`assetTypes.${currentAssetType.id}`}>
                      {({ push, remove }) => (
                        <Box>
                          {currentAssetValues.map((asset, assetIndex) => {
                            const assetPrefix = `assetTypes.${currentAssetType.id}[${assetIndex}]`;
                            const totalAllocation = calculateTotalAllocation(asset.allocations);
                            const isAllocationComplete = Math.round(totalAllocation) === 100;
                            
                            return (
                              <Card key={assetIndex} variant="outlined" sx={{ mb: 3, position: 'relative' }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1">{`${currentAssetType.label} ${assetIndex + 1}`}</Typography>
                                    <IconButton
                                      aria-label="delete asset"
                                      onClick={() => remove(assetIndex)}
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                  
                                  <TextField
                                    fullWidth
                                    id={`${assetPrefix}.name`}
                                    name={`${assetPrefix}.name`}
                                    label="Asset Name"
                                    value={asset.name || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    margin="normal"
                                    error={touched.assetTypes?.[currentAssetType.id]?.[assetIndex]?.name && Boolean(errors.assetTypes?.[currentAssetType.id]?.[assetIndex]?.name)}
                                    helperText={touched.assetTypes?.[currentAssetType.id]?.[assetIndex]?.name && errors.assetTypes?.[currentAssetType.id]?.[assetIndex]?.name}
                                  />
                                  
                                  <TextField
                                    fullWidth
                                    id={`${assetPrefix}.description`}
                                    name={`${assetPrefix}.description`}
                                    label="Description (Optional)"
                                    value={asset.description || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                  />
                                  
                                  <Typography variant="subtitle2" mt={2} mb={1}>
                                    Nominee Allocations
                                  </Typography>
                                  {errors.assetTypes?.[currentAssetType.id]?.[assetIndex]?.allocations && (
                                          <FormHelperText error sx={{ mt: 1 }}>
                                            {typeof errors.assetTypes[currentAssetType.id][assetIndex].allocations === 'string' 
                                              ? errors.assetTypes[currentAssetType.id][assetIndex].allocations 
                                              : ''}
                                          </FormHelperText>
                                    )}
                                  
                                  <FieldArray name={`${assetPrefix}.allocations`}>
                                    {({ push: pushAllocation, remove: removeAllocation }) => (
                                      <Box>
                                        {(asset.allocations || []).map((allocation, allocationIndex) => {
                                          const allocationPrefix = `${assetPrefix}.allocations[${allocationIndex}]`;
                                          const allocationErrors = 
                                            errors.assetTypes?.[currentAssetType.id]?.[assetIndex]?.allocations?.[allocationIndex];
                                          const allocationTouched = 
                                            touched.assetTypes?.[currentAssetType.id]?.[assetIndex]?.allocations?.[allocationIndex];
                                          
                                          return (
                                            <Grid container spacing={2} key={allocationIndex} alignItems="center">
                                              <Grid item xs={12} sm={5}>
                                                <FormControl 
                                                  fullWidth 
                                                  margin="normal"
                                                  error={allocationTouched?.nomineeId && Boolean(allocationErrors?.nomineeId)}
                                                >
                                                  <InputLabel id={`${allocationPrefix}-nominee-label`}>Nominee</InputLabel>
                                                  <Select
                                                    labelId={`${allocationPrefix}-nominee-label`}
                                                    id={`${allocationPrefix}.nomineeId`}
                                                    name={`${allocationPrefix}.nomineeId`}
                                                    value={allocation.nomineeId || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    label="Nominee"
                                                  >
                                                    {/* Only show nominees not already allocated to this asset */}
                                                    {nominees
                                                      .filter(nominee => 
                                                        allocation.nomineeId === nominee.id || 
                                                        !isNomineeAllocatedToAsset(currentAssetType.id, assetIndex, nominee.id, values)
                                                      )
                                                      .map((nominee) => (
                                                        <MenuItem key={nominee.id} value={nominee.id}>
                                                          {nominee.name} {(nominee.id)}
                                                        </MenuItem>
                                                      ))
                                                    }
                                                  </Select>
                                                  {allocationTouched?.nomineeId && allocationErrors?.nomineeId && (
                                                    <FormHelperText>{allocationErrors.nomineeId}</FormHelperText>
                                                  )}
                                                </FormControl>
                                              </Grid>
                                              
                                              <Grid item xs={12} sm={5}>
                                                <TextField
                                                  fullWidth
                                                  id={`${allocationPrefix}.share`}
                                                  name={`${allocationPrefix}.share`}
                                                  label="Share (%)"
                                                  type="number"
                                                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                                                  value={allocation.share || ''}
                                                  onChange={handleChange}
                                                  onBlur={handleBlur}
                                                  error={allocationTouched?.share && Boolean(allocationErrors?.share)}
                                                  helperText={allocationTouched?.share && allocationErrors?.share}
                                                  margin="normal"
                                                />
                                              </Grid>
                                              
                                              <Grid item xs={12} sm={2}>
                                                <IconButton
                                                  aria-label="remove allocation"
                                                  onClick={() => removeAllocation(allocationIndex)}
                                                  color="error"
                                                  size="small"
                                                  sx={{ mt: 2 }}
                                                >
                                                  <DeleteIcon />
                                                </IconButton>
                                              </Grid>
                                            </Grid>
                                          );
                                        })}
                                        
                                        <Button
                                          variant="outlined"
                                          color="warning"
                                          startIcon={<AddIcon />}
                                          onClick={() => pushAllocation({ nomineeId: '', share: '' })}
                                          sx={{ mt: 2 }}
                                          disabled={isAllocationComplete || getAvailableNomineesForAsset(currentAssetType.id, assetIndex, values).length === 0}
                                        >
                                          Add Nominee Allocation
                                        </Button>
                                        
                        
                                      </Box>
                                    )}
                                  </FieldArray>
                                </CardContent>
                              </Card>
                            );
                          })}
                          
                          <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<AddIcon />}
                            onClick={() => push({ name: '', description: '', allocations: [] })}
                            sx={{ mt: 2 }}
                          >
                            Add {currentAssetType.label} Asset
                          </Button>
                        </Box>
                      )}
                    </FieldArray>
                  </Box>
                )}
              </div>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button 
                  variant="contained" 
                  onClick={() => {handlePrevStep(values);}}
                  color='warning'
                >
                  Back
                </Button>
                <Button variant="contained" color="warning" type="submit">
                  Next
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default AssetDistribution;