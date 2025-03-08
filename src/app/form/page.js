'use client'; // Important for client-side components in Next.js App Router

import MulStepForm from '../../components/MulStepForm';
import { Typography, Container, Box, Button } from '@mui/material';
import Card from '../../components/Card';
import { useRouter } from 'next/navigation';
export default function FormPage() {    
  const router = useRouter();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Application Form Page
      </Typography>
      <Button onClick={() => router.push('/')} >Home</Button>
      <MulStepForm />
    </Container>
  );
}