'use client'; // Important for client-side components in Next.js App Router

import NavBar from '@/components/NavBar';
import MulStepForm from '../../components/MulStepForm';
import { Typography, Container, Box, Button } from '@mui/material';

export default function FormPage() {    
  return (
    <>
      <NavBar title="Will Creation" />
      <Box sx={{ backgroundColor: '#EEF2F5', padding: 2 }}>
        <MulStepForm />
      </Box>
    </>
  );
}