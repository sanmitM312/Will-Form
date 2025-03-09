import { Typography, Container, Box } from '@mui/material';
import Card from '../components/Card';

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to Our Service
        </Typography>
        
        <Card 
          title="Start Your Application" 
          description="Begin your application process by filling out our easy multi-step form."
          linkHref="/form"
          linkText="Get Started"
        />
      </Box>
    </Container>
  );
}