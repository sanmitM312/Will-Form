import React, { useEffect } from 'react';
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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Validation schema for a single nominee
const NomineeSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  name: Yup.string().required('Name is required'),
  relation: Yup.string().required('Relation is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
  religion: Yup.string().required('Religion is required'),
  nationality: Yup.string().required('Nationality is required'),
  occupation: Yup.string().required('Occupation is required'),
  residentialStatus: Yup.string().required('Residential status is required'),
  address: Yup.string().required('Address is required'),
  identificationDocument: Yup.string().required('Identification document is required'),
  identificationNumber: Yup.string().required('Identification number is required'),
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

const NomineeDetails = ({ formData, nextStep, prevStep, updateFormData }) => {
  // Default empty nominee
  const emptyNominee = {
    title: '',
    name: '',
    relation: '',
    dateOfBirth: null,
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

  function findAndRemoveNomineeWithConfirmation(data, id) {
    if (!data?.assetDistribution?.assetTypes) return;
    const assetTypes = data.assetDistribution.assetTypes;
    const nomineeExists = Object.values(assetTypes).flat().some(asset => asset.allocations?.some(allocation => allocation.nomineeId === id));
    const nomineeName = nomineeExists ? formData.nomineeDetails.nominees.find((_, i) => `nominee-${i}` === id)?.name : null;
    const assetName = nomineeExists ? Object.values(assetTypes).flat().find(asset => asset.allocations?.some(allocation => allocation.nomineeId === id))?.name : null;if (nomineeExists) {
      
      const confirmation = confirm(`Nominee "${nomineeName}" found to be allocated to asset ${assetName} . Do you want to remove this nominee from all allocations?`);
      console.log("confirmation", confirmation);
      if (confirmation) {
        for (const category in assetTypes) {
          assetTypes[category]?.forEach(asset => {
          asset.allocations = asset.allocations?.filter(allocation => allocation.nomineeId !== id);
          });
      }
      alert(`Nominee ID "${id}" has been removed from all allocations.`);
      return true;
      } else {
      alert(`Nominee ID "${id}" was not removed.`);
      return false; 
      }
    } else {
      alert(`Nominee ID "${id}" was not found in any allocation.`);
      return false; 
    }
  }
  const handleDelete = (index, remove) => {
    console.log("delete", `nominee-${index}`);
    if(findAndRemoveNomineeWithConfirmation(formData, `nominee-${index}`)){
      remove(index);
      const updatedNominees = formData.nomineeDetails.nominees.filter((_, i) => i !== index);
      updateFormData('nomineeDetails', { nominees: updatedNominees.length ? updatedNominees : [emptyNominee] });
    }
  };

  
  

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
                        variant="contained"
                        color="primary"
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

                              {/* Date of Birth */}
                              <Grid item xs={12} sm={6}>
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
                                        helperText={nomineeTouched.dateOfBirth && nomineeErrors.dateOfBirth ? nomineeErrors.dateOfBirth : "Enter date of birth"} />
                                    )} />
                                </LocalizationProvider>
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

                              {/* Marital Status */}
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth error={nomineeTouched.maritalStatus && Boolean(nomineeErrors.maritalStatus)}>
                                  <InputLabel id={`${nomineePrefix}-marital-status-label`}>Marital Status*</InputLabel>
                                  <Select
                                    labelId={`${nomineePrefix}-marital-status-label`}
                                    id={`${nomineePrefix}.maritalStatus`}
                                    name={`${nomineePrefix}.maritalStatus`}
                                    value={nominee.maritalStatus}
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
                                  {nomineeTouched.maritalStatus && nomineeErrors.maritalStatus && (
                                    <FormHelperText>{nomineeErrors.maritalStatus}</FormHelperText>
                                  )}
                                </FormControl>
                              </Grid>

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
                              <Grid item xs={12} sm={6}>
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
                                  helperText={nomineeTouched.address && nomineeErrors.address ? nomineeErrors.address : "Enter valid address"}
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
                                    onChange={handleChange}
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
                                  helperText={nomineeTouched.identificationNumber && nomineeErrors.identificationNumber ? nomineeErrors.identificationNumber : "Enter valid identification number"} />
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
              <Button variant="contained" onClick={prevStep}>
                Back
              </Button>
              <Button variant="contained" color="primary" type="submit">
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