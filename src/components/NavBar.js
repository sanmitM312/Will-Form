'use client'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NavBar = ({ title = "Our Service" }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        {pathname !== '/' && (
          <Button 
            color="inherit" 
            onClick={handleBackClick} 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box>
          {/* You can add additional navigation items here */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;