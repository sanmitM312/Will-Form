'use client'; // Important for client-side components in Next.js App Router

import { Card as MuiCard, CardContent, CardActions, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Card({ title, description, linkHref, linkText }) {
  const router = useRouter();
  
  return (
    <MuiCard variant="outlined" sx={{ maxWidth: 345, mb: 4 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="medium" 
          variant="contained" 
          color="primary"
          onClick={() => router.push(linkHref)}
        >
          {linkText}
        </Button>
      </CardActions>
    </MuiCard>
  );
}