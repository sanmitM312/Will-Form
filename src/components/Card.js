'use client'; // Important for client-side components in Next.js App Router

import { Card as MuiCard, CardContent, CardActions, CardMedia, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Import directly at the top level
import FALLBACK_IMG from '../app/static/will.png';

export default function Card({ title, description, linkHref, linkText, sx }) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMG);

  const onMediaFallback = (event) => {
    event.target.src = FALLBACK_IMG.src || FALLBACK_IMG;
  };

  return (
    <MuiCard variant="outlined" sx={{ maxWidth: 400, mb: 4, ...sx }}>
      <CardMedia
        component="img"
        height="140"
        image={imgSrc.src || imgSrc} // Use .src for Next.js Image objects
        alt={`${title} thumbnail`}
        onError={onMediaFallback}
      />
      
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="medium"
          variant="contained"
          color="warning"
          onClick={() => router.push(linkHref)}
        >
          {linkText}
        </Button>
      </CardActions>
    </MuiCard>
  );
}