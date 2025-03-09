'use client'; // Important for client-side components in Next.js App Router

import MulStepForm from '../../components/MulStepForm';
import { Typography, Container, Box, Button } from '@mui/material';

export default function FormPage() {    
  return (
    <>
      Application Form Page
      <MulStepForm />
    </>
  );
}