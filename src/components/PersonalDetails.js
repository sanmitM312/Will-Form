"use client";
import React, { useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormHelperText,
  Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { differenceInYears, isAfter, isFuture, isPast } from 'date-fns';

// Validation schema for personal details with enhanced validations
const PersonalDetailsSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  name: Yup.string().required('Name is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .test('is-past', 'Date of birth cannot be in the future', function(value) {
      return value ? !isFuture(new Date(value)) : true;
    }),
  gender: Yup.string().required('Gender is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
  marriageDate: Yup.date().when(['maritalStatus', 'dateOfBirth'], {
    is: (maritalStatus, dateOfBirth) => maritalStatus === 'Married' && dateOfBirth,
    then: (schema) => schema
      .required('Marriage date is required')
      .test('is-after-birth', 'Marriage date must be after date of birth', function(value, context) {
        const { dateOfBirth } = context.parent;
        return value && dateOfBirth ? isAfter(new Date(value), new Date(dateOfBirth)) : true;
      })
      .test('is-past', 'Marriage date cannot be in the future', function(value) {
        return value ? !isFuture(new Date(value)) : true;
      }),
    otherwise: Yup.date().nullable(),
  }),
  religion: Yup.string().required('Religion is required'),
  nationality: Yup.string().required('Nationality is required'),
  occupation: Yup.string().required('Occupation is required'),
  residentialStatus: Yup.string().required('Residential status is required'),
  address: Yup.string().required('Address is required'),
  identificationDocument: Yup.string().required('Identification document is required'),
  identificationNumber: Yup.string()
    .required('Identification number is required')
    .when('identificationDocument', {
      is: 'PAN',
      then: (schema) => schema
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Should be like ABCDE1234F')
        .required('PAN number is required'),
      otherwise: (schema) => schema,
    })
    .when('identificationDocument', {
      is: 'AADHAAR',
      then: (schema) => schema
        .matches(/^[0-9]{12}$/, 'Invalid Aadhaar number. Should be 12 digits')
        .required('Aadhaar number is required'),
      otherwise: (schema) => schema,
    }),
});

const titleOptions = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const religionOptions = ['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Other'];
const occupationOptions = ['Service', 'Business', 'Professional', 'Self-employed', 'Retired', 'Homemaker', 'Student'];
const residentialStatusOptions = ['Resident (ROR)', 'NRI', 'Foreign National'];
const identificationDocumentOptions = ['AADHAAR', 'PAN', 'Passport', 'Driving License', 'Voter ID'];

const PersonalDetails = ({ formData, nextStep, updateFormData }) => {
  const handleSubmit = (values) => {
    updateFormData('personalDetails', values);
    nextStep();
  };

  const titleSelectRef = useRef(null);

  
  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  // Helper function to get placeholder text based on document type
  const getIdentificationPlaceholder = (docType) => {
    switch(docType) {
      case 'AADHAAR':
        return 'Enter 12 digit Aadhaar Number';
      case 'PAN':
        return 'Enter PAN in format ABCDE1234F';
      default:
        return 'Enter Your ID Number';
    }
  };

 // Use effect to focus on the title field when component mounts
 useEffect(() => {
  // Small timeout to ensure the component is fully rendered
  const timer = setTimeout(() => {
    if (titleSelectRef.current) {
      // For Material-UI Select, focus on the component
      titleSelectRef.current.focus();
    }
  }, 0);
  
  return () => clearTimeout(timer);
}, []); // Empty dependency array means this runs once on mount

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Personal Details
      </Typography>
      <Typography variant="subtitle2" mb={3}>
        Step 1 of 7: Fill up Personal Details
      </Typography>            
      <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={0}>
              {Array.from({ length: 4 }, (_, i) => (
                  <Step key={`step-${i}`}>
                      <StepLabel></StepLabel>
                  </Step>
              ))}
          </Stepper>
      </Box>
      <Divider sx={{ mt: 3, mb: 3 }} />
      <Typography variant="caption" color="text.secondary" mb={2} display="block">
        Note: * indicates mandatory field
      </Typography>

      <Formik
        initialValues={formData.personalDetails || {
          title: '',
          name: '',
          dateOfBirth: null,
          gender: '',
          maritalStatus: '',
          marriageDate: null,
          religion: '',
          nationality: 'Indian',
          occupation: '',
          residentialStatus: '',
          address: '',
          identificationDocument: '',
          identificationNumber: '',
        }}
        validationSchema={PersonalDetailsSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
          const age = calculateAge(values.dateOfBirth);
          const idPlaceholder = getIdentificationPlaceholder(values.identificationDocument);
          
          return (
            <Form>
              <Grid container spacing={3}>
                {/* Title */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.title && Boolean(errors.title)}>
                    <InputLabel id="title-label">Title*</InputLabel>
                    <Select
                      labelId="title-label"
                      id="title"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Title*"
                      inputRef={titleSelectRef}
                    >
                      {titleOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.title && errors.title && (
                      <FormHelperText>{errors.title}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Name*"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name ? errors.name : "Enter valid name"}
                    placeholder="Enter Your Full Name"
                  />
                </Grid>

                {/* Date of Birth */}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth*"
                      inputFormat="DD-MM-YYYY"
                      value={values.dateOfBirth}
                      onChange={(date) => setFieldValue('dateOfBirth', date)}
                      onBlur={handleBlur}
                      maxDate={new Date()} 
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          name="dateOfBirth"
                          error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                          helperText={touched.dateOfBirth && errors.dateOfBirth ? errors.dateOfBirth : "Enter date of birth (past dates only)"}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                                              
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    value={age !== null ? `${age} years` : ""}
                    InputProps={{
                      readOnly: true,
                      style: { backgroundColor: '#f5f5f5' }
                    }}
                    variant="outlined"
                    helperText="Automatically calculated from Date of Birth"
                  />
                </Grid>

                {/* Gender */}
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" error={touched.gender && Boolean(errors.gender)}>
                    <FormLabel component="legend">Gender*</FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="Male" control={<Radio />} label="Male" />
                      <FormControlLabel value="Female" control={<Radio />} label="Female" />
                      <FormControlLabel value="Others" control={<Radio />} label="Others" />
                    </RadioGroup>
                    {touched.gender && errors.gender && (
                      <FormHelperText>{errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Marital Status */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.maritalStatus && Boolean(errors.maritalStatus)}>
                    <InputLabel id="marital-status-label">Marital Status*</InputLabel>
                    <Select
                      labelId="marital-status-label"
                      id="maritalStatus"
                      name="maritalStatus"
                      value={values.maritalStatus}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Marital Status*"
                    >
                      {maritalStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.maritalStatus && errors.maritalStatus && (
                      <FormHelperText>{errors.maritalStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Marriage Date (conditional) */}
                {values.maritalStatus === 'Married' && (
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Marriage Date*"
                        inputFormat="DD-MM-YYYY"
                        value={values.marriageDate}
                        onChange={(date) => setFieldValue('marriageDate', date)}
                        minDate={values.dateOfBirth} // Must be after birth date
                        maxDate={new Date()} // Restrict to past dates only
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            name="marriageDate"
                            error={touched.marriageDate && Boolean(errors.marriageDate)}
                            helperText={touched.marriageDate && errors.marriageDate ? errors.marriageDate : "Select date of marriage (after birth date, before today)"}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                )}

                {/* Religion */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.religion && Boolean(errors.religion)}>
                    <InputLabel id="religion-label">Religion*</InputLabel>
                    <Select
                      labelId="religion-label"
                      id="religion"
                      name="religion"
                      value={values.religion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Religion*"
                    >
                      {religionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.religion && errors.religion && (
                      <FormHelperText>Please select a religion</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Nationality */}
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" error={touched.nationality && Boolean(errors.nationality)}>
                    <FormLabel component="legend">Nationality*</FormLabel>
                    <RadioGroup
                      row
                      name="nationality"
                      value={values.nationality}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="Indian" control={<Radio />} label="Indian" />
                      <FormControlLabel value="Foreign" control={<Radio />} label="Foreign" />
                    </RadioGroup>
                    {touched.nationality && errors.nationality && (
                      <FormHelperText>{errors.nationality}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Occupation */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.occupation && Boolean(errors.occupation)}>
                    <InputLabel id="occupation-label">Occupation*</InputLabel>
                    <Select
                      labelId="occupation-label"
                      id="occupation"
                      name="occupation"
                      value={values.occupation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Occupation*"
                    >
                      {occupationOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.occupation && errors.occupation && (
                      <FormHelperText>{errors.occupation}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Residential Status */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.residentialStatus && Boolean(errors.residentialStatus)}>
                    <InputLabel id="residential-status-label">Residential Status*</InputLabel>
                    <Select
                      labelId="residential-status-label"
                      id="residentialStatus"
                      name="residentialStatus"
                      value={values.residentialStatus}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Residential Status*"
                    >
                      {residentialStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.residentialStatus && errors.residentialStatus && (
                      <FormHelperText>{errors.residentialStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Address*"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address ? errors.address : "Enter valid address"}
                    placeholder="Enter Your Address"
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* Identification Document */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.identificationDocument && Boolean(errors.identificationDocument)}>
                    <InputLabel id="identification-document-label">Identification Document*</InputLabel>
                    <Select
                      labelId="identification-document-label"
                      id="identificationDocument"
                      name="identificationDocument"
                      value={values.identificationDocument}
                      onChange={(e) => {
                        // Reset identification number when document type changes
                        setFieldValue('identificationNumber', '');
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      label="Identification Document*"
                    >
                      {identificationDocumentOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.identificationDocument && errors.identificationDocument && (
                      <FormHelperText>{errors.identificationDocument}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Identification Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="identificationNumber"
                    name="identificationNumber"
                    label="Identification Number*"
                    value={values.identificationNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.identificationNumber && Boolean(errors.identificationNumber)}
                    helperText={touched.identificationNumber && errors.identificationNumber 
                      ? errors.identificationNumber 
                      : values.identificationDocument === 'PAN' 
                        ? "Enter valid PAN (e.g., ABCDE1234F)"
                        : values.identificationDocument === 'AADHAAR'
                          ? "Enter valid 12-digit Aadhaar number"
                          : "Enter valid ID number"}
                    placeholder={idPlaceholder}
                    inputProps={{
                      maxLength: values.identificationDocument === 'AADHAAR' ? 12 : 
                                values.identificationDocument === 'PAN' ? 10 : undefined
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  color="warning"
                  type="submit"
                >
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

export default PersonalDetails;