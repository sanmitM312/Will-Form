import React from 'react';
import {
    Typography,
    Paper,
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PreviewForm = ({ formData, nextStep, prevStep, updateFormData }) => {
    const { personalDetails, nomineeDetails, assetDistribution } = formData;

    // Function to calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '';
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return `${age} years`;
    };

    // Format date to DD-MM-YYYY
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Create data row for the tables
    const createDataRow = (label, value) => {
        return { label, value };
    };

    // Personal details rows
    const personalRows = personalDetails ? [
        createDataRow('Name', personalDetails.title + ' ' + personalDetails.name),
        createDataRow('D.O.B', formatDate(personalDetails.dateOfBirth)),
        createDataRow('Age', calculateAge(personalDetails.dateOfBirth)),
        createDataRow('Gender', personalDetails.gender),
        createDataRow('Marital Status', personalDetails.maritalStatus),
        createDataRow('Marriage Date', formatDate(personalDetails.marriageDate)),
        createDataRow('Nationality', personalDetails.nationality),
        createDataRow('Religion', personalDetails.religion),
        createDataRow('Occupation', personalDetails.occupation),
        createDataRow('Residential Status', personalDetails.residentialStatus),
        createDataRow('Address', personalDetails.address),
        createDataRow('Identification Document', personalDetails.identificationDocument),
        createDataRow('Identification Number', personalDetails.identificationNumber),
    ] : [];

    // Get nominee name by ID
    const getNomineeName = (nomineeId) => {
        if (!nomineeDetails || !nomineeDetails.nominees) return 'Unknown';
        
        const index = parseInt(nomineeId.split('-')[1]);
        if (isNaN(index) || !nomineeDetails.nominees[index]) return 'Unknown';
        
        const nominee = nomineeDetails.nominees[index];
        return nominee.title ? `${nominee.title} ${nominee.name}` : nominee.name;
    };

    const handleSubmit = () => {
        nextStep();
    };

    return (
        <Paper elevation={3} sx={{ p: 4, mt: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h5" gutterBottom>
                Preview Details
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" mb={3}>
                Step 4 of 7: Preview Form
            </Typography>
            
            <Box sx={{ width: '100%', mb: 4 }}>
                <Stepper activeStep={3}>
                    {Array.from({ length: 4 }, (_, i) => (
                        <Step key={`step-${i}`}>
                            <StepLabel></StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            
            {/* Personal Details Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Personal Details
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: '#f8fbff' }}>
                    <Table>
                        <TableBody>
                            {personalRows.map((row, index) => (
                                row.value && (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row" sx={{ width: '30%', py: 1 }}>
                                            {row.label}
                                        </TableCell>
                                        <TableCell sx={{ py: 1 }}>{row.value}</TableCell>
                                    </TableRow>
                                )
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            
            {/* Nominee Details Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Nominee Details
                </Typography>
                
                {nomineeDetails && nomineeDetails.nominees && nomineeDetails.nominees.map((nominee, nomineeIndex) => {
                    const nomineeRows = [
                        createDataRow('Name', nominee.title + ' ' + nominee.name),
                        createDataRow('Relation', nominee.relation),
                        createDataRow('D.O.B', formatDate(nominee.dateOfBirth)),
                        createDataRow('Age', calculateAge(nominee.dateOfBirth)),
                        createDataRow('Gender', nominee.gender),
                        createDataRow('Marital Status', nominee.maritalStatus),
                        createDataRow('Religion', nominee.religion),
                        createDataRow('Nationality', nominee.nationality),
                        createDataRow('Occupation', nominee.occupation),
                        createDataRow('Residential Status', nominee.residentialStatus),
                        createDataRow('Address', nominee.address),
                        createDataRow('Identification Document', nominee.identificationDocument),
                        createDataRow('Identification Number', nominee.identificationNumber),
                    ];
                    
                    return (
                        <Box key={nomineeIndex} sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Nominee {nomineeIndex + 1}
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: '#f8fbff' }}>
                                <Table>
                                    <TableBody>
                                        {nomineeRows.map((row, index) => (
                                            row.value && (
                                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row" sx={{ width: '30%', py: 1 }}>
                                                        {row.label}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1 }}>{row.value}</TableCell>
                                                </TableRow>
                                            )
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    );
                })}
            </Box>
            
            {/* Assets Distribution Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Assets Distribution
                </Typography>
                
                {assetDistribution && assetDistribution.assetTypes && (
                    Object.entries(assetDistribution.assetTypes).map(([assetTypeId, assets], typeIndex) => {
                        if (!assets || assets.length === 0) return null;
                        
                        // Format asset type name for display
                        const assetTypeName = assetTypeId.charAt(0).toUpperCase() + assetTypeId.slice(1);
                        
                        return (
                            <Accordion key={typeIndex} defaultExpanded={typeIndex === 0} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {assetTypeName} ({assets.length})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {assets.map((asset, assetIndex) => (
                                        <Box key={assetIndex} sx={{ mb: assetIndex < assets.length - 1 ? 3 : 0 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                {asset.name || `${assetTypeName} ${assetIndex + 1}`}
                                            </Typography>
                                            
                                            {asset.description && (
                                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                                    {asset.description}
                                                </Typography>
                                            )}
                                            
                                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, backgroundColor: '#f8fbff' }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Nominee</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Share (%)</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {asset.allocations && asset.allocations.map((allocation, allocIndex) => (
                                                            <TableRow key={allocIndex}>
                                                                <TableCell>{getNomineeName(allocation.nomineeId)}</TableCell>
                                                                <TableCell>{allocation.share}%</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        
                                                        {/* Total row */}
                                                        <TableRow sx={{ backgroundColor: '#f0f7ff' }}>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                                {asset.allocations && asset.allocations.reduce((sum, alloc) => 
                                                                    sum + (parseFloat(alloc.share) || 0), 0)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
                )}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="contained" color="primary" onClick={prevStep}>
                    Previous
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Next
                </Button>
            </Box>
        </Paper>
    );
};

export default PreviewForm;