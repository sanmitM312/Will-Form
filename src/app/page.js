import { Typography, Container, Box } from '@mui/material';
import Card from '../components/Card';
import NavBar from '@/components/NavBar';

export default function Home() {
  return (
    
    <>
      <NavBar title="Will Creation" />
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'top',
          justifyContent: 'top',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to Our Service
        </Typography>
        
        <Card 
          title="Will Creator" 
          description="Ensure your family members are taken care of by creating your will."
          linkHref="/form"
          linkText="Let's Get Started"
          sx={{ borderRadius: '16px' }} // Added inline style for rounded corners
        />
      </Box>
    </>
  );
}

