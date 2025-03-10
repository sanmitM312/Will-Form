import React, { useEffect, useRef, useState } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { differenceInYears, isAfter, isFuture, isValid } from 'date-fns';

// Validation schema for a single nominee
const NomineeSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  name: Yup.string().required('Name is required'),
  relation: Yup.string().required('Relation is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .test('dob-future', 'Date of birth cannot be in the future', function(value) {
      return value ? !isFuture(new Date(value)) : true;
    }),
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
  gender: Yup.string().required('Gender is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
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

// Validation schema for nominee details (array of nominees)
const NomineeDetailsSchema = Yup.object().shape({
  nominees: Yup.array().of(NomineeSchema).min(1, 'At least one nominee is required'),
});

const titleOptions = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
const relationOptions = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const religionOptions = ['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Other'];
const occupationOptions = ['Service', 'Business', 'Professional', 'Self-employed', 'Retired', 'Homemaker', 'Student', 'Photographer', 'Other'];
const residentialStatusOptions = ['Resident (ROR)', 'NRI', 'Foreign National'];
const identificationDocumentOptions = ['AADHAAR', 'PAN', 'Passport', 'Driving License', 'Voter ID'];

// Function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth || !isValid(new Date(dateOfBirth))) return null;
  return differenceInYears(new Date(), new Date(dateOfBirth));
};

 // Use effect to focus on the title field when component mounts
 // Empty dependency array means this runs once on mount

const NomineeDetails = ({ formData, nextStep, prevStep, updateFormData }) => {

  const titleSelectRef = useRef(null);
  
  // Default empty nominee
  const emptyNominee = {
    title: '',
    name: '',
    relation: '',
    dateOfBirth: null,
    marriageDate: null,
    gender: '',
    maritalStatus: '',
    religion: '',
    nationality: 'Indian',
    occupation: '',
    residentialStatus: '',
    address: '',
    identificationDocument: '',
    identificationNumber: '',
  };

  const handleSubmit = (values) => {
    updateFormData('nomineeDetails', values);
    nextStep();
  };

  useEffect(() => {
    // Small timeout to ensure the component is fully rendered
    const timer = setTimeout(() => {
      if (titleSelectRef.current) {
        // For Material-UI Select, focus on the component
        titleSelectRef.current.focus();
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);


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
  function findAndRemoveNomineeWithConfirmation(data, id) {
    if (!data?.assetDistribution?.assetTypes){
      alert(`No asset types found in data. Nominee "${id}" was removed.`);
      return true;
    }
    const assetTypes = data.assetDistribution.assetTypes;
    const nomineeExists = Object.values(assetTypes).flat().some(asset => asset.allocations?.some(allocation => allocation.nomineeId === id));
    const foundNominee = nomineeExists ? formData.nomineeDetails.nominees.find((_, i) => `nominee-${i}` === id) : null;
    const nomineeName = foundNominee ? foundNominee.name : null;
    const assetName = nomineeExists ? Object.values(assetTypes).flat().find(asset => asset.allocations?.some(allocation => allocation.nomineeId === id))?.name : null;
    // console.log("nomineeExists", nomineeExists);
    if (nomineeExists) {
      
      const confirmation = confirm(`Nominee "${nomineeName}" found to be allocated to asset ${assetName} . Do you want to remove this nominee from all allocations?`);
      console.log("confirmation", confirmation);
      if (confirmation) {
        for (const category in assetTypes) {
          assetTypes[category]?.forEach(asset => {
          asset.allocations = asset.allocations?.filter(allocation => allocation.nomineeId !== id);
          });
      }
      alert(`Nominee "${nomineeName}" has been removed from all allocations.`);
      return true;
      } else {
      alert(`Nominee "${nomineeName}"was not removed.`);
      return false; 
      }
    } else {
      return true;
    }
  }
  
  const handleDelete = (index, remove) => {
    const result = findAndRemoveNomineeWithConfirmation(formData, `nominee-${index}`);
    if(result === true){
      remove(index);
      const updatedNominees = formData.nomineeDetails?.nominees?.filter((_, i) => i !== index) || [];
      updateFormData('nomineeDetails', { nominees: updatedNominees.length ? updatedNominees : [emptyNominee] });
    }
  };
  const [nomineeCount, setNomineeCount] = useState(formData.nomineeDetails?.nominees?.length || 0);

  useEffect(() => {
    setNomineeCount(formData.nomineeDetails?.nominees?.length || 0);
  }, [formData.nomineeDetails?.nominees]);

  useEffect(() => {
    if (nomineeCount === 0) {
      setNomineeCount(1);
    }
  }, [nomineeCount]);

  useEffect(() => {
    console.log("formData", JSON.stringify(formData, null, 2));
  }, [formData]);
  
  return (
    <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Nominee Details
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={3}>
        Step 2 of 7: Fill up Nominee Details
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={1}>
          {Array.from({ length: 4 }, (_, i) => (
            <Step key={`step-${i}`}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
  
      <Typography variant="caption" color="text.secondary" mb={2} display="block">
        Note: * indicates mandatory field
      </Typography>
    
      <Formik
        initialValues={formData.nomineeDetails || {
          nominees: [emptyNominee]
        }}
        validationSchema={NomineeDetailsSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <FieldArray name="nominees">
              {({ remove, push }) => {
                return (
                  <div>
                  <Button
                    variant="text"
                    color="warning"
                    startIcon={<AddIcon />}
                    onClick={() => push(emptyNominee)}
                    sx={{ mt: 2 }}
                  >
                    Add Nominee
                  </Button>
                  <Divider sx={{ mt: 2, mb: 4 }} />

                  {values.nominees.map((nominee, index) => {
                    const nomineePrefix = `nominees[${index}]`;
                    const nomineeErrors = (errors.nominees && errors.nominees[index]) || {};
                    const nomineeTouched = (touched.nominees && touched.nominees[index]) || {};
                    const age = calculateAge(nominee.dateOfBirth);
                    const idPlaceholder = getIdentificationPlaceholder(nominee.identificationDocument);

                    
                    return (
                    <Card key={index} variant="outlined" sx={{ mb: 4, position: 'relative' }}>
                      <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Nominee {index + 1}</Typography>
                        {values.nominees.length && (
                        <IconButton
                          aria-label="delete nominee"
                          onClick={() => handleDelete(index, remove)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                        )}
                      </Box>

                      <Grid container spacing={3}>
                        {/* Title */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.title && Boolean(nomineeErrors.title)}>
                          <InputLabel id={`${nomineePrefix}-title-label`}>Title*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-title-label`}
                          id={`${nomineePrefix}.title`}
                          name={`${nomineePrefix}.title`}
                          value={nominee.title}
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
                          {nomineeTouched.title && nomineeErrors.title && (
                          <FormHelperText>{nomineeErrors.title}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Name */}
                        <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id={`${nomineePrefix}.name`}
                          name={`${nomineePrefix}.name`}
                          label="Name*"
                          value={nominee.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={nomineeTouched.name && Boolean(nomineeErrors.name)}
                          helperText={nomineeTouched.name && nomineeErrors.name ? nomineeErrors.name : "Enter valid name"} />
                        </Grid>

                        {/* Relation */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.relation && Boolean(nomineeErrors.relation)}>
                          <InputLabel id={`${nomineePrefix}-relation-label`}>Relation*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-relation-label`}
                          id={`${nomineePrefix}.relation`}
                          name={`${nomineePrefix}.relation`}
                          value={nominee.relation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Relation*"
                          >
                          {relationOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                            {option}
                            </MenuItem>
                          ))}
                          </Select>
                          {nomineeTouched.relation && nomineeErrors.relation && (
                          <FormHelperText>{nomineeErrors.relation}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" error={nomineeTouched.gender && Boolean(nomineeErrors.gender)}>
                          <FormLabel component="legend">Gender*</FormLabel>
                          <RadioGroup
                          row
                          name={`${nomineePrefix}.gender`}
                          value={nominee.gender}
                          onChange={handleChange}
                          >
                          <FormControlLabel value="Male" control={<Radio />} label="Male" />
                          <FormControlLabel value="Female" control={<Radio />} label="Female" />
                          <FormControlLabel value="Others" control={<Radio />} label="Others" />
                          </RadioGroup>
                          {nomineeTouched.gender && nomineeErrors.gender && (
                          <FormHelperText>{nomineeErrors.gender}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Date of Birth and Age */}
                        <Grid item xs={12} sm={6}>
                        <Box sx={{ position: 'relative' }}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Date of Birth*"
                            inputFormat="DD-MM-YYYY"
                            value={nominee.dateOfBirth}
                            onChange={(date) => setFieldValue(`${nomineePrefix}.dateOfBirth`, date)}
                            renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              name={`${nomineePrefix}.dateOfBirth`}
                              error={nomineeTouched.dateOfBirth && Boolean(nomineeErrors.dateOfBirth)}
                              helperText={nomineeTouched.dateOfBirth && nomineeErrors.dateOfBirth ? nomineeErrors.dateOfBirth : "Date must not be in the future"} />
                            )} />
                          </LocalizationProvider>
                        </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Age"
                          value={age !== null ? `${age} years` : ""}
                          InputProps={{
                          readOnly: true,
                          style: { backgroundColor: '#f5f5f5' },
                          }}
                          variant="outlined"
                        />
                        </Grid>

                        {/* Marital Status */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.maritalStatus && Boolean(nomineeErrors.maritalStatus)}>
                          <InputLabel id={`${nomineePrefix}-marital-status-label`}>Marital Status*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-marital-status-label`}
                          id={`${nomineePrefix}.maritalStatus`}
                          name={`${nomineePrefix}.maritalStatus`}
                          value={nominee.maritalStatus}
                          onChange={(e) => {
                            // If the marital status is not "Married", clear marriage date
                            if (e.target.value !== "Married") {
                            setFieldValue(`${nomineePrefix}.marriageDate`, null);
                            }
                            handleChange(e);
                          }}
                          onBlur={handleBlur}
                          label="Marital Status*"
                          >
                          {maritalStatusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                            {option}
                            </MenuItem>
                          ))}
                          </Select>
                          {nomineeTouched.maritalStatus && nomineeErrors.maritalStatus && (
                          <FormHelperText>{nomineeErrors.maritalStatus}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Marriage Date (only visible if marital status is "Married") */}
                        {nominee.maritalStatus === "Married" && (
                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Marriage Date"
                            inputFormat="DD-MM-YYYY"
                            value={nominee.marriageDate}
                            onChange={(date) => setFieldValue(`${nomineePrefix}.marriageDate`, date)}
                            minDate={nominee.dateOfBirth} // Must be after birth date
                            maxDate={new Date()} // Restrict to past dates only
                            renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              name={`${nomineePrefix}.marriageDate`}
                              error={nomineeTouched.marriageDate && Boolean(nomineeErrors.marriageDate)}
                              helperText={nomineeTouched.marriageDate && nomineeErrors.marriageDate ? 
                              nomineeErrors.marriageDate : 
                              "Date must be after birth date and not in the future"} />
                            )} />
                          </LocalizationProvider>
                        </Grid>
                        )}

                        {/* Religion */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.religion && Boolean(nomineeErrors.religion)}>
                          <InputLabel id={`${nomineePrefix}-religion-label`}>Religion*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-religion-label`}
                          id={`${nomineePrefix}.religion`}
                          name={`${nomineePrefix}.religion`}
                          value={nominee.religion}
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
                          {nomineeTouched.religion && nomineeErrors.religion && (
                          <FormHelperText>{nomineeErrors.religion}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Nationality */}
                        <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" error={nomineeTouched.nationality && Boolean(nomineeErrors.nationality)}>
                          <FormLabel component="legend">Nationality*</FormLabel>
                          <RadioGroup
                          row
                          name={`${nomineePrefix}.nationality`}
                          value={nominee.nationality}
                          onChange={handleChange}
                          >
                          <FormControlLabel value="Indian" control={<Radio />} label="Indian" />
                          <FormControlLabel value="Foreign" control={<Radio />} label="Foreign" />
                          </RadioGroup>
                          {nomineeTouched.nationality && nomineeErrors.nationality && (
                          <FormHelperText>{nomineeErrors.nationality}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Occupation */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.occupation && Boolean(nomineeErrors.occupation)}>
                          <InputLabel id={`${nomineePrefix}-occupation-label`}>Occupation*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-occupation-label`}
                          id={`${nomineePrefix}.occupation`}
                          name={`${nomineePrefix}.occupation`}
                          value={nominee.occupation}
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
                          {nomineeTouched.occupation && nomineeErrors.occupation && (
                          <FormHelperText>{nomineeErrors.occupation}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Residential Status */}
                        <Grid item xs={12}>
                        <FormControl fullWidth error={nomineeTouched.residentialStatus && Boolean(nomineeErrors.residentialStatus)}>
                          <InputLabel id={`${nomineePrefix}-residential-status-label`}>Residential Status*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-residential-status-label`}
                          id={`${nomineePrefix}.residentialStatus`}
                          name={`${nomineePrefix}.residentialStatus`}
                          value={nominee.residentialStatus}
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
                          {nomineeTouched.residentialStatus && nomineeErrors.residentialStatus && (
                          <FormHelperText>{nomineeErrors.residentialStatus}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Address */}
                        <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id={`${nomineePrefix}.address`}
                          name={`${nomineePrefix}.address`}
                          label="Address*"
                          value={nominee.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={nomineeTouched.address && Boolean(nomineeErrors.address)}
                          helperText={nomineeTouched.address && nomineeErrors.address ? nomineeErrors.address : null}
                          multiline
                          rows={2} />
                        </Grid>

                        {/* Identification Document */}
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={nomineeTouched.identificationDocument && Boolean(nomineeErrors.identificationDocument)}>
                          <InputLabel id={`${nomineePrefix}-identification-document-label`}>Identification Document*</InputLabel>
                          <Select
                          labelId={`${nomineePrefix}-identification-document-label`}
                          id={`${nomineePrefix}.identificationDocument`}
                          name={`${nomineePrefix}.identificationDocument`}
                          value={nominee.identificationDocument}
                          onChange={(e) => {
                            // Clear identification number when document type changes
                            setFieldValue(`${nomineePrefix}.identificationNumber`, '');
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
                          {nomineeTouched.identificationDocument && nomineeErrors.identificationDocument && (
                          <FormHelperText>{nomineeErrors.identificationDocument}</FormHelperText>
                          )}
                        </FormControl>
                        </Grid>

                        {/* Identification Number */}
                        <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id={`${nomineePrefix}.identificationNumber`}
                          name={`${nomineePrefix}.identificationNumber`}
                          label="Identification Number*"
                          value={nominee.identificationNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={nomineeTouched.identificationNumber && Boolean(nomineeErrors.identificationNumber)}
                          helperText={nomineeTouched.identificationNumber && nomineeErrors.identificationNumber 
                          ? nomineeErrors.identificationNumber 
                          : nominee.identificationDocument === 'PAN' 
                            ? "Enter valid PAN (e.g., ABCDE1234F)"
                            : nominee.identificationDocument === 'AADHAAR'
                            ? "Enter valid 12-digit Aadhaar number"
                            : "Enter valid ID number"}
                          placeholder={idPlaceholder}
                          inputProps={{
                          maxLength: nominee.identificationDocument === 'AADHAAR' ? 12 : 
                                nominee.identificationDocument === 'PAN' ? 10 : undefined
                          }}
                        />
                        </Grid>
                      </Grid>
                      </CardContent>
                    </Card>
                    );
                  })}

                  </div>
                );
              }}
            </FieldArray>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button variant="contained" color='warning' onClick={prevStep}>
                Back
              </Button>
              <Button variant="contained" color="warning" type="submit">
                Next
              </Button>
            </Box>
            </Form>
        )}
        </Formik>
    </Paper>
    );
}
export default NomineeDetails;